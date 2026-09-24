import type { DashboardOverview } from "@/lib/portal/dashboard-data";
import { formatCurrency } from "@/lib/portal/dashboard-data";
import { MetricCard } from "./MetricCard";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface ExpenseBreakdownProps {
  data: DashboardOverview["expensesByCategory"];
}

export function ExpenseBreakdown({ data }: ExpenseBreakdownProps) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <MetricCard
      eyebrow="Expenses · By Category · MTD"
      accent="amber"
      className="lg:col-span-6"
      emptyHint={total === 0 ? "No expenses logged this month" : undefined}
    >
      <div className="mt-2 flex flex-1 flex-col gap-3">
        {data.map((row) => {
          const widthPct = total > 0 ? (row.amount / max) * 100 : 0;
          const share = total > 0 ? (row.amount / total) * 100 : 0;
          return (
            <div key={row.category} className="flex items-center gap-4">
              <div className="w-32 shrink-0">
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
                  {row.label}
                </p>
              </div>
              <div className="relative flex-1">
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${widthPct}%`,
                      height: "100%",
                      background: "linear-gradient(to right, #F59E0B, #FBBF24)",
                      boxShadow: row.amount > 0 ? "0 0 12px rgba(245,158,11,0.25)" : "none",
                      transition: "width 0.6s cubic-bezier(.16,1,.3,1)",
                    }}
                  />
                </div>
              </div>
              <div className="w-32 shrink-0 text-right">
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: row.amount > 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.30)",
                    margin: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatCurrency(row.amount)}
                </p>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    color: "rgba(255,255,255,0.30)",
                    margin: 0,
                    marginTop: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {share.toFixed(0)}%
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
          Total MTD
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 14,
            color: "white",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatCurrency(total)}
        </span>
      </div>
    </MetricCard>
  );
}
