'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import { Button, Input, Label, Pill, Segmented, Textarea, useToast } from '@/components/admin/ui';
import { deleteReferral, deleteReferrer, payReferral, saveReferral, saveReferrer, undoReferralPayout } from '@/app/accounts/(panel)/actions';
import { groupPayments, incomeBalance, referralState, rewardAmount, type Income, type Payment, type Referral } from '@/lib/accounts/model';
import { formatDocDate } from '@/lib/documents/model';
import { Section, TD, TH, rm } from './kit';
import { Modal, selectCls } from './Modal';

export type Referrer = { id: string; name: string; phone: string; bank_name: string; bank_account: string; notes: string };
const METHODS = ['Bank transfer', 'DuitNow', 'Cash', 'Other'];
type Result = { ok: true } | { ok: false; error: string };
const STATE = {
  paid: { label: 'Paid', color: '#7FE8C4' },
  payable: { label: 'Ready to pay', color: '#F0C88F' },
  waiting: { label: 'Waiting for client', color: '#9CA3AF' },
} as const;

export function ReferralsBoard({ referrals, referrers, incomes, payments, clients, today }: {
  referrals: Referral[]; referrers: Referrer[]; incomes: Income[]; payments: Payment[]; clients: { id: string; name: string }[]; today: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const byIncome = useMemo(() => groupPayments(payments), [payments]);
  const incomeById = useMemo(() => new Map(incomes.map((i) => [i.id, i])), [incomes]);
  const referrerById = useMemo(() => new Map(referrers.map((r) => [r.id, r])), [referrers]);

  const run = async (fn: () => Promise<Result>, okMsg: string) => {
    setBusy(true);
    const r = await fn();
    setBusy(false);
    if (!r.ok) {
      toast('error', r.error);
      return false;
    }
    toast('ok', okMsg);
    router.refresh();
    return true;
  };

  const blankRef = { id: undefined as string | undefined, referrerId: '', clientName: '', clientId: null as string | null, project: '', incomeId: '', baseAmount: '', rewardKind: 'percent' as 'percent' | 'fixed', rewardValue: '10', payWhen: 'full' as 'full' | 'first_payment', notes: '' };
  const [rf, setRf] = useState(blankRef);
  const [showRf, setShowRf] = useState(false);
  const reward = rewardAmount(rf.rewardKind, Number(rf.rewardValue) || 0, Number(rf.baseAmount) || 0);

  const pickIncome = (id: string) => {
    const inc = incomeById.get(id);
    setRf((f) => (inc ? { ...f, incomeId: id, clientName: inc.client_name, clientId: inc.client_id, project: inc.project || inc.description, baseAmount: String(inc.amount) } : { ...f, incomeId: '' }));
  };
  const pickClient = (name: string) => {
    const c = clients.find((x) => x.name.toLowerCase() === name.trim().toLowerCase());
    setRf((f) => ({ ...f, clientName: name, clientId: c?.id ?? null }));
  };
  const submitRf = async () => {
    const ok = await run(
      () => saveReferral({ id: rf.id, referrerId: rf.referrerId, clientId: rf.clientId, clientName: rf.clientName, project: rf.project, incomeId: rf.incomeId || null, baseAmount: Number(rf.baseAmount) || 0, rewardKind: rf.rewardKind, rewardValue: Number(rf.rewardValue) || 0, payWhen: rf.payWhen, notes: rf.notes }),
      rf.id ? 'Referral updated' : 'Referral saved',
    );
    if (ok) setShowRf(false);
  };
  const editRf = (r: Referral) => {
    setRf({ id: r.id, referrerId: r.referrer_id, clientName: r.client_name, clientId: r.client_id, project: r.project, incomeId: r.income_id ?? '', baseAmount: String(r.base_amount), rewardKind: r.reward_kind, rewardValue: String(r.reward_value), payWhen: r.pay_when, notes: r.notes });
    setShowRf(true);
  };

  const [paying, setPaying] = useState<Referral | null>(null);
  const [payForm, setPayForm] = useState({ paidOn: today, method: 'Bank transfer', reference: '' });

  const blankPerson = { id: undefined as string | undefined, name: '', phone: '', bankName: '', bankAccount: '', notes: '' };
  const [pf, setPf] = useState(blankPerson);
  const [showPf, setShowPf] = useState(false);
  const submitPf = async () => {
    if (await run(() => saveReferrer(pf), pf.id ? 'Referrer updated' : 'Referrer saved')) setShowPf(false);
  };
  const addReferral = () => {
    if (referrers.length === 0) {
      toast('error', 'Add a referrer first.');
      setPf(blankPerson);
      setShowPf(true);
      return;
    }
    setRf(blankRef);
    setShowRf(true);
  };

  const rows = referrals.map((r) => {
    const inc = r.income_id ? incomeById.get(r.income_id) : undefined;
    const linked = inc ? incomeBalance(inc, byIncome.get(inc.id) ?? []) : null;
    return { r, state: referralState(r, linked), linked };
  });
  const sum = (xs: typeof rows) => xs.reduce((s, x) => s + x.r.reward_amount, 0);

  return (
    <>
      <Section
        eyebrow="Referral ledger"
        title="Every reward"
        count={`${rows.length} · ${rm(sum(rows))}`}
        action={<Button variant="primary" size="sm" onClick={addReferral}><Plus className="h-3.5 w-3.5" />Add referral</Button>}
      >
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-[13px] text-white/45">No referrals yet. When someone sends you a client, add it here and we track the reward.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className={`${TH} pl-5 md:pl-6`}>Referred by</th>
                  <th className={TH}>Client</th>
                  <th className={TH}>Deal</th>
                  <th className={`${TH} text-right`}>Reward</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} pr-5 text-right md:pr-6`}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {rows.map(({ r, state, linked }) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} pl-5 font-semibold text-white md:pl-6`}>{referrerById.get(r.referrer_id)?.name ?? 'Unknown'}</td>
                    <td className={TD}>
                      <p className="text-white/85">{r.client_name}</p>
                      <p className="mt-0.5 text-[12px] text-white/40">{r.project || 'No project'}</p>
                    </td>
                    <td className={`${TD} text-white/55`}>
                      {r.reward_kind === 'percent' ? `${r.reward_value}% of ${rm(r.base_amount)}` : 'Fixed reward'}
                      {state === 'waiting' && linked && <p className="mt-0.5 text-[12px] text-amber-300/80">Client still owes {rm(linked.balance)}</p>}
                    </td>
                    <td className={`${TD} text-right font-semibold tabular-nums text-white`}>{rm(r.reward_amount)}</td>
                    <td className={TD}><Pill color={STATE[state].color}>{STATE[state].label}{state === 'paid' && r.paid_on ? ` ${formatDocDate(r.paid_on)}` : ''}</Pill></td>
                    <td className={`${TD} whitespace-nowrap pr-5 text-right md:pr-6`}>
                      {state === 'payable' && <Button size="sm" variant="primary" onClick={() => { setPaying(r); setPayForm({ paidOn: today, method: 'Bank transfer', reference: '' }); }}>Pay</Button>}
                      {state === 'paid' && <Button size="sm" variant="ghost" disabled={busy} onClick={() => window.confirm('Undo this payout? The expense is removed too.') && run(() => undoReferralPayout(r.id), 'Payout undone')}><Undo2 className="h-3.5 w-3.5" /> Undo</Button>}
                      {state !== 'paid' && <Button size="sm" variant="ghost" aria-label="Edit referral" onClick={() => editRf(r)}><Pencil className="h-3.5 w-3.5" /></Button>}
                      {state !== 'paid' && <Button size="sm" variant="ghost" aria-label="Delete referral" disabled={busy} onClick={() => window.confirm('Delete this referral?') && run(() => deleteReferral(r.id), 'Referral deleted')}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </td>
                  </tr>
                ))}
                <tr className="bg-white/[0.04] font-semibold">
                  <td className={`${TD} pl-5 md:pl-6`} colSpan={3}>Total · paid {rm(sum(rows.filter((x) => x.state === 'paid')))} · still to pay {rm(sum(rows.filter((x) => x.state !== 'paid')))}</td>
                  <td className={`${TD} text-right tabular-nums`}>{rm(sum(rows))}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section
        eyebrow="People"
        title="Referrers"
        count={referrers.length}
        action={<Button variant="ghost" size="sm" onClick={() => { setPf(blankPerson); setShowPf(true); }}><Plus className="h-3.5 w-3.5" />Add referrer</Button>}
      >
        {referrers.length === 0 ? (
          <p className="px-6 py-12 text-center text-[13px] text-white/45">No referrers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className={`${TH} pl-5 md:pl-6`}>Name</th>
                  <th className={TH}>Contact and bank</th>
                  <th className={`${TH} text-right`}>Referrals</th>
                  <th className={`${TH} text-right`}>Paid</th>
                  <th className={`${TH} text-right`}>To pay</th>
                  <th className={`${TH} pr-5 text-right md:pr-6`}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {referrers.map((p) => {
                  const mine = rows.filter((x) => x.r.referrer_id === p.id);
                  const owed = sum(mine.filter((x) => x.state !== 'paid'));
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className={`${TD} pl-5 font-semibold text-white md:pl-6`}>{p.name}</td>
                      <td className={`${TD} text-white/50`}>{[p.phone, [p.bank_name, p.bank_account].filter(Boolean).join(' ')].filter(Boolean).join(' · ') || 'No contact saved'}</td>
                      <td className={`${TD} text-right tabular-nums text-white/70`}>{mine.length}</td>
                      <td className={`${TD} text-right tabular-nums text-[#5EE3DA]`}>{rm(sum(mine.filter((x) => x.state === 'paid')))}</td>
                      <td className={`${TD} text-right tabular-nums ${owed > 0 ? 'text-amber-300/90' : 'text-white/35'}`}>{owed > 0 ? rm(owed) : '—'}</td>
                      <td className={`${TD} whitespace-nowrap pr-5 text-right md:pr-6`}>
                        <Button size="sm" variant="ghost" aria-label="Edit referrer" onClick={() => { setPf({ id: p.id, name: p.name, phone: p.phone, bankName: p.bank_name, bankAccount: p.bank_account, notes: p.notes }); setShowPf(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" aria-label="Delete referrer" disabled={busy} onClick={() => window.confirm(`Delete ${p.name}?`) && run(() => deleteReferrer(p.id), 'Referrer deleted')}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Modal
        open={showRf}
        title={rf.id ? 'Edit referral' : 'Add referral'}
        description="A reward becomes payable once the linked client has paid."
        onClose={() => setShowRf(false)}
        footer={<><Button variant="ghost" onClick={() => setShowRf(false)}>Cancel</Button><Button variant="primary" disabled={busy} onClick={submitRf}>{rf.id ? 'Save changes' : 'Save referral'}</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Referred by</Label>
            <select value={rf.referrerId} onChange={(e) => setRf({ ...rf, referrerId: e.target.value })} className={selectCls}>
              <option value="">Choose a referrer</option>
              {referrers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Label hint="ties the reward to a payment">Linked income</Label>
            <select value={rf.incomeId} onChange={(e) => pickIncome(e.target.value)} className={selectCls}>
              <option value="">Not linked</option>
              {incomes.map((i) => <option key={i.id} value={i.id}>{i.client_name} · {i.description || i.project} · {rm(i.amount)}</option>)}
            </select>
          </div>
          <div>
            <Label>Client they referred</Label>
            <Input list="ref-clients" value={rf.clientName} onChange={(e) => pickClient(e.target.value)} />
            <datalist id="ref-clients">{clients.map((c) => <option key={c.id} value={c.name} />)}</datalist>
          </div>
          <div><Label>Project</Label><Input value={rf.project} onChange={(e) => setRf({ ...rf, project: e.target.value })} /></div>
          <div><Label hint="RM">Project value</Label><Input type="number" min={0} step="0.01" value={rf.baseAmount} onChange={(e) => setRf({ ...rf, baseAmount: e.target.value })} /></div>
          <div>
            <Label>Reward</Label>
            <div className="flex items-center gap-2">
              <Segmented size="sm" value={rf.rewardKind} onChange={(v) => setRf({ ...rf, rewardKind: v })} options={[{ value: 'percent', label: '%' }, { value: 'fixed', label: 'RM' }]} />
              <Input type="number" min={0} step="0.01" value={rf.rewardValue} onChange={(e) => setRf({ ...rf, rewardValue: e.target.value })} />
            </div>
            <p className="mt-1.5 text-[12px] text-white/50">Reward: <span className="font-semibold text-white">{rm(reward)}</span></p>
          </div>
          <div className="sm:col-span-2">
            <Label>Payable when</Label>
            <Segmented value={rf.payWhen} onChange={(v) => setRf({ ...rf, payWhen: v })} options={[{ value: 'full', label: 'Client paid in full' }, { value: 'first_payment', label: 'After first payment' }]} />
          </div>
          <div className="sm:col-span-2"><Label>Notes</Label><Textarea rows={2} value={rf.notes} onChange={(e) => setRf({ ...rf, notes: e.target.value })} /></div>
        </div>
      </Modal>

      <Modal
        open={!!paying}
        title={paying ? `Pay ${rm(paying.reward_amount)} to ${referrerById.get(paying.referrer_id)?.name ?? 'referrer'}` : 'Pay reward'}
        description="This also adds the payout to Expenses as a referral fee."
        onClose={() => setPaying(null)}
        footer={<><Button variant="ghost" onClick={() => setPaying(null)}>Cancel</Button><Button variant="primary" disabled={busy} onClick={async () => { if (paying && (await run(() => payReferral({ id: paying.id, ...payForm }), 'Reward paid and added to expenses'))) setPaying(null); }}>Confirm payout</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Paid on</Label><Input type="date" value={payForm.paidOn} onChange={(e) => setPayForm({ ...payForm, paidOn: e.target.value })} /></div>
          <div><Label>Paid via</Label><select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} className={selectCls}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
          <div className="sm:col-span-2"><Label>Reference</Label><Input value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} /></div>
        </div>
      </Modal>

      <Modal
        open={showPf}
        title={pf.id ? 'Edit referrer' : 'Add referrer'}
        onClose={() => setShowPf(false)}
        footer={<><Button variant="ghost" onClick={() => setShowPf(false)}>Cancel</Button><Button variant="primary" disabled={busy} onClick={submitPf}>{pf.id ? 'Save changes' : 'Save referrer'}</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Name</Label><Input value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={pf.phone} onChange={(e) => setPf({ ...pf, phone: e.target.value })} /></div>
          <div><Label>Bank</Label><Input value={pf.bankName} onChange={(e) => setPf({ ...pf, bankName: e.target.value })} /></div>
          <div><Label>Account number</Label><Input value={pf.bankAccount} onChange={(e) => setPf({ ...pf, bankAccount: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Notes</Label><Textarea rows={2} value={pf.notes} onChange={(e) => setPf({ ...pf, notes: e.target.value })} /></div>
        </div>
      </Modal>
    </>
  );
}
