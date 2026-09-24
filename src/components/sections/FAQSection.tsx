"use client";

import { useEffect, useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionDivider } from "@/components/ui/section-divider";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";

type FAQ = {
  id: string;
  q: string;
  a: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const faqs: FAQ[] = [
  {
    id: "cost",
    q: "How much does this cost?",
    a: "Presence, a website that brings customers in, starts from RM1,850. Core, which runs your whole business from one place, starts from RM1,500 plus a monthly fee. The exact number depends on what you need — we'll give you a fixed price before any work starts.",
  },
  {
    id: "timeline",
    q: "How long before it's running?",
    a: "Most builds take two to five weeks from kickoff to launch, depending on scope. You'll get a realistic date once we understand what you're building, not a guess.",
  },
  {
    id: "from-you",
    q: "What do you need from me?",
    a: "A short kickoff call, access to whatever accounts already exist (domain, hosting, socials), and a few decisions only you can make — like what makes your business worth choosing. We handle everything technical.",
  },
  {
    id: "breaks",
    q: "What happens if something breaks after it's live?",
    // PLACEHOLDER — the client will supply this answer directly.
    // Do not invent an SLA, warranty period, response time, or uptime
    // figure here. This is a commitment someone has to honour at 11pm
    // on a Saturday, and it isn't Claude's to make.
    a: "[PLACEHOLDER — add your real answer: what's covered, how fast you respond, what counts as \"broken.\" Do not publish this page until this is replaced.]",
  },
  {
    id: "ownership",
    q: "Do I own what you build?",
    a: "Yes. You get the source code, admin access, and your own accounts from day one — none of it is licensed back to us. If you ever want to move it in-house or hand it to another team, you take everything with you.",
  },
  {
    id: "unsure",
    q: "What if I'm not sure which one I need?",
    a: "That's normal — most people start here. Tell us what's slow or frustrating about running the business right now, and we'll recommend the smallest thing that actually fixes it, not the biggest thing we sell.",
  },
];

function askAurexis() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aurexis:open-chat"));
  }
}

function FAQRow({
  faq,
  idx,
  isOpen,
  onToggle,
  reduce,
  revealDelay,
}: {
  faq: FAQ;
  idx: number;
  isOpen: boolean;
  onToggle: () => void;
  reduce: boolean;
  revealDelay: number;
}) {
  const buttonId = useId();
  const panelId = useId();

  return (
    <motion.div
      className="faqx-row group relative"
      data-open={isOpen}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE, delay: revealDelay }}
    >
      {/* active top hairline */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-electric-cyan)]/70 to-transparent opacity-0 transition-opacity duration-500",
          isOpen && "opacity-100"
        )}
      />
      {/* travelling signal along the bottom hairline */}
      <span aria-hidden className="faqx-signal" />

      <h3 className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className={cn(
            "grid w-full grid-cols-[40px_1fr_44px] items-center gap-4 py-4 text-left transition-colors duration-300 sm:grid-cols-[64px_1fr_48px] sm:gap-6 sm:py-5 lg:grid-cols-[88px_1fr_56px] lg:py-7",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60 focus-visible:ring-inset",
            isOpen && "faqx-row-active"
          )}
        >
          <span
            className={cn(
              "font-mono text-[11px] tracking-[0.2em] tabular-nums transition-colors duration-300 sm:text-[12px]",
              isOpen ? "text-[var(--color-electric-cyan)]" : "text-white/35"
            )}
          >
            {String(idx).padStart(2, "0")}
          </span>
          <span
            className={cn(
              "text-[19px] font-semibold leading-[1.25] tracking-[-0.01em] text-balance transition-colors duration-300 sm:text-[22px] lg:text-[28px] lg:leading-[1.2] xl:text-[30px]",
              isOpen ? "text-white" : "text-white/85 group-hover:text-white"
            )}
          >
            {faq.q}
          </span>
          <span
            aria-hidden
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center justify-self-end rounded-full border transition-all duration-300",
              isOpen
                ? "rotate-45 border-[var(--color-electric-cyan)]/60 text-[var(--color-electric-cyan)]"
                : "border-white/[0.14] text-white/50 group-hover:border-white/30 group-hover:text-white/80"
            )}
          >
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: reduce ? 1 : 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: reduce ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.35, ease: "easeOut", delay: reduce ? 0 : 0.06 }}
              className="relative grid grid-cols-1 gap-3 pb-5 pl-[40px] pr-[44px] sm:pl-[64px] sm:pr-[48px] lg:grid-cols-[88px_1fr] lg:gap-8 lg:pl-0 lg:pr-[56px]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -left-10 top-1/2 -z-10 h-40 w-64 -translate-y-1/2 rounded-full bg-[var(--color-electric-cyan)]/[0.07] blur-3xl"
              />
              <span aria-hidden className="hidden lg:block" />
              <p className="max-w-[68ch] text-[17px] leading-[1.7] text-white/65 sm:text-[18px]">
                {faq.a}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const reduceMotion = useSafeReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(faqs[0].id);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setActiveId(null);
    }
  }, []);

  function toggle(id: string) {
    setActiveId((current) => (current === id ? null : id));
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <section className="relative bg-[var(--color-background)] px-6 py-12 md:py-14">
      <SectionDivider />
      <style>{`
        .faqx-row::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }
        .faqx-signal {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 64px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--color-electric-cyan), transparent);
          opacity: 0;
          pointer-events: none;
          transform: translateX(-64px);
        }
        .faqx-row:hover .faqx-signal,
        .faqx-row:focus-within .faqx-signal,
        .faqx-row[data-open="true"] .faqx-signal {
          animation: faqxSignal 750ms ease-out forwards;
        }
        @keyframes faqxSignal {
          0% { opacity: 1; transform: translateX(-64px); }
          85% { opacity: 1; }
          100% { opacity: 0; transform: translateX(calc(100% - 0px)); }
        }
        .faqx-row-active {
          background: linear-gradient(180deg, rgba(0, 240, 255, 0.05), rgba(0, 240, 255, 0) 60%);
        }
        @media (prefers-reduced-motion: reduce) {
          .faqx-signal { animation: none !important; opacity: 0 !important; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.3fr_1fr] md:items-end md:gap-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
              Frequently Asked
            </span>
            <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] text-balance text-white md:text-4xl lg:text-5xl">
              Clear answers.{" "}
              <em
                className="font-serif italic text-[var(--color-electric-cyan)] font-normal"
                style={{ filter: "drop-shadow(0 0 22px rgba(0,240,255,0.32))" }}
              >
                Better decisions.
              </em>
            </h2>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="md:text-right"
          >
            <p className="text-[15px] leading-[1.6] text-white/55 text-balance md:ml-auto md:max-w-sm">
              Practical answers about scope, delivery, ownership and what it
              is like to work with Aurexis.
            </p>
            <p className="mt-4 text-[13px] text-white/40">
              Can&apos;t find your question?{" "}
              <button
                type="button"
                onClick={askAurexis}
                className="rounded text-[13px] font-semibold text-[var(--color-electric-cyan)]/85 underline-offset-4 transition-colors hover:text-[var(--color-electric-cyan)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60"
              >
                Ask Aurexis →
              </button>
            </p>
          </motion.div>
        </div>

        <motion.div
          aria-hidden
          className="mt-6 h-px w-full origin-left bg-white/10 md:mt-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
        />

        <div>
          {faqs.map((faq, i) => (
            <FAQRow
              key={faq.id}
              faq={faq}
              idx={i + 1}
              isOpen={activeId === faq.id}
              onToggle={() => toggle(faq.id)}
              reduce={reduceMotion}
              revealDelay={reduceMotion ? 0 : 0.25 + i * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
