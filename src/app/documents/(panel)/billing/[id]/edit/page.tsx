// src/app/documents/(panel)/billing/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { docsAuthed } from '@/lib/documents/access';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isId } from '@/lib/admin/validate';
import { loadClientOptions } from '@/lib/documents/clients';
import { checkInvoice, checkReceipt } from '@/lib/documents/validate';
import { DEFAULT_BANK, DEFAULT_SCHEDULE } from '@/lib/documents/presets';
import { PageHeader } from '@/components/admin/ui';
import { DocumentEditor, type EditorState } from '@/components/documents/DocumentEditor';

export const dynamic = 'force-dynamic';

export default async function EditBillingPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await docsAuthed())) return null;
  const { id } = await params;
  if (!isId(id)) notFound();

  const [{ data: row }, clients] = await Promise.all([
    supabaseAdmin.from('documents').select('id,kind,client_id,source_id,data').eq('id', id).in('kind', ['invoice', 'receipt']).maybeSingle(),
    loadClientOptions(),
  ]);
  if (!row) notFound();

  const base = { clientId: (row.client_id as string | null) ?? null, sourceId: (row.source_id as string | null) ?? null };
  let initial: EditorState;
  let heading: string;
  if (row.kind === 'invoice') {
    const c = checkInvoice(row.data);
    if (!c.ok) notFound();
    const d = c.data;
    heading = `Edit invoice ${d.number}`;
    initial = {
      ...base, kind: 'invoice', number: d.number, date: d.date, dueDate: d.dueDate ?? '', invoiceNumber: '', billTo: d.billTo,
      items: d.items.map((i) => ({ ...i, paid: false })), taxPct: Math.round(d.taxRate * 100), bank: d.bank, schedule: d.schedule,
      method: 'Bank Transfer', reference: '', remarks: '',
    };
  } else {
    const c = checkReceipt(row.data);
    if (!c.ok) notFound();
    const d = c.data;
    heading = `Edit receipt ${d.number}`;
    initial = {
      ...base, kind: 'receipt', number: d.number, date: d.date, dueDate: '', invoiceNumber: d.invoiceNumber, billTo: d.billTo,
      items: d.items, taxPct: Math.round(d.taxRate * 100), bank: DEFAULT_BANK, schedule: DEFAULT_SCHEDULE, method: d.method,
      reference: d.reference, remarks: d.remarks,
    };
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Invoices & Receipts"
        title={heading}
        description="Changing the amount or date also updates it in Accounts. Payments you have already recorded are not removed."
      />
      <DocumentEditor key={id} docId={id} initial={initial} clients={clients} />
    </div>
  );
}
