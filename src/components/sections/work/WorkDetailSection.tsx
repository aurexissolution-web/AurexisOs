// src/components/sections/work/WorkDetailSection.tsx
import type { ReactNode } from 'react';
import { WorkSectionLabel } from './WorkSectionLabel';

export function WorkDetailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/[0.08] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <WorkSectionLabel>{label}</WorkSectionLabel>
        <p className="max-w-2xl text-[15px] leading-[1.65] text-white/60 md:text-[16px]">
          {children}
        </p>
      </div>
    </section>
  );
}
