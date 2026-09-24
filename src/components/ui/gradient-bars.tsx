"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GradientBarsProps {
  numBars?: number;
  gradientFrom?: string;
  gradientTo?: string;
  animationDuration?: number;
  className?: string;
  /** Max bar height in 0-100 (% of container). Default 50 — caps edges at half viewport. */
  maxHeight?: number;
  /** Min bar height in 0-100. Default 12 — center bars stay short for headline clearance. */
  minHeight?: number;
  /** Per-bar opacity 0-1. Default 0.7 — atmospheric, not solid. */
  opacity?: number;
}

export function GradientBars({
  numBars = 21,
  gradientFrom = "rgb(0, 240, 255)",
  gradientTo = "transparent",
  animationDuration = 2.4,
  className = "",
  maxHeight = 48,
  minHeight = 10,
  opacity = 0.5,
}: GradientBarsProps) {
  const calculateHeight = (index: number, total: number) => {
    const position = index / (total - 1);
    const center = 0.5;
    const distanceFromCenter = Math.abs(position - center);
    const heightPercentage = Math.pow(distanceFromCenter * 2, 1.2);
    return minHeight + (maxHeight - minHeight) * heightPercentage;
  };

  return (
    <div
      aria-hidden
      className={cn(
        "gradient-bars pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      <style>{`
        @keyframes pulseBar {
          0%   { transform: scaleY(var(--initial-scale)); }
          100% { transform: scaleY(calc(var(--initial-scale) * 0.7)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gradient-bars .gradient-bar { animation: none !important; }
        }
      `}</style>

      <div
        className="flex h-full w-full"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {Array.from({ length: numBars }).map((_, index) => {
          const height = calculateHeight(index, numBars);
          const initialScale = height / 100;
          return (
            <div
              key={index}
              className="gradient-bar"
              style={
                {
                  flex: `1 0 calc(100% / ${numBars})`,
                  maxWidth: `calc(100% / ${numBars})`,
                  height: "100%",
                  background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
                  transform: `scaleY(${initialScale})`,
                  transformOrigin: "bottom",
                  transition: "transform 0.5s ease-in-out",
                  animation: `pulseBar ${animationDuration}s ease-in-out infinite alternate`,
                  animationDelay: `${index * 0.1}s`,
                  outline: "1px solid rgba(0, 0, 0, 0)",
                  boxSizing: "border-box",
                  opacity,
                  "--initial-scale": initialScale,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
