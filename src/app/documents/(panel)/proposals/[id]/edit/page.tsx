// src/app/documents/(panel)/proposals/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { docsAuthed } from '@/lib/documents/access';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isId } from '@/lib/admin/validate';
import { loadClientOptions } from '@/lib/documents/clients';
import { checkProposal } from '@/lib/documents/validate';
import { PageHeader } from '@/components/admin/ui';
import { ProposalEditor, type ProposalState } from '@/components/documents/ProposalEditor';

export const dynamic = 'force-dynamic';

export default async function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await docsAuthed())) return null;
  const { id } = await params;
  if (!isId(id)) notFound();

  const [{ data: row }, clients, refsRes] = await Promise.all([
    supabaseAdmin.from('documents').select('id,client_id,total_myr,data').eq('id', id).eq('kind', 'proposal').maybeSingle(),
    loadClientOptions(),
    supabaseAdmin.from('documents').select('number').eq('kind', 'proposal').neq('id', id).limit(5000),
  ]);
  if (!row) notFound();
  const checked = checkProposal(row.data);
  if (!checked.ok) notFound();
  const d = checked.data;

  const initial: ProposalState = {
    ref: d.ref, date: d.date, product: d.product, title: d.title, clientName: d.clientName,
    clientId: (row.client_id as string | null) ?? null, price: Number(row.total_myr) || 0, sections: d.sections,
  };
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Proposals" title={`Edit ${d.ref}`} description="Change anything, then save. The PDF is rebuilt from your changes." />
      <ProposalEditor docId={id} initial={initial} clients={clients} existingRefs={(refsRes.data ?? []).map((r) => r.number as string)} year={Number(d.date.slice(0, 4))} />
    </div>
  );
}
