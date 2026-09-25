// src/app/accounts/(panel)/income/page.tsx
import { ArrowUpRight, FileText, HandCoins, Users } from 'lucide-react';
import { accountsAuthed } from '@/lib/accounts/access';
import { loadClients, loadIncome, syncFromDocuments } from '@/lib/accounts/data';
import { groupPayments, incomeBalance, ledger } from '@/lib/accounts/model';
import { dateKeyOf } from '@/lib/admin/calendar';
import { PageHeader } from '@/components/admin/ui';
import { IncomeBoard } from '@/components/accounts/IncomeBoard';
import { BarList, MetricCard, Section, rm } from '@/components/accounts/kit';

export const dynamic = 'force-dynamic';

export default async function IncomePage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  if (!(await accountsAuthed())) return null;
  await syncFromDocuments();
  const [{ incomes, payments }, clients] = await Promise.all([loadIncome(), loadClients()]);
  const sp = await searchParams;
  const L = ledger(incomes, payments, [], '');
  const byIncome = groupPayments(payments);
  const owed = incomes.map((i) => incomeBalance(i, byIncome.get(i.id) ?? [])).filter((b) => b.balance > 0);
  const owedTotal = owed.reduce((s, b) => s + b.balance, 0);
  const invoiced = incomes.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Accounts" title="Income" accent="in and owed." description="Every invoice from Documents lands here and each receipt marks its payment. Click a row to see its payments or record a new one." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Received, all time" value={rm(L.received)} hint={`${L.paymentCount} payment${L.paymentCount === 1 ? '' : 's'}`} tone="in" icon={ArrowUpRight} />
        <MetricCard label="Still owed" value={owedTotal > 0 ? rm(owedTotal) : 'All paid'} hint={owed.length ? `${owed.length} open ${owed.length === 1 ? 'entry' : 'entries'}` : 'Nothing waiting for payment'} tone={owedTotal > 0 ? 'neg' : 'plain'} icon={HandCoins} />
        <MetricCard label="Invoiced" value={rm(invoiced)} hint={`${incomes.length} ${incomes.length === 1 ? 'entry' : 'entries'}`} icon={FileText} />
        <MetricCard label="Clients paid" value={String(L.byClient.length)} hint={L.byClient[0] ? `Biggest: ${L.byClient[0].name}` : 'No payments yet'} icon={Users} />
      </section>
      <Section eyebrow="By client" title="Who has paid you" count={rm(L.received)}>
        <BarList rows={L.byClient} empty="No payments yet." />
      </Section>
      <IncomeBoard incomes={incomes} payments={payments} clients={clients} today={dateKeyOf(new Date().toISOString())} startOpen={sp.new === '1'} />
    </div>
  );
}
