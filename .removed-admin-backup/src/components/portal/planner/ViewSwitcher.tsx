"use client";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

export type PlannerView = "month" | "week";

interface Props {
  value: PlannerView;
  onChange: (v: PlannerView) => void;
}

export function ViewSwitcher({ value, onChange }: Props) {
  const tabs: { key: PlannerView; label: string }[] = [
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
  ];
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-white/[0.08] p-0.5 bg-white/[0.02]">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className="rounded-[5px] px-3 py-1.5 transition-all"
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: active ? "rgba(0,240,255,0.10)" : "transparent",
              color: active ? "#00F0FF" : "rgba(255,255,255,0.50)",
              border: active ? "1px solid rgba(0,240,255,0.25)" : "1px solid transparent",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
