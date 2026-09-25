// src/lib/admin/stats.ts
// Aggregates for the sidebar badges and the Overview page. Service role —
// callers must have passed requireAdmin().
import 'server-only';
import { cache } from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { LEAD_SOURCES, type LeadSourceKey } from './lead-sources';
import { listLeads } from './leads';

async function count(table: string, status?: string): Promise<number> {
  let q = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
  if (status) q = q.eq('status', status);
  const { count: c, error } = await q;
  if (error) {
    console.error(`[admin/stats] ${table}:`, error.message);
    return 0;
  }
  return c ?? 0;
}

export const getNavCounts = cache(async () => {
  const [newLeads, pendingReviews] = await Promise.all([
    Promise.all(LEAD_SOURCES.map((s) => count(s.table, 'new'))).then((a) =>
      a.reduce((x, y) => x + y, 0),
    ),
    count('reviews', 'pending'),
  ]);
  return { newLeads, pendingReviews };
});

const DAY = 86_400_000;

export async function getOverview() {
  const [leads, pendingReviews, publishedInsights, draftInsights, liveWork, draftWork] =
    await Promise.all([
      listLeads({ limitPerSource: 500 }),
      count('reviews', 'pending'),
      count('insights_posts', 'published'),
      count('insights_posts', 'draft'),
      count('case_studies', 'published'),
      count('case_studies', 'draft'),
    ]);

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const ts = (iso: string) => new Date(iso).getTime();

  const thisWeek = leads.filter((l) => now - ts(l.createdAt) < 7 * DAY).length;
  const lastWeek = leads.filter((l) => {
    const age = now - ts(l.createdAt);
    return age >= 7 * DAY && age < 14 * DAY;
  }).length;
  const monthStart = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1).getTime();

  // Last 30 days, one bucket per day, split by source.
  const days: { date: string; bySource: Partial<Record<LeadSourceKey, number>>; total: number }[] =
    [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * DAY);
    days.push({ date: d.toISOString().slice(0, 10), bySource: {}, total: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  for (const l of leads) {
    const local = new Date(ts(l.createdAt));
    local.setHours(0, 0, 0, 0);
    const key = new Date(local.getTime()).toISOString().slice(0, 10);
    const i = dayIndex.get(key);
    if (i === undefined) continue;
    days[i].bySource[l.source] = (days[i].bySource[l.source] ?? 0) + 1;
    days[i].total += 1;
  }

  const bySource = LEAD_SOURCES.map((s) => ({
    key: s.key,
    label: s.label,
    accent: s.accent,
    total: leads.filter((l) => l.source === s.key && now - ts(l.createdAt) < 30 * DAY).length,
  }));

  const funnel = {
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    won: leads.filter((l) => l.status === 'won').length,
  };

  return {
    newLeads: funnel.new,
    today: leads.filter((l) => ts(l.createdAt) >= startOfToday.getTime()).length,
    thisWeek,
    lastWeek,
    wonThisMonth: leads.filter((l) => l.status === 'won' && ts(l.createdAt) >= monthStart).length,
    pendingReviews,
    publishedInsights,
    draftInsights,
    liveWork,
    draftWork,
    days,
    bySource,
    funnel,
    needsYou: leads.filter((l) => l.status === 'new').slice(0, 6),
  };
}
