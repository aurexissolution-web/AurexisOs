// src/components/sections/presence/PresenceAddOns.tsx
import Image from 'next/image';
import { Building2, MapPin, PenLine, Plus, ShieldCheck } from 'lucide-react';
import { ADD_ON_BUNDLE_NOTE, PRESENCE_ACCENT, PRESENCE_ACCENT_RGB } from '@/data/presence-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { PresenceSectionLabel } from './PresenceSectionLabel';
import { PresenceAddOnsTabs } from './PresenceAddOnsTabs';

const accent = (a: number) => `rgba(${PRESENCE_ACCENT_RGB},${a})`;

// ADD_ON_BUNDLE_NOTE reads "Most popular bundle — A + b + c + d. Tagline."
const [bundleParts, ...taglineParts] = ADD_ON_BUNDLE_NOTE.split(' — ')[1].split('. ');
const BUNDLE_PIECES = bundleParts.split(' + ').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
const BUNDLE_TAGLINE = taglineParts.join('. ');
const PIECE_ICONS = [Building2, PenLine, MapPin, ShieldCheck];

function BundleBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-5 md:px-7 md:py-5"
      style={{
        borderColor: accent(0.35),
        background: `radial-gradient(70% 120% at 0% 0%, ${accent(0.16)}, transparent 65%), radial-gradient(50% 100% at 100% 100%, rgba(0,110,140,0.18), transparent 70%), #050A10`,
      }}
    >
      <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto] lg:gap-10">
        <div>
          <span
            className="inline-block rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ background: accent(0.16), color: PRESENCE_ACCENT }}
          >
            Most popular bundle
          </span>
          <p className="mt-3 max-w-md text-[19px] font-semibold leading-[1.3] tracking-[-0.01em] text-white md:text-[21px]">
            {BUNDLE_TAGLINE}
          </p>
        </div>

        <ol className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch md:gap-3">
          {BUNDLE_PIECES.map((piece, i) => {
            const Icon = PIECE_ICONS[i] ?? Building2;
            return (
              <li
                key={piece}
                className="flex items-center gap-2 md:gap-3 [&>span:last-child]:self-stretch"
              >
                {i > 0 && (
                  <Plus
                    aria-hidden
                    className="hidden h-4 w-4 shrink-0 sm:block"
                    style={{ color: accent(0.7) }}
                  />
                )}
                <span
                  className="flex h-full w-full flex-col items-center gap-2 rounded-2xl border bg-[#070C13] px-2 py-3 text-center sm:w-[108px] md:w-[118px]"
                  style={{
                    borderColor: i === 0 ? accent(0.5) : 'rgba(255,255,255,0.12)',
                    boxShadow: i === 0 ? `0 0 30px -10px ${accent(0.6)}` : undefined,
                  }}
                >
                  <span
                    className="grid h-9 w-9 place-items-center rounded-xl"
                    style={{ background: accent(i === 0 ? 0.22 : 0.1), color: PRESENCE_ACCENT }}
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
  );
}

export function PresenceAddOns() {
  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-14">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/images/presence/build-bg-soft.webp"
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
      <GlowDivider position="bottom" rgb={PRESENCE_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <PresenceSectionLabel>Add-ons</PresenceSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Bolt on{' '}
              <span className="font-serif italic font-normal" style={{ color: PRESENCE_ACCENT }}>
                what you need.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/55 lg:pb-2">
            Add any of these to any tier. Prices are one-off unless stated.
          </p>
        </div>

        <div className="mt-6">
          <BundleBanner />
        </div>

        <div className="mt-4">
          <PresenceAddOnsTabs />
        </div>
      </div>
    </section>
  );
}
