// src/components/sections/work/WorkSectionLabel.tsx
import type { ReactNode } from 'react';
import { WORK_ACCENT, WORK_ACCENT_RGB } from '@/data/work-config';

export function WorkSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-2.5">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: WORK_ACCENT, boxShadow: `0 0 8px rgba(${WORK_ACCENT_RGB},0.7)` }}
      />
      <span
        className="font-mono text-[11px] uppercase tracking-[0.32em]"
        style={{ color: WORK_ACCENT }}
      >
        {children}
      </span>
    </div>
  );
}
