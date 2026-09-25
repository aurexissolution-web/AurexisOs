// src/app/admin/(panel)/command/page.tsx
import { requireAdmin } from '@/lib/auth/admin';
import { listLeads } from '@/lib/admin/leads';
import { isLeadSourceKey } from '@/lib/admin/lead-sources';
import { CommandCenter } from '@/components/admin/CommandCenter';

export const dynamic = 'force-dynamic';

export default async function CommandPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; lead?: string }>;
}) {
  const user = await requireAdmin();
  const sp = await searchParams;
  const leads = await listLeads();

  return (
    <CommandCenter
      leads={leads}
      adminName={user.name.split(' ')[0]}
      initialSource={isLeadSourceKey(sp.source) ? sp.source : 'all'}
      initialStatus={sp.status ?? 'open'}
      initialLead={sp.lead ?? null}
    />
  );
}
