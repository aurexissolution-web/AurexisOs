"use client";

import Image from "next/image";
import type { ReactNode, SVGProps } from "react";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

const LinkedinIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface VitalRow {
  label: string;
  value: string;
}

interface FounderHalfData {
  index: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  prose: ReactNode;
  signature: string;
  shortName: string;
  role: string;
  caption: string;
  imageSrc?: string;
  imageAlt: string;
  monogram?: string;
  vitals: VitalRow[];
  linkedinUrl?: string;
  instagramUrl?: string;
}

const SANJAY: FounderHalfData = {
  index: "01",
  eyebrow: "From the CEO",
  title: "An",
  titleAccent: "introduction.",
  prose: (
    <>
      I build every system Aurexis ships. The first was for a wiring
      contractor running jobs out of a notebook — and I&rsquo;ve since seen
      the same thing in a law firm, a training company and an auto workshop.
      Different trades, same problem: the business grew, the way of running
      it didn&rsquo;t. Aurexis exists to fix that properly,{" "}
      <em
        className="bg-gradient-to-r from-[#A0FFFF] via-[var(--color-electric-cyan)] to-[#0080FF] bg-clip-text font-serif text-transparent"
        style={{
          fontStyle: "italic",
          filter: "drop-shadow(0 0 18px rgba(0,240,255,0.30))",
        }}
      >
        one connected system
      </em>{" "}
      instead of five that don&rsquo;t talk.
    </>
  ),
  signature: "Sanjay Gunabalan",
  shortName: "Sanjay",
  role: "Founder · CEO · Kuala Lumpur · 2026",
  caption: "Portrait · Malaysia · 2026",
  imageSrc: "/images/cto.jpg",
  imageAlt: "Sanjay Gunabalan, Founder & CEO of Aurexis Solution",
  vitals: [
    { label: "Location", value: "Kuala Lumpur" },
    { label: "Based", value: "Kedah, Malaysia" },
    { label: "Now", value: "Founder · CEO" },
    { label: "Writes about", value: "Business systems · Malaysian SMEs" },
  ],
  linkedinUrl: "#",
  instagramUrl: "#",
};

const NEMILA: FounderHalfData = {
  index: "02",
  eyebrow: "From the COO",
  title: "A",
  titleAccent: "second voice.",
  prose: (
    <>
      I handle the side of Aurexis that isn&rsquo;t code &mdash;{" "}
      <em
        className="bg-gradient-to-r from-[#A0FFFF] via-[var(--color-electric-cyan)] to-[#0080FF] bg-clip-text font-serif text-transparent"
        style={{
          fontStyle: "italic",
          filter: "drop-shadow(0 0 18px rgba(0,240,255,0.30))",
        }}
      >
        operations, marketing
      </em>{" "}
      and the legal and compliance work that comes with running a company
      properly in Malaysia. Sanjay builds the systems; I make sure the
      business behind them holds up. Most small companies get one of those
      right and neglect the other.
    </>
  ),
  signature: "Nemila Raj Selvaraj",
  shortName: "Nemila",
  role: "COO · Kuala Lumpur · 2025",
  caption: "Portrait · Malaysia · 2025",
  imageSrc: "/images/coo.jpg",
  imageAlt: "Nemila Raj Selvaraj, COO of Aurexis Solution",
  vitals: [
    { label: "Location", value: "Kuala Lumpur" },
    { label: "Based", value: "Malaysia" },
    { label: "Now", value: "COO · Operations" },
    { label: "Focus", value: "Operations · Marketing · Legal" },
  ],
};

const easeOut = [0.16, 1, 0.3, 1] as const;

function FounderHalf({ data, side }: { data: FounderHalfData; side: "left" | "right" }) {
  const reduceMotion = useSafeReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.7, ease: easeOut, delay },
        };

  const fadeImage = reduceMotion
    ? { initial: false, animate: { opacity: 1, scale: 1 } }
    : {
        initial: { opacity: 0, scale: 0.985 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 1.05, ease: easeOut },
      };

  const sideClass = side === "left" ? "lg:pr-10 xl:pr-14" : "lg:pl-10 xl:pl-14";

  return (
    <div className={`flex h-full flex-col ${sideClass}`}>
      <motion.div
        {...fadeUp(0.02)}
        className="mb-7 flex items-baseline gap-4 lg:mb-3"
      >
        <span
          className="font-serif text-[32px] leading-none text-white/80 md:text-[38px]"
          style={{ fontStyle: "italic" }}
        >
          {data.index}
        </span>
        <span className="h-px w-8 bg-white/15" />
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">
          {data.eyebrow}
        </span>
      </motion.div>

      <motion.div
        {...fadeImage}
        className="relative aspect-[4/5] w-full max-w-[230px] overflow-hidden rounded-[2px] border border-white/[0.08] bg-[var(--color-deep-void)] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.65)] lg:max-w-[170px]"
      >
        {data.imageSrc ? (
          <Image
            src={data.imageSrc}
            alt={data.imageAlt}
            fill
            className="object-cover object-center"
            style={{ filter: "grayscale(1) contrast(1.05)" }}
            sizes="(max-width: 1024px) 230px, 22vw"
          />
        ) : (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,240,255,0.07) 0%, rgba(167,139,250,0.05) 50%, rgba(2,4,10,1) 100%)",
            }}
            role="img"
            aria-label={data.imageAlt}
          >
            <span
              className="font-serif text-white/30"
              style={{
                fontStyle: "italic",
                fontSize: "180px",
                lineHeight: 1,
                filter: "drop-shadow(0 0 32px rgba(0,240,255,0.20))",
              }}
            >
              {data.monogram}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04]" />
      </motion.div>

      <div className="mt-4 flex items-center gap-3 lg:mt-2">
        <span aria-hidden className="h-px w-6 bg-white/20" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/40">
          {data.caption}
        </span>
      </div>

      <motion.h2
        {...fadeUp(0.06)}
        className="mt-8 mb-5 max-w-md font-serif text-[28px] leading-[1.1] tracking-tight text-white md:text-[32px] lg:mt-4 lg:mb-2 lg:text-[34px]"
        style={{ fontStyle: "italic" }}
      >
        {data.title}{" "}
        <span
          className="bg-gradient-to-r from-[#A0FFFF] via-[var(--color-electric-cyan)] to-[#0080FF] bg-clip-text text-transparent"
          style={{
            filter: "drop-shadow(0 0 22px rgba(0,240,255,0.25))",
          }}
        >
          {data.titleAccent}
        </span>
      </motion.h2>

      <motion.p
        {...fadeUp(0.12)}
        className="max-w-lg font-serif text-[17px] leading-[1.6] text-white/80 md:text-[18px] lg:leading-[1.5]"
        style={{ fontStyle: "italic" }}
      >
        {data.prose}
      </motion.p>

      {/* Signature + vitals move as one unit, pinned to the bottom of the
          (grid-stretched) column, so both founders' name lines land at the
          same height regardless of how many lines their paragraph took. */}
      <div className="flex flex-col lg:mt-auto">
        <motion.div
          {...fadeUp(0.2)}
          className="mt-7 flex items-center gap-4 lg:mt-3"
        >
          <span aria-hidden className="h-px w-10 bg-white/20" />
          <span
            className="font-serif text-xl text-white md:text-[22px]"
            style={{ fontStyle: "italic" }}
          >
            {data.signature}
          </span>
        </motion.div>

        <motion.div
          {...fadeUp(0.28)}
          className="mt-8 border-t border-white/[0.06] pt-6 lg:pt-3"
        >
          <div className="flex flex-col gap-4 lg:gap-3">
            <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              {data.vitals.map((row, i) => (
                <div
                  key={row.label}
                  className={
                    "flex items-baseline gap-2 whitespace-nowrap " +
                    (i > 0 ? "border-l border-white/[0.06] pl-5" : "")
                  }
                >
                  <dt className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/35">
                    {row.label}
                  </dt>
                  <dd className="text-[12px] text-white/70">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex min-h-9 items-center gap-3">
              <span
                className="font-serif text-base text-white/55"
                style={{ fontStyle: "italic" }}
              >
                — {data.shortName}
              </span>
              {data.linkedinUrl && (
                <a
                  href={data.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`LinkedIn — ${data.signature}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/55 transition-colors hover:border-[var(--color-electric-cyan)]/40 hover:bg-white/[0.05] hover:text-[var(--color-electric-cyan)]"
                >
                  <LinkedinIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {data.instagramUrl && (
                <a
                  href={data.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Instagram — ${data.signature}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/55 transition-colors hover:border-[var(--color-electric-cyan)]/40 hover:bg-white/[0.05] hover:text-[var(--color-electric-cyan)]"
                >
                  <InstagramIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function FoundersStory() {
  const reduceMotion = useSafeReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.7, ease: easeOut, delay },
        };

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-background)] py-20 md:py-24">
      <SectionDivider />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full opacity-50 blur-[180px]"
        style={{ backgroundColor: "rgba(0,71,255,0.04)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full opacity-40 blur-[200px]"
        style={{ backgroundColor: "rgba(0,240,255,0.03)" }}
      />

      <div className="container relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 sm:px-10 lg:px-12 xl:px-16">
        <motion.div
          {...fadeUp()}
          className="flex items-center justify-between border-b border-white/[0.06] pb-5 lg:pb-1"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">
            From the Founders
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 md:inline">
            Aurexis Solution · 2026
          </span>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-14 lg:mt-5 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-white/[0.22]">
          <FounderHalf data={SANJAY} side="left" />
          <FounderHalf data={NEMILA} side="right" />
        </div>
      </div>
    </section>
  );
}
