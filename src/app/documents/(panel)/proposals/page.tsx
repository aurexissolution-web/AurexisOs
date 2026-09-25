// src/app/documents/(panel)/proposals/page.tsx
import { docsAuthed } from '@/lib/documents/access';
import { ButtonLink } from '@/components/admin/ui';
import { DocumentList } from '@/components/documents/DocumentList';

export const dynamic = 'force-dynamic';

export default async function ProposalsPage() {
  if (!(await docsAuthed())) return null;
  return (
    <DocumentList
      kinds={['proposal']}
      eyebrow="Documents"
      title="Proposals"
      accent="that win."
      description="Write each section, watch the PDF build live, and download it on the Aurexis template."
      actions={<ButtonLink href="/documents/proposals/new" variant="primary">New proposal</ButtonLink>}
      emptyBody="Create your first proposal."
    />
  );
}
