"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";

const BEAM_COUNT = 51;

function buildPath(i: number) {
  const dx = i * 7;
  const dy = i * -8;
  return `M${-380 + dx} ${-189 + dy}C${-380 + dx} ${-189 + dy} ${-312 + dx} ${216 + dy} ${152 + dx} ${343 + dy}C${616 + dx} ${470 + dy} ${684 + dx} ${875 + dy} ${684 + dx} ${875 + dy}`;
}

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt) * 43758.5453;
  return x - Math.floor(x);
}

export const BackgroundBeams = React.memo(function BackgroundBeams({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = useSafeReducedMotion();

  const beams = React.useMemo(
    () =>
      Array.from({ length: BEAM_COUNT }, (_, i) => ({
        d: buildPath(i),
        duration: 10 + seeded(i, 1) * 10,
        delay: seeded(i, 2) * 10,
        y2End: 93 + seeded(i, 3) * 8,
      })),
    []
  );

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      <svg
        className="z-0 h-full w-full absolute"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* radial ambient glow — single static path, very faint */}
        <path
          d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
          stroke="url(#paint0_radial)"
          strokeOpacity="0.06"
          strokeWidth="0.5"
        />

        {beams.map((b, idx) => (
          <motion.path
            key={`path-${idx}`}
            d={b.d}
            stroke={`url(#beam-${idx})`}
            strokeOpacity="0.4"
            strokeWidth="0.5"
          />
        ))}

        <defs>
          {beams.map((b, idx) => (
            <motion.linearGradient
              key={`grad-${idx}`}
              id={`beam-${idx}`}
              initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
              animate={
                reduceMotion
                  ? {
                      x1: "100%",
                      x2: "95%",
                      y1: "100%",
                      y2: `${b.y2End}%`,
                    }
                  : {
                      x1: ["0%", "100%"],
                      x2: ["0%", "95%"],
                      y1: ["0%", "100%"],
                      y2: ["0%", `${b.y2End}%`],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: b.duration,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: b.delay,
                    }
              }
            >
              {/* Cyan-only progression: electric → bright → deep */}
              <stop stopColor="#00F0FF" stopOpacity="0" />
              <stop stopColor="#00F0FF" />
              <stop offset="32.5%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0E7490" stopOpacity="0" />
            </motion.linearGradient>
          ))}

          <radialGradient
            id="paint0_radial"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
          >
            <stop offset="0.067" stopColor="#22D3EE" stopOpacity="0.10" />
            <stop offset="0.243" stopColor="#22D3EE" stopOpacity="0.06" />
            <stop offset="0.436" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
});
