// src/app/accounts/(panel)/referrals/page.tsx
import { CheckCircle2, Clock, HandCoins, Users } from 'lucide-react';
import { accountsAuthed } from '@/lib/accounts/access';
import { loadClients, loadIncome, loadReferrals, syncFromDocuments } from '@/lib/accounts/data';
import { groupPayments, incomeBalance, referralState } from '@/lib/accounts/model';
import { dateKeyOf } from '@/lib/admin/calendar';
import { PageHeader } from '@/components/admin/ui';
import { ReferralsBoard } from '@/components/accounts/ReferralsBoard';
import { MetricCard, rm } from '@/components/accounts/kit';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  if (!(await accountsAuthed())) return null;
  await syncFromDocuments();
  const [{ incomes, payments }, { referrals, referrers }, clients] = await Promise.all([loadIncome(), loadReferrals(), loadClients()]);
  const byIncome = groupPayments(payments);
  const incomeById = new Map(incomes.map((i) => [i.id, i]));
  const totals = { paid: 0, payable: 0, waiting: 0 };
  const counts = { paid: 0, payable: 0, waiting: 0 };
  for (const r of referrals) {
    const inc = r.income_id ? incomeById.get(r.income_id) : undefined;
    const st = referralState(r, inc ? incomeBalance(inc, byIncome.get(inc.id) ?? []) : null);
    totals[st] += r.reward_amount;
    counts[st] += 1;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Accounts" title="Referrals" accent="paid fairly." description="Who sent you a client and what you owe them. A reward becomes payable once the client has paid, and paying it adds an expense automatically." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ready to pay" value={rm(totals.payable)} hint={`${counts.payable} reward${counts.payable === 1 ? '' : 's'}`} tone={totals.payable > 0 ? 'neg' : 'plain'} icon={HandCoins} />
        <MetricCard label="Waiting for client" value={rm(totals.waiting)} hint={`${counts.waiting} reward${counts.waiting === 1 ? '' : 's'}`} icon={Clock} />
        <MetricCard label="Paid out" value={rm(totals.paid)} hint={`${counts.paid} reward${counts.paid === 1 ? '' : 's'}`} tone="in" icon={CheckCircle2} />
        <MetricCard label="Referrers" value={String(referrers.length)} hint={`${referrals.length} referral${referrals.length === 1 ? '' : 's'} in total`} icon={Users} />
      </section>
      <ReferralsBoard referrals={referrals} referrers={referrers} incomes={incomes} payments={payments} clients={clients} today={dateKeyOf(new Date().toISOString())} />
    </div>
  );
}
