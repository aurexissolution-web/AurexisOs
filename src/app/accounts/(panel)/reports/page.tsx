// src/app/accounts/(panel)/reports/page.tsx
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Percent, Scale } from 'lucide-react';
import { accountsAuthed } from '@/lib/accounts/access';
import { loadExpenses, loadIncome, syncFromDocuments } from '@/lib/accounts/data';
import { buildStatement, periodPrefix } from '@/lib/accounts/report';
import { dateKeyOf } from '@/lib/admin/calendar';
import { ButtonLink, PageHeader } from '@/components/admin/ui';
import { PrintButton } from '@/components/accounts/PrintButton';
import { MetricCard, PeriodTabs, Section, TD, TH, rm } from '@/components/accounts/kit';
import { formatDocDate } from '@/lib/documents/model';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const clean = (n: string) => n.replace(/^\[bank-import\]\s*/, '');

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  if (!(await accountsAuthed())) return null;
  await syncFromDocuments();
  const sp = await searchParams;
  const today = dateKeyOf(new Date().toISOString());
  const thisYear = Number(today.slice(0, 4));

  const [{ incomes, payments }, expenses] = await Promise.all([loadIncome(), loadExpenses()]);
  const firstYear = Math.min(thisYear, ...[...payments.map((p) => p.paid_on), ...expenses.map((e) => e.expense_date)].map((d) => Number(d.slice(0, 4))));
  const years = Array.from({ length: thisYear - firstYear + 1 }, (_, i) => thisYear - i);

  const yearN = Number(sp.year);
  const year = sp.year === 'all' ? null : Number.isInteger(yearN) && yearN >= 2000 && yearN <= 2100 ? yearN : thisYear;
  const monthN = Number(sp.month);
  const month = year !== null && monthN >= 1 && monthN <= 12 ? monthN : null;

  const st = buildStatement(incomes, payments, expenses, periodPrefix(year, month));
  const title = year === null ? 'All time' : month ? `${MONTHS[month - 1]} ${year}` : `Year ${year}`;
  const q = `year=${year ?? 'all'}${month ? `&month=${month}` : ''}`;
  const margin = st.totalIncome > 0 ? Math.round((st.profit / st.totalIncome) * 100) : null;

  const monthKeys = month
    ? []
    : [...new Set([...st.received.map((r) => r.date.slice(0, 7)), ...st.spent.map((e) => e.date.slice(0, 7))])].sort();
  const monthly = monthKeys.map((key) => {
    const income = st.received.filter((r) => r.date.startsWith(key)).reduce((s, r) => s + r.amount, 0);
    const spent = st.spent.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
    return { key, income, spent, net: income - spent };
  });

  return (
    <div className="space-y-6">
      <style>{`@media print{body *{visibility:hidden}.report-sheet,.report-sheet *{visibility:visible}.report-sheet{position:absolute;left:0;top:0;width:100%;background:#fff;padding:24px}.report-sheet *{color:#111!important;border-color:#ccc!important;background:transparent!important;box-shadow:none!important}.report-sheet details>*{display:block}}`}</style>
      <div className="space-y-5 print:hidden">
        <PageHeader
          eyebrow="Accounts"
          title="Reports"
          accent="for the books."
          description="Cash basis: income counts on the day the payment arrived. Export the lists for your accountant, or print the statement."
          actions={
            <>
              <ButtonLink href={`/api/accounts/export?type=income&${q}`}>Income CSV</ButtonLink>
              <ButtonLink href={`/api/accounts/export?type=expenses&${q}`}>Expenses CSV</ButtonLink>
              <PrintButton />
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-3">
          <PeriodTabs
            current={year === null ? 'all' : String(year)}
            options={[{ value: 'all', label: 'All time', href: '/accounts/reports?year=all' }, ...years.map((y) => ({ value: String(y), label: String(y), href: `/accounts/reports?year=${y}` }))]}
          />
          {year !== null && (
            <nav aria-label="Month" className="flex flex-wrap gap-1 text-[12px]">
              {MONTHS.map((m, i) => (
                <Link
                  key={m}
                  href={`/accounts/reports?year=${year}${month === i + 1 ? '' : `&month=${i + 1}`}`}
                  aria-current={month === i + 1 ? 'page' : undefined}
                  className={cn('rounded-lg px-2.5 py-1.5', month === i + 1 ? 'bg-white/[0.09] text-white' : 'text-white/45 hover:text-white')}
                >
                  {m.slice(0, 3)}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="report-sheet space-y-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#5EE3DA]">Aurexis Solution · Income &amp; expense statement</p>
          <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.02em]">{title}</h2>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Income received" value={rm(st.totalIncome)} hint={`${st.received.length} payment${st.received.length === 1 ? '' : 's'}`} tone="in" icon={ArrowUpRight} />
          <MetricCard label="Expenses" value={rm(st.totalExpenses)} hint={`${st.spent.length} expense${st.spent.length === 1 ? '' : 's'}`} tone="out" icon={ArrowDownRight} />
          <MetricCard label="Net profit" value={rm(st.profit)} hint={st.profit < 0 ? 'Spent more than came in' : 'Kept after costs'} tone={st.profit < 0 ? 'neg' : 'net'} icon={Scale} />
          <MetricCard label="Margin" value={margin === null ? '—' : `${margin}%`} hint="Net profit ÷ income" icon={Percent} />
        </section>

        {monthly.length > 1 && (
          <Section eyebrow="Month by month" title="Profit and loss" count={`${monthly.length} months`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className={`${TH} pl-5 md:pl-6`}>Month</th>
                    <th className={`${TH} text-right`}>Income</th>
                    <th className={`${TH} text-right`}>Expenses</th>
                    <th className={`${TH} pr-5 text-right md:pr-6`}>Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {monthly.map((m) => (
                    <tr key={m.key} className="hover:bg-white/[0.02]">
                      <td className={`${TD} pl-5 md:pl-6`}>
                        <Link href={`/accounts/reports?year=${m.key.slice(0, 4)}&month=${Number(m.key.slice(5))}`} className="text-white/85 hover:text-[#5EE3DA]">{MONTHS[Number(m.key.slice(5)) - 1]} {m.key.slice(0, 4)}</Link>
                      </td>
                      <td className={`${TD} text-right tabular-nums text-[#5EE3DA]`}>{m.income ? rm(m.income) : '—'}</td>
                      <td className={`${TD} text-right tabular-nums text-white/80`}>{m.spent ? rm(-m.spent) : '—'}</td>
                      <td className={`${TD} pr-5 text-right font-semibold tabular-nums md:pr-6 ${m.net < 0 ? 'text-red-300' : 'text-[#8FE3B0]'}`}>{rm(m.net)}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.04] font-semibold">
                    <td className={`${TD} pl-5 md:pl-6`}>Total</td>
                    <td className={`${TD} text-right tabular-nums text-[#5EE3DA]`}>{rm(st.totalIncome)}</td>
                    <td className={`${TD} text-right tabular-nums`}>{rm(-st.totalExpenses)}</td>
                    <td className={`${TD} pr-5 text-right tabular-nums md:pr-6 ${st.profit < 0 ? 'text-red-300' : 'text-[#8FE3B0]'}`}>{rm(st.profit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
        )}

        <Section eyebrow="Money in" title="Income received" count={rm(st.totalIncome)}>
          {st.received.length === 0 ? (
            <p className="px-6 py-10 text-center text-[13px] text-white/45">No payments received in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className={`${TH} pl-5 md:pl-6`}>Date</th>
                    <th className={TH}>Client</th>
                    <th className={TH}>For</th>
                    <th className={TH}>Via</th>
                    <th className={`${TH} pr-5 text-right md:pr-6`}>Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {st.received.map((r, i) => (
                    <tr key={i}>
                      <td className={`${TD} whitespace-nowrap pl-5 text-white/55 md:pl-6`}>{formatDocDate(r.date)}</td>
                      <td className={`${TD} font-medium text-white`}>{r.client}</td>
                      <td className={`${TD} text-white/55`}>{r.what}</td>
                      <td className={`${TD} text-white/45`}>{[r.method, r.reference].filter(Boolean).join(' · ') || '—'}</td>
                      <td className={`${TD} pr-5 text-right font-semibold tabular-nums text-[#5EE3DA] md:pr-6`}>{rm(r.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.04] font-semibold">
                    <td className={`${TD} pl-5 md:pl-6`} colSpan={4}>Total · {st.received.length} payment{st.received.length === 1 ? '' : 's'}</td>
                    <td className={`${TD} pr-5 text-right tabular-nums text-[#5EE3DA] md:pr-6`}>{rm(st.totalIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section eyebrow="Money out" title="Expenses by category" count={rm(st.totalExpenses)}>
          {st.categories.length === 0 ? (
            <p className="px-6 py-10 text-center text-[13px] text-white/45">No expenses in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className={`${TH} pl-5 md:pl-6`}>Category</th>
                    <th className={`${TH} text-right`}>Items</th>
                    <th className={`${TH} text-right`}>Share</th>
                    <th className={`${TH} pr-5 text-right md:pr-6`}>Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {st.categories.map((c) => (
                    <tr key={c.category}>
                      <td className={`${TD} pl-5 text-white/85 md:pl-6`}>{c.category}</td>
                      <td className={`${TD} text-right tabular-nums text-white/50`}>{c.count}</td>
                      <td className={`${TD} text-right tabular-nums text-white/50`}>{st.totalExpenses ? Math.round((c.total / st.totalExpenses) * 100) : 0}%</td>
                      <td className={`${TD} pr-5 text-right font-semibold tabular-nums md:pr-6`}>{rm(c.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.04] font-semibold">
                    <td className={`${TD} pl-5 md:pl-6`}>Total</td>
                    <td className={`${TD} text-right tabular-nums`}>{st.spent.length}</td>
                    <td className={`${TD} text-right tabular-nums`}>100%</td>
                    <td className={`${TD} pr-5 text-right tabular-nums md:pr-6`}>{rm(st.totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {st.spent.length > 0 && (
          <details className="group overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.025]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 md:px-6">
              <span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#5EE3DA]/80">Full ledger</span>
                <span className="mt-1 block text-[16px] font-semibold text-white">Every expense ({st.spent.length})</span>
              </span>
              <span className="text-[12px] text-white/45 group-open:hidden">Show</span>
              <span className="hidden text-[12px] text-white/45 group-open:inline">Hide</span>
            </summary>
            <div className="overflow-x-auto border-t border-white/[0.1]">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className={`${TH} pl-5 md:pl-6`}>Date</th>
                    <th className={TH}>Paid to</th>
                    <th className={TH}>Category</th>
                    <th className={`${TH} pr-5 text-right md:pr-6`}>Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {st.spent.map((e, i) => (
                    <tr key={i}>
                      <td className={`${TD} whitespace-nowrap pl-5 text-white/55 md:pl-6`}>{formatDocDate(e.date)}</td>
                      <td className={TD}>
                        <span className="text-white/85">{e.vendor || '—'}</span>
                        {clean(e.notes) && <span className="ml-2 text-[12px] text-white/35">{clean(e.notes)}</span>}
                      </td>
                      <td className={`${TD} text-white/55`}>{e.category}</td>
                      <td className={`${TD} pr-5 text-right tabular-nums md:pr-6`}>{rm(e.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.04] font-semibold">
                    <td className={`${TD} pl-5 md:pl-6`} colSpan={3}>Total</td>
                    <td className={`${TD} pr-5 text-right tabular-nums md:pr-6`}>{rm(st.totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
