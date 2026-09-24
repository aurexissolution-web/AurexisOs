import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/portal"];
const AUTH_PAGES = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  // Extract Supabase auth tokens from cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Read the sb auth token from cookies
  const accessToken = req.cookies.get("sb-access-token")?.value
    || req.cookies.get(`sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`)?.value;

  // Try to get auth from the storage-based cookie
  let isAuthenticated = false;

  if (accessToken) {
    try {
      const parsed = JSON.parse(accessToken);
      if (parsed?.access_token) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
          global: { headers: { Authorization: `Bearer ${parsed.access_token}` } },
        });
        const { data: { user } } = await supabase.auth.getUser();
        isAuthenticated = !!user;
      }
    } catch {
      // Not valid JSON, try as raw token
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });
      const { data: { user } } = await supabase.auth.getUser();
      isAuthenticated = !!user;
    }
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isAuthPage && isAuthenticated) {
    const redirectParam = req.nextUrl.searchParams.get("redirect") || "/portal/client";
    return NextResponse.redirect(new URL(redirectParam, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/login"],
};
