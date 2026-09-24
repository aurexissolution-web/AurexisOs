import { supabaseAdmin } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("invite_links")
    .select("id, token, email, role, used, expires_at")
    .eq("token", token)
    .single();

  if (error || !data) {
    return Response.json({ error: "Invalid invite link" }, { status: 404 });
  }

  if (data.used) {
    return Response.json({ error: "This invite link has already been used" }, { status: 410 });
  }

  if (new Date(data.expires_at) < new Date()) {
    return Response.json({ error: "This invite link has expired" }, { status: 410 });
  }

  return Response.json({ data: { email: data.email, role: data.role, token: data.token } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, password } = body;

  if (!token || !password) {
    return Response.json({ error: "Missing token or password" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  if (typeof token !== "string" || !/^[a-zA-Z0-9_-]+$/.test(token)) {
    return Response.json({ error: "Invalid token format" }, { status: 400 });
  }

  // Validate token
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("invite_links")
    .select("id, email, role, used, expires_at")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return Response.json({ error: "Invalid invite link" }, { status: 404 });
  }

  if (invite.used) {
    return Response.json({ error: "This invite link has already been used" }, { status: 410 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return Response.json({ error: "This invite link has expired" }, { status: 410 });
  }

  // Create user via Supabase Admin auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
  });

  if (authError) {
    // If user already exists, tell them to log in instead
    if (authError.message.toLowerCase().includes("already") || authError.message.toLowerCase().includes("exists")) {
      return Response.json({ error: "An account with this email already exists. Please log in instead." }, { status: 409 });
    }
    return Response.json({ error: authError.message }, { status: 500 });
  }

  // Create client profile
  if (authData.user) {
    await supabaseAdmin.from("client_profiles").insert({
      user_id: authData.user.id,
      role: invite.role,
      contact_email: invite.email,
      contact_name: "",
      company_name: "",
      contact_phone: "",
      billing_address: "",
      billing_preferences: "",
    });
  }

  // Mark invite as used
  await supabaseAdmin
    .from("invite_links")
    .update({ used: true })
    .eq("id", invite.id);

  return Response.json({ success: true, role: invite.role });
}
