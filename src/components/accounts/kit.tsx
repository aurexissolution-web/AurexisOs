// Shared building blocks for the /accounts pages, modelled on the Keluarga
// Ledger: big metric cards, section cards with a count pill, period tabs and
// ledger tables with a totals row.
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'in' | 'out' | 'net' | 'neg' | 'plain';

const TONES: Record<Tone, string> = {
  in: 'border-[#5EE3DA]/25 bg-[linear-gradient(160deg,rgba(94,227,218,0.16),rgba(94,227,218,0.03)_60%)] text-[#5EE3DA]',
  out: 'border-white/[0.14] bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015)_60%)] text-white',
  net: 'border-[#8FE3B0]/25 bg-[linear-gradient(160deg,rgba(143,227,176,0.14),rgba(143,227,176,0.02)_60%)] text-[#8FE3B0]',
  neg: 'border-red-400/25 bg-[linear-gradient(160deg,rgba(248,113,113,0.14),rgba(248,113,113,0.02)_60%)] text-red-300',
  plain: 'border-white/[0.12] bg-white/[0.025] text-white',
};

export function MetricCard({
  label,
  value,
  hint,
  tone = 'plain',
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: Tone;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className={cn('h-full rounded-2xl border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]', TONES[tone])}>
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-6 text-[30px] font-extrabold leading-none tracking-[-0.04em] tabular-nums md:text-[34px]">{value}</p>
      {hint && <p className="mt-2.5 text-[12.5px] text-white/45">{hint}</p>}
    </div>
  );
}

export function Section({
  eyebrow,
  title,
  count,
  action,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  count?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.1] px-5 py-4 md:px-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5EE3DA]/80">{eyebrow}</p>
          <h2 className="mt-1 text-[16px] font-semibold tracking-[-0.01em] text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11.5px] font-semibold tabular-nums text-white/70 ring-1 ring-white/10">{count}</span>
          )}
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}

export function PeriodTabs({ current, options }: { current: string; options: { value: string; label: string; href: string }[] }) {
  return (
    <nav aria-label="Period" className="inline-flex flex-wrap gap-1 rounded-xl border border-white/[0.14] bg-white/[0.02] p-1">
      {options.map((o) => (
        <Link
          key={o.value}
          href={o.href}
          aria-current={o.value === current ? 'page' : undefined}
          className={cn(
            'inline-flex h-8 items-center rounded-lg px-3 text-[12.5px] font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/50',
            o.value === current ? 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]' : 'text-white/50 hover:text-white/80',
          )}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}

export function StatusChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/70">
      <span className="h-1.5 w-1.5 rounded-full bg-[#5EE3DA] shadow-[0_0_8px_rgba(94,227,218,0.8)]" />
      {children}
    </span>
  );
}

/** Horizontal bar list: label, amount, and a bar scaled to the largest row. */
export function BarList({ rows, color = '#5EE3DA', empty }: { rows: { name: string; total: number; count?: number; href?: string }[]; color?: string; empty: string }) {
  if (!rows.length) return <p className="px-6 py-10 text-center text-[13px] text-white/45">{empty}</p>;
  const max = rows[0].total || 1;
  return (
    <ul className="space-y-3.5 px-5 py-5 md:px-6">
      {rows.map((r) => {
        const body = (
          <>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate text-white/85">
                {r.name}
                {r.count !== undefined && <span className="ml-2 text-[11.5px] text-white/35">{r.count}×</span>}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-white/80">{rm(r.total)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full" style={{ width: `${Math.max(2, (r.total / max) * 100)}%`, background: color }} />
            </div>
          </>
        );
        return <li key={r.name}>{r.href ? <Link href={r.href} className="block rounded-lg outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/50">{body}</Link> : body}</li>;
      })}
    </ul>
  );
}

/** RM with two decimals only when needed; negatives with a real minus sign. */
export function rm(n: number): string {
  const v = Math.round((Math.abs(n) + Number.EPSILON) * 100) / 100;
  const s = v.toLocaleString('en-MY', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });
  return `${n < 0 ? '−' : ''}RM ${s}`;
}

export const TH = 'px-4 py-3 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-white/40';
export const TD = 'px-4 py-3 text-[13px]';
