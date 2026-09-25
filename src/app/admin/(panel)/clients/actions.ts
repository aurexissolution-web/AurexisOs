'use server';

// Client database mutations. Each action calls requireAdmin() first and
// validates on the server; the browser is never trusted for ids or values.
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  MANUAL_KEYS,
  CLIENT_STATUSES,
  STATUS_BY_KEY,
  normalizeEmail,
  normalizePhone,
  type ActivityKind,
  type Client,
  type ClientActivity,
  type ClientContact,
  type ClientKind,
  type ClientStatus,
} from '@/lib/admin/clients';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CLIENT_COLS =
  'id,name,company,kind,status,owner_id,industry,source,website,address,tags,notes,first_contact_at,last_contact_at,next_followup_at,next_followup_note,created_at,updated_at';
const CONTACT_COLS = 'id,client_id,name,role,email,phone,is_primary';
const ACTIVITY_COLS = 'id,client_id,kind,title,body,occurred_at,actor_id,ref';

type Fail = { ok: false; error: string };
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isId = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v);

function touch() {
  revalidatePath('/admin/clients');
}

export interface ClientInput {
  name: string;
  company: string;
  kind: ClientKind;
  status: ClientStatus;
  ownerId: string | null;
  industry: string;
  website: string;
  address: string;
  tags: string[];
  notes: string;
  // First contact person (create only)
  contactName?: string;
  email?: string;
  phone?: string;
}

function validateClient(i: ClientInput): Fail | { ok: true; row: Record<string, unknown> } {
  const name = clean(i.name, 160);
  if (!name) return { ok: false, error: 'Add a name.' };
  if (!(i.kind === 'business' || i.kind === 'individual')) return { ok: false, error: 'Pick business or individual.' };
  if (!CLIENT_STATUSES.some((s) => s.key === i.status)) return { ok: false, error: 'Pick a status.' };
  const website = clean(i.website, 300);
  if (website && !/^https?:\/\//i.test(website)) return { ok: false, error: 'The website must start with https://' };
  const tags = [...new Set((i.tags ?? []).map((t) => clean(t, 30).toLowerCase()).filter(Boolean))].slice(0, 12);
  return {
    ok: true,
    row: {
      name,
      company: clean(i.company, 160),
      kind: i.kind,
      status: i.status,
      owner_id: isId(i.ownerId) ? i.ownerId : null,
      industry: clean(i.industry, 120),
      website,
      address: clean(i.address, 300),
      tags,
      notes: clean(i.notes, 5000),
    },
  };
}

/** Existing client that already uses this email or phone, if any. */
async function findDuplicate(email: string | null, phone: string | null) {
  const filters = [email && `email_key.eq.${email}`, phone && `phone_key.eq.${phone}`].filter(Boolean);
  if (!filters.length) return null;
  const { data } = await supabaseAdmin
    .from('client_contacts')
    .select('client_id, clients(name)')
    .or(filters.join(','))
    .limit(1);
  const hit = data?.[0] as { client_id: string; clients: { name: string } | { name: string }[] | null } | undefined;
  if (!hit) return null;
  const c = Array.isArray(hit.clients) ? hit.clients[0] : hit.clients;
  return { id: hit.client_id, name: c?.name ?? 'another client' };
}

export async function createClient(
  input: ClientInput,
): Promise<{ ok: true; client: Client } | Fail | { ok: false; error: string; duplicateId: string }> {
  const admin = await requireAdmin();
  const v = validateClient(input);
  if (!v.ok) return v;

  const emailRaw = clean(input.email, 200);
  const phoneRaw = clean(input.phone, 40);
  const email = normalizeEmail(emailRaw);
  if (emailRaw && !email) return { ok: false, error: 'That email doesn’t look right.' };
  const phone = normalizePhone(phoneRaw);

  const dup = await findDuplicate(email, phone);
  if (dup) return { ok: false, error: `${dup.name} already uses that email or phone.`, duplicateId: dup.id };

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert({ ...v.row, source: 'manual', first_contact_at: now, last_contact_at: now, owner_id: v.row.owner_id ?? admin.id })
    .select(CLIENT_COLS)
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not save.' };
  const client = data as Client;

  if (email || phone || clean(input.contactName, 160)) {
    await supabaseAdmin.from('client_contacts').insert({
      client_id: client.id,
      name: clean(input.contactName, 160) || client.name,
      email: email ?? '',
      phone: phoneRaw,
      is_primary: true,
    });
  }
  await supabaseAdmin.from('client_activity').insert({
    client_id: client.id,
    kind: 'status_change',
    title: `Added as ${STATUS_BY_KEY[client.status].label.toLowerCase()}`,
    actor_id: admin.id,
  });
  touch();
  return { ok: true, client };
}

export async function updateClient(
  id: string,
  patch: Partial<Omit<ClientInput, 'status' | 'contactName' | 'email' | 'phone'>> & {
    nextFollowupAt?: string | null;
    nextFollowupNote?: string;
  },
): Promise<{ ok: true; client: Client } | Fail> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: 'Invalid client.' };
  const { data: prev } = await supabaseAdmin.from('clients').select(CLIENT_COLS).eq('id', id).single();
  if (!prev) return { ok: false, error: 'That client no longer exists.' };
  const before = prev as Client;

  const v = validateClient({
    name: patch.name ?? before.name,
    company: patch.company ?? before.company,
    kind: patch.kind ?? before.kind,
    status: before.status,
    ownerId: patch.ownerId === undefined ? before.owner_id : patch.ownerId,
    industry: patch.industry ?? before.industry,
    website: patch.website ?? before.website,
    address: patch.address ?? before.address,
    tags: patch.tags ?? before.tags,
    notes: patch.notes ?? before.notes,
  });
  if (!v.ok) return v;
  const { status: _status, ...row } = v.row;
  void _status;

  const next: Record<string, unknown> = { ...row, updated_at: new Date().toISOString() };
  if (patch.nextFollowupAt !== undefined) {
    if (patch.nextFollowupAt && !Number.isFinite(new Date(patch.nextFollowupAt).getTime()))
      return { ok: false, error: 'Pick a valid follow-up date.' };
    next.next_followup_at = patch.nextFollowupAt ? new Date(patch.nextFollowupAt).toISOString() : null;
    next.followup_notified_at = null; // a new date earns a new phone reminder
    if (!patch.nextFollowupAt) next.next_followup_note = '';
  }
  if (patch.nextFollowupNote !== undefined) next.next_followup_note = clean(patch.nextFollowupNote, 300);

  const { data, error } = await supabaseAdmin.from('clients').update(next).eq('id', id).select(CLIENT_COLS).single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not save.' };
  touch();
  return { ok: true, client: data as Client };
}

export async function setClientStatus(
  id: string,
  status: ClientStatus,
): Promise<{ ok: true; client: Client; activity: ClientActivity } | Fail> {
  const admin = await requireAdmin();
  if (!isId(id)) return { ok: false, error: 'Invalid client.' };
  if (!CLIENT_STATUSES.some((s) => s.key === status)) return { ok: false, error: 'Invalid status.' };
  const { data, error } = await supabaseAdmin
    .from('clients')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(CLIENT_COLS)
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not update.' };
  const { data: act } = await supabaseAdmin
    .from('client_activity')
    .insert({ client_id: id, kind: 'status_change', title: `Marked ${STATUS_BY_KEY[status].label.toLowerCase()}`, actor_id: admin.id })
    .select(ACTIVITY_COLS)
    .single();
  touch();
  return { ok: true, client: data as Client, activity: act as ClientActivity };
}

export async function addActivity(
  clientId: string,
  input: { kind: ActivityKind; title: string; body: string; occurredAt?: string },
): Promise<{ ok: true; activity: ClientActivity; client: Client } | Fail> {
  const admin = await requireAdmin();
  if (!isId(clientId)) return { ok: false, error: 'Invalid client.' };
  if (!MANUAL_KEYS.includes(input.kind)) return { ok: false, error: 'Pick what happened.' };
  const title = clean(input.title, 160);
  const body = clean(input.body, 4000);
  if (!title && !body) return { ok: false, error: 'Write something first.' };
  const at = input.occurredAt ? new Date(input.occurredAt) : new Date();
  if (!Number.isFinite(at.getTime())) return { ok: false, error: 'Pick a valid date.' };
  if (at.getTime() > Date.now() + 60_000) return { ok: false, error: 'That date is in the future.' };

  const { data, error } = await supabaseAdmin
    .from('client_activity')
    .insert({ client_id: clientId, kind: input.kind, title, body, occurred_at: at.toISOString(), actor_id: admin.id })
    .select(ACTIVITY_COLS)
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not save.' };

  // A conversation counts as contact; a private note does not.
  const { data: cur } = await supabaseAdmin.from('clients').select(CLIENT_COLS).eq('id', clientId).single();
  let client = cur as Client;
  if (input.kind !== 'note' && client && (!client.last_contact_at || new Date(client.last_contact_at) < at)) {
    const { data: upd } = await supabaseAdmin
      .from('clients')
      .update({ last_contact_at: at.toISOString(), updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .select(CLIENT_COLS)
      .single();
    if (upd) client = upd as Client;
  }
  touch();
  return { ok: true, activity: data as ClientActivity, client };
}

export async function deleteActivity(id: string): Promise<{ ok: true } | Fail> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: 'Invalid entry.' };
  // Only hand-written entries can be removed; automatic history stays intact.
  const { error } = await supabaseAdmin.from('client_activity').delete().eq('id', id).in('kind', MANUAL_KEYS);
  if (error) return { ok: false, error: error.message };
  touch();
  return { ok: true };
}

export async function saveContact(
  clientId: string,
  input: { id?: string; name: string; role: string; email: string; phone: string; isPrimary: boolean },
): Promise<{ ok: true; contacts: ClientContact[] } | Fail> {
  await requireAdmin();
  if (!isId(clientId)) return { ok: false, error: 'Invalid client.' };
  if (input.id !== undefined && !isId(input.id)) return { ok: false, error: 'Invalid contact.' };
  const name = clean(input.name, 160);
  const emailRaw = clean(input.email, 200);
  const email = normalizeEmail(emailRaw);
  if (emailRaw && !email) return { ok: false, error: 'That email doesn’t look right.' };
  const phone = clean(input.phone, 40);
  if (!name && !email && !phone) return { ok: false, error: 'Add a name, email or phone.' };

  const row = { name, role: clean(input.role, 120), email: email ?? '', phone, is_primary: Boolean(input.isPrimary) };
  if (row.is_primary) {
    await supabaseAdmin.from('client_contacts').update({ is_primary: false }).eq('client_id', clientId);
  }
  const res = input.id
    ? await supabaseAdmin.from('client_contacts').update(row).eq('id', input.id).eq('client_id', clientId)
    : await supabaseAdmin.from('client_contacts').insert({ ...row, client_id: clientId });
  if (res.error) return { ok: false, error: res.error.message };

  const { data } = await supabaseAdmin
    .from('client_contacts')
    .select(CONTACT_COLS)
    .eq('client_id', clientId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });
  touch();
  return { ok: true, contacts: (data ?? []) as ClientContact[] };
}

export async function deleteContact(
  clientId: string,
  id: string,
): Promise<{ ok: true; contacts: ClientContact[] } | Fail> {
  await requireAdmin();
  if (!isId(clientId) || !isId(id)) return { ok: false, error: 'Invalid contact.' };
  const { error } = await supabaseAdmin.from('client_contacts').delete().eq('id', id).eq('client_id', clientId);
  if (error) return { ok: false, error: error.message };
  const { data } = await supabaseAdmin
    .from('client_contacts')
    .select(CONTACT_COLS)
    .eq('client_id', clientId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });
  touch();
  return { ok: true, contacts: (data ?? []) as ClientContact[] };
}
