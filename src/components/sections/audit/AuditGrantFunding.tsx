// src/components/sections/audit/AuditGrantFunding.tsx
import Image from 'next/image';
import { GraduationCap, Info, Landmark } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  GRANT_INTRO,
  GRANTS,
  GRANT_FOOTNOTE,
  AUDIT_ACCENT,
  AUDIT_ACCENT_RGB,
} from '@/data/audit-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { AuditSectionLabel } from './AuditSectionLabel';

const accent = (a: number) => `rgba(${AUDIT_ACCENT_RGB},${a})`;

const GRANT_ICONS: ReactNode[] = [
  <GraduationCap key="hrd" aria-hidden className="h-6 w-6" />,
  <Landmark key="msme" aria-hidden className="h-6 w-6" />,
];

// Pull the headline figure out of each grant description for the big number.
const HEADLINE = (description: string) =>
  description.match(/Up to RM[\d,]+\/day|\d+% matching grant/i)?.[0] ?? null;

export function AuditGrantFunding() {
  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/images/audit/grants-bg.webp"
          alt=""
          fill
          sizes="100vw"
          className="-scale-x-100 object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 20% 12%, rgba(2,4,10,0.8), transparent 75%), linear-gradient(to bottom, rgba(2,4,10,0.74), rgba(2,4,10,0.68) 50%, rgba(2,4,10,0.82))',
          }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={AUDIT_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <AuditSectionLabel>Grant Funding</AuditSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(28px, 3.6vw, 46px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Let a grant{' '}
              <span className="font-serif italic font-normal" style={{ color: AUDIT_ACCENT }}>
                share the cost.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/60 lg:pb-2">{GRANT_INTRO}</p>
        </div>

        <ul className="mt-9 grid gap-4 md:grid-cols-2">
          {GRANTS.map((grant, i) => {
            const headline = HEADLINE(grant.description);
            return (
              <li
                key={grant.name}
                className="relative overflow-hidden rounded-3xl border border-white/[0.16] bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-7"
                style={{
                  backgroundImage: `linear-gradient(140deg, rgba(255,255,255,0.08), transparent 38%), radial-gradient(70% 60% at 100% 0%, ${accent(0.1)}, transparent 70%)`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl border"
                    style={{
                      borderColor: accent(0.4),
                      background: accent(0.12),
                      color: AUDIT_ACCENT,
                    }}
                  >
                    {GRANT_ICONS[i]}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-white/30">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-[22px] font-bold tracking-[-0.015em] text-white">
                  {grant.name}
                </h3>
                {headline && (
                  <p
                    className="mt-2 font-serif text-[30px] italic leading-none"
                    style={{ color: AUDIT_ACCENT }}
                  >
                    {headline}
                  </p>
                )}
                <p className="mt-3 text-[14.5px] leading-[1.65] text-white/65">
                  {grant.description}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 flex items-start gap-2.5 text-[12.5px] leading-[1.6] text-white/45">
          <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" style={{ color: AUDIT_ACCENT }} />
          {GRANT_FOOTNOTE}
        </p>
      </div>
    </section>
  );
}
