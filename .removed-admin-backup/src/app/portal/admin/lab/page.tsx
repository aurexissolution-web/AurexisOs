"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  listExplorations,
  createExploration,
  updateExploration,
  deleteExploration,
  uploadThumbnail,
  type AdminExplorationRow,
  type ExplorationInput,
} from "@/lib/portal/lab-admin";
import {
  PILLAR_LABELS,
  TYPE_LABELS,
  type LabExploration,
  type LabPillar,
} from "@/data/lab-explorations";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const easeOut = [0.16, 1, 0.3, 1] as const;

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
  fontSize: 13,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "white",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 9.5,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.50)",
  display: "block",
  marginBottom: 6,
};

const PILLARS: LabPillar[] = ["ecosystem", "ai", "web", "app"];
const TYPES: LabExploration["type"][] = ["interactive", "mockup", "prototype", "video", "case"];

interface FormState {
  slug: string;
  pillar: LabPillar;
  type: LabExploration["type"];
  status_tone: "live" | "build";
  status_label: string;
  hook: string;
  title: string;
  description: string;
  thumbnail: string;
  outcome: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  note_title: string;
  note_href: string;
  is_featured: boolean;
  display_order: number;
}

const EMPTY_FORM: FormState = {
  slug: "",
  pillar: "ai",
  type: "interactive",
  status_tone: "live",
  status_label: "LIVE",
  hook: "",
  title: "",
  description: "",
  thumbnail: "",
  outcome: "",
  primary_cta_label: "",
  primary_cta_href: "",
  secondary_cta_label: "",
  secondary_cta_href: "",
  note_title: "",
  note_href: "",
  is_featured: false,
  display_order: 0,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function rowToForm(row: AdminExplorationRow): FormState {
  return {
    slug: row.slug,
    pillar: row.pillar,
    type: row.type,
    status_tone: row.status_tone,
    status_label: row.status_label,
    hook: row.hook,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail ?? "",
    outcome: row.outcome,
    primary_cta_label: row.primary_cta_label,
    primary_cta_href: row.primary_cta_href,
    secondary_cta_label: row.secondary_cta_label ?? "",
    secondary_cta_href: row.secondary_cta_href ?? "",
    note_title: row.note_title ?? "",
    note_href: row.note_href ?? "",
    is_featured: row.is_featured,
    display_order: row.display_order,
  };
}

function formToInput(form: FormState): ExplorationInput {
  return {
    slug: form.slug,
    pillar: form.pillar,
    type: form.type,
    status_tone: form.status_tone,
    status_label: form.status_label,
    hook: form.hook,
    title: form.title,
    description: form.description,
    thumbnail: form.thumbnail || null,
    outcome: form.outcome,
    primary_cta_label: form.primary_cta_label,
    primary_cta_href: form.primary_cta_href || "#",
    secondary_cta_label: form.secondary_cta_label || null,
    secondary_cta_href: form.secondary_cta_href || null,
    note_title: form.note_title || null,
    note_href: form.note_href || null,
    is_featured: form.is_featured,
    display_order: form.display_order,
  };
}

export default function LabAdminPage() {
  const [rows, setRows] = useState<AdminExplorationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listExplorations();
      setRows(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowEditor(true);
  }

  function startEdit(row: AdminExplorationRow) {
    setEditingId(row.id);
    setForm(rowToForm(row));
    setShowEditor(true);
  }

  function cancel() {
    setShowEditor(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadThumbnail(file);
      update("thumbnail", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const input = formToInput(form);
      if (editingId) await updateExploration(editingId, input);
      else await createExploration(input);
      cancel();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: AdminExplorationRow) {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    try {
      await deleteExploration(row.id, row.thumbnail);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-8 max-w-[1280px]">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="flex flex-col gap-3 border-b border-white/[0.06] pb-6"
      >
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
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
              The Lab.
            </h1>
            <p
              className="mt-3"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 15,
                color: "rgba(255,255,255,0.55)",
                margin: 0,
              }}
            >
              Manage explorations shown on{" "}
              <span style={{ color: "rgba(0,240,255,0.85)" }}>/the-lab</span>.
              Lab Notes are pulled from blog posts tagged{" "}
              <code
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  background: "rgba(0,240,255,0.08)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: "rgba(0,240,255,0.85)",
                }}
              >
                lab
              </code>
              .
            </p>
          </div>
          {!showEditor && (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-md bg-[#00F0FF] px-5 py-2.5 text-[13px] font-semibold text-black hover:brightness-110"
              style={{ boxShadow: "0 0 24px rgba(0,240,255,0.25)" }}
            >
              + New Exploration
            </button>
          )}
        </div>
      </motion.header>

      {showEditor && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
        >
          <h2
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 24,
              color: "white",
              margin: 0,
            }}
          >
            {editingId ? "Edit exploration" : "New exploration"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title *">
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => {
                  update("title", e.target.value);
                  if (!editingId && !form.slug) update("slug", slugify(e.target.value));
                }}
                required
              />
            </Field>
            <Field label="Slug *">
              <input
                style={inputStyle}
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Pillar">
              <select style={inputStyle} value={form.pillar} onChange={(e) => update("pillar", e.target.value as LabPillar)}>
                {PILLARS.map((p) => (
                  <option key={p} value={p}>
                    {PILLAR_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select style={inputStyle} value={form.type} onChange={(e) => update("type", e.target.value as LabExploration["type"])}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Display Order">
              <input
                type="number"
                style={inputStyle}
                value={form.display_order}
                onChange={(e) => update("display_order", Number(e.target.value) || 0)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Status Tone">
              <select
                style={inputStyle}
                value={form.status_tone}
                onChange={(e) => update("status_tone", e.target.value as "live" | "build")}
              >
                <option value="live">Live</option>
                <option value="build">In Build</option>
              </select>
            </Field>
            <Field label="Status Label">
              <input
                style={inputStyle}
                placeholder="LIVE · or · IN BUILD · LIVE MAY 28"
                value={form.status_label}
                onChange={(e) => update("status_label", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Hook (top-of-card eyebrow)">
            <input
              style={inputStyle}
              placeholder="e.g. The chatbot that learns your tone"
              value={form.hook}
              onChange={(e) => update("hook", e.target.value)}
            />
          </Field>

          <Field label="Description">
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif" }}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>

          <Field label="Outcome Line (metric or context)">
            <input
              style={inputStyle}
              placeholder="e.g. Replaced 3 staff handling intake forms"
              value={form.outcome}
              onChange={(e) => update("outcome", e.target.value)}
            />
          </Field>

          <Field label="Thumbnail">
            <div className="flex items-center gap-3 flex-wrap">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleThumbnail} className="hidden" disabled={uploading} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-md border border-white/[0.12] bg-white/[0.02] px-4 py-2 text-[12.5px] text-white/80 hover:bg-white/[0.05] disabled:opacity-50"
              >
                📎 {uploading ? "Uploading…" : form.thumbnail ? "Replace image" : "Upload image"}
              </button>
              <input
                type="url"
                placeholder="or paste image URL"
                style={{ ...inputStyle, flex: 1, minWidth: 240 }}
                value={form.thumbnail}
                onChange={(e) => update("thumbnail", e.target.value)}
              />
              {form.thumbnail && (
                <button
                  type="button"
                  onClick={() => update("thumbnail", "")}
                  className="text-red-400/70 hover:text-red-400 text-[11px]"
                  style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  Clear
                </button>
              )}
            </div>
            {form.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.thumbnail}
                alt="Thumbnail preview"
                className="mt-3 max-h-48 rounded-md border border-white/[0.08]"
              />
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Primary CTA Label">
              <input
                style={inputStyle}
                placeholder="auto if blank (e.g. 'Try it live')"
                value={form.primary_cta_label}
                onChange={(e) => update("primary_cta_label", e.target.value)}
              />
            </Field>
            <Field label="Primary CTA Href *">
              <input
                style={inputStyle}
                placeholder="https://… or /path"
                value={form.primary_cta_href}
                onChange={(e) => update("primary_cta_href", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Secondary CTA Label (optional)">
              <input
                style={inputStyle}
                value={form.secondary_cta_label}
                onChange={(e) => update("secondary_cta_label", e.target.value)}
              />
            </Field>
            <Field label="Secondary CTA Href (optional)">
              <input
                style={inputStyle}
                value={form.secondary_cta_href}
                onChange={(e) => update("secondary_cta_href", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Linked Note Title (optional)">
              <input
                style={inputStyle}
                placeholder="e.g. How we built the intake form"
                value={form.note_title}
                onChange={(e) => update("note_title", e.target.value)}
              />
            </Field>
            <Field label="Linked Note Href (optional)">
              <input
                style={inputStyle}
                placeholder="/blog/some-slug"
                value={form.note_href}
                onChange={(e) => update("note_href", e.target.value)}
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => update("is_featured", e.target.checked)}
              className="w-4 h-4 accent-[#00F0FF]"
            />
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
              ★ Featured exploration (replaces any other featured)
            </span>
          </label>

          {error && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: "#F87171",
                padding: "10px 14px",
                border: "1px solid rgba(248,113,113,0.20)",
                borderRadius: 8,
                background: "rgba(248,113,113,0.06)",
              }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-white/[0.06] pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#00F0FF] px-5 py-2.5 text-[13px] font-semibold text-black hover:brightness-110 disabled:opacity-50"
              style={{ boxShadow: "0 0 18px rgba(0,240,255,0.20)" }}
            >
              {submitting ? "Saving…" : editingId ? "Save changes" : "Create exploration"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-md border border-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-white/60 hover:bg-white/[0.04]"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {!showEditor && error && (
        <p style={{ fontFamily: MONO, fontSize: 11, color: "#F87171" }}>{error}</p>
      )}

      {loading ? (
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[72px] rounded-md bg-white/[0.02] border border-white/[0.04] animate-pulse" />
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] py-12 text-center">
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            No explorations yet.
          </p>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.30)",
              marginTop: 12,
            }}
          >
            Add your first exploration and it&apos;ll appear on /the-lab.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.04]">
          {rows.map((row) => (
            <li key={row.id} className="group flex items-center gap-4 py-4">
              <div className="w-16 h-12 rounded-md overflow-hidden bg-[#0A0B12] border border-white/[0.06] shrink-0 grid place-items-center">
                {row.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.30)" }}>
                    no img
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-2">
                  {row.is_featured && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: "0.20em",
                        color: "#F59E0B",
                      }}
                    >
                      ★ FEATURED
                    </span>
                  )}
                  <span
                    className="truncate"
                    style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: "white" }}
                  >
                    {row.title}
                  </span>
                </p>
                <p
                  className="mt-1"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.40)",
                  }}
                >
                  {PILLAR_LABELS[row.pillar]} · {TYPE_LABELS[row.type]} · {row.status_label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(row)}
                className="text-[11px] text-white/60 hover:text-white"
                style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(row)}
                className="text-[11px] text-red-400/70 hover:text-red-400"
                style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
