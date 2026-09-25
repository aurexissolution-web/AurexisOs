// Private gate for /documents. A person needs a Supabase Auth account AND a row
// in documents_access (admins do not get in automatically). Every page, route
// and action re-checks it; the UI is never the boundary.
import 'server-only';
import { cache } from 'react';
import { createAuthClient } from '@/lib/supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface DocsUser {
  id: string;
  email: string;
  name: string;
}

export const getDocsUser = cache(async (): Promise<DocsUser | null> => {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin.from('documents_access').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!data) return null;
  const email = user.email ?? '';
  return { id: user.id, email, name: email.split('@')[0] };
});

export const docsAuthed = async (): Promise<boolean> => (await getDocsUser()) !== null;

export async function requireDocsAccess(): Promise<void> {
  if (!(await docsAuthed())) throw new Error('Not signed in to Documents.');
}
