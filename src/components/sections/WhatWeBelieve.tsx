"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Principle {
  num: string;
  tag: string;
  title: string;
  body: string;
  /** col-span + row-span class for the bento cell */
  spanClass: string;
  /** Min height for the cell */
  heightClass: string;
  /** Whether the card uses a horizontal text layout (wide footer card) */
  wide?: boolean;
  /** Bigger title scale for hero cells */
  big?: boolean;
  /** Base atmosphere gradient — always visible */
  baseGradient: string;
  /** Hover-only intensifier gradient */
  hoverGradient: string;
}

const PRINCIPLES: Principle[] = [
  {
    num: "01",
    tag: "Purpose",
    title: "Technology should reduce work, not add to it.",
    body:
      "Every system we build has to disappear from your day. If your team has to think about it after launch, we built it wrong.",
    spanClass: "lg:col-span-7 lg:row-start-1",
    heightClass: "min-h-[170px]",
    big: true,
    baseGradient:
      "radial-gradient(circle at 18% 22%, rgba(0,240,255,0.22), transparent 100%), linear-gradient(135deg, rgba(0,71,255,0.13), transparent 100%)",
    hoverGradient:
      "radial-gradient(circle at 18% 22%, rgba(0,240,255,0.30), transparent 100%), linear-gradient(135deg, rgba(0,71,255,0.17), transparent 100%)",
  },
  {
    num: "02",
    tag: "Focus",
    title: "The right system beats the trendy one.",
    body:
      "Every business is different enough that the same stack doesn't fit twice. I build for what the business actually needs, not what's easiest to sell.",
    spanClass: "lg:col-span-5 lg:row-start-1",
    heightClass: "min-h-[170px]",
    baseGradient:
      "radial-gradient(circle at 78% 50%, rgba(0,240,255,0.22), transparent 100%), radial-gradient(circle at 10% 100%, rgba(0,71,255,0.10), transparent 100%)",
    hoverGradient:
      "radial-gradient(circle at 78% 50%, rgba(0,240,255,0.30), transparent 100%), radial-gradient(circle at 10% 100%, rgba(0,71,255,0.15), transparent 100%)",
  },
  {
    num: "03",
    tag: "Architecture",
    title: "Connected systems beat standalone tools. Every time.",
    body:
      "A web app, an AI agent, and a mobile app talking to one another are worth more than three best-in-class products that don't.",
    spanClass: "lg:col-span-5 lg:row-start-2",
    heightClass: "min-h-[170px]",
    baseGradient:
      "radial-gradient(circle at 92% 88%, rgba(0,240,255,0.22), transparent 100%), radial-gradient(circle at 8% 12%, rgba(0,71,255,0.13), transparent 100%)",
    hoverGradient:
      "radial-gradient(circle at 92% 88%, rgba(0,240,255,0.30), transparent 100%), radial-gradient(circle at 8% 12%, rgba(0,71,255,0.17), transparent 100%)",
  },
  {
    num: "04",
    tag: "Context",
    title: "Malaysian context is the advantage, not the limitation.",
    body:
      "Built for how business actually runs here — in ringgit, in the languages customers use, for the tools they already have on their phones.",
    spanClass: "lg:col-span-7 lg:row-start-2",
    heightClass: "min-h-[170px]",
    big: true,
    baseGradient:
      "radial-gradient(circle at 28% 50%, rgba(0,240,255,0.20), transparent 100%), radial-gradient(circle at 72% 28%, rgba(139,92,246,0.11), transparent 100%), radial-gradient(circle at 60% 80%, rgba(0,71,255,0.11), transparent 100%)",
    hoverGradient:
      "radial-gradient(circle at 28% 50%, rgba(0,240,255,0.27), transparent 100%), radial-gradient(circle at 72% 28%, rgba(139,92,246,0.16), transparent 100%), radial-gradient(circle at 60% 80%, rgba(0,71,255,0.15), transparent 100%)",
  },
  {
    num: "05",
    tag: "Tooling",
    title: "AI is a tool. I use it because it works.",
    body:
      "The chili farm dashboard I built uses AI to track pricing trends automatically. Not because AI was the goal — because it was the right tool for that job. If a spreadsheet formula would've done it, I'd have used a spreadsheet formula.",
    spanClass: "lg:col-span-12 lg:row-start-3",
    heightClass: "min-h-[120px]",
    wide: true,
    baseGradient:
      "linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.09) 30%, rgba(0,71,255,0.11) 50%, rgba(0,240,255,0.09) 70%, transparent 100%)",
    hoverGradient:
      "linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.13) 30%, rgba(0,71,255,0.15) 50%, rgba(0,240,255,0.13) 70%, transparent 100%)",
  },
];

export function WhatWeBelieve() {
  const reduceMotion = useSafeReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 22 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.7, ease: easeOut, delay },
        };

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-background)] py-14 md:py-16 lg:py-20">
      <SectionDivider />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[8%] h-[420px] w-[420px] rounded-full opacity-40 blur-[200px]"
        style={{ backgroundColor: "rgba(0,71,255,0.04)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[6%] h-[360px] w-[360px] rounded-full opacity-30 blur-[200px]"
        style={{ backgroundColor: "rgba(0,240,255,0.03)" }}
      />

      <div className="container relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 sm:px-10 lg:px-12">
        <motion.div {...fadeUp()} className="mb-4 flex items-baseline gap-3 lg:mb-1">
          <span
            className="font-serif text-[24px] leading-none text-[var(--color-electric-cyan)]"
            style={{
              fontStyle: "italic",
              filter: "drop-shadow(0 0 14px rgba(0,240,255,0.45))",
            }}
            aria-hidden
          >
            §
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.42em] text-white/55">
            What we believe
          </span>
        </motion.div>

        <motion.h2
          {...fadeUp(0.05)}
          className="mb-8 max-w-3xl text-2xl font-medium leading-[1.15] tracking-[-0.025em] text-white md:text-3xl lg:mb-3 lg:text-[28px]"
        >
          Five things we hold to be{" "}
          <em
            className="bg-gradient-to-r from-[#A0FFFF] via-[var(--color-electric-cyan)] to-[#0080FF] bg-clip-text font-serif font-normal text-transparent"
            style={{ filter: "drop-shadow(0 0 22px rgba(0,240,255,0.30))" }}
          >
            true.
          </em>
        </motion.h2>

        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-2">
          {PRINCIPLES.map((p, i) => (
            <motion.article
              key={p.num}
              {...fadeUp(0.08 + i * 0.08)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 transition-colors duration-500 hover:border-[var(--color-electric-cyan)]/25 md:p-7 lg:h-full lg:rounded-[20px] lg:p-5",
                p.spanClass,
                p.heightClass,
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: p.baseGradient }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: p.hoverGradient }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.03] lg:rounded-[20px]"
              />

              <div
                className={cn(
                  "relative z-10 flex h-full",
                  p.wide
                    ? "flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-10"
                    : "flex-col justify-center",
                )}
              >
                <div className={cn(p.wide && "md:min-w-0 md:max-w-2xl")}>
                  <div className="mb-3 flex items-baseline gap-3 lg:mb-2">
                    <span className="font-mono text-[10px] tracking-[0.32em] text-[var(--color-electric-cyan)]/75">
                      {p.num}
                    </span>
                    <span aria-hidden className="h-px w-5 bg-white/15" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/40">
                      {p.tag}
                    </span>
                  </div>

                  <h3
                    className={cn(
                      "font-medium leading-[1.15] tracking-[-0.02em] text-white",
                      p.big
                        ? "text-xl md:text-2xl lg:text-[24px]"
                        : "text-xl md:text-[22px] lg:text-2xl",
                    )}
                  >
                    {p.title}
                  </h3>
                </div>

                <p
                  className={cn(
                    "text-[13px] leading-[1.55] text-white/55 md:text-[14px]",
                    p.wide
                      ? "min-w-0 max-w-sm md:text-right"
                      : "mt-3 max-w-md",
                  )}
                >
                  {p.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
