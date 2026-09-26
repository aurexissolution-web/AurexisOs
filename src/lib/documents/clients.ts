// Server-only: the client list the document editors offer for "Prepared for" / "Issued to".
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { ClientOption } from '@/components/documents/DocumentEditor';

export async function loadClientOptions(): Promise<ClientOption[]> {
  const [clientsRes, contactsRes] = await Promise.all([
    supabaseAdmin.from('clients').select('id,name,address').order('name').limit(5000),
    supabaseAdmin.from('client_contacts').select('client_id,phone,is_primary').order('is_primary', { ascending: false }).limit(20000),
  ]);
  const phone = new Map<string, string>();
  for (const c of contactsRes.data ?? []) if (c.phone && !phone.has(c.client_id as string)) phone.set(c.client_id as string, c.phone);
  return (clientsRes.data ?? []).map((c) => ({
    id: c.id as string, name: c.name as string, address: (c.address as string) ?? '', phone: phone.get(c.id as string) ?? '',
  }));
}
