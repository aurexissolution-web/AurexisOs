import type { ReactNode } from "react";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface MetricCardProps {
  eyebrow: string;
  children: ReactNode;
  accent?: "cyan" | "violet" | "amber" | "emerald" | "neutral";
  className?: string;
  emptyHint?: string;
}

const ACCENT_HEX = {
  cyan: "#00F0FF",
  violet: "#A78BFA",
  amber: "#F59E0B",
  emerald: "#10B981",
  neutral: "rgba(255,255,255,0.40)",
};

export function MetricCard({ eyebrow, children, accent = "neutral", className = "", emptyHint }: MetricCardProps) {
  const accentColor = ACCENT_HEX[accent];

  return (
    <div
      className={
        "group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-white/[0.06] bg-white/[0.015] p-5 transition-all duration-300 hover:-translate-y-[1px] hover:border-white/[0.18] hover:bg-white/[0.025] " +
        className
      }
    >
      <span
        aria-hidden
        className="absolute inset-x-5 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
        }}
      />
      <p
        style={{
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          margin: 0,
        }}
      >
        {eyebrow}
      </p>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
      {emptyHint && (
        <p
          className="mt-2"
          style={{
            fontFamily: "var(--font-instrument-serif), ui-serif, Georgia, serif",
            fontStyle: "italic",
            fontSize: 12,
            color: "rgba(255,255,255,0.30)",
            margin: 0,
          }}
        >
          {emptyHint}
        </p>
      )}
    </div>
  );
}
