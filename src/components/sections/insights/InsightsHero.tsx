// src/components/sections/insights/InsightsHero.tsx
import { INSIGHTS_ACCENT_RGB } from '@/data/insights-config';
import { InsightsSectionLabel } from './InsightsSectionLabel';

export function InsightsHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-16 md:pb-20 md:pt-[88px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(34% 55% at 18% 30%, rgba(${INSIGHTS_ACCENT_RGB},0.16), transparent 68%)`,
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <InsightsSectionLabel>Insights</InsightsSectionLabel>
        <h1
          className="max-w-2xl font-serif italic font-normal text-white"
          style={{ fontSize: 'clamp(32px, 5vw, 58px)', lineHeight: 1.15, letterSpacing: '-0.01em' }}
        >
          What we&apos;re learning, building this in public.
        </h1>
      </div>
    </section>
  );
}
