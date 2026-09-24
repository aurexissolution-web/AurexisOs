// Server-side: imported by server components / route handlers.
// Client-side helpers in reviews-admin.ts.

import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Review } from "@/types/portal";

function devReview(
  id: string,
  name: string,
  role: string,
  content: string,
  createdAt: string,
  featured = false,
): Review {
  return {
    id,
    name,
    role,
    rating: 5,
    content,
    avatar_key: "cyan",
    email: null,
    status: "approved",
    featured,
    admin_notes: "",
    created_at: createdAt,
    approved_at: createdAt,
    updated_at: createdAt,
  } as unknown as Review;
}

// Local-dev-only stand-in so this section is visible on the homepage without
// real Supabase credentials in .env.local. Never used in production — a
// misconfigured prod environment would still (correctly) render nothing.
// The `reviews` table is empty in production too; swap these for real
// client words via supabase/add-real-reviews.sql once collected.
const DEV_FALLBACK_REVIEWS: Review[] = [
  devReview(
    "dev-1",
    "T. Jayaraj & Company",
    "Managing Partner · Legal practice",
    "Every matter used to live in a different folder and half of it in someone's head. Now the firm runs off one screen, and I can hand a file to anyone without a twenty-minute briefing first.",
    "2026-03-04T00:00:00Z",
    true,
  ),
  devReview(
    "dev-2",
    "Kerala Ayurvedic Lifestyle",
    "Clinic Operations",
    "Patients book themselves now. The front desk stopped being a call centre and went back to being a front desk.",
    "2026-01-12T00:00:00Z",
  ),
  devReview(
    "dev-3",
    "M.A. Veerappan Auto",
    "Director · Parts distribution",
    "Three enquiry types used to arrive in three different places. Now it's one list, and nothing gets lost.",
    "2025-11-20T00:00:00Z",
  ),
];

export async function fetchApprovedReviews(limit = 50): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    console.warn("[reviews] Supabase not configured — skipping (see .env.local)");
    return process.env.NODE_ENV !== "production" ? DEV_FALLBACK_REVIEWS.slice(0, limit) : [];
  }
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("featured", { ascending: false })
    .order("approved_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[reviews] fetchApprovedReviews error:", error);
    return [];
  }
  return (data ?? []) as Review[];
}
