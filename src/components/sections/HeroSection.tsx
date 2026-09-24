"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroPoster } from "./HeroPoster";
import { useShaderEligibility } from "@/lib/hooks/use-shader-eligibility";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { CHANNELS } from "@/data/contact-config";

const HeroShader = lazy(() => import("./HeroShader"));

type IdleCallbackHandle = number;
type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

export function HeroSection() {
  const eligible = useShaderEligibility();
  const [shaderReady, setShaderReady] = useState(false);

  useEffect(() => {
    if (!eligible) {
      setShaderReady(false);
      return;
    }

    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(() => setShaderReady(true), { timeout: 1500 });
      return () => w.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(() => setShaderReady(true), 800);
    return () => window.clearTimeout(timer);
  }, [eligible]);

  const reduce = useSafeReducedMotion();

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const, delay: reduce ? 0 : delay },
  });

  const headlineWords =
    "Still running your business on WhatsApp and".split(" ");

  const stagger: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: reduce ? 0 : 0.12 },
    },
  };

  const word: Variants = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HeroPoster />
        {shaderReady && (
          <Suspense fallback={null}>
            <HeroShader />
          </Suspense>
        )}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--color-background)] to-transparent z-[5]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-background)]/60 to-transparent z-[5]" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-28 md:pt-28 md:pb-36">
        <motion.div {...reveal(0.05)}>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--color-electric-cyan)]/15 bg-white/[0.04] backdrop-blur-xl text-sm text-[#cbd5e1] mb-8 transition-all hover:border-[var(--color-electric-cyan)]/35 hover:bg-white/[0.07]"
            style={{ boxShadow: "0 0 28px rgba(0,240,255,0.10), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)" }}
          >
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-electric-cyan)] animate-pulse"
              style={{ boxShadow: "0 0 8px rgba(0,240,255,0.9)" }}
            />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--color-electric-cyan)]">
              Introducing
            </span>
            <span aria-hidden className="text-white/25">·</span>
            <span className="text-white">The Aurexis Ecosystem</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-electric-cyan)] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-[88px] font-extrabold tracking-[-0.03em] leading-[1.05] md:leading-[1.0] text-white max-w-7xl mb-10"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {headlineWords.map((w, i) => (
            <motion.span
              key={i}
              variants={word}
              className="inline-block"
              style={{ marginRight: "0.25em" }}
            >
              {w}
            </motion.span>
          ))}
          <motion.em
            variants={word}
            className="inline-block align-baseline text-[1.02em] bg-gradient-to-r from-[#A0FFFF] via-[var(--color-electric-cyan)] to-[#0080FF] text-transparent bg-clip-text accent-shimmer"
            style={{ fontFamily: "var(--font-instrument-serif)", filter: "drop-shadow(0 0 20px rgba(0,240,255,0.32))" }}
          >
            spreadsheets?
          </motion.em>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-[#94A3B8] max-w-4xl mb-12 leading-relaxed text-pretty"
          {...reveal(0.28)}
        >
          We build the <strong className="text-white font-semibold">website</strong> that
          brings customers in, the{" "}
          <strong className="text-white font-semibold">follow-up</strong> that keeps them
          warm, and the <strong className="text-white font-semibold">system</strong> that
          tracks every job, sale and ringgit — so nothing falls through the cracks again.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          {...reveal(0.4)}
        >
          <Link
            href={CHANNELS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-2.5 rounded-full bg-white text-black text-[15px] font-semibold transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),0_0_24px_rgba(0,240,255,0.15)]"
          >
            WhatsApp us
          </Link>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-[var(--color-electric-cyan)]/20 text-white text-[15px] font-semibold bg-white/[0.03] backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-[var(--color-electric-cyan)]/40"
          >
            Get in touch
            <ArrowRight className="w-4 h-4 text-[var(--color-electric-cyan)] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
