// src/components/sections/audit/AuditSectionLabel.tsx
import type { ReactNode } from 'react';
import { AUDIT_ACCENT, AUDIT_ACCENT_RGB } from '@/data/audit-config';

export function AuditSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-2.5">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: AUDIT_ACCENT, boxShadow: `0 0 8px rgba(${AUDIT_ACCENT_RGB},0.7)` }}
      />
      <span
        className="font-mono text-[11px] uppercase tracking-[0.32em]"
        style={{ color: AUDIT_ACCENT }}
      >
        {children}
      </span>
    </div>
  );
}
