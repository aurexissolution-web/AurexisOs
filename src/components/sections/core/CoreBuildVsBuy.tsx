// src/components/sections/core/CoreBuildVsBuy.tsx
import { Check, Hammer, ShoppingCart } from 'lucide-react';
import {
  BUILD_VS_BUY_INTRO,
  BUILD_HEADING,
  BUILD_REASONS,
  BUY_HEADING,
  BUY_NOTE,
  CORE_ACCENT,
  CORE_ACCENT_RGB,
  CORE_DEEP_RGB,
} from '@/data/core-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { CoreSectionLabel } from './CoreSectionLabel';

const accent = (a: number) => `rgba(${CORE_ACCENT_RGB},${a})`;

// "Consider a Custom Build When..." -> "Consider a custom build when…"
const sentence = (h: string) =>
  h.charAt(0) +
  h
    .slice(1)
    .toLowerCase()
    .replace(/\.\.\.$/, '…');

export function CoreBuildVsBuy() {
  return (
    <section className="relative overflow-hidden bg-[#05060F] px-6 py-12 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(40% 60% at 90% 10%, ${accent(0.16)}, transparent 72%)`,
            `radial-gradient(45% 60% at 10% 100%, rgba(${CORE_DEEP_RGB},0.35), transparent 72%)`,
          ].join(', '),
          filter: 'blur(12px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="top" rgb={CORE_ACCENT_RGB} />
      <GlowDivider position="bottom" rgb={CORE_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <CoreSectionLabel>Build vs Buy</CoreSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Build or buy?{' '}
              <span className="font-serif italic font-normal" style={{ color: CORE_ACCENT }}>
                We&apos;ll tell you honestly.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/60 lg:pb-2">{BUILD_VS_BUY_INTRO}</p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          <article className="relative overflow-hidden rounded-3xl border border-white/[0.14] bg-white/[0.03] p-6 md:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/[0.05] text-white/70">
              <ShoppingCart aria-hidden className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-[21px] font-bold tracking-[-0.015em] text-white">
              {sentence(BUY_HEADING)}
            </h3>
            <p className="mt-3 text-[14.5px] leading-[1.65] text-white/60">{BUY_NOTE}</p>
          </article>

          <article
            className="relative overflow-hidden rounded-3xl border p-6 md:p-7"
            style={{
              borderColor: accent(0.4),
              background: `radial-gradient(80% 70% at 100% 0%, ${accent(0.14)}, transparent 70%), #080B1C`,
            }}
          >
            <span
              className="grid h-11 w-11 place-items-center rounded-xl border"
              style={{ borderColor: accent(0.45), background: accent(0.16), color: CORE_ACCENT }}
            >
              <Hammer aria-hidden className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-[21px] font-bold tracking-[-0.015em] text-white">
              {sentence(BUILD_HEADING)}
            </h3>
            <ul className="mt-4 space-y-3">
              {BUILD_REASONS.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 text-[14.5px] leading-[1.55] text-white/80"
                >
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md"
                    style={{ background: accent(0.18), color: CORE_ACCENT }}
                  >
                    <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div aria-hidden className="mt-6 hidden md:block">
          <div className="relative h-2 rounded-full bg-white/[0.06]">
            <div
              className="absolute inset-y-0 right-0 w-1/2 rounded-full"
              style={{ background: `linear-gradient(90deg, ${accent(0.25)}, ${CORE_ACCENT})` }}
            />
            <span
              className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#05060F]"
              style={{ background: CORE_ACCENT, boxShadow: `0 0 18px ${accent(0.7)}` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            <span>Monthly software spend</span>
            <span className="text-center" style={{ color: CORE_ACCENT }}>
              ~RM5,000/mo
            </span>
            <span className="text-right">Worth considering a build</span>
          </div>
        </div>
      </div>
    </section>
  );
}
