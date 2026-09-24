import type { DashboardOverview } from "@/lib/portal/dashboard-data";
import { PROJECT_PHASES } from "@/types/portal";
import { MetricCard } from "./MetricCard";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const PHASE_COLORS: Record<string, string> = {
  audit: "#00F0FF",
  blueprint: "#A78BFA",
  sprint: "#F59E0B",
  launch: "#10B981",
};

interface ProjectFunnelProps {
  data: DashboardOverview["projects"];
}

export function ProjectFunnel({ data }: ProjectFunnelProps) {
  const max = Math.max(1, ...Object.values(data.byPhase));
  const total = data.total;

  return (
    <MetricCard
      eyebrow="Project Funnel · By Phase"
      accent="violet"
      className="lg:col-span-6"
      emptyHint={total === 0 ? "No active projects · Add one in /projects →" : undefined}
    >
      <div className="mt-2 flex flex-1 flex-col gap-3">
        {PROJECT_PHASES.map((phase) => {
          const count = data.byPhase[phase.key];
          const widthPct = (count / max) * 100;
          const color = PHASE_COLORS[phase.key];
          return (
            <div key={phase.key} className="flex items-center gap-4">
              <div className="w-28 shrink-0 flex items-center gap-2.5">
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: count > 0 ? color : "rgba(255,255,255,0.10)",
                    boxShadow: count > 0 ? `0 0 6px ${color}55` : "none",
                  }}
                />
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    margin: 0,
                  }}
                >
                  {phase.label}
                </p>
              </div>
              <div className="relative flex-1">
                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: count > 0 ? `${Math.max(widthPct, 6)}%` : "0%",
                      height: "100%",
                      background: `linear-gradient(to right, ${color}aa, ${color})`,
                      boxShadow: count > 0 ? `0 0 10px ${color}40` : "none",
                      transition: "width 0.6s cubic-bezier(.16,1,.3,1)",
                    }}
                  />
                </div>
              </div>
              <div className="w-12 shrink-0 text-right">
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 22,
                    color: count > 0 ? "white" : "rgba(255,255,255,0.25)",
                    margin: 0,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {count}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-white/[0.06] pt-3">
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.40)",
          }}
        >
          {data.launchingSoon > 0 ? `${data.launchingSoon} launching ≤ 14d` : "All clear"}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: "white",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {total} total
        </span>
      </div>
    </MetricCard>
  );
}
