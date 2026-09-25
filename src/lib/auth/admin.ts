// src/lib/auth/admin.ts
// The single gate for /admin. Every admin page AND every admin server action
// calls requireAdmin() — never trust the proxy or the UI alone.
//
// An admin is a Supabase Auth user whose client_profiles row has role='admin'.
// The user is always taken from the verified session (getUser() hits Supabase
// Auth), never from anything the browser sends.
import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createAuthClient } from '@/lib/supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from('client_profiles')
    .select('role, contact_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') return null;
  return {
    id: user.id,
    email: user.email ?? '',
    name: profile.contact_name || (user.email ?? '').split('@')[0],
  };
});

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect('/admin/login');
  return admin;
}
