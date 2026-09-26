import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Keeps the free-tier database awake (pinged on a schedule). Public, so it uses
// the anon key and never returns error details.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
  try {
    const { error } = await createClient(supabaseUrl, supabaseKey).from("tickets").select("id").limit(1);
    if (error) console.error("Health check query failed:", error.message);
    return NextResponse.json({ status: error ? "error" : "ok", timestamp: new Date().toISOString() }, { status: error ? 500 : 200 });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
