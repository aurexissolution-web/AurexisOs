// src/components/sections/core/CoreProblem.tsx
import Image from 'next/image';
import { Check } from 'lucide-react';
import {
  PROBLEM_INTRO,
  WHAT_CORE_FIXES,
  PROBLEM_CALLOUT,
  CORE_ACCENT,
  CORE_ACCENT_RGB,
  CORE_DEEP_RGB,
  CORE_PROBLEM_IMAGE,
} from '@/data/core-config';
import { SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { CoreSectionLabel } from './CoreSectionLabel';

const accent = (a: number) => `rgba(${CORE_ACCENT_RGB},${a})`;
const deep = (a: number) => `rgba(${CORE_DEEP_RGB},${a})`;

// Illustrative subscription bills — shown until CORE_PROBLEM_IMAGE is set.
const SUBSCRIPTIONS = [
  { name: 'Booking app', price: 'RM 90' },
  { name: 'CRM · 12 users', price: 'RM 600' },
  { name: 'Inventory tool', price: 'RM 450' },
  { name: 'Job tracker', price: 'RM 380' },
  { name: 'Reporting add-on', price: 'RM 290' },
];

function SubscriptionStack() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[380px]">
      <div className="rounded-3xl border border-white/10 bg-[#0A0C18]/95 p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Monthly software bills
        </p>
        <ul className="mt-4 space-y-2">
          {SUBSCRIPTIONS.map((sub, i) => (
            <li
              key={sub.name}
              className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5"
              style={{ transform: `translateX(${[0, 8, -6, 10, -4][i]}px)` }}
            >
              <span className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-md bg-white/10" />
                <span className="text-[13px] text-white/75">{sub.name}</span>
              </span>
              <span className="font-mono text-[12px] text-white/60">{sub.price}/mo</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-end justify-between border-t border-white/[0.08] pt-4">
          <span className="text-[12px] text-white/50">None of them talk to each other</span>
          <span className="font-serif text-[26px] italic text-red-300/90">RM 1,810</span>
        </div>
      </div>
      <div
        className="absolute -bottom-4 -right-3 rounded-xl border px-3 py-2 font-mono text-[10px] text-white/70 shadow-2xl"
        style={{ borderColor: accent(0.35), background: '#0C0F20' }}
      >
        Exported to Excel <span style={{ color: CORE_ACCENT }}>again</span>
      </div>
    </div>
  );
}

export function CoreProblem() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.12] bg-[#05060F] px-6">
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
          <CoreSectionLabel>The Problem</CoreSectionLabel>
          <h2
            className="max-w-xl font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(30px, 4vw, 52px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Five subscriptions.{' '}
            <span className="font-serif italic font-normal" style={{ color: CORE_ACCENT }}>
              None of them fit.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/70 md:text-[16px]">
            {PROBLEM_INTRO}
          </p>

          <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/40">
            What Core fixes
          </p>
          <ul className="mt-3 grid gap-2.5">
            {WHAT_CORE_FIXES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[14px] leading-[1.55] text-white/75"
              >
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md"
                  style={{ background: accent(0.14), color: CORE_ACCENT }}
                >
                  <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div
            className="mt-8 max-w-xl rounded-2xl border px-5 py-4"
            style={{
              borderColor: accent(0.3),
              background: `linear-gradient(100deg, ${accent(0.1)}, ${accent(0.02)} 70%)`,
            }}
          >
            <p className="text-[14.5px] font-semibold text-white">{PROBLEM_CALLOUT.heading}</p>
            <p className="mt-1 text-[13.5px] leading-[1.6] text-white/65">{PROBLEM_CALLOUT.body}</p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[400px] lg:ml-auto">
          {CORE_PROBLEM_IMAGE ? (
            <Image
              src={CORE_PROBLEM_IMAGE}
              alt="A business owner juggling several software tools"
              width={928}
              height={1152}
              sizes="(min-width: 1024px) 400px, 90vw"
              className="h-auto w-full rounded-2xl border border-white/[0.12] object-cover shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <SubscriptionStack />
          )}
        </div>
      </div>
    </section>
  );
}
