// src/app/accounts/(panel)/page.tsx
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, HandCoins, Plus, TrendingUp, Wallet } from 'lucide-react';
import { accountsAuthed } from '@/lib/accounts/access';
import { loadExpenses, loadIncome, loadReferrals, syncFromDocuments } from '@/lib/accounts/data';
import { activeMonths, ledger, monthSeries, periodKey, summarize, type Period } from '@/lib/accounts/model';
import { dateKeyOf } from '@/lib/admin/calendar';
import { ButtonLink } from '@/components/admin/ui';
import { BarList, MetricCard, PeriodTabs, Section, StatusChip, rm } from '@/components/accounts/kit';
import { formatDocDate } from '@/lib/documents/model';

export const dynamic = 'force-dynamic';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default async function AccountsOverview({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  if (!(await accountsAuthed())) return null;
  await syncFromDocuments();
  const [{ incomes, payments }, expenses, { referrals }] = await Promise.all([loadIncome(), loadExpenses(), loadReferrals()]);
  const sp = await searchParams;
  const period: Period = sp.period === 'year' || sp.period === 'month' ? sp.period : 'all';
  const today = dateKeyOf(new Date().toISOString());
  const L = ledger(incomes, payments, expenses, periodKey(period, today));
  const s = summarize(incomes, payments, expenses, referrals, today);
  const series = monthSeries(payments, expenses, activeMonths(payments, expenses, today));
  const peak = Math.max(1, ...series.flatMap((m) => [m.income, m.expenses]));
  const periodLabel = period === 'all' ? 'All time' : period === 'year' ? `Year ${today.slice(0, 4)}` : `${FULL[Number(today.slice(5, 7)) - 1]} ${today.slice(0, 4)}`;
  const todayLabel = new Intl.DateTimeFormat('en-MY', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date());

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#5EE3DA]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5EE3DA] shadow-[0_0_8px_rgba(94,227,218,0.8)]" />
            Aurexis accounts
          </p>
          <h1 className="mt-3 text-[30px] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-[40px]">
            Everything, <span className="font-serif font-normal italic text-[#5EE3DA]">in balance.</span>
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-[1.6] text-white/50">Every ringgit in and out of Aurexis, from the first transfer to today. Invoices and receipts from Documents flow in on their own.</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <StatusChip>{periodLabel} view</StatusChip>
          <span className="text-[12px] text-white/40">{todayLabel}</span>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodTabs
          current={period}
          options={[
            { value: 'all', label: 'All time', href: '/accounts' },
            { value: 'year', label: 'This year', href: '/accounts?period=year' },
            { value: 'month', label: 'This month', href: '/accounts?period=month' },
          ]}
        />
        <div className="flex gap-2">
          <ButtonLink href="/accounts/expenses?new=1"><Plus className="h-4 w-4" />Add expense</ButtonLink>
          <ButtonLink href="/accounts/income?new=1" variant="primary"><Plus className="h-4 w-4" />Add income</ButtonLink>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Money received" value={rm(L.received)} hint={`${L.paymentCount} payment${L.paymentCount === 1 ? '' : 's'} from ${L.byClient.length} client${L.byClient.length === 1 ? '' : 's'}`} tone="in" icon={ArrowUpRight} />
        <MetricCard label="Outgoings" value={rm(L.spent)} hint={`${L.expenseCount.toLocaleString('en-MY')} expense${L.expenseCount === 1 ? '' : 's'} recorded`} tone="out" icon={ArrowDownRight} />
        <MetricCard label="Net position" value={rm(L.net)} hint="Received less outgoings" tone={L.net < 0 ? 'neg' : 'net'} icon={TrendingUp} />
        <MetricCard label="Still to collect" value={rm(s.owedTotal)} hint={s.owed.length ? `${s.owed.length} open invoice${s.owed.length === 1 ? '' : 's'}` : 'Nothing waiting for payment'} icon={HandCoins} />
      </section>

      <Section eyebrow="Business pulse" title="Money in and out, month by month" count={`${series.length} months`}>
        <div className="overflow-x-auto">
          <div className="flex h-64 min-w-[560px] items-end gap-3 px-5 pb-3 pt-8 md:px-6">
            {series.map((m) => (
              <div key={m.key} className="group flex h-full flex-1 flex-col justify-end gap-2">
                <div className="relative flex flex-1 items-end justify-center gap-1">
                  <div className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-[#0b0f16] px-2.5 py-1.5 text-[11px] text-white/80 shadow-lg group-hover:block">
                    <span className="text-[#5EE3DA]">In {rm(m.income)}</span> · Out {rm(m.expenses)}
                  </div>
                  <div className="w-full max-w-[22px] rounded-t-[4px] bg-[#5EE3DA]" style={{ height: `${m.income ? Math.max(2, (m.income / peak) * 100) : 0}%` }} />
                  <div className="w-full max-w-[22px] rounded-t-[4px] bg-white/35" style={{ height: `${m.expenses ? Math.max(2, (m.expenses / peak) * 100) : 0}%` }} />
                </div>
                <p className="text-center font-mono text-[10px] uppercase tracking-wider text-white/40">
                  {MONTHS[Number(m.key.slice(5)) - 1]}
                  {m.key.endsWith('-01') || m.key === series[0].key ? <span className="block text-white/25">{m.key.slice(0, 4)}</span> : null}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-5 border-t border-white/[0.08] px-5 py-3 text-[11.5px] text-white/50 md:px-6">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#5EE3DA]" />Received</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-white/35" />Spent</span>
          <span className="ml-auto">Hover a month for exact figures</span>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section eyebrow="Where it came from" title="Income by client" count={rm(L.received)} action={<Link href="/accounts/income" className="text-[12.5px] font-semibold text-[#5EE3DA] hover:underline">Open income</Link>}>
          <BarList rows={L.byClient} empty="No payments received in this period." />
        </Section>
        <Section eyebrow="Where it went" title="Outgoings by category" count={rm(L.spent)} action={<Link href="/accounts/expenses" className="text-[12.5px] font-semibold text-[#5EE3DA] hover:underline">Open expenses</Link>}>
          <BarList rows={L.byCategory.slice(0, 8).map((c) => ({ ...c, href: `/accounts/expenses?category=${encodeURIComponent(c.name)}` }))} color="rgba(255,255,255,0.45)" empty="No expenses in this period." />
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Section eyebrow="Latest activity" title="Your most recent entries" count={L.activity.length}>
          {L.activity.length === 0 ? (
            <p className="px-6 py-10 text-center text-[13px] text-white/45">Nothing recorded in this period yet.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {L.activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3 md:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${a.kind === 'income' ? 'bg-[#5EE3DA]/10 text-[#5EE3DA] ring-[#5EE3DA]/25' : 'bg-white/[0.05] text-white/60 ring-white/10'}`}>
                      {a.kind === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-white">{a.title}</p>
                      <p className="truncate text-[12px] text-white/45">{a.detail} · {formatDocDate(a.date)}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[13.5px] font-bold tabular-nums ${a.kind === 'income' ? 'text-[#5EE3DA]' : 'text-white/80'}`}>
                    {a.amount < 0 ? '−' : '+'}{rm(Math.abs(a.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="space-y-6">
          <Section eyebrow="Owed to you" title="Waiting for payment" count={rm(s.owedTotal)}>
            {s.owed.length === 0 ? (
              <p className="px-6 py-8 text-center text-[13px] text-white/45">Every invoice is paid.</p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {s.owed.slice(0, 6).map((o) => (
                  <li key={o.income.id} className="flex items-center justify-between gap-3 px-5 py-3 md:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{o.income.client_name}</p>
                      <p className={`text-[11.5px] ${o.ageDays > 14 ? 'text-amber-300/90' : 'text-white/40'}`}>{o.state === 'partial' ? 'Part paid · ' : ''}{o.ageDays} days old</p>
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums">{rm(o.balance)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section eyebrow="Referrals" title="You owe referrers" count={rm(s.referrersOwed)}>
            <div className="space-y-1 px-5 py-5 md:px-6">
              <p className="text-[13px] text-white/60">{rm(s.referrersOwed)} ready to pay now, {rm(s.referrersWaiting)} more once those clients pay.</p>
              <Link href="/accounts/referrals" className="inline-block pt-2 text-[12.5px] font-semibold text-[#5EE3DA] hover:underline">Open referrals</Link>
            </div>
          </Section>
        </div>
      </div>

      <p className="flex items-center gap-2 text-[12px] text-white/35"><Wallet className="h-3.5 w-3.5" />Cash basis: income counts on the day the money arrived.</p>
    </div>
  );
}
