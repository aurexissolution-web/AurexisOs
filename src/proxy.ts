// src/proxy.ts
// Keeps the Supabase session cookie fresh on /admin requests (access tokens
// expire hourly; server components can't write cookies themselves).
// This is NOT the security boundary — requireAdmin() is. It only refreshes.
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
