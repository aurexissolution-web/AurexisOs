"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Invoice } from "@/types/portal";
import { attachReceipt } from "@/lib/portal/customer-data";
import { formatCurrency } from "@/lib/portal/dashboard-data";
import { FileUpload } from "./FileUpload";
import { SignedFileLink } from "./SignedFileLink";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

interface CustomerReceiptsTabProps {
  customerId: string;
  invoices: Invoice[];
}

export function CustomerReceiptsTab({ customerId, invoices }: CustomerReceiptsTabProps) {
  const router = useRouter();
  const paid = invoices.filter((i) => i.status === "paid");
  const [attaching, setAttaching] = useState<string | null>(null);
  const [pendingValue, setPendingValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(invoiceId: string) {
    if (!pendingValue) return;
    setSaving(true);
    setError(null);
    try {
      await attachReceipt(invoiceId, pendingValue);
      setAttaching(null);
      setPendingValue("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to attach receipt");
    } finally {
      setSaving(false);
    }
  }

  function startAttach(invoiceId: string, existing: string | null) {
    setAttaching(invoiceId);
    setPendingValue(existing ?? "");
    setError(null);
  }

  function cancelAttach() {
    setAttaching(null);
    setPendingValue("");
    setError(null);
  }

  return (
    <div className="space-y-5">
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
        Payment receipts · attached to invoices marked paid
      </p>

      {paid.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] py-10 text-center">
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: "rgba(255,255,255,0.40)", margin: 0 }}>
            No paid invoices yet · receipts will appear here as invoices are marked paid
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.04]">
          {paid.map((inv) => (
            <li key={inv.id} className="flex flex-col gap-2 py-4">
              <div className="flex items-center gap-4">
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
                  className="flex-1 truncate"
                  style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,0.70)" }}
                >
                  {inv.description || "—"}
                </span>
                <span
                  className="hidden md:inline"
                  style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,0.40)", width: 110, textAlign: "right" }}
                >
                  paid {formatDate(inv.paid_at)}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "#10B981",
                    fontVariantNumeric: "tabular-nums",
                    width: 110,
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(Number(inv.amount) || 0, inv.currency || "MYR")}
                </span>
              </div>

              <div className="flex items-center gap-3 pl-[110px]">
                {attaching === inv.id ? (
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <FileUpload
                      customerId={customerId}
                      category="receipts"
                      value={pendingValue}
                      onChange={setPendingValue}
                    />
                    <button
                      type="button"
                      onClick={() => handleSave(inv.id)}
                      disabled={!pendingValue || saving}
                      className="rounded-md bg-[#00F0FF] px-3 py-1.5 text-[11px] font-semibold text-black disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save receipt"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAttach}
                      className="text-white/40 hover:text-white/70 text-[11px]"
                      style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : inv.receipt_url ? (
                  <div className="flex items-center gap-3">
                    <SignedFileLink value={inv.receipt_url} label="View receipt" />
                    <button
                      type="button"
                      onClick={() => startAttach(inv.id, inv.receipt_url)}
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.40)",
                      }}
                      className="hover:text-white"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startAttach(inv.id, null)}
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.40)",
                    }}
                    className="hover:text-white"
                  >
                    + Attach receipt
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#F87171" }}>{error}</p>}
    </div>
  );
}
