// src/components/sections/flow/FlowCompliance.tsx
import type { ReactNode } from 'react';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import {
  COMPLIANCE_INTRO,
  COMPLIANCE_ITEMS,
  COMPLIANCE_FOOTNOTE,
  FLOW_ACCENT,
  FLOW_ACCENT_RGB,
  FLOW_DEEP_RGB,
} from '@/data/flow-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { FlowSectionLabel } from './FlowSectionLabel';

const accent = (a: number) => `rgba(${FLOW_ACCENT_RGB},${a})`;

function Pill({ ok, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
      style={
        ok
          ? { background: accent(0.18), color: FLOW_ACCENT }
          : { background: 'rgba(248,113,113,0.12)', color: 'rgb(252,165,165)' }
      }
    >
      {children}
    </span>
  );
}

function SubmitMock() {
  return (
    <div className="w-full max-w-[250px] rounded-xl border border-white/10 bg-[#070B0A]/90 p-3.5 shadow-2xl">
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[9px] text-white/70">
          INV-2041
        </span>
        <ArrowRight className="h-3.5 w-3.5" style={{ color: accent(0.7) }} />
        <span
          className="rounded-md border px-2 py-1 font-mono text-[9px]"
          style={{ borderColor: accent(0.4), color: FLOW_ACCENT }}
        >
          MyInvois
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        {['Supplier TIN', 'Buyer TIN', 'Line items'].map((k) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-[9.5px] text-white/50">{k}</span>
            <Check className="h-3 w-3" style={{ color: FLOW_ACCENT }} strokeWidth={3} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2.5">
        <span className="text-[9.5px] text-white/70">Status</span>
        <Pill ok>Valid</Pill>
      </div>
    </div>
  );
}

function RejectMock() {
  return (
    <div className="w-full max-w-[250px] space-y-2">
      <div className="flex items-center gap-2.5 rounded-xl border border-red-400/20 bg-[#0D0808]/90 px-3 py-2.5">
        <X className="h-3.5 w-3.5 text-red-300" />
        <span className="text-[10px] text-white/70">Buyer TIN missing</span>
        <span className="ml-auto">
          <Pill>Rejected</Pill>
        </span>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#070B0A]/90 px-3 py-2.5 translate-x-3">
        <RotateCcw className="h-3.5 w-3.5 text-white/55" />
        <span className="text-[10px] text-white/70">Fixed &amp; resubmitted</span>
        <span className="ml-auto font-mono text-[8px] text-white/40">auto</span>
      </div>
      <div
        className="flex items-center gap-2.5 rounded-xl border bg-[#070B0A]/90 px-3 py-2.5"
        style={{ borderColor: accent(0.4), boxShadow: `0 0 26px ${accent(0.14)}` }}
      >
        <Check className="h-3.5 w-3.5" style={{ color: FLOW_ACCENT }} strokeWidth={3} />
        <span className="text-[10px] text-white/80">Validated by LHDN</span>
        <span className="ml-auto">
          <Pill ok>Valid</Pill>
        </span>
      </div>
    </div>
  );
}

function BooksMock() {
  return (
    <div className="flex w-full max-w-[250px] flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-1.5">
        {['Bukku', 'AutoCount', 'SQL'].map((name) => (
          <span
            key={name}
            className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold text-white/85"
            style={{ borderColor: accent(0.35), background: accent(0.07) }}
          >
            {name}
          </span>
        ))}
        <span className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/45">
          + others
        </span>
      </div>
      <span
        className="h-6 w-px"
        style={{ background: `linear-gradient(${accent(0.6)}, transparent)` }}
      />
      <span
        className="rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em]"
        style={{ background: accent(0.16), color: FLOW_ACCENT }}
      >
        MyInvois-ready
      </span>
    </div>
  );
}

// Card titles are short labels; the verbatim COMPLIANCE_ITEMS text sits under each.
const CARDS: { title: string; mock: ReactNode }[] = [
  { title: 'Submitted for you', mock: <SubmitMock /> },
  { title: 'Rejections handled', mock: <RejectMock /> },
  { title: 'Works with your books', mock: <BooksMock /> },
];

export function FlowCompliance() {
  return (
    <section id="compliance" className="relative overflow-hidden bg-[#040A09] px-6 py-12 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(40% 60% at 12% 0%, ${accent(0.16)}, transparent 72%)`,
            `radial-gradient(35% 55% at 95% 40%, rgba(${FLOW_DEEP_RGB},0.3), transparent 72%)`,
            `radial-gradient(55% 60% at 50% 105%, rgba(${FLOW_DEEP_RGB},0.3), transparent 72%)`,
          ].join(', '),
          filter: 'blur(12px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={FLOW_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <FlowSectionLabel>LHDN e-Invoice</FlowSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              e-Invoice compliance,{' '}
              <span className="font-serif italic font-normal" style={{ color: FLOW_ACCENT }}>
                built in.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/65 lg:pb-2">{COMPLIANCE_INTRO}</p>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <li
              key={card.title}
              className="group relative overflow-hidden rounded-3xl border bg-[#050A09]"
              style={{ borderColor: 'rgba(255,255,255,0.14)' }}
            >
              <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-white/[0.06] px-6">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent)',
                  }}
                />
                <div
                  aria-hidden
                  className="relative flex w-full scale-[0.85] justify-center transition-transform duration-500 group-hover:scale-[0.9]"
                >
                  {card.mock}
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-mono text-[11px] tracking-[0.2em]"
                    style={{ color: FLOW_ACCENT }}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="text-[19px] font-bold tracking-[-0.015em] text-white">
                    {card.title}
                  </h3>
                </div>
                <p className="mt-2 text-[14px] leading-[1.6] text-white/60">
                  {COMPLIANCE_ITEMS[i]}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-3xl text-[12.5px] leading-[1.6] text-white/40">
          {COMPLIANCE_FOOTNOTE}
        </p>
      </div>
    </section>
  );
}
