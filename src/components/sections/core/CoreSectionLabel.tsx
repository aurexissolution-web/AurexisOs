// src/components/sections/core/CoreSectionLabel.tsx
import type { ReactNode } from 'react';
import { CORE_ACCENT, CORE_ACCENT_RGB } from '@/data/core-config';

export function CoreSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-2.5">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: CORE_ACCENT, boxShadow: `0 0 8px rgba(${CORE_ACCENT_RGB},0.7)` }}
      />
      <span
        className="font-mono text-[11px] uppercase tracking-[0.32em]"
        style={{ color: CORE_ACCENT }}
      >
        {children}
      </span>
    </div>
  );
}
