// src/components/sections/work/WorkDetailHero.tsx
import type { CaseStudy } from '@/types/case-study';
import { WORK_ACCENT_RGB } from '@/data/work-config';
import { WorkSectionLabel } from './WorkSectionLabel';

export function WorkDetailHero({ item }: { item: CaseStudy }) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-16 md:pb-20 md:pt-[88px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(34% 55% at 18% 30%, rgba(${WORK_ACCENT_RGB},0.16), transparent 68%)`,
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <WorkSectionLabel>{item.industry}</WorkSectionLabel>
        <h1
          className="max-w-3xl font-serif italic font-normal text-white"
          style={{
            fontSize: 'clamp(30px, 4.4vw, 54px)',
            lineHeight: 1.16,
            letterSpacing: '-0.01em',
          }}
        >
          {item.outcomeHeadline}
        </h1>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.24em] text-white/40">
          {item.clientName}
        </p>
      </div>
    </section>
  );
}
