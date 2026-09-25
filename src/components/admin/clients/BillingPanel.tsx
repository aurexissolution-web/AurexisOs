'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SERVICE_STATUSES, SOLUTIONS, SOLUTION_BY_KEY, formatRM, invoiceState, renewalState, summarizeBilling,
  type ClientInvoice, type ClientService, type InvoiceStatus, type ServiceStatus, type Solution,
} from '@/lib/admin/billing';
import { todayKey, parseKey, MONTH_NAMES } from '@/lib/admin/calendar';
import { Button, Card, CardHeader, Input, Label, Pill, Segmented, Textarea, useToast } from '../ui';
import {
  deleteInvoice, deleteService, markInvoicePaid, saveInvoice, saveService,
} from '@/app/admin/(panel)/clients/billing-actions';

const TIER_NAMES = ['Landing Page', 'Business Site', 'Corporate Site', 'E-commerce Store', 'Booking Site', 'Client Portal / Membership', 'Flow Lite', 'Flow Core', 'Flow Max', 'Core Starter', 'Core Growth', 'Core Enterprise', 'Connect Starter', 'Connect Growth', 'Connect Pro', 'Audit Light', 'Audit Full'];

const fmtDay = (k: string | null) => {
  if (!k) return '';
  const { y, m, d } = parseKey(k);
  return `${d} ${MONTH_NAMES[m].slice(0, 3)} ${y}`;
};

type SvcForm = { id?: string; solution: Solution; name: string; price: string; status: ServiceStatus; startDate: string; carePlan: string; carePrice: string; renewalDate: string; notes: string };
type InvForm = { id?: string; serviceId: string; number: string; description: string; amount: string; status: InvoiceStatus; issuedOn: string; dueOn: string; paidOn: string };

const blankSvc = (): SvcForm => ({ solution: 'presence', name: '', price: '', status: 'quoted', startDate: '', carePlan: '', carePrice: '', renewalDate: '', notes: '' });
const blankInv = (): InvForm => ({ serviceId: '', number: '', description: '', amount: '', status: 'sent', issuedOn: todayKey(), dueOn: '', paidOn: '' });

const stat = 'rounded-xl border border-white/[0.12] bg-white/[0.025] px-4 py-3';

export function BillingPanel({
  clientId,
  initialServices,
  initialInvoices,
}: {
  clientId: string;
  initialServices: ClientService[];
  initialInvoices: ClientInvoice[];
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [services, setServices] = useState(initialServices);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [svc, setSvc] = useState<SvcForm | null>(null);
  const [inv, setInv] = useState<InvForm | null>(null);
  const [today] = useState(() => todayKey());
  const sum = summarizeBilling(invoices, services, today);

  const submitSvc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!svc) return;
    start(async () => {
      const r = await saveService(clientId, { ...svc, price: Number(svc.price || 0), carePrice: Number(svc.carePrice || 0) });
      if (!r.ok) return toast('error', r.error);
      setServices((cur) => (cur.some((x) => x.id === r.service.id) ? cur.map((x) => (x.id === r.service.id ? r.service : x)) : [r.service, ...cur]));
      setSvc(null);
      toast('ok', 'Service saved');
    });
  };

  const submitInv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inv) return;
    start(async () => {
      const r = await saveInvoice(clientId, { ...inv, serviceId: inv.serviceId || null, amount: Number(inv.amount || 0) });
      if (!r.ok) return toast('error', r.error);
      setInvoices((cur) => (cur.some((x) => x.id === r.invoice.id) ? cur.map((x) => (x.id === r.invoice.id ? r.invoice : x)) : [r.invoice, ...cur]));
      setInv(null);
      toast('ok', 'Invoice saved');
    });
  };

  const paid = (id: string) => start(async () => {
    const r = await markInvoicePaid(clientId, id);
    if (!r.ok) return toast('error', r.error);
    setInvoices((cur) => cur.map((x) => (x.id === id ? r.invoice : x)));
    toast('ok', 'Marked paid');
  });

  const removeSvc = (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    start(async () => { const r = await deleteService(clientId, id); if (r.ok) setServices((c) => c.filter((x) => x.id !== id)); else toast('error', r.error); });
  };
  const removeInv = (id: string) => {
    if (!window.confirm('Delete this invoice record?')) return;
    start(async () => { const r = await deleteInvoice(clientId, id); if (r.ok) setInvoices((c) => c.filter((x) => x.id !== id)); else toast('error', r.error); });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={stat}><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Billed</p><p className="mt-1 text-[22px] font-bold text-white">{formatRM(sum.billed)}</p></div>
        <div className={stat}><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Paid</p><p className="mt-1 text-[22px] font-bold text-[#7FE8C4]">{formatRM(sum.paid)}</p></div>
        <div className={cn(stat, sum.overdue > 0 && 'border-red-400/30 bg-red-400/[0.05]')}>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Outstanding</p>
          <p className="mt-1 text-[22px] font-bold text-white">{formatRM(sum.outstanding)}</p>
          {sum.overdue > 0 && <p className="text-[11.5px] text-red-300">{formatRM(sum.overdue)} overdue</p>}
        </div>
        <div className={stat}><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Care plan / month</p><p className="mt-1 text-[22px] font-bold text-white">{formatRM(sum.mrr)}</p></div>
      </div>

      {/* Services */}
      <Card className="bg-[#070A10]/80">
        <CardHeader title="Services" meta={`${services.length}`} action={<Button size="sm" variant="secondary" onClick={() => setSvc(blankSvc())}><Plus className="h-3.5 w-3.5" /> Add service</Button>} />
        {services.length === 0 && !svc && <p className="px-6 py-8 text-center text-[13px] text-white/40">No services yet. Add what this client bought or was quoted.</p>}
        <ul>
          {services.map((s) => {
            const sol = SOLUTION_BY_KEY[s.solution];
            const st = SERVICE_STATUSES.find((x) => x.key === s.status)!;
            const rn = renewalState(s.renewal_date, today);
            return (
              <li key={s.id} className="group flex flex-wrap items-center gap-3 border-b border-white/[0.1] px-5 py-3.5 last:border-b-0">
                <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: sol.color }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-white">{s.name} <span className="font-normal text-white/40">· {sol.label}</span></span>
                  <span className="mt-0.5 block text-[12px] text-white/50">
                    {formatRM(s.price_myr)}{s.start_date && ` · started ${fmtDay(s.start_date)}`}
                    {s.care_plan && ` · ${s.care_plan} ${formatRM(s.care_price_myr)}/mo`}
                    {s.renewal_date && <span className={cn(rn === 'overdue' ? 'text-red-300' : rn === 'soon' ? 'text-[#F0C88F]' : '')}> · renews {fmtDay(s.renewal_date)}</span>}
                  </span>
                </span>
                <Pill color={st.color}>{st.label}</Pill>
                <span className="flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <button type="button" aria-label="Edit service" onClick={() => setSvc({ id: s.id, solution: s.solution, name: s.name, price: String(s.price_myr), status: s.status, startDate: s.start_date ?? '', carePlan: s.care_plan, carePrice: String(s.care_price_myr || ''), renewalDate: s.renewal_date ?? '', notes: s.notes })} className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-white/[0.07] hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                  <button type="button" aria-label="Delete service" onClick={() => removeSvc(s.id)} className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-red-400/10 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </span>
              </li>
            );
          })}
        </ul>
        {svc && (
          <form onSubmit={submitSvc} className="space-y-3 border-t border-white/[0.14] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-white">{svc.id ? 'Edit service' : 'New service'}</p><button type="button" aria-label="Cancel" onClick={() => setSvc(null)} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button></div>
            <Segmented size="sm" value={svc.solution} onChange={(v) => setSvc({ ...svc, solution: v })} options={SOLUTIONS.map((s) => ({ value: s.key, label: s.label, color: s.color }))} />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2"><Label htmlFor="s-name">Package *</Label><Input id="s-name" list="tier-names" autoFocus required value={svc.name} onChange={(e) => setSvc({ ...svc, name: e.target.value })} maxLength={160} placeholder="Business Site" /><datalist id="tier-names">{TIER_NAMES.map((n) => <option key={n} value={n} />)}</datalist></div>
              <div><Label htmlFor="s-price">Price (RM)</Label><Input id="s-price" type="number" min={0} step="0.01" value={svc.price} onChange={(e) => setSvc({ ...svc, price: e.target.value })} placeholder="3250" /></div>
              <div><Label htmlFor="s-start">Start date</Label><Input id="s-start" type="date" value={svc.startDate} onChange={(e) => setSvc({ ...svc, startDate: e.target.value })} /></div>
              <div><Label htmlFor="s-care">Care plan</Label><Input id="s-care" value={svc.carePlan} onChange={(e) => setSvc({ ...svc, carePlan: e.target.value })} maxLength={120} placeholder="Growth" /></div>
              <div><Label htmlFor="s-cprice">Care price / month</Label><Input id="s-cprice" type="number" min={0} step="0.01" value={svc.carePrice} onChange={(e) => setSvc({ ...svc, carePrice: e.target.value })} placeholder="650" /></div>
              <div><Label htmlFor="s-renew">Next renewal</Label><Input id="s-renew" type="date" value={svc.renewalDate} onChange={(e) => setSvc({ ...svc, renewalDate: e.target.value })} /></div>
            </div>
            <Segmented size="sm" value={svc.status} onChange={(v) => setSvc({ ...svc, status: v })} options={SERVICE_STATUSES.map((s) => ({ value: s.key, label: s.label, color: s.color }))} />
            <div><Label htmlFor="s-notes">Notes</Label><Textarea id="s-notes" rows={2} value={svc.notes} onChange={(e) => setSvc({ ...svc, notes: e.target.value })} maxLength={2000} /></div>
            <Button type="submit" variant="primary" size="sm" disabled={pending}>Save service</Button>
          </form>
        )}
      </Card>

      {/* Invoices */}
      <Card className="bg-[#070A10]/80">
        <CardHeader title="Invoices" meta={`${invoices.length}`} action={<Button size="sm" variant="secondary" onClick={() => setInv(blankInv())}><Plus className="h-3.5 w-3.5" /> New invoice</Button>} />
        {invoices.length === 0 && !inv && <p className="px-6 py-8 text-center text-[13px] text-white/40">No invoices tracked yet.</p>}
        <ul>
          {invoices.map((i) => {
            const state = invoiceState(i, today);
            const color = state === 'paid' ? '#7FE8C4' : state === 'overdue' ? '#F08F8F' : state === 'due' ? '#F0C88F' : state === 'draft' || state === 'void' ? '#9CA3AF' : '#8FA8F0';
            const label = state === 'sent' ? 'Sent' : state[0].toUpperCase() + state.slice(1);
            return (
              <li key={i.id} className="group flex flex-wrap items-center gap-3 border-b border-white/[0.1] px-5 py-3.5 last:border-b-0">
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-white">{formatRM(i.amount_myr)}<span className="font-normal text-white/45"> {i.number && `· ${i.number}`} {i.description && `· ${i.description}`}</span></span>
                  <span className="mt-0.5 block text-[12px] text-white/45">issued {fmtDay(i.issued_on)}{i.due_on && ` · due ${fmtDay(i.due_on)}`}{i.paid_on && ` · paid ${fmtDay(i.paid_on)}`}</span>
                </span>
                <Pill color={color}>{label}</Pill>
                {(i.status === 'sent' || i.status === 'draft') && <Button size="sm" variant="secondary" disabled={pending} onClick={() => paid(i.id)}><CheckCircle2 className="h-3.5 w-3.5" /> Mark paid</Button>}
                <span className="flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <button type="button" aria-label="Edit invoice" onClick={() => setInv({ id: i.id, serviceId: i.service_id ?? '', number: i.number, description: i.description, amount: String(i.amount_myr), status: i.status, issuedOn: i.issued_on, dueOn: i.due_on ?? '', paidOn: i.paid_on ?? '' })} className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-white/[0.07] hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                  <button type="button" aria-label="Delete invoice" onClick={() => removeInv(i.id)} className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-red-400/10 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </span>
              </li>
            );
          })}
        </ul>
        {inv && (
          <form onSubmit={submitInv} className="space-y-3 border-t border-white/[0.14] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-white">{inv.id ? 'Edit invoice' : 'New invoice'}</p><button type="button" aria-label="Cancel" onClick={() => setInv(null)} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label htmlFor="i-amount">Amount (RM) *</Label><Input id="i-amount" type="number" min={0} step="0.01" required autoFocus value={inv.amount} onChange={(e) => setInv({ ...inv, amount: e.target.value })} /></div>
              <div><Label htmlFor="i-num">Invoice no.</Label><Input id="i-num" value={inv.number} onChange={(e) => setInv({ ...inv, number: e.target.value })} maxLength={60} placeholder="INV-0042" /></div>
              <div>
                <Label htmlFor="i-svc">For service</Label>
                <select id="i-svc" value={inv.serviceId} onChange={(e) => setInv({ ...inv, serviceId: e.target.value })} className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 text-[14px] text-white outline-none focus:border-[#5EE3DA]/50">
                  <option value="" className="bg-[#070B12]">None</option>
                  {services.map((s) => <option key={s.id} value={s.id} className="bg-[#070B12]">{s.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-3"><Label htmlFor="i-desc">Description</Label><Input id="i-desc" value={inv.description} onChange={(e) => setInv({ ...inv, description: e.target.value })} maxLength={300} placeholder="50% deposit" /></div>
              <div><Label htmlFor="i-issued">Issued</Label><Input id="i-issued" type="date" required value={inv.issuedOn} onChange={(e) => setInv({ ...inv, issuedOn: e.target.value })} /></div>
              <div><Label htmlFor="i-due">Due</Label><Input id="i-due" type="date" value={inv.dueOn} onChange={(e) => setInv({ ...inv, dueOn: e.target.value })} /></div>
              {inv.status === 'paid' && <div><Label htmlFor="i-paid">Paid on</Label><Input id="i-paid" type="date" value={inv.paidOn} onChange={(e) => setInv({ ...inv, paidOn: e.target.value })} /></div>}
            </div>
            <Segmented size="sm" value={inv.status} onChange={(v) => setInv({ ...inv, status: v })} options={[{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'paid', label: 'Paid' }, { value: 'void', label: 'Void' }]} />
            <Button type="submit" variant="primary" size="sm" disabled={pending}>Save invoice</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
