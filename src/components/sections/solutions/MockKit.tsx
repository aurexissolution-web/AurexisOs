// src/components/sections/solutions/MockKit.tsx
// Building blocks for the mini website mockups on the solutions pages.
// Accent colour comes from the --mock-accent-rgb CSS variable ("r,g,b") set
// on an ancestor, so the same mocks render in each page's own colour.
import type { ReactNode } from 'react';

export function Bar({ w, strong, h = 'h-1.5' }: { w: string; strong?: boolean; h?: string }) {
  return (
    <span
      className={`block rounded-full ${h}`}
      style={{ width: w, background: strong ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)' }}
    />
  );
}

export function Browser({
  url,
  className = '',
  children,
}: {
  url: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-[#070B12] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
        <span className="mx-auto rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[7.5px] text-white/35">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

export function Toast({
  icon,
  children,
  className = '',
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 rounded-xl border bg-[#081017]/95 px-3 py-2 text-[10px] font-medium text-white/85 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.9)] ${className}`}
      style={{ borderColor: 'rgba(var(--mock-accent-rgb),0.35)' }}
    >
      <span
        className="grid h-5 w-5 place-items-center rounded-md"
        style={{
          background: 'rgba(var(--mock-accent-rgb),0.18)',
          color: 'rgb(var(--mock-accent-rgb))',
        }}
      >
        {icon}
      </span>
      {children}
    </div>
  );
}

export const iconSm = 'h-3 w-3';
