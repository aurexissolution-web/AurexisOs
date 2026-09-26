"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

type Step = {
  number: string;
  label: string;
  duration: string;
  heading: string;
  body: string;
  gets: string[];
  image: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    label: "We talk",
    duration: "about an hour",
    heading: "You tell us what's slowing the business down.",
    body: "We ask questions and look at how you work now. No jargon, no slide deck, no obligation.",
    gets: [
      "A clear picture of what's costing you time",
      "An honest view of whether we can help",
      "No cost, no commitment",
    ],
    image: "/images/how-01.jpg",
  },
  {
    number: "02",
    label: "We show you the plan",
    duration: "a few days",
    heading: "What we'd build, what it costs, how long it takes.",
    body: "A fixed price in writing, with the scope spelled out. If we don't think it's worth doing, we'll tell you.",
    gets: [
      "Fixed price, in writing",
      "Clear scope and timeline",
      "A straight answer either way",
    ],
    image: "/images/how-02.jpg",
  },
  {
    number: "03",
    label: "We build it",
    duration: "two to five weeks",
    heading: "You get updates. We handle the rest.",
    body: "We check in when something needs your decision. Everything is tested before it goes anywhere near your customers.",
    gets: [
      "Regular progress updates",
      "Tested before it goes live",
      "Training for you and your staff",
    ],
    image: "/images/how-03.jpg",
  },
  {
    number: "04",
    label: "We look after it",
    duration: "ongoing",
    heading: "It keeps working after we hand it over.",
    body: "Hosting, backups, small changes, and someone to WhatsApp when something breaks.",
    gets: [
      "Hosting and backups handled",
      "Small changes included",
      "Someone to WhatsApp when you need help",
    ],
    image: "/images/how-04.jpg",
  },
];

const LAST = STEPS.length - 1;
const LINE_MS = 900;
const NODE_STAGGER_MS = 140;

// Matches the tonal treatment used by the problem section's imagery.
const IMAGE_FILTER = "saturate(0.75) hue-rotate(-6deg) brightness(0.94)";

const WHATSAPP_HREF =
  "https://wa.me/60164071129?text=Hi%20Aurexis%20-%20I'd%20like%20to%20talk%20about%20my%20business.";

/** Missing art leaves the recessed well empty rather than showing a broken image. */
function StepVisual({ step }: { step: Step }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="haw-well relative aspect-[4/5] w-full overflow-hidden rounded-2xl lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:max-h-[420px]">
      {!failed && (
        <Image
          src={step.image}
          alt={step.heading}
          width={1300}
          height={1614}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none"
          style={{ filter: IMAGE_FILTER, opacity: loaded ? 1 : 0 }}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--color-background)] to-transparent"
      />
    </div>
  );
}

export function HowAurexisWorks() {
  const reduceMotion = useSafeReducedMotion();
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Scroll-driven reveal. IntersectionObserver only — no scroll listener.
  // Reduced motion skips straight to the finished state.
  useEffect(() => {
    if (reduceMotion) {
      setRevealed(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);

  const onTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
      let target: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") target = (i + 1) % STEPS.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") target = (i - 1 + STEPS.length) % STEPS.length;
      else if (e.key === "Home") target = 0;
      else if (e.key === "End") target = LAST;
      if (target === null) return;
      e.preventDefault();
      setActive(target);
      tabRefs.current[target]?.focus();
    },
    [],
  );

  const step = STEPS[active];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-aurexis-works-heading"
      className="relative overflow-hidden bg-[var(--color-background)] px-6 py-16 md:py-20"
    >
      <style>{`
        .haw-glass {
          background: #131313;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            0 0 60px rgba(94, 227, 218, 0.06),
            inset 0 1px 0 rgba(94, 227, 218, 0.10);
        }
        .haw-well {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
      `}</style>
      <SectionDivider />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-5">
          <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            How We Work
          </span>
          <h2
            id="how-aurexis-works-heading"
            className="mb-3 text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white text-balance md:text-4xl lg:text-[2.75rem]"
          >
            What working with us{" "}
            <em
              className="font-serif font-normal italic text-[var(--color-electric-cyan)]"
              style={{ filter: "drop-shadow(0 0 18px rgba(0,240,255,0.32))" }}
            >
              actually
            </em>{" "}
            looks like.
          </h2>
          <p className="mx-auto max-w-2xl text-[14px] leading-[1.6] text-white/55 text-balance md:text-[15px]">
            Four steps. You do very little. Most projects take three to six weeks.
          </p>
        </div>

        {/* Timeline — horizontal from lg, vertical below */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[7px] hidden h-px bg-white/[0.08] lg:block"
          />
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-[var(--color-electric-cyan)]/60 ease-out motion-reduce:transition-none lg:block"
            style={{
              transform: `scaleX(${revealed ? 1 : 0})`,
              transitionProperty: "transform",
              transitionDuration: `${LINE_MS}ms`,
            }}
          />
          <div
            aria-hidden
            className="absolute bottom-2 left-[7px] top-2 w-px bg-white/[0.08] lg:hidden"
          />
          <div
            aria-hidden
            className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-[var(--color-electric-cyan)]/60 ease-out motion-reduce:transition-none lg:hidden"
            style={{
              transform: `scaleY(${revealed ? 1 : 0})`,
              transitionProperty: "transform",
              transitionDuration: `${LINE_MS}ms`,
            }}
          />

          <ol
            role="tablist"
            aria-label="How we work — four steps"
            className="relative grid gap-y-5 lg:grid-cols-4 lg:gap-y-0"
          >
            {STEPS.map((s, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <li key={s.number}>
                  <button
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`haw-tab-${s.number}`}
                    aria-selected={isActive}
                    aria-controls="haw-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className="group flex w-full items-start gap-3 rounded-md pr-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-background)] lg:flex-col lg:gap-0"
                  >
                    <span className="relative flex h-4 w-4 shrink-0 items-center lg:w-full">
                      <span
                        aria-hidden
                        className={cn(
                          "block h-3.5 w-3.5 rounded-full border bg-[var(--color-background)] ease-out motion-reduce:transition-none",
                          isDone && "border-[var(--color-electric-cyan)] bg-[var(--color-electric-cyan)]",
                          isActive &&
                            "scale-125 border-[var(--color-electric-cyan)] bg-[var(--color-electric-cyan)] ring-4 ring-[var(--color-electric-cyan)]/20",
                          !isDone && !isActive && "border-white/25",
                        )}
                        style={{
                          transitionProperty: "opacity, transform, background-color, border-color",
                          transitionDuration: "300ms",
                          transitionDelay: revealed && !reduceMotion ? `${i * NODE_STAGGER_MS}ms` : "0ms",
                          opacity: revealed ? 1 : 0,
                        }}
                      />
                    </span>

                    <span className="flex flex-col lg:mt-3">
                      <span
                        className={cn(
                          "font-mono text-[10px] tracking-[0.28em] transition-colors duration-300",
                          isActive ? "text-[var(--color-electric-cyan)]/80" : "text-white/35",
                        )}
                      >
                        {s.number}
                      </span>
                      <span
                        className={cn(
                          "mt-1 text-[14px] font-semibold tracking-[-0.01em] transition-colors duration-300 lg:text-[15px]",
                          isActive ? "text-white" : "text-white/45 group-hover:text-white/70",
                        )}
                      >
                        {s.label}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 text-[11px] transition-colors duration-300",
                          isActive ? "text-white/70" : "text-white/30",
                        )}
                      >
                        {s.duration}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Panel */}
        <div className="haw-glass relative mt-8 rounded-[16px] px-6 py-6 lg:mt-4 lg:px-8 lg:py-3">
          {/* Progress affordance */}
          <div
            aria-hidden
            className="relative mb-4 flex items-center gap-3 lg:mb-3"
          >
            <span className="font-mono text-[10px] tracking-[0.28em]">
              <span className="text-[var(--color-electric-cyan)]">{step.number}</span>
              <span className="text-white/30"> / 04</span>
            </span>
            <span className="h-px flex-1 bg-white/[0.08]">
              <span
                className="block h-px origin-left bg-[var(--color-electric-cyan)] transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `scaleX(${(active + 1) / STEPS.length})` }}
              />
            </span>
          </div>

          <div
            id="haw-panel"
            role="tabpanel"
            aria-labelledby={`haw-tab-${step.number}`}
            tabIndex={0}
            aria-live="polite"
            className="relative focus-visible:outline-none"
          >
            <AnimatePresence mode="wait" initial={false}>
              {/* opacity + transform only — animating `filter` here previously
                  left the panel stuck mid-blur when the transition was interrupted. */}
              <motion.div
                key={active}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
                className="grid gap-6 lg:grid-cols-[1.22fr_1fr] lg:gap-10"
              >
                {/* Image is taken out of flow on desktop so the text column
                    alone determines the card height. */}
                <div className="order-1 lg:relative lg:order-2">
                  <StepVisual step={step} />
                </div>

                <div className="order-2 lg:order-1">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
                    Step {step.number} — {step.label} · {step.duration}
                  </span>
                  <h3 className="text-xl font-semibold leading-[1.2] tracking-[-0.01em] text-white lg:text-2xl">
                    {step.heading}
                  </h3>
                  <p className="mt-3 max-w-xl text-[14px] leading-[1.6] text-white/60">
                    {step.body}
                  </p>

                  <span className="mb-2 mt-5 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 lg:mt-3">
                    You get
                  </span>
                  <ul className="flex flex-col gap-2">
                    {step.gets.map((g) => (
                      <li
                        key={g}
                        className="flex items-baseline gap-2.5 text-[13.5px] leading-[1.5] text-white/75"
                      >
                        <span aria-hidden className="select-none text-white/30">
                          ›
                        </span>
                        {g}
                      </li>
                    ))}
                  </ul>

                  <figure className="mt-7 border-t border-white/[0.08] pt-5 lg:mt-4 lg:pt-3">
                    <blockquote className="font-serif text-[15px] italic leading-[1.55] text-white/50">
                      [quote]
                    </blockquote>
                    <figcaption className="mt-2.5 font-mono text-[11px] text-white/35">
                      [attribution]
                    </figcaption>
                  </figure>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Closing */}
        <div className="mt-8 flex flex-col items-center gap-5 text-center lg:mt-4 lg:gap-3">
          <p className="max-w-xl text-[15px] leading-[1.6] text-white/65 text-balance md:text-base">
            No jargon. No surprises on the invoice.{" "}
            <em
              className="font-serif font-normal italic text-[var(--color-electric-cyan)]"
              style={{ filter: "drop-shadow(0 0 14px rgba(0,240,255,0.28))" }}
            >
              Just a system that works.
            </em>
          </p>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[15px] font-semibold text-black transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Tell us what&rsquo;s slowing you down
            <ArrowRight aria-hidden className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
