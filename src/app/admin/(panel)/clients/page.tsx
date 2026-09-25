// src/app/admin/(panel)/clients/page.tsx
import { Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { loadOwners } from '@/lib/admin/owners';
import { ClientsBoard, type ClientRow } from '@/components/admin/clients/ClientsBoard';
import { EmptyState, PageHeader } from '@/components/admin/ui';
import type { Client, ClientContact } from '@/lib/admin/clients';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const admin = await requireAdmin();
  const [clientsRes, contactsRes, owners] = await Promise.all([
    supabaseAdmin
      .from('clients')
      .select(
        'id,name,company,kind,status,owner_id,industry,source,website,address,tags,notes,first_contact_at,last_contact_at,next_followup_at,next_followup_note,created_at,updated_at',
      )
      .limit(5000),
    supabaseAdmin
      .from('client_contacts')
      .select('client_id,name,email,phone,is_primary,created_at')
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(20000),
    loadOwners(),
  ]);

  if (clientsRes.error) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Every client, one place" title="Clients" accent="A–Z." />
        <div className="rounded-2xl border border-white/[0.14] bg-white/[0.02]">
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="The client tables aren't set up yet"
            body="Run supabase/migrations/034_clients.sql in the Supabase SQL Editor, then reload this page."
          />
        </div>
      </div>
    );
  }

  const primary = new Map<string, Pick<ClientContact, 'name' | 'email' | 'phone'>>();
  for (const c of contactsRes.data ?? []) {
    if (!primary.has(c.client_id as string)) primary.set(c.client_id as string, { name: c.name, email: c.email, phone: c.phone });
  }
  const rows: ClientRow[] = ((clientsRes.data ?? []) as Client[]).map((c) => ({ ...c, primary: primary.get(c.id) ?? null }));

  return <ClientsBoard clients={rows} owners={owners} meId={admin.id} />;
}
