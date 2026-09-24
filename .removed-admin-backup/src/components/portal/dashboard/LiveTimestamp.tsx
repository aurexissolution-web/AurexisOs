"use client";

import { useEffect, useState } from "react";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface LiveTimestampProps {
  asOf: string;
}

function formatRelative(ms: number): string {
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kuala_Lumpur",
  });
}

export function LiveTimestamp({ asOf }: LiveTimestampProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const asOfDate = new Date(asOf);
  const now = new Date();
  const ms = Math.max(0, now.getTime() - asOfDate.getTime());

  // tick is used to force re-render on the interval so the relative time updates.
  void tick;

  return (
    <span
      className="inline-flex items-center gap-2.5"
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.40)",
      }}
    >
      <span
        aria-hidden
        className="motion-safe:animate-pulse"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "#10B981",
          boxShadow: "0 0 6px #10B981",
        }}
      />
      <span>Live · {formatClock(now)} MYT · updated {formatRelative(ms)}</span>
    </span>
  );
}
