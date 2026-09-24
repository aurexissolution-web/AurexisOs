// src/components/sections/insights/InsightsClosingCTA.tsx
import { CHANNELS } from '@/data/contact-config';
import { InsightsSectionLabel } from './InsightsSectionLabel';

export function InsightsClosingCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.08] px-6 py-20 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(32% 55% at 22% 48%, rgba(94,227,218,0.28), transparent 68%)',
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-2xl">
          <InsightsSectionLabel>Talk To Us</InsightsSectionLabel>
          <h2
            className="font-serif italic text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.15, letterSpacing: '-0.01em' }}
          >
            Have a system you&apos;re trying to figure out?
          </h2>
          <p className="mt-5 max-w-xl text-[14px] leading-[1.6] text-white/55 md:text-[15px]">
            Tell us what you&apos;re running today. We&apos;ll tell you honestly what it needs.
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
        </div>
      </div>
    </section>
  );
}
