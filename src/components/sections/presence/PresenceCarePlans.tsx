// src/components/sections/presence/PresenceCarePlans.tsx
'use client';

import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, Database, Plus } from 'lucide-react';
import {
  CARE_PLAN_GROUPS,
  CARE_PLAN_DB_NOTE,
  PRESENCE_ACCENT,
  PRESENCE_ACCENT_RGB,
} from '@/data/presence-config';
import type { PresenceCarePlanTier } from '@/types/presence';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { PresenceSectionLabel } from './PresenceSectionLabel';

const accent = (a: number) => `rgba(${PRESENCE_ACCENT_RGB},${a})`;

const GLASS =
  'border border-white/[0.14] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl';
const SHEEN = 'linear-gradient(140deg, rgba(255,255,255,0.07), transparent 38%)';

// "RM350/mo" -> ["RM350", "/mo"]; "Quoted" -> ["Quoted", ""]
function splitPrice(price: string): [string, string] {
  const i = price.indexOf('/');
  return i === -1 ? [price, ''] : [price.slice(0, i), price.slice(i)];
}

function TierCard({
  tier,
  level,
  levels,
  index,
}: {
  tier: PresenceCarePlanTier;
  level: number;
  levels: number;
  index: number;
}) {
  const [amount, unit] = splitPrice(tier.price);
  const [first, ...rest] = tier.features;
  const inherits = first?.startsWith('Everything in');
  const features = inherits ? rest : tier.features;
  const top = level === levels;

  return (
    <article
      className={`relative flex animate-presence-pop flex-col overflow-hidden rounded-3xl p-5 motion-reduce:animate-none ${GLASS}`}
      style={{
        animationDelay: `${index * 70}ms`,
        backgroundImage: `${SHEEN}, radial-gradient(90% 60% at 100% 0%, ${accent(0.04 + level * 0.035)}, transparent 70%)`,
        borderColor: top ? accent(0.4) : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[16px] font-semibold text-white">{tier.name}</h3>
        <span className="flex gap-1" aria-label={`Level ${level} of ${levels}`}>
          {Array.from({ length: levels }, (_, i) => (
            <span
              key={i}
              className="h-1.5 w-4 rounded-full"
              style={{ background: i < level ? PRESENCE_ACCENT : 'rgba(255,255,255,0.12)' }}
            />
          ))}
        </span>
      </div>

      <p className="mt-3 flex items-baseline gap-1">
        <span
          className="font-serif text-[34px] italic leading-none"
          style={{ color: PRESENCE_ACCENT }}
        >
          {amount}
        </span>
        {unit && <span className="font-mono text-[11px] text-white/45">{unit}</span>}
      </p>

      <div className="mt-4 border-t border-white/[0.08] pt-4">
        {inherits && (
          <p
            className="mb-3 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
            style={{ background: accent(0.12), color: PRESENCE_ACCENT }}
          >
            <Plus aria-hidden className="h-3 w-3" strokeWidth={2.5} />
            {first}
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-[12.5px] leading-[1.45] text-white/70"
            >
              <Check
                aria-hidden
                className="mt-[2px] h-3.5 w-3.5 shrink-0"
                style={{ color: accent(0.85) }}
                strokeWidth={2.5}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function PresenceCarePlans() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const group = CARE_PLAN_GROUPS[activeIndex];
  const levels = group.tiers.length;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const last = CARE_PLAN_GROUPS.length - 1;
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? last
          : e.key === 'ArrowRight'
            ? (activeIndex + 1) % CARE_PLAN_GROUPS.length
            : (activeIndex - 1 + CARE_PLAN_GROUPS.length) % CARE_PLAN_GROUPS.length;
    setActiveIndex(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(40% 45% at 85% 20%, ${accent(0.1)}, transparent 70%), radial-gradient(40% 50% at 5% 90%, rgba(0,110,140,0.12), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={PRESENCE_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <PresenceSectionLabel>Care Plans</PresenceSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Keep it fast, safe and{' '}
              <span className="font-serif italic font-normal" style={{ color: PRESENCE_ACCENT }}>
                looked after.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/55 lg:pb-1.5">
            A website left unmaintained gets slow, breaks, or gets hacked. A care plan means it
            doesn&apos;t.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Care plan category"
            className="relative grid w-full grid-cols-2 rounded-full border border-white/[0.12] bg-white/[0.03] p-1 sm:w-auto"
          >
            <span
              aria-hidden
              className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full transition-transform duration-300 ease-out"
              style={{
                background: PRESENCE_ACCENT,
                boxShadow: `0 0 24px ${accent(0.35)}`,
                transform: `translateX(${activeIndex * 100}%)`,
                left: 4,
              }}
            />
            {CARE_PLAN_GROUPS.map((g, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={g.label}
                  ref={(el) => {
                    tabsRef.current[i] = el;
                  }}
                  id={`${baseId}-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={onKeyDown}
                  className="relative whitespace-nowrap rounded-full px-2 py-2 font-mono text-[9.5px] uppercase tracking-[0.06em] sm:px-6 sm:text-[11px] sm:tracking-[0.1em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 "
                  style={{
                    color: active ? '#02040A' : 'rgba(255,255,255,0.65)',
                    fontWeight: active ? 700 : 400,
                    ['--tw-ring-color' as string]: accent(0.6),
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
          <p className="text-[13.5px] text-white/50">{group.subtitle}</p>
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeIndex}`}
          key={group.label}
          className={`mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            levels === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          }`}
        >
          {group.tiers.map((tier, i) => (
            <TierCard key={tier.name} tier={tier} level={i + 1} levels={levels} index={i} />
          ))}
        </div>

        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
          {group.footnote}
        </p>

        <div
          className="mt-5 flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:gap-5 md:px-6"
          style={{
            borderColor: accent(0.3),
            background: `linear-gradient(100deg, ${accent(0.1)}, ${accent(0.02)} 60%)`,
          }}
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
            style={{ background: accent(0.16), color: PRESENCE_ACCENT }}
          >
            <Database aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-white">{CARE_PLAN_DB_NOTE.heading}</p>
            <p className="mt-1 text-[13.5px] leading-[1.6] text-white/65">
              {CARE_PLAN_DB_NOTE.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
