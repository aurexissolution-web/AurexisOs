"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Invoice, InvoiceStatus } from "@/types/portal";
import {
  createInvoiceForCustomer,
  deleteInvoice,
  markInvoicePaid,
} from "@/lib/portal/customer-data";
import { formatCurrency } from "@/lib/portal/dashboard-data";
import { FileUpload } from "./FileUpload";
import { SignedFileLink } from "./SignedFileLink";

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

const STATUS_STYLE: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  paid: { label: "Paid", color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  sent: { label: "Sent", color: "#00F0FF", bg: "rgba(0,240,255,0.08)" },
  overdue: { label: "Overdue", color: "#F87171", bg: "rgba(248,113,113,0.10)" },
  draft: { label: "Draft", color: "rgba(255,255,255,0.50)", bg: "rgba(255,255,255,0.04)" },
  cancelled: { label: "Cancelled", color: "rgba(255,255,255,0.30)", bg: "rgba(255,255,255,0.03)" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

interface CustomerInvoicesTabProps {
  customerId: string;
  invoices: Invoice[];
}

export function CustomerInvoicesTab({ customerId, invoices }: CustomerInvoicesTabProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    amount: "",
    currency: "MYR",
    status: "draft" as InvoiceStatus,
    description: "",
    due_date: "",
    invoice_file_url: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!form.invoice_number || !amt || !form.due_date) return;
    setSubmitting(true);
    setError(null);
    try {
      await createInvoiceForCustomer({
        customer_record_id: customerId,
        invoice_number: form.invoice_number,
        amount: amt,
        currency: form.currency,
        status: form.status,
        description: form.description,
        due_date: form.due_date,
        invoice_file_url: form.invoice_file_url || null,
      });
      setForm({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        amount: "",
        currency: "MYR",
        status: "draft",
        description: "",
        due_date: "",
        invoice_file_url: "",
      });
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add invoice");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkPaid(id: string) {
    if (!confirm("Mark this invoice as paid?")) return;
    try {
      await markInvoicePaid(id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string, num: string) {
    if (!confirm(`Delete invoice ${num}?`)) return;
    try {
      await deleteInvoice(id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalOutstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + (Number(i.amount) || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-5">
          <StatStrip label="Paid" value={formatCurrency(totalPaid)} tone="good" />
          <StatStrip label="Outstanding" value={formatCurrency(totalOutstanding)} tone={totalOutstanding > 0 ? "warn" : undefined} />
          <StatStrip label="Total" value={String(invoices.length)} />
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-[#00F0FF] px-4 py-2 text-[12px] font-semibold text-black hover:brightness-110"
            style={{ boxShadow: "0 0 18px rgba(0,240,255,0.20)" }}
          >
            + Add Invoice
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="Invoice number"
              style={inputStyle}
              value={form.invoice_number}
              onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))}
              required
              autoFocus
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              style={inputStyle}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
            <input
              type="date"
              style={inputStyle}
              value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              style={inputStyle}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as InvoiceStatus }))}
            >
              {(Object.keys(STATUS_STYLE) as InvoiceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_STYLE[s].label}
                </option>
              ))}
            </select>
            <input
              placeholder="Currency"
              style={inputStyle}
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
            />
          </div>
          <input
            placeholder="Description (e.g. Patient Portal v2 — milestone 1)"
            style={inputStyle}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
              Invoice PDF (optional)
            </label>
            <FileUpload
              customerId={customerId}
              category="invoices"
              value={form.invoice_file_url}
              onChange={(value) => setForm((f) => ({ ...f, invoice_file_url: value }))}
            />
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

      {invoices.length === 0 && !adding ? (
        <Empty />
      ) : (
        <ul className="divide-y divide-white/[0.04]">
          {invoices.map((inv) => {
            const style = STATUS_STYLE[inv.status];
            return (
              <li key={inv.id} className="group flex items-center gap-4 py-4">
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11.5,
                    color: "rgba(255,255,255,0.75)",
                    width: 110,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {inv.invoice_number}
                </span>
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
                  {style.label}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className="block truncate"
                    style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,0.70)" }}
                  >
                    {inv.description || "—"}
                  </span>
                  {inv.invoice_file_url && (
                    <div className="mt-0.5">
                      <SignedFileLink value={inv.invoice_file_url} label="Invoice PDF" />
                    </div>
                  )}
                </div>
                <span
                  className="hidden md:inline"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    color: "rgba(255,255,255,0.40)",
                    width: 110,
                    textAlign: "right",
                  }}
                >
                  due {formatDate(inv.due_date)}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "white",
                    fontVariantNumeric: "tabular-nums",
                    width: 110,
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(Number(inv.amount) || 0, inv.currency || "MYR")}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {inv.status !== "paid" && inv.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(inv.id)}
                      className="text-emerald-400 hover:text-emerald-300 text-[10px]"
                      style={{ fontFamily: MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(inv.id, inv.invoice_number)}
                    className="text-red-400/70 hover:text-red-400 text-[10px]"
                    style={{ fontFamily: MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatStrip({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  const color = tone === "good" ? "#10B981" : tone === "warn" ? "#F59E0B" : "rgba(255,255,255,0.85)";
  return (
    <div className="flex items-baseline gap-2">
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
        {label}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 13, color, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.10] py-10 text-center">
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: "rgba(255,255,255,0.40)", margin: 0 }}>
        No invoices yet
      </p>
    </div>
  );
}
