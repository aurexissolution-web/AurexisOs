import type { DashboardOverview } from "@/lib/portal/dashboard-data";
import { formatCurrency } from "@/lib/portal/dashboard-data";
import { MetricCard } from "./MetricCard";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const SIZE = 180;
const RADIUS = 72;
const STROKE = 14;
const CIRC = 2 * Math.PI * RADIUS;

interface IncomeMixDonutProps {
  data: DashboardOverview["incomeMix"];
}

export function IncomeMixDonut({ data }: IncomeMixDonutProps) {
  const total = data.total;
  const recurringPct = total > 0 ? (data.recurring / total) * 100 : 0;
  const oneTimePct = total > 0 ? (data.oneTime / total) * 100 : 0;

  return (
    <MetricCard
      eyebrow="Income Mix · MTD"
      accent="cyan"
      className="lg:col-span-4"
      emptyHint={total === 0 ? "No income logged this month" : undefined}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
            <g transform={`translate(${SIZE / 2} ${SIZE / 2}) rotate(-90)`}>
              {/* Empty ring */}
              <circle
                cx={0}
                cy={0}
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={STROKE}
              />
              {total > 0 && (
                <>
                  <circle
                    cx={0}
                    cy={0}
                    r={RADIUS}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth={STROKE}
                    strokeDasharray={`${(recurringPct / 100) * CIRC} ${CIRC}`}
                    strokeLinecap="butt"
                  />
                  <circle
                    cx={0}
                    cy={0}
                    r={RADIUS}
                    fill="none"
                    stroke="#A78BFA"
                    strokeWidth={STROKE}
                    strokeDasharray={`${(oneTimePct / 100) * CIRC} ${CIRC}`}
                    strokeDashoffset={`${-(recurringPct / 100) * CIRC}`}
                    strokeLinecap="butt"
                  />
                </>
              )}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 26,
                color: "white",
                margin: 0,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {total > 0 ? formatCurrency(total).replace(/^RM/, "") : "—"}
            </p>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 8.5,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginTop: 6,
              }}
            >
              Total MTD
            </p>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-2">
          <LegendRow color="#00F0FF" label="Recurring" pct={recurringPct} amount={data.recurring} />
          <LegendRow color="#A78BFA" label="One-time" pct={oneTimePct} amount={data.oneTime} />
        </div>
      </div>
    </MetricCard>
  );
}

function LegendRow({ color, label, pct, amount }: { color: string; label: string; pct: number; amount: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          fontFamily: MONO,
          fontSize: 13,
          color: "rgba(255,255,255,0.85)",
          margin: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatCurrency(amount)}{" "}
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10.5 }}>
          {pct.toFixed(0)}%
        </span>
      </p>
    </div>
  );
}
