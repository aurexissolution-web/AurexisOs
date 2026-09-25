// src/app/admin/(panel)/clients/import/page.tsx
import { requireAdmin } from '@/lib/auth/admin';
import { ImportPanel } from '@/components/admin/clients/ImportPanel';
import { PageHeader } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function ImportPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Bring your list in" title="Import" accent="clients." description="Upload a spreadsheet (CSV). You'll see exactly what will happen before anything is saved." />
      <ImportPanel />
    </div>
  );
}
