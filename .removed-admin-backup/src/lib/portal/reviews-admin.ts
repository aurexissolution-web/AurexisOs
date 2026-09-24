"use client";

import { supabase } from "@/lib/supabase/client";
import type { Review, ReviewStatus } from "@/types/portal";

export async function listReviewsByStatus(status: ReviewStatus): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function approveReview(id: string): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function rejectReview(id: string): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({ status: "rejected" })
    .eq("id", id);
  if (error) throw error;
}

export async function unapproveReview(id: string): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({ status: "pending", approved_at: null })
    .eq("id", id);
  if (error) throw error;
}

export async function toggleFeatured(id: string, featured: boolean): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({ featured })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

export interface ReviewEditInput {
  name: string;
  role: string;
  rating: number;
  content: string;
  avatar_key: Review["avatar_key"];
  admin_notes?: string;
}

export async function updateReview(id: string, input: ReviewEditInput): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({
      name: input.name,
      role: input.role,
      rating: input.rating,
      content: input.content,
      avatar_key: input.avatar_key,
      admin_notes: input.admin_notes ?? "",
    })
    .eq("id", id);
  if (error) throw error;
}
