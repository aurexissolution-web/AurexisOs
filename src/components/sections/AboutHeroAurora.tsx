"use client";

import { motion } from "framer-motion";
import { AboutHeroPoster } from "./AboutHeroPoster";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";

export function AboutHeroAurora() {
  const reduceMotion = useSafeReducedMotion();

  const reveal = (delay: number) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, filter: "blur(0px)", y: 0 } }
      : {
          initial: { opacity: 0, filter: "blur(10px)", y: 8 },
          animate: { opacity: 1, filter: "blur(0px)", y: 0 },
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
        };

  return (
    <section className="relative h-svh w-full overflow-hidden bg-[var(--color-background)]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AboutHeroPoster />
        <AuroraBackground />

        <div
          aria-hidden
          className="absolute inset-0 mix-blend-overlay opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at center, transparent 0%, rgba(2,4,10,0.55) 70%, rgba(2,4,10,0.85) 100%)",
          }}
        />

        <div className="pointer-events-none absolute top-6 left-6 h-5 w-5 border-l border-t border-[var(--color-electric-cyan)]/25" />
        <div className="pointer-events-none absolute top-6 right-6 h-5 w-5 border-r border-t border-[var(--color-electric-cyan)]/25" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-5 w-5 border-l border-b border-[var(--color-electric-cyan)]/25" />
        <div className="pointer-events-none absolute bottom-6 right-6 h-5 w-5 border-r border-b border-[var(--color-electric-cyan)]/25" />

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          {...reveal(0)}
          className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-electric-cyan)]/15 bg-white/[0.04] px-4 py-2 backdrop-blur-xl"
          style={{
            boxShadow:
              "0 0 28px rgba(0,240,255,0.10), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[var(--color-electric-cyan)] animate-pulse"
            style={{ boxShadow: "0 0 10px rgba(0,240,255,0.9)" }}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--color-electric-cyan)]">
            The Story
          </span>
        </motion.div>

        <h1 className="mb-10 max-w-none text-3xl font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-[80px] 2xl:text-[100px] min-[1920px]:text-[120px] min-[2560px]:text-[160px]">
          <motion.span {...reveal(0.08)} className="inline-block">
            The
          </motion.span>{" "}
          <motion.span {...reveal(0.16)} className="inline-block">
            work
          </motion.span>{" "}
          <motion.span {...reveal(0.24)} className="inline-block">
            was
          </motion.span>{" "}
          <motion.span {...reveal(0.32)} className="inline-block">
            always
          </motion.span>{" "}
          <motion.span {...reveal(0.4)} className="inline-block">
            going
          </motion.span>{" "}
          <motion.span {...reveal(0.48)} className="inline-block">
            to
          </motion.span>{" "}
          <motion.span {...reveal(0.6)} className="inline-block">
            <em
              className="inline-block font-serif font-normal bg-gradient-to-r from-[#A0FFFF] via-[var(--color-electric-cyan)] to-[#0080FF] bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 28px rgba(0,240,255,0.32))" }}
            >
              outgrow the notebook.
            </em>
          </motion.span>
        </h1>

        <motion.p
          {...reveal(0.75)}
          className="max-w-3xl text-lg leading-relaxed text-[#94A3B8] md:text-xl"
        >
          Aurexis builds the systems Malaysian businesses run on. The first
          one was for a wiring contractor tracking jobs in a notebook —
          quotes in WhatsApp, payments chased from memory. The problem
          repeats everywhere. The work grows; the way of running it
          doesn&apos;t.
        </motion.p>

        <motion.div
          {...reveal(0.95)}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <span aria-hidden className="h-px w-10 bg-white/15" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            Sanjay Gunabalan · Founder · Kuala Lumpur
          </span>
          <span aria-hidden className="h-px w-10 bg-white/15" />
        </motion.div>
      </div>
    </section>
  );
}
