'use server';

import { redirect } from 'next/navigation';
import { createAuthClient } from '@/lib/supabase/ssr';
import { docsAuthed } from '@/lib/documents/access';

export async function docsSignIn(_prev: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (!email || !password) return { error: 'Enter your email and password.' };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'That email and password don’t match an account.' };

  if (!(await docsAuthed())) {
    await supabase.auth.signOut();
    return { error: 'This account doesn’t have access to Documents.' };
  }
  redirect('/documents');
}

export async function docsSignOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect('/documents');
}
