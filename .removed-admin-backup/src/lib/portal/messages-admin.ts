"use client";

import { supabase } from "@/lib/supabase/client";
import type { ContactMessage } from "@/types/portal";

export async function listMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export async function markContacted(id: string, contacted: boolean): Promise<void> {
  const { error } = await supabase
    .from("contact_messages")
    .update({ contacted_at: contacted ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Strip everything except digits + leading + for a wa.me URL.
 * wa.me wants international format with no '+', spaces, or dashes.
 */
export function waMeUrl(phone: string | null, prefilled?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return prefilled ? `${base}?text=${encodeURIComponent(prefilled)}` : base;
}
