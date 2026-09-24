"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

type Capability = {
  number: string;
  id: string;
  name: string;
  descriptor: string;
  title: string;
  description: string;
  color: string;
  outcomes: string[];
  examples: string[];
  pricePrefix?: string;
  priceAmount: string;
  whatsappService: string;
};

const capabilities: Capability[] = [
  {
    number: "01",
    id: "presence",
    name: "Presence",
    descriptor: "your website",
    title: "A website that brings customers in.",
    description:
      "Not a brochure nobody reads. Built to get found on Google, explain what you do, and send enquiries straight to your WhatsApp.",
    color: "#00F0FF",
    examples: ["Website", "WhatsApp", "Email", "Social", "Ads"],
    outcomes: [
      "Built to convert, not decorate",
      "Fast on every phone",
      "Enquiries land in WhatsApp",
      "Live in weeks",
    ],
    pricePrefix: "From",
    priceAmount: "RM1,850",
    whatsappService: "Presence (website)",
  },
  {
    number: "02",
    id: "flow",
    name: "Flow",
    descriptor: "admin on autopilot",
    title: "The admin work, done without you.",
    description:
      "Quotes, invoices, reminders and follow-ups that send themselves — whether you remember or not.",
    color: "#1BC9FF",
    examples: ["Follow-ups", "Approvals", "Routing", "Alerts"],
    outcomes: [
      "Quotes and invoices sent automatically",
      "Payment reminders that chase for you",
      "Your tools talk to each other",
      "Hours back every week",
    ],
    pricePrefix: "From",
    priceAmount: "RM2,800",
    whatsappService: "Flow (admin automation)",
  },
  {
    number: "03",
    id: "core",
    name: "Core",
    descriptor: "your operations system",
    title: "Your whole business in one place.",
    description:
      "Jobs, customers, staff pay, what's owed — one system instead of twelve spreadsheets and four group chats.",
    color: "#2E90FF",
    examples: ["CRM", "Projects", "Finance", "Operations"],
    outcomes: [
      "Replaces the spreadsheets",
      "Everything visible at a glance",
      "Built around your work, not a template",
      "Year-end reports for your accountant",
    ],
    pricePrefix: "From",
    priceAmount: "RM1,500 + monthly",
    whatsappService: "Core (operations system)",
  },
  {
    number: "04",
    id: "connect",
    name: "Connect",
    descriptor: "leads and follow-up",
    title: "Every enquiry answered. Every time.",
    description:
      "Captures leads from your website, WhatsApp and Instagram, then follows up automatically — at 11pm, on a public holiday, whenever.",
    color: "#4E68FF",
    examples: ["APIs", "Webhooks", "Sync", "Channels"],
    outcomes: [
      "Every channel in one inbox",
      "Automatic follow-up",
      "Nothing goes cold",
      "You see every conversation",
    ],
    priceAmount: "RM4,500",
    whatsappService: "Connect (leads & follow-up)",
  },
  {
    number: "05",
    id: "ai-readiness-audit",
    name: "AI Readiness Audit",
    descriptor: "start here",
    title: "Find out before you spend on it.",
    description:
      "A short paid diagnostic that maps where AI actually helps in your business — and where it doesn't. Written roadmap, grant-fundable, credited against a Core build if you decide to go ahead.",
    color: "#8B5CF6",
    examples: ["Roadmap", "Grant Screening", "Ranked List", "Recommendation"],
    outcomes: [
      "Ranked list of AI opportunities",
      "Written roadmap you keep",
      "Grant-fundable via HRD Corp",
      "Credited against a Core build",
    ],
    pricePrefix: "From",
    priceAmount: "RM1,500",
    whatsappService: "AI Readiness Audit",
  },
];

const businessOutcomes = ["More leads", "Better efficiency", "Full visibility", "Smarter decisions"];

const tileCls =
  "rounded-md border border-white/20 bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white/90 whitespace-nowrap";

// Decorative, capability-specific "mini interface" shown inside the colour field.
// Recognisable structure over density; animation only on Flow + Connect.
function CapabilityPreview({
  id,
  color,
  reduce,
}: {
  id: string;
  color: string;
  reduce: boolean | null;
}) {
  const dash = reduce ? undefined : { animation: "ecoDash 1s linear infinite" };
  const shimmer = reduce ? undefined : { animation: "ecoShimmer 2s ease-in-out infinite" };

  if (id === "presence") {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-white/12 bg-black/35">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 h-3.5 max-w-[170px] flex-1 rounded bg-white/10" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded" style={{ background: color }} />
              <span className="h-2.5 w-10 rounded bg-white/20" />
              <span className="h-2.5 w-7 rounded bg-white/12" />
              <span className="h-2.5 w-7 rounded bg-white/12" />
            </div>
            <span className="h-5 w-14 rounded-full" style={{ background: color }} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="h-4 w-4/5 rounded bg-white/30" />
            <span className="h-3 w-3/5 rounded bg-white/18" />
            <span className="mt-1 h-8 w-28 rounded-md" style={{ background: color }} />
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-8 flex-1 rounded-md border border-white/15 bg-white/5" />
            <span className="h-8 w-8 rounded-md" style={{ background: color }} />
            <span className="h-8 w-8 rounded-full bg-[#25D366]" />
          </div>
          <div className="hidden gap-2 sm:grid sm:grid-cols-3">
            <span className="h-11 rounded-md bg-white/[0.06]" />
            <span className="h-11 rounded-md bg-white/[0.06]" />
            <span className="h-11 rounded-md bg-white/[0.06]" />
          </div>
        </div>
      </div>
    );
  }

  if (id === "flow") {
    const stages = [
      { label: "Lead", hide: false, active: false },
      { label: "Assigned", hide: true, active: false },
      { label: "Follow-up", hide: false, active: true },
      { label: "Proposal", hide: true, active: false },
      { label: "Won", hide: false, active: false },
    ];
    return (
      <div className="flex h-full flex-col justify-center gap-5 px-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Sales pipeline
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium text-white/85"
            style={{ borderColor: `${color}66` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            Approved
          </span>
        </div>
        <div className="flex items-center">
          {stages.map((s, i) => (
            <div
              key={s.label}
              className={`items-center ${i === 0 ? "flex" : "flex flex-1"} ${
                s.hide ? "hidden sm:flex" : ""
              }`}
            >
              {i > 0 && (
                <span
                  className="mx-1.5 h-[2px] flex-1 rounded"
                  style={{ background: color, ...shimmer }}
                />
              )}
              <span
                className={`shrink-0 rounded-md border px-2.5 py-1.5 text-[11px] font-medium ${
                  s.active ? "text-white" : "text-white/70"
                }`}
                style={
                  s.active
                    ? { borderColor: color, background: `${color}26` }
                    : { borderColor: "rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.28)" }
                }
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/45">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          Notification sent · follow-up due today
        </div>
      </div>
    );
  }

  if (id === "core") {
    return (
      <div className="flex h-full overflow-hidden rounded-lg border border-white/12 bg-black/35">
        <div className="hidden w-9 flex-col items-center gap-3 border-r border-white/10 py-3.5 sm:flex">
          <span className="h-3.5 w-3.5 rounded" style={{ background: color }} />
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3.5">
          <div className="flex items-center justify-between">
            <span className="h-3 w-20 rounded bg-white/25" />
            <span
              className="rounded-md border px-2.5 py-1 text-[12px] font-semibold text-white/90"
              style={{ borderColor: `${color}55` }}
            >
              $42k
            </span>
          </div>
          {[0, 1].map((r) => (
            <div key={r} className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-white/15" />
              <span className="h-2.5 flex-1 rounded bg-white/15" />
              <span
                className="h-5 w-12 rounded-full border"
                style={{ borderColor: `${color}55`, background: `${color}1f` }}
              />
            </div>
          ))}
          <div className="hidden flex-col gap-2.5 sm:flex">
            {[62, 38].map((w, r) => (
              <div key={r} className="flex items-center gap-2.5">
                <span className="h-2 w-12 rounded bg-white/15" />
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${w}%`, background: color }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === "connect") {
    const points = [
      [18, 22],
      [82, 22],
      [14, 50],
      [86, 50],
      [18, 78],
      [82, 78],
    ];
    return (
      <div className="relative h-full">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {points.map(([x, y], i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="#ffffff"
              strokeOpacity="0.32"
              strokeWidth="1"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
              style={dash}
            />
          ))}
        </svg>
        <div className="relative grid h-full grid-cols-3 grid-rows-3 items-center justify-items-center">
          <span className={tileCls}>Website</span>
          <span />
          <span className={tileCls}>WhatsApp</span>
          <span className={tileCls}>Email</span>
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25"
            style={{ background: color }}
          >
            <span className="h-3.5 w-3.5 rounded-full bg-white/95" />
          </span>
          <span className={tileCls}>CRM</span>
          <span className={tileCls}>Project</span>
          <span />
          <span className={tileCls}>Accounting</span>
        </div>
      </div>
    );
  }

  if (id === "ai-readiness-audit") {
    const rows = [
      { label: "Quoting & invoicing", score: 82 },
      { label: "Lead follow-up", score: 61 },
      { label: "Inventory tracking", score: 34 },
    ];
    return (
      <div className="flex h-full flex-col gap-3 rounded-lg border border-white/12 bg-black/35 p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-white/90">AI Readiness Report</span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium text-white/85"
            style={{ borderColor: `${color}55` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            Ranked
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-2.5">
              <span className="w-24 truncate text-[10.5px] text-white/60 sm:w-28">{row.label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${row.score}%`, background: color }}
                />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 rounded-md border border-white/12 bg-black/30 px-3 py-2">
          <span className="text-[11px] text-white/80">Recommendation: start with Core</span>
          <span
            className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold text-black"
            style={{ background: color }}
          >
            Roadmap
          </span>
        </div>
      </div>
    );
  }

  return null;
}

export function TheEcosystem() {
  const reduce = useSafeReducedMotion();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = capabilities[active];

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = capabilities.length;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = (active + 1) % n;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = (active - 1 + n) % n;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      aria-labelledby="eco-heading"
      className="relative overflow-hidden bg-[var(--color-background)] px-6 py-16 md:py-20"
    >
      <style>{`@keyframes ecoDash{to{stroke-dashoffset:-12}}@keyframes ecoShimmer{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <SectionDivider />

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Masthead */}
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reduce ? 0 : 0.5 }}
        >
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            What We Build
          </span>
          <h2
            id="eco-heading"
            className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white text-balance md:text-4xl lg:text-5xl"
          >
            Start with the{" "}
            <em
              className="font-serif font-normal italic text-[var(--color-electric-cyan)]"
              style={{ filter: "drop-shadow(0 0 18px rgba(0,240,255,0.32))" }}
            >
              problem
            </em>{" "}
            holding your business back.
          </h2>
        </motion.div>

        {/* Feature spread */}
        <div className="mt-10 grid gap-8 border-t border-white/[0.08] pt-8 lg:mt-6 lg:grid-cols-[220px_1fr] lg:gap-12 lg:pt-6">
          {/* Index */}
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Aurexis ecosystem capabilities"
            onKeyDown={onTabKeyDown}
            className="flex flex-col"
          >
            {capabilities.map((c, i) => {
              const on = i === active;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={`eco-tab-${c.id}`}
                  aria-selected={on}
                  aria-controls={`eco-panel-${c.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="group relative flex w-full items-start gap-3 border-b border-white/[0.06] py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-background)] lg:py-2.5"
                >
                  <span
                    aria-hidden
                    className={`absolute -left-4 top-1/2 h-5 w-[2px] -translate-y-1/2 transition-opacity duration-300 ${
                      on ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ background: c.color }}
                  />
                  <span
                    className="pt-[1px] font-serif text-[15px] italic tabular-nums transition-colors duration-300"
                    style={{ color: on ? c.color : "rgba(255,255,255,0.3)" }}
                  >
                    {c.number}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span
                      className={`text-[13.5px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                        on ? "text-white" : "text-white/45 group-hover:text-white/75"
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className="text-[11px] font-normal normal-case tracking-normal text-white/40">
                      {c.descriptor}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active feature */}
          <div
            role="tabpanel"
            id={`eco-panel-${current.id}`}
            aria-labelledby={`eco-tab-${current.id}`}
            tabIndex={0}
            className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-background)]"
          >
            <motion.div
              key={current.id}
              className="grid gap-6 lg:grid-cols-[1fr_minmax(300px,0.95fr)] lg:items-stretch lg:gap-6"
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
            >
              {/* Text */}
              <div className="order-2 flex flex-col justify-center lg:order-1">
                <div
                  className="text-[12px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: current.color }}
                >
                  {current.number} <span className="text-white/30">/ 05</span>
                </div>
                <h3 className="mt-2 text-4xl font-extrabold leading-[0.95] tracking-[-0.02em] text-white md:text-6xl lg:mt-1">
                  {current.name}
                </h3>
                <p
                  className="mt-4 font-serif text-xl italic md:text-2xl lg:mt-3"
                  style={{ color: current.color }}
                >
                  {current.title}
                </p>
                <p className="mt-4 max-w-xl text-[15px] leading-[1.7] text-white/60 md:text-[16px] lg:mt-3">
                  {current.description}
                </p>
                <ul className="mt-6 flex max-w-xl flex-wrap gap-x-5 gap-y-2.5 lg:mt-4">
                  {current.outcomes.map((o) => (
                    <li key={o} className="inline-flex items-center gap-2 text-[13px] text-white/70">
                      <span
                        aria-hidden
                        className="h-1 w-1 rounded-full"
                        style={{ background: current.color }}
                      />
                      {o}
                    </li>
                  ))}
                </ul>

                <p
                  className="mt-5 font-serif text-xl md:text-2xl lg:mt-3"
                  style={{ color: "var(--color-electric-cyan)" }}
                >
                  {current.pricePrefix && (
                    <span className="mr-1.5 align-baseline text-[13px] font-sans text-white/40">
                      {current.pricePrefix}
                    </span>
                  )}
                  {current.priceAmount}
                </p>

                <a
                  href={`https://wa.me/60164071129?text=${encodeURIComponent(
                    `Hi Aurexis - I'm interested in ${current.whatsappService}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.03] px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-white/[0.25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:mt-3"
                >
                  WhatsApp us about {current.whatsappService}
                </a>
              </div>

              {/* Colour field */}
              <div
                className="relative order-1 min-h-[280px] overflow-hidden rounded-2xl border border-white/10 sm:min-h-[300px] lg:order-2 lg:min-h-[340px]"
                style={{
                  background: `linear-gradient(152deg, ${current.color} 0%, ${current.color}2e 46%, #06090f 100%)`,
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.14]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0 1px, transparent 1px 22px)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"
                />
                <div className="absolute inset-0 flex flex-col gap-3 p-4 lg:p-5">
                  <span
                    aria-hidden="true"
                    className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80"
                  >
                    {current.name}
                  </span>
                  <ul
                    aria-label={`${current.name} includes`}
                    className="flex max-w-[90%] flex-wrap gap-1.5 sm:gap-2"
                  >
                    {current.examples.slice(0, 4).map((example) => (
                      <li key={example}>
                        <span className="inline-flex rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                          {example}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div aria-hidden="true" className="relative min-h-0 flex-1">
                    <CapabilityPreview id={current.id} color={current.color} reduce={reduce} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Closing */}
        <motion.div
          className="mt-12 flex flex-col gap-6 border-t border-white/[0.08] pt-8 md:flex-row md:items-center md:justify-between lg:mt-6 lg:pt-5"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: reduce ? 0 : 0.5 }}
        >
          <div className="max-w-lg">
            <p className="text-lg font-medium leading-snug text-white/75 md:text-xl">
              Start with one.{" "}
              <em
                className="font-serif font-normal italic text-[var(--color-electric-cyan)]"
                style={{ filter: "drop-shadow(0 0 14px rgba(0,240,255,0.28))" }}
              >
                Most businesses do.
              </em>
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] uppercase tracking-[0.12em] text-white/35">
              {businessOutcomes.map((o, i) => (
                <span key={o} className="inline-flex items-center gap-4">
                  {i > 0 && <span aria-hidden className="text-[var(--color-electric-cyan)]/40">·</span>}
                  {o}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/contact"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-electric-cyan)]/40 bg-[var(--color-electric-cyan)]/[0.04] px-7 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-[var(--color-electric-cyan)]/70 hover:bg-[var(--color-electric-cyan)]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
          >
            Talk to Us
            <ArrowRight className="h-4 w-4 text-[var(--color-electric-cyan)] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
