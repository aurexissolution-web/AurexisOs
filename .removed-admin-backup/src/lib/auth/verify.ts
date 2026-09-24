import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "../supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Verify the request has a valid Supabase auth session.
 * Returns the authenticated user or null.
 */
export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // Also check cookies for session
  const newCookieToken = req.cookies.get("sb-access-token")?.value;
  const cookieToken = req.cookies.get(`sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`)?.value;

  let accessToken = token;

  if (!accessToken && (newCookieToken || cookieToken)) {
    let rawCookie = newCookieToken || cookieToken;
    try {
      if (rawCookie) rawCookie = decodeURIComponent(rawCookie);
    } catch {
      // ignore decoding errors
    }
    try {
      const parsed = JSON.parse(rawCookie as string);
      accessToken = parsed?.access_token || rawCookie;
    } catch {
      accessToken = rawCookie;
    }
  }

  if (!accessToken) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Verify user is an admin by checking their client_profiles role.
 */
export async function verifyAdmin(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("client_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return null;
  return user;
}
