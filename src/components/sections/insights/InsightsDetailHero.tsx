// src/components/sections/insights/InsightsDetailHero.tsx
import type { InsightPost } from '@/types/insights';
import { INSIGHTS_ACCENT_RGB, formatInsightDate } from '@/data/insights-config';
import { InsightsSectionLabel } from './InsightsSectionLabel';

export function InsightsDetailHero({ post }: { post: InsightPost }) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-16 md:pb-20 md:pt-[88px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(34% 55% at 18% 30%, rgba(${INSIGHTS_ACCENT_RGB},0.16), transparent 68%)`,
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <InsightsSectionLabel>{formatInsightDate(post.published_at)}</InsightsSectionLabel>
        <h1
          className="font-serif italic font-normal text-white"
          style={{ fontSize: 'clamp(30px, 4.4vw, 54px)', lineHeight: 1.16, letterSpacing: '-0.01em' }}
        >
          {post.title}
        </h1>
      </div>
    </section>
  );
}
