// src/components/sections/insights/InsightsSectionLabel.tsx
import type { ReactNode } from 'react';
import { INSIGHTS_ACCENT, INSIGHTS_ACCENT_RGB } from '@/data/insights-config';

export function InsightsSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-2.5">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: INSIGHTS_ACCENT,
          boxShadow: `0 0 8px rgba(${INSIGHTS_ACCENT_RGB},0.7)`,
        }}
      />
      <span
        className="font-mono text-[11px] uppercase tracking-[0.32em]"
        style={{ color: INSIGHTS_ACCENT }}
      >
        {children}
      </span>
    </div>
  );
}
