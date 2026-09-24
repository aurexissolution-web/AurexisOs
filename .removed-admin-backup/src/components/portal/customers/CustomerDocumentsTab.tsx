"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Document } from "@/types/portal";
import { createDocumentForCustomer, deleteDocument } from "@/lib/portal/customer-data";
import { FileUpload } from "./FileUpload";
import { SignedFileLink } from "./SignedFileLink";
import { isExternalUrl } from "@/lib/portal/storage";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
  fontSize: 13,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 6,
  padding: "8px 10px",
  color: "white",
  outline: "none",
  width: "100%",
};

const TYPE_LABEL: Record<string, string> = {
  nda: "NDA",
  service_agreement: "Service Agreement",
  proposal: "Proposal",
  other: "Other",
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pending: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  signed: { color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  expired: { color: "#F87171", bg: "rgba(248,113,113,0.10)" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

interface CustomerDocumentsTabProps {
  customerId: string;
  documents: Document[];
}

export function CustomerDocumentsTab({ customerId, documents }: CustomerDocumentsTabProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "other" as "nda" | "service_agreement" | "proposal" | "other",
    file_url: "",
    status: "pending" as "pending" | "signed" | "expired",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.file_url) return;
    setSubmitting(true);
    setError(null);
    try {
      await createDocumentForCustomer({
        customer_record_id: customerId,
        name: form.name,
        type: form.type,
        file_url: form.file_url,
        status: form.status,
      });
      setForm({ name: "", type: "other", file_url: "", status: "pending" });
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add document");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete document "${name}"?`)) return;
    try {
      await deleteDocument(id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            margin: 0,
          }}
        >
          {documents.length} {documents.length === 1 ? "document" : "documents"} from this customer
        </p>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-[#00F0FF] px-4 py-2 text-[12px] font-semibold text-black hover:brightness-110"
            style={{ boxShadow: "0 0 18px rgba(0,240,255,0.20)" }}
          >
            + Add Document
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <input
            placeholder="Document name (e.g. Signed NDA — 2026-06)"
            style={inputStyle}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
          <div>
            <label
              style={{
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                display: "block",
                marginBottom: 6,
              }}
            >
              File
            </label>
            <FileUpload
              customerId={customerId}
              category="documents"
              value={form.file_url}
              onChange={(value) => setForm((f) => ({ ...f, file_url: value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              style={inputStyle}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
            >
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              style={inputStyle}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))}
            >
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          {error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#F87171" }}>{error}</p>}
          <div className="flex items-center gap-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-[#00F0FF] px-4 py-2 text-[12px] font-semibold text-black disabled:opacity-50">
              {submitting ? "Adding…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              className="rounded-md border border-white/[0.08] px-4 py-2 text-[12px] font-medium text-white/60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {documents.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] py-10 text-center">
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: "rgba(255,255,255,0.40)", margin: 0 }}>
            No documents yet
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.04]">
          {documents.map((doc) => {
            const style = STATUS_STYLE[doc.status] ?? STATUS_STYLE.pending;
            return (
              <li key={doc.id} className="group flex items-center gap-4 py-4">
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    width: 130,
                  }}
                >
                  {TYPE_LABEL[doc.type] ?? doc.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate"
                    style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: "white", margin: 0 }}
                  >
                    {doc.name}
                  </p>
                  {doc.file_url && (
                    <div className="mt-1">
                      <SignedFileLink
                        value={doc.file_url}
                        icon={isExternalUrl(doc.file_url) ? "🔗" : "📎"}
                      />
                    </div>
                  )}
                </div>
                <span
                  className="inline-flex items-center shrink-0"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: style.color,
                    background: style.bg,
                    borderRadius: 999,
                    padding: "3px 9px",
                  }}
                >
                  {doc.status}
                </span>
                <span
                  className="hidden md:inline"
                  style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,0.35)", width: 110, textAlign: "right" }}
                >
                  {formatDate(doc.signed_at ?? doc.created_at)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="opacity-0 group-hover:opacity-100 text-red-400/70 hover:text-red-400 text-[10px] transition-opacity"
                  style={{ fontFamily: MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
