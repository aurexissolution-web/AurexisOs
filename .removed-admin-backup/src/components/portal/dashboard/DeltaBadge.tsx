const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface DeltaBadgeProps {
  pct: number | null;
  suffix?: string;
}

export function DeltaBadge({ pct, suffix = "vs prev mo" }: DeltaBadgeProps) {
  if (pct === null) {
    return (
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        — {suffix}
      </span>
    );
  }

  const isUp = pct >= 0;
  const color = isUp ? "#10B981" : "#F87171";
  const arrow = isUp ? "▲" : "▼";
  const abs = Math.abs(pct);

  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span style={{ fontSize: 9 }}>{arrow}</span>
      <span>
        {abs.toFixed(abs < 10 ? 1 : 0)}%
      </span>
      <span style={{ color: "rgba(255,255,255,0.30)" }}>{suffix}</span>
    </span>
  );
}
