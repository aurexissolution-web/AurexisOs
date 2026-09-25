// src/app/accounts/(panel)/expenses/page.tsx
import { ArrowDownRight, CalendarRange, Receipt, Tags } from 'lucide-react';
import { accountsAuthed } from '@/lib/accounts/access';
import { loadExpenses } from '@/lib/accounts/data';
import { activeMonths, ledger, monthSeries } from '@/lib/accounts/model';
import { dateKeyOf } from '@/lib/admin/calendar';
import { PageHeader } from '@/components/admin/ui';
import { ExpensesBoard } from '@/components/accounts/ExpensesBoard';
import { BarList, MetricCard, Section, rm } from '@/components/accounts/kit';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ new?: string; category?: string }> }) {
  if (!(await accountsAuthed())) return null;
  const expenses = await loadExpenses();
  const sp = await searchParams;
  const today = dateKeyOf(new Date().toISOString());
  const L = ledger([], [], expenses, '');
  const thisMonth = ledger([], [], expenses, today.slice(0, 7));
  const months = monthSeries([], expenses, activeMonths([], expenses, today, 120)).filter((m) => m.expenses > 0);
  const avg = months.length ? L.spent / months.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Accounts" title="Expenses" accent="out the door." description="Every cost, from the bank statements and anything you add. Referral payouts land here automatically. Click a category to filter the ledger." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Spent, all time" value={rm(L.spent)} hint={`${L.expenseCount} expenses`} tone="out" icon={ArrowDownRight} />
        <MetricCard label="This month" value={rm(thisMonth.spent)} hint={`${thisMonth.expenseCount} expenses so far`} icon={CalendarRange} />
        <MetricCard label="Monthly average" value={rm(avg)} hint={`Across ${months.length} month${months.length === 1 ? '' : 's'} with spending`} icon={Receipt} />
        <MetricCard label="Biggest category" value={L.byCategory[0] ? rm(L.byCategory[0].total) : '—'} hint={L.byCategory[0]?.name ?? 'No expenses yet'} icon={Tags} />
      </section>
      <Section eyebrow="By category" title="Where it went" count={`${L.byCategory.length} categories`}>
        <BarList rows={L.byCategory.map((c) => ({ ...c, href: `/accounts/expenses?category=${encodeURIComponent(c.name)}` }))} color="#F0C88F" empty="No expenses yet." />
      </Section>
      <ExpensesBoard key={sp.category ?? ''} expenses={expenses} today={today} startOpen={sp.new === '1'} startCategory={sp.category ?? ''} />
    </div>
  );
}
