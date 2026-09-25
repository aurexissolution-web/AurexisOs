'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Label, Segmented, Textarea, useToast } from '@/components/admin/ui';
import { PdfPreview } from './PdfPreview';
import { saveDocument } from '@/app/documents/(panel)/actions';
import { amountPaid, formatRMDoc, lineTotal, totals, type LineItem } from '@/lib/documents/model';
import { PRICE_PRESETS, blankLine, depositSplit } from '@/lib/documents/presets';

export type ClientOption = { id: string; name: string; address: string; phone: string };

export type EditorState = {
  kind: 'invoice' | 'receipt';
  number: string;
  date: string;
  dueDate: string;
  clientId: string | null;
  sourceId: string | null;
  invoiceNumber: string;
  billTo: { name: string; address: string; phone: string };
  items: (LineItem & { paid: boolean })[];
  taxPct: number;
  bank: { bank: string; accountName: string; accountNo: string };
  schedule: string;
  method: string;
  reference: string;
  remarks: string;
};

const toPayload = (s: EditorState) => ({
  number: s.number,
  date: s.date,
  dueDate: s.dueDate || null,
  invoiceNumber: s.invoiceNumber,
  billTo: s.billTo,
  items: s.items,
  taxRate: (Number(s.taxPct) || 0) / 100,
  bank: s.bank,
  schedule: s.schedule,
  method: s.method,
  reference: s.reference,
  remarks: s.remarks,
  signature: true,
});

export function DocumentEditor({ initial, clients }: { initial: EditorState; clients: ClientOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState<EditorState>(initial);
  const [saving, setSaving] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const isInvoice = s.kind === 'invoice';
  const set = <K extends keyof EditorState>(k: K, v: EditorState[K]) => setS((p) => ({ ...p, [k]: v }));
  const setItem = (i: number, patch: Partial<EditorState['items'][number]>) =>
    setS((p) => ({ ...p, items: p.items.map((it, n) => (n === i ? { ...it, ...patch } : it)) }));

  const payload = useMemo(() => JSON.stringify({ kind: s.kind, data: toPayload(s) }), [s]);

  const t = totals(s.items, (Number(s.taxPct) || 0) / 100);
  const paid = amountPaid(s.items, (Number(s.taxPct) || 0) / 100);

  const pickClient = (name: string) => {
    const c = clients.find((x) => x.name.toLowerCase() === name.trim().toLowerCase());
    setS((p) => ({
      ...p,
      clientId: c?.id ?? null,
      billTo: c ? { name: c.name, address: c.address || p.billTo.address, phone: c.phone || p.billTo.phone } : { ...p.billTo, name },
    }));
  };

  const addPreset = (value: string) => {
    if (!value) return;
    const [g, label] = value.split('|');
    const item = PRICE_PRESETS.find((x) => x.group === g)?.items.find((x) => x.label === label);
    if (!item) return;
    setS((p) => ({
      ...p,
      items: [...p.items.filter((i) => i.description.trim() || i.price), { ...blankLine(), description: `${g} - ${label}`, price: item.price, paid: false }],
    }));
  };

  const split = () => {
    const base = s.items.find((i) => i.description.trim() && i.price > 0);
    if (!base) return toast('error', 'Add a priced line first.');
    const name = base.description.replace(/\s*-\s*(Initial Deposit|Final Payment).*$/i, '');
    setS((p) => ({ ...p, items: depositSplit(name, base.price * base.qty).map((l) => ({ ...l, paid: l.dueNow })) }));
  };

  const save = async () => {
    setSaving(true);
    const res = await saveDocument({
      kind: s.kind, data: toPayload(s), clientId: s.clientId, sourceId: s.sourceId,
    });
    setSaving(false);
    if (!res.ok) return toast('error', res.error);
    toast('ok', 'Saved. Opening the PDF.');
    window.open(`/api/documents/${res.id}/pdf`, '_blank');
    router.push('/documents/billing');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Card className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{isInvoice ? 'Invoice no.' : 'Receipt no.'}</Label>
              <Input value={s.number} onChange={(e) => set('number', e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={s.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            {!isInvoice && (
              <div className="col-span-2">
                <Label hint="the invoice this pays">Invoice no.</Label>
                <Input value={s.invoiceNumber} onChange={(e) => set('invoiceNumber', e.target.value)} />
              </div>
            )}
          </div>
          <div>
            <Label hint="pick an existing client to fill the rest">{isInvoice ? 'Issued to' : 'Receipt to'}</Label>
            <Input list="doc-clients" value={s.billTo.name} onChange={(e) => pickClient(e.target.value)} placeholder="Company or person" />
            <datalist id="doc-clients">
              {clients.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label hint="one line per row">Address</Label>
              <Textarea rows={4} value={s.billTo.address} onChange={(e) => set('billTo', { ...s.billTo, address: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={s.billTo.phone} onChange={(e) => set('billTo', { ...s.billTo, phone: e.target.value })} />
            </div>
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[13.5px] font-semibold text-white">Line items</h3>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Add from price list"
                value=""
                onChange={(e) => addPreset(e.target.value)}
                className="h-8 rounded-lg border border-white/[0.12] bg-[#0b0d14] px-2 text-[12px] text-white/80"
              >
                <option value="">Add from price list…</option>
                {PRICE_PRESETS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((i) => (
                      <option key={i.label} value={`${g.group}|${i.label}`}>
                        {i.label} · {formatRMDoc(i.price)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {isInvoice && (
                <Button size="sm" onClick={split} title="Turn the first priced line into a 50% deposit and 50% balance">
                  50/50 split
                </Button>
              )}
            </div>
          </div>

          {s.items.map((it, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-white/[0.1] bg-white/[0.02] p-3">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="Description" />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Remove line"
                  onClick={() => setS((p) => ({ ...p, items: p.items.filter((_, n) => n !== i) }))}
                  disabled={s.items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-[1fr_70px_1fr] gap-2">
                <div>
                  <Label>Price (RM)</Label>
                  <Input type="number" min={0} step="0.01" value={it.price} onChange={(e) => setItem(i, { price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Qty</Label>
                  <Input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Small note</Label>
                  <Input value={it.note} onChange={(e) => setItem(i, { note: e.target.value })} placeholder="e.g. DUE NOW" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[12px] text-white/50">
                {isInvoice ? (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={it.dueNow} onChange={(e) => setItem(i, { dueNow: e.target.checked })} />
                    Counts as “Total due” now
                  </label>
                ) : (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={it.paid} onChange={(e) => setItem(i, { paid: e.target.checked })} />
                    Paid
                  </label>
                )}
                <span>{formatRMDoc(lineTotal(it))}</span>
              </div>
            </div>
          ))}
          {s.items.length < 12 && (
            <Button size="sm" onClick={() => setS((p) => ({ ...p, items: [...p.items, { ...blankLine(), paid: false }] }))}>
              <Plus className="h-4 w-4" /> Add line
            </Button>
          )}

          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-white/[0.1] pt-3">
            <div>
              <Label>Tax</Label>
              <Segmented
                value={String(s.taxPct)}
                onChange={(v) => set('taxPct', Number(v))}
                options={[
                  { value: '0', label: 'None' },
                  { value: '6', label: 'Tax 6%' },
                  { value: '8', label: 'Tax 8%' },
                ]}
              />
            </div>
            <div className="text-right text-[13px] text-white/70">
              <div>Subtotal {formatRMDoc(t.subtotal)}</div>
              <div>Tax {formatRMDoc(t.tax)}</div>
              <div className="font-semibold text-white">{isInvoice ? `Total ${formatRMDoc(t.total)}` : `Paid ${formatRMDoc(paid)}`}</div>
            </div>
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          {isInvoice ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>Bank</Label>
                  <Input value={s.bank.bank} onChange={(e) => set('bank', { ...s.bank, bank: e.target.value })} />
                </div>
                <div>
                  <Label>Account name</Label>
                  <Input value={s.bank.accountName} onChange={(e) => set('bank', { ...s.bank, accountName: e.target.value })} />
                </div>
                <div>
                  <Label>Account no.</Label>
                  <Input value={s.bank.accountNo} onChange={(e) => set('bank', { ...s.bank, accountNo: e.target.value })} />
                </div>
              </div>
              <div>
                <Label hint="one bullet per row">Payment schedule</Label>
                <Textarea rows={3} value={s.schedule} onChange={(e) => set('schedule', e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Paid via</Label>
                  <Input value={s.method} onChange={(e) => set('method', e.target.value)} placeholder="Bank transfer" />
                </div>
                <div>
                  <Label>Reference ID</Label>
                  <Input value={s.reference} onChange={(e) => set('reference', e.target.value)} />
                </div>
              </div>
              <div>
                <Label hint="**double asterisks** make bold">Remarks</Label>
                <Textarea rows={4} value={s.remarks} onChange={(e) => set('remarks', e.target.value)} />
              </div>
            </>
          )}
        </Card>

        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={save} disabled={saving || !!previewError}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Save &amp; download PDF
          </Button>
          <Button variant="ghost" onClick={() => router.push('/documents/billing')}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <PdfPreview payload={payload} onError={setPreviewError} />
      </div>
    </div>
  );
}
