import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface ClientOverview {
  total: number;
  active: number;
  leads: number;
  followups: { id: string; name: string; note: string; at: string; overdue: boolean }[];
  renewals: { clientId: string; client: string; service: string; date: string; overdue: boolean }[];
  unpaid: { total: number; overdue: number; items: { clientId: string; client: string; amount: number; due: string | null; overdue: boolean }[] };
  quiet: { id: string; name: string; last: string | null }[];
}

const EMPTY: ClientOverview = { total: 0, active: 0, leads: 0, followups: [], renewals: [], unpaid: { total: 0, overdue: 0, items: [] }, quiet: [] };
const nameOf = (c: unknown) => (Array.isArray(c) ? (c[0] as { name?: string })?.name : (c as { name?: string } | null)?.name) ?? 'Client';
const dayKey = (ms: number) => new Date(ms + 8 * 3_600_000).toISOString().slice(0, 10);

/** Everything the Overview "Clients" section shows. Any failure returns empty. */
export async function getClientOverview(): Promise<ClientOverview> {
  try {
    const nowMs = Date.now();
    const today = dayKey(nowMs);
    const in30 = dayKey(nowMs + 30 * 86_400_000);
    const endOfToday = new Date(`${today}T23:59:59+08:00`).toISOString();
    const quietBefore = new Date(nowMs - 30 * 86_400_000).toISOString();

    const [all, follow, ren, inv, quiet] = await Promise.all([
      supabaseAdmin.from('clients').select('status'),
      supabaseAdmin.from('clients').select('id,name,next_followup_at,next_followup_note').not('next_followup_at', 'is', null).lte('next_followup_at', endOfToday).order('next_followup_at').limit(6),
      supabaseAdmin.from('client_services').select('client_id,name,renewal_date,clients(name)').eq('status', 'live').not('renewal_date', 'is', null).lte('renewal_date', in30).order('renewal_date').limit(6),
      supabaseAdmin.from('client_invoices').select('client_id,amount_myr,due_on,clients(name)').eq('status', 'sent').order('due_on', { ascending: true, nullsFirst: false }).limit(200),
      supabaseAdmin.from('clients').select('id,name,last_contact_at').eq('status', 'active').or(`last_contact_at.lt.${quietBefore},last_contact_at.is.null`).order('last_contact_at', { ascending: true, nullsFirst: true }).limit(6),
    ]);
    if (all.error) return EMPTY;

    const statuses = (all.data ?? []) as { status: string }[];
    const invoices = ((inv.data ?? []) as unknown as { client_id: string; amount_myr: number; due_on: string | null; clients: unknown }[]).map((i) => ({
      clientId: i.client_id, client: nameOf(i.clients), amount: Number(i.amount_myr), due: i.due_on, overdue: Boolean(i.due_on && i.due_on < today),
    }));
    return {
      total: statuses.length,
      active: statuses.filter((s) => s.status === 'active').length,
      leads: statuses.filter((s) => s.status === 'lead').length,
      followups: ((follow.data ?? []) as { id: string; name: string; next_followup_at: string; next_followup_note: string }[]).map((c) => ({
        id: c.id, name: c.name, note: c.next_followup_note, at: c.next_followup_at, overdue: dayKey(new Date(c.next_followup_at).getTime()) < today,
      })),
      renewals: ((ren.data ?? []) as unknown as { client_id: string; name: string; renewal_date: string; clients: unknown }[]).map((r) => ({
        clientId: r.client_id, client: nameOf(r.clients), service: r.name, date: r.renewal_date, overdue: r.renewal_date < today,
      })),
      unpaid: {
        total: invoices.reduce((s, i) => s + i.amount, 0),
        overdue: invoices.filter((i) => i.overdue).reduce((s, i) => s + i.amount, 0),
        items: invoices.slice(0, 6),
      },
      quiet: ((quiet.data ?? []) as { id: string; name: string; last_contact_at: string | null }[]).map((c) => ({ id: c.id, name: c.name, last: c.last_contact_at })),
    };
  } catch (err) {
    console.error('[client-stats] failed:', err);
    return EMPTY;
  }
}
