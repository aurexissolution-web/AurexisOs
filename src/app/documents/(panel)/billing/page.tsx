// src/app/documents/(panel)/billing/page.tsx
import { docsAuthed } from '@/lib/documents/access';
import { ButtonLink } from '@/components/admin/ui';
import { DocumentList } from '@/components/documents/DocumentList';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  if (!(await docsAuthed())) return null;
  return (
    <DocumentList
      kinds={['invoice', 'receipt']}
      eyebrow="Documents"
      title="Invoices & Receipts"
      accent="on brand."
      description="Fill in the details, get the PDF. Make a receipt straight from any invoice."
      actions={
        <>
          <ButtonLink href="/documents/billing/new?kind=invoice" variant="primary">New invoice</ButtonLink>
          <ButtonLink href="/documents/billing/new?kind=receipt">New receipt</ButtonLink>
        </>
      }
      emptyBody="Create your first invoice or receipt."
    />
  );
}
