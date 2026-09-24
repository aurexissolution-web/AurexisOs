"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  listReviewsByStatus,
  approveReview,
  rejectReview,
  unapproveReview,
  toggleFeatured,
  deleteReview,
  updateReview,
} from "@/lib/portal/reviews-admin";
import type { Review, ReviewAvatarKey, ReviewStatus } from "@/types/portal";
import { ReviewAvatar } from "@/components/sections/reviews/ReviewAvatar";
import { AvatarPicker } from "@/components/sections/reviews/AvatarPicker";
import { StarRating } from "@/components/sections/reviews/StarRating";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const easeOut = [0.16, 1, 0.3, 1] as const;

const TABS: { key: ReviewStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
  fontSize: 13,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "white",
  width: "100%",
  outline: "none",
};

export default function ReviewsAdminPage() {
  const [activeTab, setActiveTab] = useState<ReviewStatus>("pending");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState<Record<ReviewStatus, number>>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    rating: 5,
    content: "",
    avatar_key: "cyan" as ReviewAvatarKey,
    admin_notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, pendingAll, approvedAll, rejectedAll] = await Promise.all([
        listReviewsByStatus(activeTab),
        listReviewsByStatus("pending"),
        listReviewsByStatus("approved"),
        listReviewsByStatus("rejected"),
      ]);
      setReviews(list);
      setCounts({
        pending: pendingAll.length,
        approved: approvedAll.length,
        rejected: rejectedAll.length,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(r: Review) {
    setEditing(r.id);
    setEditForm({
      name: r.name,
      role: r.role,
      rating: r.rating,
      content: r.content,
      avatar_key: r.avatar_key,
      admin_notes: r.admin_notes,
    });
  }
  function cancelEdit() {
    setEditing(null);
  }
  async function saveEdit(id: string) {
    try {
      await updateReview(id, editForm);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleApprove(id: string) {
    await approveReview(id);
    await load();
  }
  async function handleReject(id: string) {
    if (!confirm("Reject this review? It won't show on the site.")) return;
    await rejectReview(id);
    await load();
  }
  async function handleUnapprove(id: string) {
    if (!confirm("Move back to pending? It will stop showing on the site.")) return;
    await unapproveReview(id);
    await load();
  }
  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    await deleteReview(id);
    await load();
  }
  async function handleToggleFeatured(id: string, current: boolean) {
    await toggleFeatured(id, !current);
    await load();
  }

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1)),
    [reviews],
  );

  return (
    <div className="space-y-8 max-w-[1180px]">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="border-b border-white/[0.06] pb-6"
      >
        <h1
          className="leading-none tracking-tight"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "clamp(40px, 5vw, 56px)",
            color: "white",
            margin: 0,
          }}
        >
          Reviews.
        </h1>
        <p
          className="mt-3"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 16,
            color: "rgba(255,255,255,0.55)",
            margin: 0,
          }}
        >
          Approve, edit, or pin reviews submitted by visitors. Approved reviews show on{" "}
          <span style={{ color: "rgba(0,240,255,0.85)" }}>/</span>.
        </p>
      </motion.header>

      <nav className="flex items-center gap-1 border-b border-white/[0.06]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="relative px-4 py-3 transition-colors"
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                color: isActive ? "white" : "rgba(255,255,255,0.45)",
              }}
            >
              {tab.label}
              <span
                className="ml-2"
                style={{
                  fontSize: 10,
                  color: isActive ? "rgba(0,240,255,0.85)" : "rgba(255,255,255,0.30)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 0,
                }}
              >
                {count}
              </span>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-3 right-3 h-px"
                  style={{ background: "linear-gradient(to right, transparent, #00F0FF, transparent)" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {error && (
        <p style={{ fontFamily: MONO, fontSize: 11, color: "#F87171" }}>{error}</p>
      )}

      {loading ? (
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[140px] rounded-xl border border-white/[0.04] bg-white/[0.01] animate-pulse" />
          ))}
        </ul>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] py-14 text-center">
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Nothing in this queue.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedReviews.map((r) => {
            const isEditing = editing === r.id;
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <ReviewAvatar avatarKey={r.avatar_key} size={48} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            style={inputStyle}
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Name"
                          />
                          <input
                            style={inputStyle}
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            placeholder="Role"
                          />
                        </div>
                        <StarRating
                          value={editForm.rating}
                          onChange={(v) => setEditForm({ ...editForm, rating: v })}
                          size={22}
                        />
                        <textarea
                          style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                          value={editForm.content}
                          onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                          placeholder="Review content"
                        />
                        <AvatarPicker
                          value={editForm.avatar_key}
                          onChange={(k) => setEditForm({ ...editForm, avatar_key: k })}
                        />
                        <textarea
                          style={{ ...inputStyle, minHeight: 60, fontSize: 12, resize: "vertical" }}
                          value={editForm.admin_notes}
                          onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                          placeholder="Admin notes (internal only)"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(r.id)}
                            className="rounded-md bg-[#00F0FF] px-4 py-2 text-[12px] font-semibold text-black hover:brightness-110"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-white/[0.08] px-4 py-2 text-[12px] font-medium text-white/60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            style={{
                              fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                              fontSize: 15,
                              fontWeight: 600,
                              color: "white",
                            }}
                          >
                            {r.name}
                          </span>
                          {r.role && (
                            <span
                              style={{
                                fontFamily: MONO,
                                fontSize: 10,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,0.45)",
                              }}
                            >
                              · {r.role}
                            </span>
                          )}
                          {r.featured && (
                            <span
                              style={{
                                fontFamily: MONO,
                                fontSize: 9,
                                letterSpacing: "0.20em",
                                color: "#F59E0B",
                              }}
                            >
                              ★ PINNED
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <StarRating value={r.rating} readOnly size={14} />
                        </div>
                        <p
                          className="mt-3"
                          style={{
                            fontFamily: SERIF,
                            fontStyle: "italic",
                            fontSize: 15,
                            lineHeight: 1.55,
                            color: "rgba(255,255,255,0.85)",
                            margin: 0,
                          }}
                        >
                          &ldquo;{r.content}&rdquo;
                        </p>
                        <div
                          className="mt-3 flex items-center gap-4 flex-wrap"
                          style={{
                            fontFamily: MONO,
                            fontSize: 10,
                            letterSpacing: "0.14em",
                            color: "rgba(255,255,255,0.30)",
                          }}
                        >
                          <span>
                            {new Date(r.created_at).toLocaleString("en-MY", {
                              timeZone: "Asia/Kuala_Lumpur",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          {r.email && <span>· {r.email}</span>}
                          {r.admin_notes && (
                            <span style={{ color: "rgba(245,158,11,0.85)" }}>
                              · Note: {r.admin_notes}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="mt-4 flex items-center gap-2 border-t border-white/[0.04] pt-3 flex-wrap">
                    {activeTab === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(r.id)}
                        className="rounded-md bg-[#10B981]/15 border border-[#10B981]/40 px-3 py-1.5 text-[11px] font-medium text-[#10B981] hover:bg-[#10B981]/25"
                        style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                      >
                        ✓ Approve
                      </button>
                    )}
                    {activeTab === "approved" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(r.id, r.featured)}
                          className="rounded-md border border-white/[0.10] px-3 py-1.5 text-[11px] font-medium text-white/70 hover:bg-white/[0.04]"
                          style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                        >
                          ★ {r.featured ? "Unpin" : "Pin"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnapprove(r.id)}
                          className="rounded-md border border-white/[0.10] px-3 py-1.5 text-[11px] font-medium text-white/70 hover:bg-white/[0.04]"
                          style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                        >
                          Move to pending
                        </button>
                      </>
                    )}
                    {(activeTab === "pending" || activeTab === "approved") && (
                      <button
                        type="button"
                        onClick={() => handleReject(r.id)}
                        className="rounded-md border border-red-500/30 px-3 py-1.5 text-[11px] font-medium text-red-300 hover:bg-red-500/[0.08]"
                        style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                      >
                        ✕ Reject
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="rounded-md border border-white/[0.10] px-3 py-1.5 text-[11px] font-medium text-white/70 hover:bg-white/[0.04]"
                      style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="ml-auto rounded-md text-[11px] font-medium text-red-400/70 hover:text-red-400"
                      style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
