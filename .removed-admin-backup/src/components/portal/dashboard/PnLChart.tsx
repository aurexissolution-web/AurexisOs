import type { PnLMonth } from "@/lib/portal/dashboard-data";
import { formatCompact } from "@/lib/portal/dashboard-data";
import { MetricCard } from "./MetricCard";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const W = 720;
const H = 240;
const PAD_L = 16;
const PAD_R = 16;
const PAD_T = 24;
const PAD_B = 28;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

interface PnLChartProps {
  data: PnLMonth[];
}

export function PnLChart({ data }: PnLChartProps) {
  const allValues = data.flatMap((d) => [d.revenue, d.expenses, d.profit]);
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);
  const range = max - min || 1;

  const n = data.length || 1;
  const stepX = n > 1 ? PLOT_W / (n - 1) : 0;
  const yFor = (v: number) => PAD_T + PLOT_H - ((v - min) / range) * PLOT_H;
  const xFor = (i: number) => PAD_L + i * stepX;

  const buildPath = (values: number[], close = false) => {
    const pts = values.map((v, i) => [xFor(i), yFor(v)] as [number, number]);
    if (!pts.length) return "";
    const line = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
    if (!close) return line;
    return `${line} L ${xFor(n - 1)} ${yFor(0)} L ${xFor(0)} ${yFor(0)} Z`;
  };

  const revenuePath = buildPath(data.map((d) => d.revenue), true);
  const expensePath = buildPath(data.map((d) => d.expenses), true);
  const profitLine = buildPath(data.map((d) => d.profit), false);
  const zeroY = yFor(0);

  const isEmpty = allValues.every((v) => v === 0);

  return (
    <MetricCard
      eyebrow="P&L · Last 12 Months"
      accent="cyan"
      className="lg:col-span-8"
      emptyHint={isEmpty ? "No financial data yet · Log income & expenses to see trends →" : undefined}
    >
      <div className="mt-1 flex items-center gap-5">
        <Legend color="#00F0FF" label="Revenue" />
        <Legend color="#F59E0B" label="Expenses" />
        <Legend color="#10B981" label="Profit" line />
      </div>

      <div className="mt-4 flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="pnl-revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="pnl-expense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* zero line */}
          {min < 0 && (
            <line x1={PAD_L} x2={W - PAD_R} y1={zeroY} y2={zeroY} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 4" />
          )}

          {/* Revenue area */}
          <path d={revenuePath} fill="url(#pnl-revenue)" />
          {/* Expense area */}
          <path d={expensePath} fill="url(#pnl-expense)" />
          {/* Revenue stroke */}
          <path
            d={buildPath(data.map((d) => d.revenue))}
            fill="none"
            stroke="#00F0FF"
            strokeWidth={1.5}
            strokeOpacity={0.9}
          />
          {/* Expense stroke */}
          <path
            d={buildPath(data.map((d) => d.expenses))}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={1.5}
            strokeOpacity={0.8}
            strokeDasharray="3 3"
          />
          {/* Profit line */}
          <path d={profitLine} fill="none" stroke="#10B981" strokeWidth={2} />

          {/* Profit dots */}
          {data.map((d, i) => (
            <circle key={i} cx={xFor(i)} cy={yFor(d.profit)} r={2.5} fill="#10B981" />
          ))}

          {/* X labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={xFor(i)}
              y={H - 8}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={9}
              fill="rgba(255,255,255,0.35)"
              letterSpacing="0.18em"
            >
              {d.monthLabel.toUpperCase()}
            </text>
          ))}

          {/* Max label (top right) */}
          <text
            x={W - PAD_R}
            y={PAD_T - 6}
            textAnchor="end"
            fontFamily={MONO}
            fontSize={9.5}
            fill="rgba(255,255,255,0.30)"
            letterSpacing="0.18em"
          >
            MAX RM{formatCompact(max)}
          </text>
        </svg>
      </div>
    </MetricCard>
  );
}

function Legend({ color, label, line }: { color: string; label: string; line?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {line ? (
        <span aria-hidden style={{ width: 18, height: 2, background: color, borderRadius: 1 }} />
      ) : (
        <span
          aria-hidden
          style={{ width: 9, height: 9, borderRadius: 2, background: color, opacity: 0.75 }}
        />
      )}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {label}
      </span>
    </span>
  );
}
