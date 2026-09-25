'use server';

// Calendar mutations. Every action calls requireAdmin() first, then validates
// input on the server: the browser is never trusted for times or ids.
import { after } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail, SITE_URL } from '@/lib/email/send';
import { buildIcs } from '@/lib/email/ics';
import { pushNotification } from '@/lib/admin/ntfy';
import { calendarInvite } from '@/lib/email/templates';
import {
  ALLOWED_REMINDERS,
  KIND_BY_KEY,
  alreadyPast,
  formatRange,
  type CalEvent,
  type EventKind,
  type EventStatus,
} from '@/lib/admin/calendar';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LEAD_REF_RE =
  /^(presence|flow|core|connect|audit|contact|calculator):[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LENGTH_MS = 7 * 24 * 60 * 60 * 1000;

const INVITE_EMAIL = process.env.CALENDAR_INVITE_EMAIL;
const FROM_ADDRESS = (process.env.LEAD_FROM_EMAIL || '').match(/<(.+)>/)?.[1] || 'hello@aurexissolution.com';

export interface EventInput {
  id?: string;
  title: string;
  kind: EventKind;
  startsAt: string;
  endsAt: string;
  location: string;
  meetingUrl: string;
  attendee: string;
  notes: string;
  leadRef: string | null;
  clientId?: string | null;
  reminders: number[];
  sendInvite: boolean;
}

type Saved = { ok: true; event: CalEvent } | { ok: false; error: string };
type Done = { ok: true } | { ok: false; error: string };

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const COLUMNS =
  'id,title,kind,starts_at,ends_at,location,meeting_url,attendee,notes,lead_ref,client_id,reminders,reminders_sent,status,send_invite,invite_seq';

async function sendInvite(ev: CalEvent, method: 'REQUEST' | 'CANCEL', sequence: number) {
  if (!INVITE_EMAIL) return;
  const cancelled = method === 'CANCEL';
  const where = [ev.location, ev.meeting_url].filter(Boolean).join(' · ');
  const email = calendarInvite({
    title: ev.title,
    kindLabel: KIND_BY_KEY[ev.kind].label,
    when: formatRange(ev.starts_at, ev.ends_at),
    where: ev.location,
    url: ev.meeting_url,
    attendee: ev.attendee,
    notes: ev.notes,
    cancelled,
    adminUrl: `${SITE_URL}/admin/calendar?event=${ev.id}`,
  });
  const ics = buildIcs({
    method,
    uid: `${ev.id}@aurexissolution.com`,
    sequence,
    title: ev.title,
    startsAt: ev.starts_at,
    endsAt: ev.ends_at,
    location: where,
    url: ev.meeting_url,
    description: [ev.attendee && `With: ${ev.attendee}`, ev.notes].filter(Boolean).join('\n'),
    organizerEmail: FROM_ADDRESS,
    attendeeEmail: INVITE_EMAIL,
    alarmMinutes: ev.reminders.length ? Math.min(...ev.reminders) : null,
  });
  await sendEmail(INVITE_EMAIL, email, undefined, [
    {
      filename: 'invite.ics',
      content: Buffer.from(ics).toString('base64'),
      contentType: `text/calendar; charset=utf-8; method=${method}`,
    },
  ]);
}

function validate(input: EventInput): { ok: false; error: string } | { ok: true; value: EventInput } {
  const title = clean(input.title, 160);
  if (!title) return { ok: false, error: 'Add a title.' };
  if (!(input.kind in KIND_BY_KEY)) return { ok: false, error: 'Pick a type.' };
  const s = new Date(input.startsAt).getTime();
  const e = new Date(input.endsAt).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e)) return { ok: false, error: 'Pick a valid date and time.' };
  if (e <= s) return { ok: false, error: 'The end must be after the start.' };
  if (e - s > MAX_LENGTH_MS) return { ok: false, error: 'Events can be up to 7 days long.' };
  const meetingUrl = clean(input.meetingUrl, 500);
  if (meetingUrl && !/^https?:\/\//i.test(meetingUrl))
    return { ok: false, error: 'The meeting link must start with https://' };
  const leadRef = input.leadRef && LEAD_REF_RE.test(input.leadRef) ? input.leadRef : null;
  const reminders = [...new Set((input.reminders ?? []).filter((m) => ALLOWED_REMINDERS.includes(m)))].sort(
    (a, b) => b - a,
  );
  return {
    ok: true,
    value: {
      ...input,
      title,
      startsAt: new Date(s).toISOString(),
      endsAt: new Date(e).toISOString(),
      location: clean(input.location, 200),
      meetingUrl,
      attendee: clean(input.attendee, 160),
      notes: clean(input.notes, 2000),
      leadRef,
      clientId: input.clientId && UUID_RE.test(input.clientId) ? input.clientId : null,
      reminders,
      sendInvite: Boolean(input.sendInvite),
    },
  };
}

export async function saveEvent(input: EventInput): Promise<Saved> {
  const admin = await requireAdmin();
  const v = validate(input);
  if (!v.ok) return v;
  const e = v.value;
  const now = Date.now();
  const base = {
    title: e.title,
    kind: e.kind,
    starts_at: e.startsAt,
    ends_at: e.endsAt,
    location: e.location,
    meeting_url: e.meetingUrl || null,
    attendee: e.attendee,
    notes: e.notes,
    lead_ref: e.leadRef,
    client_id: e.clientId ?? null,
    reminders: e.reminders,
    send_invite: e.sendInvite,
    updated_at: new Date(now).toISOString(),
  };

  if (!e.id) {
    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .insert({
        ...base,
        reminders_sent: alreadyPast(e.startsAt, e.reminders, now),
        created_by: admin.id,
      })
      .select(COLUMNS)
      .single();
    if (error || !data) return { ok: false, error: error?.message ?? 'Could not save.' };
    const ev = data as CalEvent;
    if (ev.send_invite) after(() => sendInvite(ev, 'REQUEST', 0));
    if (ev.client_id) {
      await supabaseAdmin.from('client_activity').insert({
        client_id: ev.client_id,
        kind: 'meeting',
        title: `${KIND_BY_KEY[ev.kind].label} booked: ${ev.title}`,
        body: formatRange(ev.starts_at, ev.ends_at),
        actor_id: admin.id,
        ref: `event:${ev.id}`,
      });
    }
    revalidatePath('/admin/calendar');
    return { ok: true, event: ev };
  }

  if (!UUID_RE.test(e.id)) return { ok: false, error: 'Invalid event.' };
  const { data: prev } = await supabaseAdmin
    .from('calendar_events')
    .select(COLUMNS)
    .eq('id', e.id)
    .single();
  if (!prev) return { ok: false, error: 'That event no longer exists.' };
  const before = prev as CalEvent;
  const timeChanged = before.starts_at !== e.startsAt;
  const kept = timeChanged ? [] : before.reminders_sent.filter((m) => e.reminders.includes(m));
  const sent = [...new Set([...kept, ...alreadyPast(e.startsAt, e.reminders, now)])];
  const seq = before.invite_seq + 1;

  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .update({ ...base, reminders_sent: sent, invite_seq: seq })
    .eq('id', e.id)
    .select(COLUMNS)
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not save.' };
  const ev = data as CalEvent;
  if (ev.send_invite && ev.status !== 'cancelled') after(() => sendInvite(ev, 'REQUEST', seq));
  else if (before.send_invite && !ev.send_invite) after(() => sendInvite(ev, 'CANCEL', seq));
  revalidatePath('/admin/calendar');
  return { ok: true, event: ev };
}

/** Drag / resize: only the times change. */
export async function moveEvent(id: string, startsAt: string, endsAt: string): Promise<Saved> {
  await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, error: 'Invalid event.' };
  const s = new Date(startsAt).getTime();
  const en = new Date(endsAt).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(en) || en <= s || en - s > MAX_LENGTH_MS)
    return { ok: false, error: 'Invalid time.' };
  const { data: prev } = await supabaseAdmin.from('calendar_events').select(COLUMNS).eq('id', id).single();
  if (!prev) return { ok: false, error: 'That event no longer exists.' };
  const before = prev as CalEvent;
  const iso = new Date(s).toISOString();
  const seq = before.invite_seq + 1;
  const timeChanged = before.starts_at !== iso;
  const sent = timeChanged
    ? alreadyPast(iso, before.reminders, Date.now())
    : before.reminders_sent;
  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .update({
      starts_at: iso,
      ends_at: new Date(en).toISOString(),
      reminders_sent: sent,
      invite_seq: seq,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not move.' };
  const ev = data as CalEvent;
  if (ev.send_invite && ev.status === 'scheduled') after(() => sendInvite(ev, 'REQUEST', seq));
  revalidatePath('/admin/calendar');
  return { ok: true, event: ev };
}

export async function setEventStatus(id: string, status: EventStatus): Promise<Saved> {
  await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, error: 'Invalid event.' };
  if (!['scheduled', 'done', 'cancelled'].includes(status)) return { ok: false, error: 'Invalid status.' };
  const { data: prev } = await supabaseAdmin.from('calendar_events').select(COLUMNS).eq('id', id).single();
  if (!prev) return { ok: false, error: 'That event no longer exists.' };
  const before = prev as CalEvent;
  const seq = before.invite_seq + 1;
  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .update({ status, invite_seq: seq, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not update.' };
  const ev = data as CalEvent;
  if (ev.send_invite) {
    if (status === 'cancelled') after(() => sendInvite(ev, 'CANCEL', seq));
    else if (before.status === 'cancelled') after(() => sendInvite(ev, 'REQUEST', seq));
  }
  revalidatePath('/admin/calendar');
  return { ok: true, event: ev };
}

export async function deleteEvent(id: string): Promise<Done> {
  await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, error: 'Invalid event.' };
  const { data: prev } = await supabaseAdmin.from('calendar_events').select(COLUMNS).eq('id', id).single();
  if (!prev) return { ok: true };
  const before = prev as CalEvent;
  const { error } = await supabaseAdmin.from('calendar_events').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  if (before.send_invite && before.status !== 'cancelled')
    after(() => sendInvite(before, 'CANCEL', before.invite_seq + 1));
  revalidatePath('/admin/calendar');
  return { ok: true };
}

/** Setup helper: sends one notification so you can confirm your phone receives it. */
export async function sendTestPush(): Promise<Done> {
  await requireAdmin();
  const ok = await pushNotification({
    title: 'Aurexis calendar is connected',
    message: 'Reminders for your meetings will arrive here.',
    click: `${SITE_URL}/admin/calendar`,
    tags: ['white_check_mark'],
  });
  return ok ? { ok: true } : { ok: false, error: 'ntfy did not accept the message. Check NTFY_TOPIC.' };
}
