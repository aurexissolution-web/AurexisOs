import type { DashboardOverview } from "@/lib/portal/dashboard-data";
import { formatCurrency } from "@/lib/portal/dashboard-data";
import { PROJECT_PHASES } from "@/types/portal";
import { MetricCard } from "./MetricCard";
import { Sparkline } from "./Sparkline";
import { DeltaBadge } from "./DeltaBadge";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface DashboardHeroProps {
  data: DashboardOverview;
}

export function DashboardHero({ data }: DashboardHeroProps) {
  const { revenue, profit, projects } = data;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Revenue hero */}
      <div className="lg:col-span-7">
        <MetricCard
          eyebrow="Revenue · Month to Date"
          accent="cyan"
          emptyHint={revenue.mtd === 0 ? "No income logged yet · Add your first entry in /income →" : undefined}
        >
          <div className="flex flex-1 flex-col justify-between gap-6">
            <div>
              <div
                className="mt-1 leading-none tracking-tight"
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: "clamp(56px, 7vw, 88px)",
                  fontVariantNumeric: "tabular-nums",
                  backgroundImage: revenue.mtd > 0
                    ? "linear-gradient(110deg, #A0FFFF 10%, #00F0FF 50%, #0080FF 100%)"
                    : "none",
                  backgroundClip: revenue.mtd > 0 ? "text" : undefined,
                  WebkitBackgroundClip: revenue.mtd > 0 ? "text" : undefined,
                  color: revenue.mtd > 0 ? "transparent" : "rgba(255,255,255,0.40)",
                  filter: revenue.mtd > 0 ? "drop-shadow(0 0 24px rgba(0,240,255,0.25))" : "none",
                }}
              >
                {formatCurrency(revenue.mtd)}
              </div>
              <div className="mt-4">
                <DeltaBadge pct={revenue.deltaPct} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <Sparkline data={revenue.daily30} width={420} height={56} color="#00F0FF" fillOpacity={0.14} />
              </div>
              <div className="text-right" style={{ fontFamily: MONO }}>
                <p style={{ fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                  Last 30 days
                </p>
              </div>
            </div>
          </div>
        </MetricCard>
      </div>

      {/* Right column: profit + projects */}
      <div className="lg:col-span-5 grid grid-cols-1 gap-5">
        <MetricCard
          eyebrow="Net Profit · MTD"
          accent="emerald"
          emptyHint={profit.mtd === 0 && revenue.mtd === 0 ? "No data yet" : undefined}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="leading-none tracking-tight text-white"
                style={{
                  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 36,
                  fontVariantNumeric: "tabular-nums",
                  margin: 0,
                }}
              >
                {formatCurrency(profit.mtd)}
              </p>
              <p
                className="mt-2"
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: profit.marginPct !== null && profit.marginPct >= 0 ? "#10B981" : "rgba(255,255,255,0.35)",
                  margin: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {profit.marginPct !== null ? `${profit.marginPct.toFixed(0)}% margin` : "— margin"}
              </p>
            </div>
            <Sparkline data={profit.daily30} width={120} height={44} color="#10B981" fillOpacity={0.16} />
          </div>
        </MetricCard>

        <MetricCard
          eyebrow="Active Projects"
          accent="amber"
          emptyHint={projects.total === 0 ? "No projects yet · Add one in /projects →" : undefined}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="leading-none tracking-tight text-white"
                style={{
                  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 36,
                  fontVariantNumeric: "tabular-nums",
                  margin: 0,
                }}
              >
                {projects.active}
              </p>
              <p
                className="mt-2"
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: projects.launchingSoon > 0 ? "#F59E0B" : "rgba(255,255,255,0.35)",
                  margin: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {projects.launchingSoon > 0
                  ? `${projects.launchingSoon} launching ≤ 14d`
                  : `${projects.total} total`}
              </p>
            </div>
            {/* Mini funnel */}
            <div className="flex items-end gap-1">
              {PROJECT_PHASES.map((p) => {
                const count = projects.byPhase[p.key];
                const max = Math.max(1, ...Object.values(projects.byPhase));
                const h = 12 + (count / max) * 32;
                const isActive = count > 0;
                return (
                  <div key={p.key} className="flex flex-col items-center gap-1.5" title={`${p.label}: ${count}`}>
                    <div
                      style={{
                        width: 10,
                        height: h,
                        borderRadius: 2,
                        background: isActive ? "#F59E0B" : "rgba(255,255,255,0.06)",
                        opacity: isActive ? 0.85 : 1,
                        boxShadow: isActive ? "0 0 8px rgba(245,158,11,0.25)" : "none",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 8.5,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.30)",
                      }}
                    >
                      {p.label.slice(0, 1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </MetricCard>
      </div>
    </div>
  );
}
