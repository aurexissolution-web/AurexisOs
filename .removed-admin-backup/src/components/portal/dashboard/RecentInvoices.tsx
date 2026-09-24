import Link from "next/link";
import type { DashboardOverview, InvoiceStatusKey } from "@/lib/portal/dashboard-data";
import { formatCurrency } from "@/lib/portal/dashboard-data";
import { MetricCard } from "./MetricCard";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const STATUS_STYLE: Record<InvoiceStatusKey, { label: string; color: string; bg: string }> = {
  paid: { label: "Paid", color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  sent: { label: "Sent", color: "#00F0FF", bg: "rgba(0,240,255,0.08)" },
  overdue: { label: "Overdue", color: "#F87171", bg: "rgba(248,113,113,0.10)" },
  draft: { label: "Draft", color: "rgba(255,255,255,0.50)", bg: "rgba(255,255,255,0.04)" },
  cancelled: { label: "Cancelled", color: "rgba(255,255,255,0.30)", bg: "rgba(255,255,255,0.03)" },
};

interface RecentInvoicesProps {
  data: DashboardOverview["recentInvoices"];
}

export function RecentInvoices({ data }: RecentInvoicesProps) {
  return (
    <MetricCard
      eyebrow="Recent Invoices"
      accent="cyan"
      className="lg:col-span-6"
      emptyHint={data.length === 0 ? "No invoices yet · Create one in /invoices →" : undefined}
    >
      <div className="mt-2 flex flex-1 flex-col">
        {data.length > 0 && (
          <ul className="flex flex-col">
            {data.map((inv) => {
              const style = STATUS_STYLE[inv.status] ?? STATUS_STYLE.draft;
              return (
                <li
                  key={inv.id}
                  className="flex items-center gap-3 border-b border-white/[0.04] py-3 last:border-none"
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: "0.10em",
                      color: "rgba(255,255,255,0.75)",
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 100,
                    }}
                  >
                    {inv.invoice_number || `INV-${inv.id.slice(0, 6)}`}
                  </span>
                  <span
                    className="inline-flex shrink-0 items-center"
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
                  <span className="flex-1" />
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12.5,
                      color: "white",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatCurrency(Number(inv.amount) || 0, inv.currency || "MYR")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-auto pt-4">
          <Link
            href="/portal/admin/customers"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(0,240,255,0.85)",
            }}
          >
            Manage in customer pages <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </MetricCard>
  );
}
