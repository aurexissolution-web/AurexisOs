// src/components/sections/audit/AuditWhyThisExists.tsx
import Image from 'next/image';
import { Check } from 'lucide-react';
import {
  WHY_INTRO,
  WHAT_YOU_GET,
  AUDIT_ACCENT,
  AUDIT_ACCENT_RGB,
  AUDIT_DEEP_RGB,
  AUDIT_PROBLEM_IMAGE,
} from '@/data/audit-config';
import { SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { AuditSectionLabel } from './AuditSectionLabel';

const accent = (a: number) => `rgba(${AUDIT_ACCENT_RGB},${a})`;
const deep = (a: number) => `rgba(${AUDIT_DEEP_RGB},${a})`;

// Illustrative roadmap document — shown until AUDIT_PROBLEM_IMAGE is set.
const ROADMAP = [
  { phase: 'Now', item: 'Draft quotes from past jobs', tag: 'Quick win' },
  { phase: '3 months', item: 'WhatsApp FAQ assistant', tag: 'Connect' },
  { phase: '6 months', item: 'Ops dashboard with AI summaries', tag: 'Core' },
];

function RoadmapDoc() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute inset-0 translate-x-4 -translate-y-4 rotate-3 rounded-2xl border border-white/[0.06] bg-[#15110A]/70" />
      <div className="relative rounded-2xl border border-white/10 bg-[#0F0C07]/95 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/40">
          AI Readiness Roadmap
        </p>
        <p className="mt-2 font-serif text-[24px] italic leading-tight text-white/90">
          Where to start, and what to skip.
        </p>
        <div className="mt-3 space-y-1.5">
          <span className="block h-1.5 w-full rounded-full bg-white/10" />
          <span className="block h-1.5 w-4/5 rounded-full bg-white/10" />
        </div>
        <ol className="mt-5 space-y-3 border-l pl-4" style={{ borderColor: accent(0.35) }}>
          {ROADMAP.map((r) => (
            <li key={r.item} className="relative">
              <span
                className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0F0C07]"
                style={{ background: AUDIT_ACCENT }}
              />
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                {r.phase}
              </span>
              <span className="mt-0.5 flex items-center justify-between gap-2">
                <span className="text-[13px] text-white/85">{r.item}</span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                  style={{ background: accent(0.16), color: AUDIT_ACCENT }}
                >
                  {r.tag}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-3">
          <span className="text-[11px] text-white/45">Grant-eligible</span>
          <span className="font-mono text-[10px]" style={{ color: AUDIT_ACCENT }}>
            HRD Corp · MSME
          </span>
        </div>
      </div>
    </div>
  );
}

export function AuditWhyThisExists() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.12] bg-[#0A0805] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(45% 90% at 72% 0%, ${accent(0.24)}, transparent 72%)`,
            `radial-gradient(38% 70% at 90% 55%, ${deep(0.4)}, transparent 72%)`,
            `radial-gradient(50% 70% at 45% 105%, ${deep(0.4)}, transparent 72%)`,
          ].join(', '),
          filter: 'blur(12px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <AuditSectionLabel>Why This Exists</AuditSectionLabel>
          <h2
            className="max-w-xl font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(30px, 4vw, 52px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Not a scorecard.{' '}
            <span className="font-serif italic font-normal" style={{ color: AUDIT_ACCENT }}>
              The honest middle.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/70 md:text-[16px]">
            {WHY_INTRO}
          </p>

          <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/40">
            What you get
          </p>
          <ul className="mt-3 grid gap-2.5">
            {WHAT_YOU_GET.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[14px] leading-[1.55] text-white/75"
              >
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md"
                  style={{ background: accent(0.14), color: AUDIT_ACCENT }}
                >
                  <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[400px] lg:ml-auto">
          {AUDIT_PROBLEM_IMAGE ? (
            <Image
              src={AUDIT_PROBLEM_IMAGE}
              alt="A business owner reviewing a written AI roadmap"
              width={928}
              height={1152}
              sizes="(min-width: 1024px) 400px, 90vw"
              className="h-auto w-full rounded-2xl border border-white/[0.12] object-cover shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <RoadmapDoc />
          )}
        </div>
      </div>
    </section>
  );
}
