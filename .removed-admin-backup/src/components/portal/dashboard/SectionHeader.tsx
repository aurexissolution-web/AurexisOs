import type { ReactNode } from "react";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

interface SectionHeaderProps {
  index: string;
  label: string;
  accent?: "cyan" | "violet" | "amber";
  right?: ReactNode;
}

const ACCENT_HEX = {
  cyan: "#00F0FF",
  violet: "#A78BFA",
  amber: "#F59E0B",
};

export function SectionHeader({ index, label, accent = "cyan", right }: SectionHeaderProps) {
  const color = ACCENT_HEX[accent];
  return (
    <div className="flex items-end justify-between gap-6 border-b border-white/[0.06] pb-3 mb-6">
      <div className="flex items-baseline gap-4 min-w-0">
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 28,
            lineHeight: 1,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {index}
        </span>
        <span aria-hidden style={{ height: 1, width: 28, background: "rgba(255,255,255,0.15)" }} />
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {label}
        </span>
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
