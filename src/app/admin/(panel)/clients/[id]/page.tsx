// src/app/admin/(panel)/clients/[id]/page.tsx
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { loadOwners } from '@/lib/admin/owners';
import { ClientDetail } from '@/components/admin/clients/ClientDetail';
import type { Client, ClientActivity, ClientContact } from '@/lib/admin/clients';
import type { ClientFile } from '../files-actions';
import type { ClientInvoice, ClientService } from '@/lib/admin/billing';

export const dynamic = 'force-dynamic';

function nowIso() {
  return new Date().toISOString();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [client, contacts, activity, owners, meetings, files, services, invoices] = await Promise.all([
    supabaseAdmin
      .from('clients')
      .select(
        'id,name,company,kind,status,owner_id,industry,source,website,address,tags,notes,first_contact_at,last_contact_at,next_followup_at,next_followup_note,created_at,updated_at',
      )
      .eq('id', id)
      .maybeSingle(),
    supabaseAdmin
      .from('client_contacts')
      .select('id,client_id,name,role,email,phone,is_primary')
      .eq('client_id', id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('client_activity')
      .select('id,client_id,kind,title,body,occurred_at,actor_id,ref')
      .eq('client_id', id)
      .order('occurred_at', { ascending: false })
      .limit(300),
    loadOwners(),
    supabaseAdmin
      .from('calendar_events')
      .select('id,title,starts_at,ends_at')
      .eq('client_id', id)
      .eq('status', 'scheduled')
      .gte('starts_at', nowIso())
      .order('starts_at', { ascending: true })
      .limit(5),
    supabaseAdmin.from('client_files').select('id,client_id,name,kind,size_bytes,mime_type,sent_at,sent_to,created_at').eq('client_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('client_services').select('id,client_id,solution,name,price_myr,status,start_date,care_plan,care_price_myr,renewal_date,notes').eq('client_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('client_invoices').select('id,client_id,service_id,number,description,amount_myr,status,issued_on,due_on,paid_on').eq('client_id', id).order('issued_on', { ascending: false }),
  ]);
  if (!client.data) notFound();

  // Other clients that share one of this client's emails or phones.
  const emailKeys = (contacts.data ?? []).map((c) => (c.email as string).trim().toLowerCase()).filter(Boolean);
  const phoneKeys = (contacts.data ?? []).map((c) => (c.phone as string).replace(/\D/g, '')).filter(Boolean);
  let duplicates: { id: string; name: string }[] = [];
  if (emailKeys.length || phoneKeys.length) {
    const orFilter = [
      ...emailKeys.map((e) => `email_key.eq.${e.replace(/[,()]/g, '')}`),
      ...phoneKeys.map((p) => `phone_key.eq.${(p.startsWith('00') ? p.slice(2) : p.startsWith('0') ? `6${p}` : p)}`),
    ].join(',');
    const { data: shared } = await supabaseAdmin
      .from('client_contacts')
      .select('client_id, clients(name)')
      .or(orFilter)
      .neq('client_id', id)
      .limit(10);
    const seen = new Map<string, string>();
    for (const r of (shared ?? []) as unknown as { client_id: string; clients: { name: string } | { name: string }[] | null }[]) {
      const nm = (Array.isArray(r.clients) ? r.clients[0]?.name : r.clients?.name) ?? 'Another client';
      seen.set(r.client_id, nm);
    }
    duplicates = [...seen].map(([cid, name]) => ({ id: cid, name }));
  }

  return (
    <ClientDetail
      client={client.data as Client}
      contacts={(contacts.data ?? []) as ClientContact[]}
      activity={(activity.data ?? []) as ClientActivity[]}
      owners={owners}
      meetings={(meetings.data ?? []) as { id: string; title: string; starts_at: string; ends_at: string }[]}
      files={(files.data ?? []) as ClientFile[]}
      services={((services.data ?? []) as ClientService[]).map((s) => ({ ...s, price_myr: Number(s.price_myr), care_price_myr: Number(s.care_price_myr) }))}
      invoices={((invoices.data ?? []) as ClientInvoice[]).map((i) => ({ ...i, amount_myr: Number(i.amount_myr) }))}
      duplicates={duplicates}
    />
  );
}
