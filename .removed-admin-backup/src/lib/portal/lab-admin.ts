"use client";

import { supabase } from "@/lib/supabase/client";
import type { LabExploration, LabPillar } from "@/data/lab-explorations";

export interface AdminExplorationRow {
  id: string;
  slug: string;
  pillar: LabPillar;
  type: LabExploration["type"];
  status_tone: "live" | "build";
  status_label: string;
  hook: string;
  title: string;
  description: string;
  thumbnail: string | null;
  outcome: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  note_title: string | null;
  note_href: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExplorationInput {
  slug: string;
  pillar: LabPillar;
  type: LabExploration["type"];
  status_tone: "live" | "build";
  status_label: string;
  hook: string;
  title: string;
  description: string;
  thumbnail: string | null;
  outcome: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  note_title: string | null;
  note_href: string | null;
  is_featured: boolean;
  display_order: number;
}

export const LAB_THUMBNAILS_BUCKET = "lab-thumbnails";

export async function listExplorations(): Promise<AdminExplorationRow[]> {
  const { data, error } = await supabase
    .from("lab_explorations")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminExplorationRow[];
}

export async function createExploration(input: ExplorationInput): Promise<AdminExplorationRow> {
  if (input.is_featured) {
    await supabase.from("lab_explorations").update({ is_featured: false }).eq("is_featured", true);
  }
  const { data, error } = await supabase
    .from("lab_explorations")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as AdminExplorationRow;
}

export async function updateExploration(id: string, input: ExplorationInput): Promise<AdminExplorationRow> {
  if (input.is_featured) {
    await supabase
      .from("lab_explorations")
      .update({ is_featured: false })
      .eq("is_featured", true)
      .neq("id", id);
  }
  const { data, error } = await supabase
    .from("lab_explorations")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as AdminExplorationRow;
}

export async function deleteExploration(id: string, thumbnail: string | null): Promise<void> {
  if (thumbnail && !thumbnail.startsWith("http")) {
    // It's a storage path, not an external URL — clean up
    await supabase.storage.from(LAB_THUMBNAILS_BUCKET).remove([thumbnail]);
  }
  const { error } = await supabase.from("lab_explorations").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadThumbnail(file: File): Promise<string> {
  const safe = file.name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(-80);
  const ts = Math.floor(Date.now() / 1000);
  const path = `${ts}-${safe}`;
  const { error } = await supabase.storage
    .from(LAB_THUMBNAILS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) throw error;
  // Return public URL (bucket is public)
  const { data } = supabase.storage.from(LAB_THUMBNAILS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
