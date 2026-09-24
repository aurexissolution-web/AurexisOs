// src/components/sections/presence/PresenceSectionLabel.tsx
import type { ReactNode } from 'react';
import { PRESENCE_ACCENT, PRESENCE_ACCENT_RGB } from '@/data/presence-config';

export function PresenceSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-2.5">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: PRESENCE_ACCENT,
          boxShadow: `0 0 8px rgba(${PRESENCE_ACCENT_RGB},0.7)`,
        }}
      />
      <span
        className="font-mono text-[11px] uppercase tracking-[0.32em]"
        style={{ color: PRESENCE_ACCENT }}
      >
        {children}
      </span>
    </div>
  );
}
