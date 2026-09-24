import Link from "next/link";
import type { CustomerRecord } from "@/types/portal";
import { CustomerStatusPill } from "./StatusPill";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

interface CustomerDetailHeaderProps {
  customer: CustomerRecord;
  lifetimePaid: number;
  projectCount: number;
}

function formatCurrencyShort(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function CustomerDetailHeader({ customer, lifetimePaid, projectCount }: CustomerDetailHeaderProps) {
  return (
    <header className="border-b border-white/[0.06] pb-6">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/portal/admin/customers"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.40)",
          }}
        >
          ← All Customers
        </Link>
      </div>

      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <CustomerStatusPill status={customer.status} />
            {customer.industry && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.40)",
                }}
              >
                · {customer.industry}
              </span>
            )}
          </div>
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
            {customer.company_name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {customer.contact_name && <ContactChip label="Lead" value={customer.contact_name} />}
            {customer.contact_email && (
              <ContactChip
                label="Email"
                value={customer.contact_email}
                href={`mailto:${customer.contact_email}`}
              />
            )}
            {customer.contact_phone && (
              <ContactChip
                label="Phone"
                value={customer.contact_phone}
                href={`tel:${customer.contact_phone.replace(/[^0-9+]/g, "")}`}
              />
            )}
            {customer.live_url && (
              <ContactChip
                label="Live"
                value={customer.live_url.replace(/^https?:\/\//, "")}
                href={customer.live_url}
                external
              />
            )}
            {customer.github_url && (
              <ContactChip
                label="GitHub"
                value={customer.github_url.replace(/^https?:\/\//, "")}
                href={customer.github_url}
                external
              />
            )}
            {customer.hosting_provider && <ContactChip label="Hosting" value={customer.hosting_provider} />}
          </div>
        </div>

        <div className="flex items-end gap-7">
          <Stat label="Projects" value={String(projectCount)} />
          <Stat label="Lifetime Paid" value={formatCurrencyShort(lifetimePaid)} tone="good" />
          <Stat label="First Engaged" value={formatDate(customer.first_engaged_at)} />
          <Link
            href={`/portal/admin/customers/${customer.slug}/edit`}
            className="rounded-md border border-white/[0.10] px-4 py-2 text-[12px] font-medium text-white/70 hover:bg-white/[0.04]"
            style={{ fontFamily: MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            Edit
          </Link>
        </div>
      </div>
    </header>
  );
}

function ContactChip({
  label,
  value,
  href,
  external,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <span className="inline-flex items-baseline gap-2">
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.30)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: href ? "rgba(0,240,255,0.85)" : "rgba(255,255,255,0.75)",
        }}
      >
        {value}
      </span>
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="transition-opacity hover:opacity-80"
      >
        {content}
      </a>
    );
  }
  return content;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" }) {
  return (
    <div className="hidden md:flex flex-col items-end">
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 22,
          color: tone === "good" ? "#10B981" : "white",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
