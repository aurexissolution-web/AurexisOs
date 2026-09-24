// src/components/sections/work/WorkHero.tsx
import { WORK_ACCENT_RGB } from '@/data/work-config';
import { WorkSectionLabel } from './WorkSectionLabel';

export function WorkHero() {
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
        <WorkSectionLabel>Our Work</WorkSectionLabel>
        <h1
          className="max-w-2xl font-serif italic font-normal text-white"
          style={{ fontSize: 'clamp(32px, 5vw, 58px)', lineHeight: 1.15, letterSpacing: '-0.01em' }}
        >
          Real businesses, real systems.
        </h1>
      </div>
    </section>
  );
}
