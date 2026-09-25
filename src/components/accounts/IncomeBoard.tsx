'use client';

import { Fragment, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown, FileText, Plus, Search, Trash2 } from 'lucide-react';
import { Button, Input, Label, Pill, Segmented, Switch, Textarea, useToast } from '@/components/admin/ui';
import { addIncome, deleteIncome, deletePayment, recordPayment } from '@/app/accounts/(panel)/actions';
import { groupPayments, incomeBalance, type Income, type Payment } from '@/lib/accounts/model';
import { formatDocDate } from '@/lib/documents/model';
import { Section, TD, TH, rm } from './kit';
import { Modal, selectCls } from './Modal';

const METHODS = ['Bank transfer', 'DuitNow', 'Cash', 'Cheque', 'Card', 'Other'];
type Filter = 'all' | 'owed' | 'paid';
const STATE = {
  paid: { label: 'Paid', color: '#7FE8C4' },
  partial: { label: 'Part paid', color: '#F0C88F' },
  owed: { label: 'Owed', color: '#F08F8F' },
} as const;
const clean = (n: string) => n.replace(/^\[bank-import\]\s*/, '');

export function IncomeBoard({ incomes, payments, clients, today, startOpen }: { incomes: Income[]; payments: Payment[]; clients: { id: string; name: string }[]; today: string; startOpen: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [client, setClient] = useState('');
  const [adding, setAdding] = useState(startOpen);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const blank = { date: today, clientName: '', clientId: null as string | null, project: '', description: '', amount: '', receivedNow: true, paidOn: today, method: 'Bank transfer', reference: '', notes: '' };
  const [form, setForm] = useState(blank);
  const [pay, setPay] = useState({ amount: '', paidOn: today, method: 'Bank transfer', reference: '' });

  const byIncome = useMemo(() => groupPayments(payments), [payments]);
  const clientNames = useMemo(() => [...new Set(incomes.map((i) => i.client_name))].sort(), [incomes]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return incomes
      .map((income) => ({ income, pays: byIncome.get(income.id) ?? [], ...incomeBalance(income, byIncome.get(income.id) ?? []) }))
      .filter((r) => (filter === 'all' ? true : filter === 'paid' ? r.state === 'paid' : r.state !== 'paid'))
      .filter((r) => !client || r.income.client_name === client)
      .filter((r) => !q || `${r.income.client_name} ${r.income.description} ${r.income.project} ${r.income.notes}`.toLowerCase().includes(q))
      .sort((a, b) => b.income.income_date.localeCompare(a.income.income_date));
  }, [incomes, byIncome, filter, client, query]);
  const totals = rows.reduce((t, r) => ({ amount: t.amount + r.income.amount, paid: t.paid + r.paid, balance: t.balance + r.balance }), { amount: 0, paid: 0, balance: 0 });

  const run = async (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, okMsg: string) => {
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
  const pickClient = (name: string) => {
    const c = clients.find((x) => x.name.toLowerCase() === name.trim().toLowerCase());
    setForm((f) => ({ ...f, clientName: name, clientId: c?.id ?? null }));
  };
  const submitAdd = async () => {
    if (await run(() => addIncome({ ...form, amount: Number(form.amount) }), 'Income saved')) {
      setForm(blank);
      setAdding(false);
    }
  };
  const toggleRow = (id: string, balance: number) => {
    setOpen(open === id ? null : id);
    setPay({ amount: String(balance), paidOn: today, method: 'Bank transfer', reference: '' });
  };

  return (
    <>
      <Section
        eyebrow="Income ledger"
        title="Every invoice and payment"
        count={`${rows.length} ${rows.length === 1 ? 'entry' : 'entries'}`}
        action={<Button variant="primary" size="sm" onClick={() => { setForm(blank); setAdding(true); }}><Plus className="h-3.5 w-3.5" />Add income</Button>}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] px-5 py-3 md:px-6">
          <Segmented size="sm" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'owed', label: 'Still owed' }, { value: 'paid', label: 'Paid' }]} />
          <select aria-label="Client" value={client} onChange={(e) => setClient(e.target.value)} className="h-9 rounded-xl border border-white/[0.12] bg-[#0b0d14] px-3 text-[12.5px] text-white">
            <option value="">All clients</option>
            {clientNames.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search client, invoice, note" className="h-9 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] pl-9 pr-3 text-[12.5px] text-white placeholder:text-white/30 outline-none focus:border-[#5EE3DA]/50" />
          </label>
        </div>
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-[13px] text-white/45">Nothing matches. Invoices from Documents show up here automatically.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className={`${TH} pl-5 md:pl-6`}>Client</th>
                  <th className={TH}>Date</th>
                  <th className={`${TH} text-right`}>Invoiced</th>
                  <th className={`${TH} text-right`}>Received</th>
                  <th className={`${TH} text-right`}>Balance</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} pr-5 text-right md:pr-6`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {rows.map((r) => {
                  const st = STATE[r.state];
                  const isOpen = open === r.income.id;
                  return (
                    <Fragment key={r.income.id}>
                      <tr className="cursor-pointer hover:bg-white/[0.02]" onClick={() => toggleRow(r.income.id, r.balance)}>
                        <td className={`${TD} pl-5 md:pl-6`}>
                          <p className="font-semibold text-white">{r.income.client_name}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/45">
                            {r.income.document_id && <FileText className="h-3 w-3" />}
                            {[r.income.description, r.income.project].filter(Boolean).join(' · ') || 'Income'}
                          </p>
                        </td>
                        <td className={`${TD} whitespace-nowrap text-white/55`}>{formatDocDate(r.income.income_date)}</td>
                        <td className={`${TD} text-right tabular-nums text-white/85`}>{rm(r.income.amount)}</td>
                        <td className={`${TD} text-right font-semibold tabular-nums text-[#5EE3DA]`}>{rm(r.paid)}</td>
                        <td className={`${TD} text-right tabular-nums ${r.balance > 0 ? 'text-amber-300/90' : 'text-white/35'}`}>{r.balance > 0 ? rm(r.balance) : '—'}</td>
                        <td className={TD}><Pill color={st.color}>{st.label}</Pill></td>
                        <td className={`${TD} pr-5 text-right md:pr-6`}>
                          <span className="inline-flex items-center gap-1 text-[12px] text-white/45">{r.pays.length} payment{r.pays.length === 1 ? '' : 's'}<ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></span>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-white/[0.015]">
                          <td colSpan={7} className="px-5 pb-5 pt-2 md:px-6">
                            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Payments received</p>
                            {r.pays.length === 0 ? <p className="text-[12.5px] text-white/45">None yet.</p> : (
                              <ul className="space-y-1.5">
                                {r.pays.map((p) => (
                                  <li key={p.id} className="flex items-center justify-between gap-3 text-[13px]">
                                    <span className="text-white/75">
                                      <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5 text-[#7FE8C4]" />
                                      {rm(p.amount)} on {formatDocDate(p.paid_on)}
                                      <span className="text-white/40"> · {[p.method, p.reference].filter(Boolean).join(' · ')}{p.receipt_id ? ' · receipt' : ''}</span>
                                    </span>
                                    {!p.receipt_id && <button type="button" aria-label="Delete payment" onClick={() => run(() => deletePayment(p.id), 'Payment removed')} className="text-white/35 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {r.income.notes && <p className="mt-3 text-[12px] text-white/40">{clean(r.income.notes)}</p>}
                            {r.balance > 0 && (
                              <div className="mt-4 grid items-end gap-3 sm:grid-cols-[110px_150px_150px_1fr_auto]">
                                <div><Label>Amount</Label><Input type="number" min={0} step="0.01" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></div>
                                <div><Label>Received on</Label><Input type="date" value={pay.paidOn} onChange={(e) => setPay({ ...pay, paidOn: e.target.value })} /></div>
                                <div><Label>Paid via</Label><select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} className={selectCls}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
                                <div><Label>Reference</Label><Input value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} /></div>
                                <Button variant="primary" disabled={busy} onClick={() => run(() => recordPayment({ incomeId: r.income.id, amount: Number(pay.amount), paidOn: pay.paidOn, method: pay.method, reference: pay.reference }), 'Payment recorded')}>Record payment</Button>
                              </div>
                            )}
                            {!r.income.document_id && (
                              <Button className="mt-4" variant="danger" size="sm" disabled={busy} onClick={() => window.confirm('Delete this income and its payments?') && run(() => deleteIncome(r.income.id), 'Income deleted')}>
                                <Trash2 className="h-3.5 w-3.5" /> Delete entry
                              </Button>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                <tr className="bg-white/[0.04] font-semibold">
                  <td className={`${TD} pl-5 md:pl-6`} colSpan={2}>Total</td>
                  <td className={`${TD} text-right tabular-nums`}>{rm(totals.amount)}</td>
                  <td className={`${TD} text-right tabular-nums text-[#5EE3DA]`}>{rm(totals.paid)}</td>
                  <td className={`${TD} text-right tabular-nums`}>{totals.balance > 0 ? rm(totals.balance) : '—'}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Modal
        open={adding}
        title="Add income"
        description="For money that isn't on a Documents invoice, such as a retainer, cash job or cheque."
        onClose={() => setAdding(false)}
        footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button variant="primary" onClick={submitAdd} disabled={busy}>Save income</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>From</Label>
            <Input list="inc-clients" value={form.clientName} onChange={(e) => pickClient(e.target.value)} placeholder="Client name" />
            <datalist id="inc-clients">{[...new Set([...clients.map((c) => c.name), ...clientNames])].map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><Label>Project</Label><Input value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} placeholder="e.g. Business Site" /></div>
          <div><Label hint="RM">Amount</Label><Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>What for</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Invoice AS-015" /></div>
          <div className="sm:col-span-2"><Switch checked={form.receivedNow} onChange={(v) => setForm({ ...form, receivedNow: v })} label="Already received" /></div>
          {form.receivedNow && (
            <>
              <div><Label>Received on</Label><Input type="date" value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} /></div>
              <div><Label>Paid via</Label><select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className={selectCls}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
              <div className="sm:col-span-2"><Label>Reference</Label><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
            </>
          )}
          <div className="sm:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
      </Modal>
    </>
  );
}
