'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button, Input, Label, Textarea, useToast } from '@/components/admin/ui';
import { deleteExpense, saveExpense } from '@/app/accounts/(panel)/actions';
import { EXPENSE_CATEGORIES, type Expense } from '@/lib/accounts/model';
import { formatDocDate } from '@/lib/documents/model';
import { Section, TD, TH, rm } from './kit';
import { Modal, selectCls } from './Modal';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PAGE = 100;
const clean = (n: string) => n.replace(/^\[bank-import\]\s*/, '');
const filterCls = 'h-9 rounded-xl border border-white/[0.12] bg-[#0b0d14] px-3 text-[12.5px] text-white';

export function ExpensesBoard({ expenses, today, startOpen, startCategory }: { expenses: Expense[]; today: string; startOpen: boolean; startCategory: string }) {
  const router = useRouter();
  const toast = useToast();
  const blank = { id: undefined as string | undefined, date: today, category: EXPENSE_CATEGORIES[0] as string, vendor: '', amount: '', notes: '' };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(startOpen);
  const [busy, setBusy] = useState(false);
  const [month, setMonth] = useState('all');
  const [category, setCategory] = useState(startCategory);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const months = useMemo(() => [...new Set(expenses.map((e) => e.expense_date.slice(0, 7)))].sort().reverse(), [expenses]);
  const categories = useMemo(() => [...new Set([...EXPENSE_CATEGORIES, ...expenses.map((e) => e.category)])], [expenses]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter(
      (e) =>
        (month === 'all' || e.expense_date.startsWith(month)) &&
        (!category || e.category === category) &&
        (!q || `${e.vendor} ${e.category} ${e.notes}`.toLowerCase().includes(q)),
    );
  }, [expenses, month, category, query]);
  const total = shown.reduce((s, e) => s + e.amount, 0);
  const filtered = month !== 'all' || !!category || !!query.trim();

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
  const save = async () => {
    if (await run(() => saveExpense({ ...form, amount: Number(form.amount) }), form.id ? 'Expense updated' : 'Expense saved')) {
      setForm(blank);
      setEditing(false);
    }
  };
  const edit = (e: Expense) => {
    setForm({ id: e.id, date: e.expense_date, category: e.category, vendor: e.vendor, amount: String(e.amount), notes: e.notes });
    setEditing(true);
  };
  const reset = () => {
    setMonth('all');
    setCategory('');
    setQuery('');
    setLimit(PAGE);
  };

  return (
    <>
      <Section
        eyebrow="Expense ledger"
        title={category || 'Every ringgit out'}
        count={`${shown.length} · ${rm(total)}`}
        action={<Button variant="primary" size="sm" onClick={() => { setForm(blank); setEditing(true); }}><Plus className="h-3.5 w-3.5" />Add expense</Button>}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] px-5 py-3 md:px-6">
          <select aria-label="Month" value={month} onChange={(e) => { setMonth(e.target.value); setLimit(PAGE); }} className={filterCls}>
            <option value="all">All months</option>
            {months.map((m) => <option key={m} value={m}>{MONTHS[Number(m.slice(5)) - 1]} {m.slice(0, 4)}</option>)}
          </select>
          <select aria-label="Category" value={category} onChange={(e) => { setCategory(e.target.value); setLimit(PAGE); }} className={filterCls}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          {filtered && <Button variant="ghost" size="sm" onClick={reset}><X className="h-3.5 w-3.5" />Clear</Button>}
          <label className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} placeholder="Search who, category, note" className="h-9 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] pl-9 pr-3 text-[12.5px] text-white placeholder:text-white/30 outline-none focus:border-[#5EE3DA]/50" />
          </label>
        </div>
        {shown.length === 0 ? (
          <p className="px-6 py-12 text-center text-[13px] text-white/45">No expenses match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className={`${TH} pl-5 md:pl-6`}>Date</th>
                  <th className={TH}>Paid to</th>
                  <th className={TH}>Category</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={`${TH} pr-5 text-right md:pr-6`}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {shown.slice(0, limit).map((e) => (
                  <tr key={e.id} className="group hover:bg-white/[0.02]">
                    <td className={`${TD} whitespace-nowrap pl-5 text-white/55 md:pl-6`}>{formatDocDate(e.expense_date)}</td>
                    <td className={`${TD} max-w-[340px]`}>
                      <p className="truncate font-medium text-white">{e.vendor || '—'}</p>
                      {clean(e.notes) && <p className="mt-0.5 truncate text-[12px] text-white/40">{clean(e.notes)}</p>}
                    </td>
                    <td className={TD}>
                      <button type="button" onClick={() => { setCategory(e.category); setLimit(PAGE); }} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11.5px] text-white/65 ring-1 ring-white/10 hover:text-white">{e.category}</button>
                    </td>
                    <td className={`${TD} text-right font-semibold tabular-nums text-white/90`}>{rm(-e.amount)}</td>
                    <td className={`${TD} whitespace-nowrap pr-5 text-right md:pr-6`}>
                      <Button variant="ghost" size="sm" aria-label="Edit expense" onClick={() => edit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" aria-label="Delete expense" disabled={busy} onClick={() => window.confirm('Delete this expense?') && run(() => deleteExpense(e.id), 'Expense deleted')}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-white/[0.04] font-semibold">
                  <td className={`${TD} pl-5 md:pl-6`} colSpan={3}>Total{filtered ? ' (filtered)' : ''} · {shown.length} {shown.length === 1 ? 'expense' : 'expenses'}</td>
                  <td className={`${TD} text-right tabular-nums`}>{rm(-total)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {shown.length > limit && (
          <div className="border-t border-white/[0.08] px-5 py-3 text-center md:px-6">
            <Button variant="ghost" size="sm" onClick={() => setLimit((l) => l + PAGE * 2)}>Show more ({shown.length - limit} left)</Button>
          </div>
        )}
      </Section>

      <Modal
        open={editing}
        title={form.id ? 'Edit expense' : 'Add expense'}
        onClose={() => setEditing(false)}
        footer={<><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button><Button variant="primary" onClick={save} disabled={busy}>{form.id ? 'Save changes' : 'Save expense'}</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><Label hint="RM">Amount</Label><Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div><Label>Category</Label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectCls}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><Label hint="who you paid">Paid to</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="e.g. Vercel, Hostinger" /></div>
          <div className="sm:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
      </Modal>
    </>
  );
}
