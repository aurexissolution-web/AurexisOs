import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function ensureClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseServiceKey) {
    console.warn(
      "[SECURITY] SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will fail. " +
        "Set this environment variable in your hosting provider (e.g. Vercel).",
    );
  }

  if (!supabaseUrl) {
    throw new Error(
      "supabaseAdmin: NEXT_PUBLIC_SUPABASE_URL is required at runtime.",
    );
  }

  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) {
    throw new Error(
      "supabaseAdmin: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required at runtime.",
    );
  }

  _client = createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });
  return _client;
}

// Proxy preserves the `supabaseAdmin.x.y()` call-site ergonomics
// while deferring createClient() until first property access — so module
// evaluation succeeds at build time even when env vars aren't present.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = ensureClient();
    const value = Reflect.get(client as object, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// Distinguishes "no real project connected yet" (expected in local/dev
// setups without credentials) from a genuine query failure against a real
// project. Callers use this to log a quiet one-line warning instead of a
// console.error that Next's dev overlay surfaces as a full-screen error.
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  return !url.includes("your-project") && !key.startsWith("your-");
}
