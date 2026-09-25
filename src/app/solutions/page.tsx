// src/app/solutions/page.tsx
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroChat } from "@/components/ui/hero-chat";
import { SolutionsServiceRows } from "@/components/sections/SolutionsServiceRows";
import { CHANNELS } from "@/data/contact-config";
import { SERVICES } from "@/data/solutions-services";

function SolutionsLabelPill() {
  return (
    <div
      className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-electric-cyan)]/15 bg-white/[0.04] px-4 py-2 backdrop-blur-xl"
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
        Solutions
      </span>
    </div>
  );
}

export const metadata = {
  title: "Solutions: Websites, Automation & AI | Aurexis Solution",
  description:
    "Five services for Malaysian businesses, priced separately: Presence (websites), Flow (automation), Core (systems), Connect (WhatsApp) and the AI Readiness Audit.",
};

const PICKER_SOLUTIONS = SERVICES.map((s) => ({
  name: s.name,
  priceLabel: [s.pricePrefix, s.priceAmount].filter(Boolean).join(" "),
}));

export default function SolutionsPage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "#02040A", color: "#f5f5f7" }}
    >
      <Navbar />
      <main className="flex-1">
        <HeroChat
          title="Pick the one that"
          accent="hurts most."
          subtitle="Add the others when you're ready."
          placeholder="What do you need fixed?"
          badge={<SolutionsLabelPill />}
          trustLine="Real answers, not a form."
          explainer="Ask about pricing, timelines, or which solution fits — answered live."
          solutions={PICKER_SOLUTIONS}
        />

        <SolutionsServiceRows services={SERVICES} />

        {/* Closing — hairline matches the service rows' own divider color exactly. */}
        <section className="relative overflow-hidden border-t border-white/[0.08] px-6 py-20 lg:py-24">
          {/* Glow — one contained spotlight behind the headline, not a wash across
              the whole section: a deliberate light source, not a haze. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(32% 55% at 22% 48%, rgba(0,240,255,0.32), transparent 68%)",
            }}
          />

          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-electric-cyan)]"
                  style={{ boxShadow: "0 0 8px rgba(0,240,255,0.7)" }}
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--color-electric-cyan)]">
                  Architect With Us
                </span>
              </div>
              <h2
                className="font-serif italic text-white"
                style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 1.15, letterSpacing: "-0.01em" }}
              >
                Tell me what you&apos;re building.
                <br />
                I&apos;ll tell you what it actually needs.
              </h2>
              <p className="mt-5 max-w-xl text-[14px] leading-[1.6] text-white/55 md:text-[15px]">
                A straight conversation about the system you&apos;re trying to ship. No deck, no pitch.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 lg:items-center">
              <a
                href={CHANNELS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-electric-cyan)]/40 bg-[var(--color-electric-cyan)]/[0.04] px-9 py-4 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-[var(--color-electric-cyan)]/70 hover:bg-[var(--color-electric-cyan)]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
              >
                WhatsApp us
              </a>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
                NDA-protected · No obligation
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
