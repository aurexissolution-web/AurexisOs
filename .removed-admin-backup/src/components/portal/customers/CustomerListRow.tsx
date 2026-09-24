import Link from "next/link";
import type { CustomerListItem } from "@/lib/portal/customer-data";
import { formatCurrency } from "@/lib/portal/dashboard-data";
import { CustomerStatusPill } from "./StatusPill";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

interface CustomerListRowProps {
  customer: CustomerListItem;
  index: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function CustomerListRow({ customer, index }: CustomerListRowProps) {
  return (
    <Link
      href={`/portal/admin/customers/${customer.slug}`}
      className="group grid items-center gap-4 border-b border-white/[0.04] py-5 transition-colors hover:bg-white/[0.015] px-2 -mx-2 rounded-md"
      style={{
        gridTemplateColumns: "48px 1fr auto auto auto auto 16px",
      }}
    >
      <span
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 22,
          color: "rgba(255,255,255,0.30)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <p
          className="truncate"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 22,
            color: "white",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {customer.company_name}
        </p>
        <p
          className="mt-1 truncate"
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.10em",
            color: "rgba(255,255,255,0.40)",
            margin: 0,
          }}
        >
          {[customer.contact_name, customer.contact_email].filter(Boolean).join(" · ") || "no contact info yet"}
        </p>
      </div>

      <div className="hidden md:flex flex-col items-end gap-1">
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {customer.project_count} {customer.project_count === 1 ? "project" : "projects"}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.30)",
          }}
        >
          {customer.invoice_count} invoices
        </span>
      </div>

      <div className="hidden lg:flex flex-col items-end gap-1">
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: customer.invoice_total > 0 ? "white" : "rgba(255,255,255,0.30)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatCurrency(customer.invoice_total)}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.30)",
          }}
        >
          lifetime paid
        </span>
      </div>

      <div className="hidden lg:flex flex-col items-end gap-1">
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: "rgba(255,255,255,0.55)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatDate(customer.last_engaged_at ?? customer.first_engaged_at)}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.30)",
          }}
        >
          last engaged
        </span>
      </div>

      <CustomerStatusPill status={customer.status} />

      <span aria-hidden className="text-white/30 transition-colors group-hover:text-[#00F0FF]" style={{ fontSize: 16 }}>
        →
      </span>
    </Link>
  );
}
