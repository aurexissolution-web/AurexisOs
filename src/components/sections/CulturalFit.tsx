"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { SectionDivider } from "@/components/ui/section-divider";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface FitItem {
  headline: string;
  body: string;
}

const BUILT_FOR: FitItem[] = [
  {
    headline: "Speed is a strategy.",
    body: "You ship, then refine. You don't wait for perfect specs from a committee — velocity is your competitive weapon.",
  },
  {
    headline: "You want a partner, not a pair of hands.",
    body: "We push back when something won't work, bring strategy to every stage, and don't disappear after delivery.",
  },
  {
    headline: "You're done doing things manually.",
    body: "You want repetitive work automated where it makes sense — not AI bolted on for the sake of it.",
  },
];

const NOT_BUILT_FOR: FitItem[] = [
  {
    headline: "Slow committees and six-month roadmaps.",
    body: "If five rounds of stakeholder review are required before kickoff, we're not the fit. Decision speed is a precondition.",
  },
  {
    headline: "Vendors who take a brief and disappear.",
    body: "If you want a body shop that bills hours and ships exactly the spec — no challenge, no second opinion — we're the wrong call.",
  },
  {
    headline: "Teams who treat AI as a feature.",
    body: "Teams chasing an AI trend with nothing real behind it. If there's no genuine use for it in your business, I won't force it in.",
  },
];

interface ColumnProps {
  label: string;
  items: FitItem[];
  variant: "yes" | "no";
}

function Column({ label, items, variant }: ColumnProps) {
  const isYes = variant === "yes";

  return (
    <div className="relative p-6 sm:p-8 lg:p-10">
      <div className="mb-8 flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{
            borderColor: isYes
              ? "rgba(0,240,255,0.30)"
              : "rgba(248,113,113,0.30)",
            background: isYes
              ? "rgba(0,240,255,0.08)"
              : "rgba(248,113,113,0.06)",
            boxShadow: isYes
              ? "inset 0 0 12px rgba(0,240,255,0.15)"
              : "inset 0 0 12px rgba(248,113,113,0.10)",
          }}
        >
          {isYes ? (
            <Check
              className="h-[18px] w-[18px] text-[var(--color-electric-cyan)]"
              strokeWidth={2}
            />
          ) : (
            <X
              className="h-[18px] w-[18px] text-[#f87171]"
              strokeWidth={2}
            />
          )}
        </span>
        <span
          className="font-mono text-[10.5px] uppercase tracking-[0.42em]"
          style={{
            color: isYes
              ? "var(--color-electric-cyan)"
              : "rgba(248,113,113,0.85)",
          }}
        >
          {label}
        </span>
      </div>

      <ul>
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              delay: 0.1 + i * 0.08,
              ease: easeOut,
            }}
            className={`relative py-6 first:pt-0 last:pb-0 ${
              i > 0 ? "border-t border-white/[0.07]" : ""
            }`}
          >
            <h4
              className={`whitespace-pre-line font-serif text-[22px] italic leading-[1.15] tracking-[-0.01em] md:text-[24px] ${
                isYes ? "text-white" : "text-white/70"
              }`}
            >
              {item.headline}
            </h4>
            <p
              className={`mt-2 max-w-[42ch] text-[13px] leading-[1.6] ${
                isYes ? "text-white/55" : "text-white/40"
              }`}
            >
              {item.body}
            </p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function CulturalFit() {
  return (
    <section className="relative container mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-16">
      <SectionDivider />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="mb-10 lg:mb-14"
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="h-px w-10 bg-[var(--color-electric-cyan)]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-[var(--color-electric-cyan)]">
            The Right Fit
          </p>
        </div>
        <h3 className="text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
          We&apos;re built for
          <br />
          <span className="text-neutral-600">a certain kind of client.</span>
        </h3>
      </motion.div>

      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--color-electric-cyan)]/[0.28] bg-gradient-to-br from-white/[0.045] via-white/[0.015] to-transparent backdrop-blur-sm"
        style={{
          boxShadow:
            "0 0 140px -15px rgba(0,240,255,0.4), 0 40px 80px -40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 60px rgba(0,240,255,0.10)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(0,240,255,0.18), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(248,113,113,0.06), transparent 45%)",
          }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-2">
          <Column label="Built for" items={BUILT_FOR} variant="yes" />
          <div className="border-t border-white/[0.14] lg:border-l lg:border-t-0">
            <Column label="Not built for" items={NOT_BUILT_FOR} variant="no" />
          </div>
        </div>
      </div>
    </section>
  );
}
