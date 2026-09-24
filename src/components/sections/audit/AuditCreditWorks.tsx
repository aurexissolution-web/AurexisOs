// src/components/sections/audit/AuditCreditWorks.tsx
import { ArrowRight, BadgeCheck, CalendarClock, FileSearch, Layers } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  CREDIT_HEADING,
  CREDIT_PARAGRAPHS,
  AUDIT_ACCENT,
  AUDIT_ACCENT_RGB,
  AUDIT_DEEP_RGB,
} from '@/data/audit-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { AuditSectionLabel } from './AuditSectionLabel';

const accent = (a: number) => `rgba(${AUDIT_ACCENT_RGB},${a})`;

// "IF YOU SIGN A CORE BUILD, WE CREDIT THE AUDIT FEE" -> sentence case
const HEADING =
  CREDIT_HEADING.charAt(0) + CREDIT_HEADING.slice(1).toLowerCase().replace('core', 'Core');
const [lead, rest] = HEADING.split(', ');

const STEPS: { icon: ReactNode; title: string; meta: string; highlight?: boolean }[] = [
  { icon: <FileSearch className="h-5 w-5" />, title: 'Audit delivered', meta: 'Light or Full' },
  { icon: <CalendarClock className="h-5 w-5" />, title: 'Within 60 days', meta: 'You decide' },
  { icon: <Layers className="h-5 w-5" />, title: 'Sign a Core build', meta: 'Starter or above' },
  {
    icon: <BadgeCheck className="h-5 w-5" />,
    title: 'Audit fee credited',
    meta: 'Off the Core setup cost',
    highlight: true,
  },
];

export function AuditCreditWorks() {
  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(40% 50% at 85% 20%, ${accent(0.1)}, transparent 70%), radial-gradient(40% 50% at 5% 90%, rgba(${AUDIT_DEEP_RGB},0.18), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={AUDIT_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <AuditSectionLabel>How The Credit Works</AuditSectionLabel>
        <h2
          className="max-w-3xl font-sans font-extrabold text-white"
          style={{
            fontSize: 'clamp(28px, 3.6vw, 46px)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
          }}
        >
          {lead},{' '}
          <span className="font-serif italic font-normal" style={{ color: AUDIT_ACCENT }}>
            {rest}.
          </span>
        </h2>

        <ol className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
          {STEPS.map((step, i) => (
            <li key={step.title} className="contents">
              {i > 0 && (
                <span aria-hidden className="hidden items-center justify-center lg:flex">
                  <ArrowRight className="h-4 w-4" style={{ color: accent(0.6) }} />
                </span>
              )}
              <div
                className="flex items-center gap-3 rounded-2xl border px-4 py-4"
                style={{
                  borderColor: step.highlight ? accent(0.5) : 'rgba(255,255,255,0.12)',
                  background: step.highlight
                    ? `radial-gradient(80% 90% at 100% 0%, ${accent(0.18)}, transparent 70%), #120E07`
                    : 'rgba(255,255,255,0.025)',
                  boxShadow: step.highlight ? `0 0 34px -10px ${accent(0.5)}` : undefined,
                }}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: accent(step.highlight ? 0.22 : 0.1), color: AUDIT_ACCENT }}
                >
                  {step.icon}
                </span>
                <span>
                  <span className="block text-[14.5px] font-semibold text-white">{step.title}</span>
                  <span className="block font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45">
                    {step.meta}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {CREDIT_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph} className="text-[14.5px] leading-[1.7] text-white/60">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
