// src/components/sections/flow/FlowAddOns.tsx
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  BellRing,
  Calculator,
  CalendarDays,
  FileSignature,
  FileText,
  GraduationCap,
  Plug,
  Plus,
  ScanText,
  Upload,
  UserPlus,
  Workflow,
} from 'lucide-react';
import { ADD_ONS, ADD_ON_BUNDLE_NOTE, FLOW_ACCENT, FLOW_ACCENT_RGB } from '@/data/flow-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { FlowSectionLabel } from './FlowSectionLabel';

const accent = (a: number) => `rgba(${FLOW_ACCENT_RGB},${a})`;

// ADD_ON_BUNDLE_NOTE reads "Most popular bundle — A + b + c. Tagline."
const [bundleParts, ...taglineParts] = ADD_ON_BUNDLE_NOTE.split(' — ')[1].split('. ');
const BUNDLE_PIECES = bundleParts.split(' + ').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
const BUNDLE_TAGLINE = taglineParts.join('. ');
const PIECE_ICONS = [Workflow, Calculator, BellRing];

const ITEM_ICONS: Record<string, LucideIcon> = {
  'Extra integration': Plug,
  'Accounting sync': Calculator,
  'E-signature integration': FileSignature,
  'Document generation': FileText,
  'HR workflow — leave & claims': CalendarDays,
  'Staff onboarding workflow': UserPlus,
  'OCR / document extraction': ScanText,
  'Notification workflows': BellRing,
  'Data import': Upload,
  'Team training': GraduationCap,
};

export function FlowAddOns() {
  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-14">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/images/flow/addons-bg.webp"
          alt=""
          fill
          sizes="100vw"
          className="-scale-x-100 object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 20% 12%, rgba(2,4,10,0.8), transparent 75%), linear-gradient(to bottom, rgba(2,4,10,0.72), rgba(2,4,10,0.66) 50%, rgba(2,4,10,0.8))',
          }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={FLOW_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <FlowSectionLabel>Add-ons</FlowSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Automate{' '}
              <span className="font-serif italic font-normal" style={{ color: FLOW_ACCENT }}>
                a little more.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/55 lg:pb-2">
            Add to any Flow package. One-off unless stated.
          </p>
        </div>

        <div
          className="relative mt-6 overflow-hidden rounded-3xl border p-5 md:px-7 md:py-5"
          style={{
            borderColor: accent(0.35),
            background: `radial-gradient(70% 120% at 0% 0%, ${accent(0.16)}, transparent 65%), #050B0A`,
          }}
        >
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
            <div>
              <span
                className="inline-block rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ background: accent(0.16), color: FLOW_ACCENT }}
              >
                Most popular bundle
              </span>
              <p className="mt-3 max-w-lg text-[18px] font-semibold leading-[1.35] tracking-[-0.01em] text-white md:text-[20px]">
                {BUNDLE_TAGLINE}
              </p>
            </div>
            <ol className="grid grid-cols-3 gap-2 sm:flex sm:items-stretch md:gap-3">
              {BUNDLE_PIECES.map((piece, i) => {
                const Icon = PIECE_ICONS[i] ?? Workflow;
                return (
                  <li key={piece} className="flex items-center gap-2 md:gap-3">
                    {i > 0 && (
                      <Plus
                        aria-hidden
                        className="hidden h-4 w-4 shrink-0 sm:block"
                        style={{ color: accent(0.7) }}
                      />
                    )}
                    <span
                      className="flex h-full w-full flex-col items-center gap-2 rounded-2xl border bg-[#070C0B] px-2 py-3 text-center sm:w-[118px]"
                      style={{
                        borderColor: i === 0 ? accent(0.5) : 'rgba(255,255,255,0.12)',
                        boxShadow: i === 0 ? `0 0 30px -10px ${accent(0.6)}` : undefined,
                      }}
                    >
                      <span
                        className="grid h-9 w-9 place-items-center rounded-xl"
                        style={{ background: accent(i === 0 ? 0.22 : 0.1), color: FLOW_ACCENT }}
                      >
                        <Icon aria-hidden className="h-[18px] w-[18px]" />
                      </span>
                      <span className="text-[12px] font-semibold leading-snug text-white/85">
                        {piece}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <ul
          className="mt-4 grid overflow-hidden rounded-3xl border border-white/[0.16] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl md:grid-cols-2"
          style={{
            backgroundImage: 'linear-gradient(140deg, rgba(255,255,255,0.08), transparent 38%)',
          }}
        >
          {ADD_ONS.map((item, i) => {
            const Icon = ITEM_ICONS[item.name] ?? Plug;
            return (
              <li
                key={item.name}
                className={`group flex items-start gap-4 border-white/[0.07] sm:items-center px-5 py-3.5 transition-colors hover:bg-white/[0.03] md:px-6 ${
                  i < ADD_ONS.length - 1 ? 'border-b' : ''
                } ${i % 2 === 0 ? 'md:border-r' : ''} ${i >= ADD_ONS.length - 2 ? 'md:border-b-0' : ''}`}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors group-hover:border-white/25"
                  style={{ borderColor: accent(0.22), background: accent(0.07) }}
                >
                  <Icon aria-hidden className="h-[18px] w-[18px]" style={{ color: FLOW_ACCENT }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold text-white">{item.name}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-[1.45] text-white/50">
                    {item.description}
                  </span>
                  <span
                    className="mt-1 block font-serif text-[16px] italic leading-tight sm:hidden"
                    style={{ color: FLOW_ACCENT }}
                  >
                    {item.price}
                  </span>
                </span>
                <span
                  className="hidden shrink-0 text-right font-serif sm:block text-[17px] italic leading-tight"
                  style={{ color: FLOW_ACCENT }}
                >
                  {item.price}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
