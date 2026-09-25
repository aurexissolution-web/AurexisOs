// src/app/documents/(panel)/billing/new/page.tsx
import { docsAuthed } from '@/lib/documents/access';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isId } from '@/lib/admin/validate';
import { dateKeyOf } from '@/lib/admin/calendar';
import { PageHeader } from '@/components/admin/ui';
import { DocumentEditor, type ClientOption, type EditorState } from '@/components/documents/DocumentEditor';
import { DEFAULT_BANK, DEFAULT_SCHEDULE } from '@/lib/documents/presets';
import { invoiceNumber, nextSequence, receiptNumber, receiptNumberFor } from '@/lib/documents/model';
import { checkInvoice } from '@/lib/documents/validate';

export const dynamic = 'force-dynamic';

const SEED = 10; // last number used before this tool: AS-010 / REC-010

export default async function NewDocumentPage({ searchParams }: { searchParams: Promise<{ kind?: string; from?: string; client?: string }> }) {
  if (!(await docsAuthed())) return null;
  const sp = await searchParams;
  const kind = sp.kind === 'receipt' ? 'receipt' : 'invoice';

  const [clientsRes, contactsRes, numbersRes, sourceRes] = await Promise.all([
    supabaseAdmin.from('clients').select('id,name,address').order('name').limit(5000),
    supabaseAdmin.from('client_contacts').select('client_id,phone,is_primary').order('is_primary', { ascending: false }).limit(20000),
    supabaseAdmin.from('documents').select('kind,number').in('kind', ['invoice', 'receipt']).limit(5000),
    kind === 'receipt' && isId(sp.from)
      ? supabaseAdmin.from('documents').select('id,client_id,data').eq('id', sp.from).eq('kind', 'invoice').maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const phone = new Map<string, string>();
  for (const c of contactsRes.data ?? []) if (c.phone && !phone.has(c.client_id as string)) phone.set(c.client_id as string, c.phone);
  const clients: ClientOption[] = (clientsRes.data ?? []).map((c) => ({
    id: c.id as string, name: c.name as string, address: (c.address as string) ?? '', phone: phone.get(c.id as string) ?? '',
  }));

  const existing = (numbersRes.data ?? []) as { kind: string; number: string }[];
  const invoices = existing.filter((d) => d.kind === 'invoice').map((d) => d.number);
  const receipts = existing.filter((d) => d.kind === 'receipt').map((d) => d.number);
  const today = dateKeyOf(new Date().toISOString());

  const base: EditorState = {
    kind, number: '', date: today, dueDate: '', clientId: null, sourceId: null, invoiceNumber: '',
    billTo: { name: '', address: '', phone: '' },
    items: [{ description: '', note: '', price: 0, qty: 1, dueNow: false, paid: false }],
    taxPct: 0, bank: DEFAULT_BANK, schedule: DEFAULT_SCHEDULE, method: 'Bank Transfer', reference: '', remarks: '',
  };

  let initial: EditorState;
  const src = sourceRes.data as { id: string; client_id: string | null; data: unknown } | null;
  const inv = src ? checkInvoice(src.data) : null;
  if (kind === 'receipt' && src && inv?.ok) {
    const d = inv.data;
    const flagged = d.items.some((i) => i.dueNow);
    initial = {
      ...base,
      number: receiptNumberFor(d.number, receipts),
      invoiceNumber: d.number,
      sourceId: src.id,
      clientId: src.client_id,
      billTo: d.billTo,
      items: d.items.map((i, n) => ({ ...i, paid: flagged ? i.dueNow : n === 0 })),
      taxPct: Math.round(d.taxRate * 100),
      remarks: 'Thank you for your business. This receipt serves as an official acknowledgment of your payment.',
    };
  } else if (kind === 'receipt') {
    initial = { ...base, number: receiptNumber(nextSequence('REC-', receipts, SEED)) };
  } else {
    initial = { ...base, number: invoiceNumber(nextSequence('AS-', invoices, SEED)) };
    const c = isId(sp.client) ? clients.find((x) => x.id === sp.client) : undefined;
    if (c) initial = { ...initial, clientId: c.id, billTo: { name: c.name, address: c.address, phone: c.phone } };
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Invoices & Receipts"
        title={kind === 'invoice' ? 'New invoice' : 'New receipt'}
        description="The preview on the right is the real PDF and updates as you type."
      />
      <DocumentEditor key={`${kind}-${sp.from ?? ''}`} initial={initial} clients={clients} />
    </div>
  );
}
