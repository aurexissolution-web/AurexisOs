// src/components/sections/presence/PresenceWhoFor.tsx
import type { LucideIcon } from 'lucide-react';
import { GraduationCap, Scale, Stethoscope, Wrench } from 'lucide-react';
import { WHO_FOR, PRESENCE_ACCENT, PRESENCE_ACCENT_RGB } from '@/data/presence-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { PresenceSectionLabel } from './PresenceSectionLabel';

const accent = (a: number) => `rgba(${PRESENCE_ACCENT_RGB},${a})`;

// Keyed by WHO_FOR[].type.
const ICONS: Record<string, LucideIcon> = {
  'Clinic or practice': Stethoscope,
  'Law firm or professional service': Scale,
  'Workshop or trade business': Wrench,
  'Training or consultancy': GraduationCap,
};

export function PresenceWhoFor() {
  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(40% 60% at 90% 10%, ${accent(0.08)}, transparent 70%), radial-gradient(40% 60% at 5% 100%, rgba(0,110,140,0.12), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={PRESENCE_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <PresenceSectionLabel>Who This Is Built For</PresenceSectionLabel>
        <h2
          className="font-sans font-extrabold text-white"
          style={{
            fontSize: 'clamp(28px, 3.4vw, 44px)',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
          }}
        >
          Built for businesses{' '}
          <span className="font-serif italic font-normal" style={{ color: PRESENCE_ACCENT }}>
            like yours.
          </span>
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WHO_FOR.map((audience) => {
            const Icon = ICONS[audience.type];
            return (
              <li
                key={audience.type}
                className="rounded-3xl border border-white/[0.14] bg-white/[0.03] p-5"
                style={{
                  backgroundImage:
                    'linear-gradient(140deg, rgba(255,255,255,0.06), transparent 40%)',
                }}
              >
                {Icon && (
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl border"
                    style={{
                      borderColor: accent(0.35),
                      background: accent(0.1),
                      color: PRESENCE_ACCENT,
                    }}
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                )}
                <h3 className="mt-4 text-[16px] font-semibold text-white">{audience.type}</h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.55] text-white/55">{audience.line}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
