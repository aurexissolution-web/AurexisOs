import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';

/** Admins who can own a client, for the owner picker. */
export async function loadOwners(): Promise<{ id: string; name: string }[]> {
  const { data } = await supabaseAdmin.from('client_profiles').select('user_id, contact_name').eq('role', 'admin');
  return (data ?? []).map((r) => ({ id: r.user_id as string, name: (r.contact_name as string) || 'Admin' }));
}
