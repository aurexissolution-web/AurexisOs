// src/app/documents/(panel)/proposals/new/page.tsx
import { docsAuthed } from '@/lib/documents/access';
import { supabaseAdmin } from '@/lib/supabase/server';
import { dateKeyOf } from '@/lib/admin/calendar';
import { PageHeader } from '@/components/admin/ui';
import type { ClientOption } from '@/components/documents/DocumentEditor';
import { ProposalEditor, type ProposalState } from '@/components/documents/ProposalEditor';
import { defaultSections } from '@/lib/documents/proposal';
import { nextSequence, proposalRef } from '@/lib/documents/model';

export const dynamic = 'force-dynamic';

export default async function NewProposalPage() {
  if (!(await docsAuthed())) return null;
  const [clientsRes, contactsRes, refsRes] = await Promise.all([
    supabaseAdmin.from('clients').select('id,name,address').order('name').limit(5000),
    supabaseAdmin.from('client_contacts').select('client_id,phone,is_primary').order('is_primary', { ascending: false }).limit(20000),
    supabaseAdmin.from('documents').select('number').eq('kind', 'proposal').limit(5000),
  ]);

  const phone = new Map<string, string>();
  for (const c of contactsRes.data ?? []) if (c.phone && !phone.has(c.client_id as string)) phone.set(c.client_id as string, c.phone);
  const clients: ClientOption[] = (clientsRes.data ?? []).map((c) => ({
    id: c.id as string, name: c.name as string, address: (c.address as string) ?? '', phone: phone.get(c.id as string) ?? '',
  }));

  const refs = (refsRes.data ?? []).map((d) => d.number as string);
  const today = dateKeyOf(new Date().toISOString());
  const year = Number(today.slice(0, 4));
  const initial: ProposalState = {
    ref: proposalRef('presence', 'CLI', year, nextSequence(`AUR-PRES-CLI-${year}-`, refs, 0)),
    date: today, product: 'presence', title: 'Corporate Capability\nWebsite Proposal', clientName: '', clientId: null, price: 0,
    sections: defaultSections('', 'presence', 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Proposals" title="New proposal" description="Write each section on the left; the preview on the right is the real PDF." />
      <ProposalEditor initial={initial} clients={clients} existingRefs={refs} year={year} />
    </div>
  );
}
