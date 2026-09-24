import type { ClientProfile, UserRole } from "@/types/portal";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./client";

const DEFAULT_ADMIN_EMAILS = ["aurexissolution@gmail.com"];

const parseEmailList = (value?: string) =>
  (value ? value.split(",") : [])
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const adminEmails = new Set<string>([
  ...DEFAULT_ADMIN_EMAILS,
  ...parseEmailList(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
]);

export function determineRoleFromEmail(email?: string | null): UserRole {
  const normalized = email?.toLowerCase();
  if (normalized && adminEmails.has(normalized)) {
    return "admin";
  }
  return "client";
}

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}

// Where a user lands after login. Admins go to the portal, everyone else
// gets bounced to the public contact page.
export function postLoginRouteForRole(role: UserRole): string {
  return role === "admin" ? "/portal/admin" : "/contact";
}

export async function ensureUserProfile(user: User): Promise<ClientProfile> {
  const desiredRole = determineRoleFromEmail(user.email);
  const { data: profile, error } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (!profile) {
    const { data: created, error: insertError } = await supabase
      .from("client_profiles")
      .insert({
        user_id: user.id,
        role: desiredRole,
        contact_email: user.email ?? "",
        contact_name: user.user_metadata?.full_name ?? "",
        company_name: user.user_metadata?.company ?? "",
        contact_phone: "",
        billing_address: "",
        billing_preferences: "",
      })
      .select("*")
      .single();

    if (insertError || !created) {
      throw insertError ?? new Error("Failed to create client profile");
    }

    return created as ClientProfile;
  }

  if (desiredRole === "admin" && profile.role !== "admin") {
    const { data: updated, error: updateError } = await supabase
      .from("client_profiles")
      .update({ role: "admin" })
      .eq("id", profile.id)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    if (updated) {
      return updated as ClientProfile;
    }
  }

  return profile as ClientProfile;
}
