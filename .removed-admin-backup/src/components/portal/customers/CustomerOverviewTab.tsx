import type { CustomerRecord, Project, Invoice, Document } from "@/types/portal";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

interface CustomerOverviewTabProps {
  customer: CustomerRecord;
  projects: Project[];
  invoices: Invoice[];
  documents: Document[];
}

export function CustomerOverviewTab({ customer, projects, invoices, documents }: CustomerOverviewTabProps) {
  const paid = invoices.filter((i) => i.status === "paid");
  const sent = invoices.filter((i) => i.status === "sent");
  const overdue = invoices.filter((i) => i.status === "overdue");

  const lifetimePaid = paid.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const outstanding = [...sent, ...overdue].reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Panel title="Notes">
          {customer.notes ? (
            <p
              className="whitespace-pre-wrap"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 16,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.80)",
                margin: 0,
              }}
            >
              {customer.notes}
            </p>
          ) : (
            <Empty>No notes yet · add via Edit</Empty>
          )}
        </Panel>

        <Panel title="Tech Stack">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <Row label="Hosting" value={customer.hosting_provider} />
            <Row label="Live URL" value={customer.live_url} href={customer.live_url} />
            <Row label="GitHub" value={customer.github_url} href={customer.github_url} />
            <Row label="Industry" value={customer.industry} />
          </dl>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel title="Financials">
          <dl className="space-y-3">
            <Row label="Lifetime Paid" value={`RM ${lifetimePaid.toLocaleString()}`} tone="good" />
            <Row label="Outstanding" value={`RM ${outstanding.toLocaleString()}`} tone={outstanding > 0 ? "warn" : undefined} />
            <Row label="Invoices Sent" value={String(invoices.length)} />
            {overdue.length > 0 && (
              <Row label="Overdue" value={String(overdue.length)} tone="bad" />
            )}
          </dl>
        </Panel>

        <Panel title="Engagement">
          <dl className="space-y-3">
            <Row label="Projects" value={String(projects.length)} />
            <Row label="Documents" value={String(documents.length)} />
            <Row
              label="First Engaged"
              value={
                customer.first_engaged_at
                  ? new Date(customer.first_engaged_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })
                  : null
              }
            />
          </dl>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
      <h3
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          margin: 0,
          marginBottom: 14,
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: string | null | undefined;
  href?: string | null;
  tone?: "good" | "bad" | "warn";
}) {
  const color =
    tone === "good" ? "#10B981" : tone === "bad" ? "#F87171" : tone === "warn" ? "#F59E0B" : "rgba(255,255,255,0.85)";

  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.40)",
          margin: 0,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </dt>
      <dd
        className="text-right"
        style={{
          fontFamily: MONO,
          fontSize: 12.5,
          color: value ? color : "rgba(255,255,255,0.25)",
          fontVariantNumeric: "tabular-nums",
          margin: 0,
        }}
      >
        {!value ? (
          "—"
        ) : href ? (
          <a
            href={href.startsWith("http") ? href : `https://${href}`}
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80"
            style={{ color: "rgba(0,240,255,0.85)" }}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: 14,
        color: "rgba(255,255,255,0.35)",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}
