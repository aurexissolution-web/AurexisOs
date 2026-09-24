"use client";

import { Shield, Rocket, Layers, type LucideIcon } from "lucide-react";
import { SectionDivider } from "@/components/ui/section-divider";

interface Standard {
  Icon: LucideIcon;
  index: string;
  title: string;
  body: string;
  detail: string;
}

const STANDARDS: Standard[] = [
  {
    Icon: Rocket,
    index: "01",
    title: "Speed-to-Market",
    body: 'Short, focused build cycles — typically two to five weeks depending on scope — with no open-ended "development hell."',
    detail: "Typical build: 2–5 weeks",
  },
  {
    Icon: Shield,
    index: "02",
    title: "Privacy-First",
    body: "An NDA and service agreement before any work starts, so your data and ideas stay yours.",
    detail: "NDA issued before kickoff, every project",
  },
  {
    Icon: Layers,
    index: "03",
    title: "Scalability",
    body: "Built on Next.js, Supabase and Vercel — the same infrastructure real production apps run on, so it grows with the business instead of needing a rebuild.",
    detail: "Same stack: Next.js · Supabase · Vercel",
  },
];

// ───── CARD ─────

interface StandardCardProps {
  standard: Standard;
}

function StandardCard({ standard }: StandardCardProps) {
  const { Icon, index, title, body, detail } = standard;

  return (
    <article
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.045] via-white/[0.015] to-transparent p-5 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-[var(--color-electric-cyan)]/40 hover:shadow-[0_28px_56px_-24px_rgba(0,240,255,0.3)] lg:p-6"
      style={{
        boxShadow:
          "0 0 40px -20px rgba(0,240,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(0,240,255,0.09), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(0,113,255,0.06), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-electric-cyan)]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-electric-cyan)]/20 bg-[var(--color-electric-cyan)]/[0.07] transition-colors duration-500 group-hover:border-[var(--color-electric-cyan)]/40 group-hover:bg-[var(--color-electric-cyan)]/[0.12]"
            style={{ boxShadow: "0 0 18px rgba(0,240,255,0.16)" }}
          >
            <Icon
              className="h-4 w-4 text-[var(--color-electric-cyan)]"
              strokeWidth={1.5}
            />
          </div>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.32em] text-white/35">
            N° {index}
          </span>
        </div>

        <h4 className="text-[17px] font-medium tracking-tight text-white lg:text-[18px]">
          {title}
        </h4>
        <p className="mt-1.5 text-[12px] leading-[1.5] text-white/55 lg:text-[12.5px]">
          {body}
        </p>

        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <span className="font-mono text-[9.5px] tracking-[0.08em] text-white/45">
            {detail}
          </span>
        </div>
      </div>
    </article>
  );
}

export function AurexisStandard() {
  return (
    <section className="relative bg-[var(--color-background)] py-12 md:py-16 lg:py-16">
      <SectionDivider />
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-2xl lg:mb-10">
          <div
            className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-electric-cyan)]/15 bg-white/[0.04] px-4 py-2 backdrop-blur-xl"
            style={{
              boxShadow:
                "0 0 28px rgba(0,240,255,0.10), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)",
            }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-electric-cyan)]"
              style={{ boxShadow: "0 0 8px rgba(0,240,255,0.7)" }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--color-electric-cyan)]">
              The Aurexis Standard
            </span>
          </div>
          <h3 className="text-3xl font-medium leading-[1.1] tracking-[-0.025em] text-white md:text-4xl lg:text-5xl">
            How we{" "}
            <em
              className="bg-gradient-to-r from-[#A0FFFF] via-[var(--color-electric-cyan)] to-[#0080FF] bg-clip-text font-serif font-normal text-transparent"
              style={{ filter: "drop-shadow(0 0 20px rgba(0,240,255,0.25))" }}
            >
              operate.
            </em>
          </h3>
          <p className="mt-5 max-w-xl text-[14px] leading-[1.6] text-white/55 md:text-[15px]">
            Three principles that govern every project we ship — speed of
            delivery, secrecy of your IP, scale that compounds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-6">
          {STANDARDS.map((standard) => (
            <StandardCard key={standard.index} standard={standard} />
          ))}
        </div>
      </div>
    </section>
  );
}
