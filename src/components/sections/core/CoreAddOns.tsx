// src/components/sections/core/CoreAddOns.tsx
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  ArchiveRestore,
  BarChart3,
  BrainCircuit,
  Building2,
  Calculator,
  DatabaseZap,
  GraduationCap,
  Landmark,
  Layers,
  MessageSquareText,
  Plus,
  Puzzle,
  Sheet,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react';
import {
  ADD_ONS,
  ADD_ONS_INTRO,
  ADD_ON_BUNDLE_NOTE,
  CORE_ACCENT,
  CORE_ACCENT_RGB,
} from '@/data/core-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { CoreSectionLabel } from './CoreSectionLabel';

const accent = (a: number) => `rgba(${CORE_ACCENT_RGB},${a})`;

// ADD_ON_BUNDLE_NOTE.body reads "A + b + c — tagline."
const [bundleParts, bundleTagline] = ADD_ON_BUNDLE_NOTE.body.split(' — ');
const BUNDLE_PIECES = bundleParts.split(' + ').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
const BUNDLE_TAGLINE = bundleTagline.charAt(0).toUpperCase() + bundleTagline.slice(1);
const BUNDLE_LABEL = ADD_ON_BUNDLE_NOTE.heading.replace(/\.$/, '');
const PIECE_ICONS = [Layers, DatabaseZap, Calculator];

const ITEM_ICONS: Record<string, LucideIcon> = {
  'Data migration': DatabaseZap,
  'Data cleaning & deduplication': Sparkles,
  'Spreadsheet-to-app conversion': Sheet,
  'BI dashboard build': BarChart3,
  'PDPA technical documentation': ShieldCheck,
  'Extra module': Puzzle,
  'Accounting integration': Calculator,
  'Marketplace integration': Store,
  'Government portal integration': Landmark,
  'Multi-branch premium': Building2,
  'Mobile companion app': Smartphone,
  'Legacy system extraction': ArchiveRestore,
  'Team training': GraduationCap,
  'AI narrative layer on dashboards': MessageSquareText,
  'Predictive module': TrendingUp,
  'AI advisor reasoning layer': BrainCircuit,
};

export function CoreAddOns() {
  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-14">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/images/core/addons-bg.webp"
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
      <GlowDivider position="bottom" rgb={CORE_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <CoreSectionLabel>Add-ons</CoreSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Extend it{' '}
              <span className="font-serif italic font-normal" style={{ color: CORE_ACCENT }}>
                when you&apos;re ready.
              </span>
            </h2>
          </div>
          <p className="text-[14.5px] leading-[1.6] text-white/55 lg:pb-2">{ADD_ONS_INTRO}</p>
        </div>

        <div
          className="relative mt-6 overflow-hidden rounded-3xl border p-5 md:px-7 md:py-5"
          style={{
            borderColor: accent(0.35),
            background: `radial-gradient(70% 120% at 0% 0%, ${accent(0.16)}, transparent 65%), #070918`,
          }}
        >
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
            <div>
              <span
                className="inline-block rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ background: accent(0.16), color: CORE_ACCENT }}
              >
                {BUNDLE_LABEL}
              </span>
              <p className="mt-3 max-w-lg text-[18px] font-semibold leading-[1.35] tracking-[-0.01em] text-white md:text-[20px]">
                {BUNDLE_TAGLINE}
              </p>
            </div>
            <ol className="grid grid-cols-3 gap-2 sm:flex sm:items-stretch md:gap-3">
              {BUNDLE_PIECES.map((piece, i) => {
                const Icon = PIECE_ICONS[i] ?? Layers;
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
                      className="flex h-full w-full flex-col items-center gap-2 rounded-2xl border bg-[#0A0C1C] px-2 py-3 text-center sm:w-[118px]"
                      style={{
                        borderColor: i === 0 ? accent(0.5) : 'rgba(255,255,255,0.12)',
                        boxShadow: i === 0 ? `0 0 30px -10px ${accent(0.6)}` : undefined,
                      }}
                    >
                      <span
                        className="grid h-9 w-9 place-items-center rounded-xl"
                        style={{ background: accent(i === 0 ? 0.22 : 0.1), color: CORE_ACCENT }}
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
            const Icon = ITEM_ICONS[item.name] ?? Puzzle;
            return (
              <li
                key={item.name}
                className={`group flex items-start gap-4 border-white/[0.07] sm:items-center px-5 py-3 transition-colors hover:bg-white/[0.03] md:px-6 ${
                  i < ADD_ONS.length - 1 ? 'border-b' : ''
                } ${i % 2 === 0 ? 'md:border-r' : ''} ${i >= ADD_ONS.length - 2 ? 'md:border-b-0' : ''}`}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors group-hover:border-white/25"
                  style={{ borderColor: accent(0.22), background: accent(0.07) }}
                >
                  <Icon aria-hidden className="h-[18px] w-[18px]" style={{ color: CORE_ACCENT }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold text-white">{item.name}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-[1.45] text-white/50">
                    {item.description}
                  </span>
                  <span
                    className="mt-1 block font-serif text-[16px] italic leading-tight sm:hidden"
                    style={{ color: CORE_ACCENT }}
                  >
                    {item.price}
                  </span>
                </span>
                <span
                  className="hidden shrink-0 text-right font-serif sm:block text-[17px] italic leading-tight"
                  style={{ color: CORE_ACCENT }}
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
