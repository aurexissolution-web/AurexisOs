"use client";

import { motion, useSpring } from "framer-motion";
import React, { useEffect } from "react";
import { Check, Star as LucideStar } from "lucide-react";
import { cn } from "@/lib/utils";

// --- INTERACTIVE STARFIELD ---
function seededUnit(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function Star({
  mousePosition,
  containerRef,
  themeColor,
  seed,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement | null>;
  themeColor: string;
  seed: number;
}) {
  const initialPos = React.useMemo(() => ({
    top: `${seededUnit(seed) * 100}%`,
    left: `${seededUnit(seed + 1) * 100}%`,
  }), [seed]);

  const sizePx = 1 + seededUnit(seed + 2) * 2;
  const glowPx = 4 + seededUnit(seed + 3) * 10;
  const twinkleDuration = 2 + seededUnit(seed + 4) * 5;
  const twinkleDelay = seededUnit(seed + 5) * 5;

  const springConfig = { stiffness: 100, damping: 15, mass: 0.1 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);

  useEffect(() => {
    if (!containerRef.current || mousePosition.x === null || mousePosition.y === null) {
      springX.set(0);
      springY.set(0);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const starX = containerRect.left + (parseFloat(initialPos.left) / 100) * containerRect.width;
    const starY = containerRect.top + (parseFloat(initialPos.top) / 100) * containerRect.height;
    const deltaX = mousePosition.x - starX;
    const deltaY = mousePosition.y - starY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const radius = 600;

    if (distance < radius) {
      const force = 1 - distance / radius;
      springX.set(deltaX * force * 0.5);
      springY.set(deltaY * force * 0.5);
    } else {
      springX.set(0);
      springY.set(0);
    }
  }, [mousePosition, initialPos, containerRef, springX, springY]);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        ...initialPos,
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        x: springX,
        y: springY,
        backgroundColor: themeColor,
        boxShadow: `0 0 ${glowPx}px ${themeColor}80`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.6, 0] }}
      transition={{ duration: twinkleDuration, repeat: Infinity, delay: twinkleDelay }}
    />
  );
}

export function InteractiveStarfield({
  mousePosition,
  containerRef,
  themeColor
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement | null>;
  themeColor: string;
}) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
      {Array.from({ length: 60 }).map((_, i) => (
        <Star
          key={`star-${i}`}
          mousePosition={mousePosition}
          containerRef={containerRef}
          themeColor={themeColor}
          seed={i + 1}
        />
      ))}
    </div>
  );
}

// --- PRICING LOGIC ---
export interface InteractivePricingPlan {
  tier: string;
  price: string;
  description: string;
  features: string[];
  isRecommended?: boolean;
}

export function PricingCard({ plan, index, themeColor }: { plan: InteractivePricingPlan; index: number; themeColor: string; }) {
  // Hydration safe match media tracking if desired, simpler to just assume false initially or animate CSS
  // Converting hex to RGB
  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };
  const rgb = themeColor ? hexToRgb(themeColor) : "255,255,255";

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20, delay: index * 0.15 }}
      whileHover={plan.isRecommended ? { y: -5 } : {}}
      className={cn(
        "rounded-[24px] p-8 flex flex-col relative bg-[#050505] backdrop-blur-sm transition-colors duration-300 h-full",
        plan.isRecommended ? "border z-10 scale-100 lg:scale-105" : "border border-white/5"
      )}
      style={{
        borderColor: plan.isRecommended ? themeColor : undefined,
        boxShadow: plan.isRecommended ? `0 0 40px rgba(${rgb}, 0.08), inset 0 0 20px rgba(${rgb}, 0.05)` : "none"
      }}
    >
      {/* Popular Badge */}
      {plan.isRecommended && (
        <div className="absolute top-0 -translate-y-[130%] left-1/2 -translate-x-1/2">
          <div 
            className="py-1.5 px-4 rounded-full flex items-center gap-1.5 border"
            style={{ 
              backgroundColor: `rgba(${rgb}, 0.15)`,
              borderColor: themeColor,
              boxShadow: `0 0 20px rgba(${rgb}, 0.3)`
            }}
          >
            <LucideStar className="h-3 w-3 fill-current" style={{ color: themeColor }} />
            <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: themeColor }}>
              Recommended Phase
            </span>
          </div>
        </div>
      )}

      {/* Plan Header */}
      <div className="flex-1 flex flex-col text-center mt-4">
        <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">{plan.tier}</h3>
        <p className="mt-3 text-sm md:text-[15px] text-neutral-400 font-light leading-relaxed">
          {plan.description}
        </p>

        {/* Pricing String */}
        <div className="mt-8 flex items-end justify-center gap-x-1 border-b border-white/5 pb-8 mb-8">
          <span className="text-4xl md:text-5xl font-medium tracking-tighter text-white">
            {plan.price}
          </span>
        </div>
        
        {/* The requested billing note */}
        <p className="text-[11px] font-mono tracking-widest text-[#9ca3af] uppercase -mt-4 mb-8 bg-white/5 mx-auto px-3 py-1 rounded-full border border-white/10">
          30-30-40 structure
        </p>

        {/* Features list */}
        <ul className="space-y-4 text-sm leading-6 text-left text-neutral-300">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-x-3 items-start">
              <Check className="h-5 w-5 flex-none mt-0.5" style={{ color: themeColor }} aria-hidden="true" />
              <span className="font-light">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <div className="mt-auto pt-10">
          <button
            onClick={() => {
              document.getElementById("conversion-block")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
               "w-full rounded-full py-4 text-sm font-semibold tracking-wide transition-all duration-300 border flex items-center justify-center gap-2",
               plan.isRecommended ? "hover:opacity-90" : "hover:bg-white/5"
            )}
            style={{
              backgroundColor: plan.isRecommended ? themeColor : "transparent",
              color: plan.isRecommended ? "#000" : "#fff",
              borderColor: plan.isRecommended ? "transparent" : "rgba(255,255,255,0.1)",
              boxShadow: plan.isRecommended ? `0 4px 20px rgba(${rgb}, 0.3)` : "none"
            }}
          >
            {plan.isRecommended ? "Begin Architecture" : "Request Scope"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
