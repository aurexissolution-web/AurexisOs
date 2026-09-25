// src/lib/admin/leads.ts
// Server-side reads for the Command Center and Overview. Callers must have
// passed requireAdmin() — these use the service role.
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  LEAD_SOURCES,
  SOURCE_BY_KEY,
  type Lead,
  type LeadSource,
  type LeadSourceKey,
  type LeadStatus,
} from './lead-sources';

function formatHeadline(source: LeadSource, row: Record<string, unknown>): string {
  if (source.key === 'calculator') {
    const waste = Number(row.annual_waste ?? 0);
    return `${row.staff} staff · ${row.hours} admin hrs/wk · RM${Math.round(waste).toLocaleString('en-MY')}/yr lost`;
  }
  const v = row[source.headlineColumn];
  return typeof v === 'string' ? v : '';
}

function toLead(source: LeadSource, row: Record<string, unknown>): Lead {
  const email = String(row.email ?? '');
  return {
    source: source.key,
    id: String(row.id),
    name: source.hasName ? String(row.name ?? '') : email.split('@')[0],
    email,
    phone: (row.whatsapp as string) ?? (row.phone as string) ?? null,
    headline: formatHeadline(source, row),
    status: (row.status as LeadStatus) ?? 'new',
    adminNotes: String(row.admin_notes ?? ''),
    createdAt: String(row.created_at),
    contactedAt: (row.contacted_at as string) ?? null,
    clientId: (row.client_id as string) ?? null,
    raw: row,
  };
}

/** All leads, newest first. Each table is capped so one noisy form can't flood the view. */
export async function listLeads(opts: { sources?: LeadSourceKey[]; limitPerSource?: number } = {}) {
  const sources = opts.sources?.length
    ? LEAD_SOURCES.filter((s) => opts.sources!.includes(s.key))
    : LEAD_SOURCES;
  const limit = opts.limitPerSource ?? 200;

  const results = await Promise.all(
    sources.map(async (s) => {
      const { data, error } = await supabaseAdmin
        .from(s.table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.error(`[admin/leads] ${s.table}:`, error.message);
        return [];
      }
      return (data ?? []).map((row) => toLead(s, row));
    }),
  );

  return results.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLead(source: LeadSourceKey, id: string): Promise<Lead | null> {
  const s = SOURCE_BY_KEY[source];
  const { data } = await supabaseAdmin.from(s.table).select('*').eq('id', id).maybeSingle();
  return data ? toLead(s, data) : null;
}
