// Private gate for /accounts: a Supabase Auth account AND a row in
// accounts_access. Separate from admin and from Documents. Every page, route and
// action re-checks it; the UI is never the boundary.
import 'server-only';
import { cache } from 'react';
import { createAuthClient } from '@/lib/supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface AccountsUser {
  id: string;
  email: string;
  name: string;
}

export const getAccountsUser = cache(async (): Promise<AccountsUser | null> => {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin.from('accounts_access').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!data) return null;
  const email = user.email ?? '';
  return { id: user.id, email, name: email.split('@')[0] };
});

export const accountsAuthed = async (): Promise<boolean> => (await getAccountsUser()) !== null;

/** For server actions: returns the user or throws. */
export async function requireAccounts(): Promise<AccountsUser> {
  const u = await getAccountsUser();
  if (!u) throw new Error('Not signed in to Accounts.');
  return u;
}
