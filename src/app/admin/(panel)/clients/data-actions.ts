'use server';

// Data care: CSV import, merging duplicates, and PDPA erasure. All admin-only,
// and every decision (duplicate or not, who to delete) is re-made on the server.
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { clean, isId } from '@/lib/admin/validate';
import { normalizeEmail, normalizePhone } from '@/lib/admin/clients';
import type { ImportData } from '@/lib/admin/csv';

const MAX_IMPORT = 2000;
const LEAD_TABLES = [
  'presence_quote_requests', 'flow_quote_requests', 'core_quote_requests', 'connect_quote_requests',
  'ai_readiness_audit_quote_requests', 'contact_messages', 'calculator_leads',
];
type Fail = { ok: false; error: string };

export type ImportVerdict =
  | { state: 'new' }
  | { state: 'duplicate'; clientId: string; clientName: string }
  | { state: 'repeat-in-file' }
  | { state: 'invalid'; reason: string };

/** Decide, for every row, whether it would be new, a duplicate or unusable. */
async function judge(rows: ImportData[]): Promise<ImportVerdict[]> {
  const { data } = await supabaseAdmin
    .from('client_contacts')
    .select('client_id,email_key,phone_key,clients(name)')
    .limit(50000);
  const byEmail = new Map<string, { id: string; name: string }>();
  const byPhone = new Map<string, { id: string; name: string }>();
  for (const c of (data ?? []) as unknown as { client_id: string; email_key: string | null; phone_key: string | null; clients: { name: string } | { name: string }[] | null }[]) {
    const nm = (Array.isArray(c.clients) ? c.clients[0]?.name : c.clients?.name) ?? 'a client';
    if (c.email_key) byEmail.set(c.email_key, { id: c.client_id, name: nm });
    if (c.phone_key) byPhone.set(c.phone_key, { id: c.client_id, name: nm });
  }
  const seen = new Set<string>();
  return rows.map((r): ImportVerdict => {
    if (!clean(r.name, 160)) return { state: 'invalid', reason: 'Missing name' };
    const email = normalizeEmail(r.email);
    if (r.email && !email) return { state: 'invalid', reason: 'Email looks wrong' };
    const phone = normalizePhone(r.phone);
    const hit = (email && byEmail.get(email)) || (phone && byPhone.get(phone)) || null;
    if (hit) return { state: 'duplicate', clientId: hit.id, clientName: hit.name };
    const keys = [email && `e:${email}`, phone && `p:${phone}`].filter(Boolean) as string[];
    if (keys.some((k) => seen.has(k))) return { state: 'repeat-in-file' };
    keys.forEach((k) => seen.add(k));
    return { state: 'new' };
  });
}

export async function previewImport(rows: ImportData[]): Promise<{ ok: true; verdicts: ImportVerdict[] } | Fail> {
  await requireAdmin();
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'The file has no rows.' };
  if (rows.length > MAX_IMPORT) return { ok: false, error: `Import up to ${MAX_IMPORT} rows at a time.` };
  return { ok: true, verdicts: await judge(rows) };
}

export async function runImport(rows: ImportData[]): Promise<{ ok: true; created: number; skipped: number } | Fail> {
  const admin = await requireAdmin();
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'The file has no rows.' };
  if (rows.length > MAX_IMPORT) return { ok: false, error: `Import up to ${MAX_IMPORT} rows at a time.` };
  const verdicts = await judge(rows);
  const fresh = rows.filter((_, i) => verdicts[i].state === 'new');
  const now = new Date().toISOString();
  let created = 0;

  for (let i = 0; i < fresh.length; i += 100) {
    const chunk = fresh.slice(i, i + 100);
    const { data: made, error } = await supabaseAdmin
      .from('clients')
      .insert(
        chunk.map((r) => ({
          name: clean(r.name, 160), company: clean(r.company, 160), kind: 'business',
          status: ['lead', 'active', 'past', 'lost'].includes(r.status) ? r.status : 'lead',
          owner_id: admin.id, industry: clean(r.industry, 120), source: 'import',
          tags: (r.tags ?? []).map((t) => clean(t, 30).toLowerCase()).filter(Boolean).slice(0, 12),
          notes: clean(r.notes, 5000), first_contact_at: now,
        })),
      )
      .select('id');
    if (error || !made) return { ok: false, error: `Stopped after ${created} rows: ${error?.message ?? 'save failed'}` };
    await supabaseAdmin.from('client_contacts').insert(
      chunk.flatMap((r, k) => (r.email || r.phone ? [{ client_id: made[k].id, name: clean(r.name, 160), email: normalizeEmail(r.email) ?? '', phone: clean(r.phone, 40), is_primary: true }] : [])),
    );
    await supabaseAdmin.from('client_activity').insert(made.map((m) => ({ client_id: m.id, kind: 'status_change', title: 'Imported from a spreadsheet', actor_id: admin.id })));
    created += made.length;
  }
  revalidatePath('/admin/clients');
  return { ok: true, created, skipped: rows.length - created };
}

export async function searchClients(q: string, excludeId: string): Promise<{ id: string; name: string; company: string }[]> {
  await requireAdmin();
  const term = clean(q, 80).replace(/[%,()]/g, ' ');
  if (term.length < 2) return [];
  const { data } = await supabaseAdmin
    .from('clients')
    .select('id,name,company')
    .or(`name.ilike.%${term}%,company.ilike.%${term}%`)
    .neq('id', isId(excludeId) ? excludeId : '00000000-0000-0000-0000-000000000000')
    .limit(8);
  return (data ?? []) as { id: string; name: string; company: string }[];
}

/** Move everything from `dropId` onto `keepId` in one all-or-nothing step. */
export async function mergeClients(keepId: string, dropId: string): Promise<{ ok: true } | Fail> {
  await requireAdmin();
  if (!isId(keepId) || !isId(dropId) || keepId === dropId) return { ok: false, error: 'Pick two different clients.' };
  const { error } = await supabaseAdmin.rpc('merge_clients', { keep_id: keepId, drop_id: dropId });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/clients');
  return { ok: true };
}

/** PDPA erasure. The person must type the client's exact name to confirm. */
export async function deleteClient(
  id: string,
  o: { confirmName: string; alsoEnquiries: boolean },
): Promise<{ ok: true } | Fail> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: 'Invalid client.' };
  const { data: c } = await supabaseAdmin.from('clients').select('name').eq('id', id).single();
  if (!c) return { ok: true };
  if (clean(o.confirmName, 200) !== c.name) return { ok: false, error: 'Type the client’s exact name to confirm.' };

  const { data: files } = await supabaseAdmin.from('client_files').select('storage_path').eq('client_id', id);
  if (files?.length) await supabaseAdmin.storage.from('client-files').remove(files.map((f) => f.storage_path as string));
  if (o.alsoEnquiries) {
    for (const t of LEAD_TABLES) await supabaseAdmin.from(t).delete().eq('client_id', id);
  }
  await supabaseAdmin.from('calendar_events').delete().eq('client_id', id);
  const { error } = await supabaseAdmin.from('clients').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/clients');
  return { ok: true };
}
