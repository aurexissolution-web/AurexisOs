import type { DashboardOverview } from "@/lib/portal/dashboard-data";
import { MetricCard } from "./MetricCard";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

interface InboundMessagesProps {
  data: DashboardOverview["inbound"];
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

export function InboundMessages({ data }: InboundMessagesProps) {
  return (
    <MetricCard
      eyebrow="Inbound · Last 7 Days"
      accent="emerald"
      className="lg:col-span-3"
      emptyHint={data.lastWeek === 0 && !data.latest ? "No messages this week" : undefined}
    >
      <div className="mt-2 flex flex-1 flex-col justify-between gap-4">
        <div>
          <p
            className="leading-none"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 42,
              color: data.lastWeek > 0 ? "white" : "rgba(255,255,255,0.30)",
              margin: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {data.lastWeek}
          </p>
          <p
            className="mt-2"
            style={{
              fontFamily: MONO,
              fontSize: 9.5,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.40)",
              margin: 0,
            }}
          >
            New messages
          </p>
        </div>

        {data.latest && (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: "0.20em",
                  textTransform: "uppercase",
                  color: "#10B981",
                }}
              >
                {data.latest.intent.replace(/-/g, " ")}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.30)",
                }}
              >
                {formatRelative(data.latest.created_at)}
              </span>
            </div>
            <p
              className="line-clamp-2"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 13,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.80)",
                margin: 0,
              }}
            >
              &ldquo;{data.latest.message}&rdquo;
            </p>
            <p
              className="mt-2"
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.45)",
                margin: 0,
              }}
            >
              — {data.latest.name}
            </p>
          </div>
        )}
      </div>
    </MetricCard>
  );
}
