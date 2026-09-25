// src/lib/supabase/ssr.ts
// Cookie-based Supabase client for server components and server actions.
// Uses the ANON key and the visitor's own session — it can only see what the
// signed-in user is allowed to see. Privileged reads/writes still go through
// supabaseAdmin (server.ts) *after* requireAdmin() has passed.
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          // Server components can't write cookies; the proxy refreshes the
          // session on every /admin request, so ignoring here is safe.
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}
