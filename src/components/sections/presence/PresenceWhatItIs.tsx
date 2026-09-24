// src/components/sections/presence/PresenceWhatItIs.tsx
import type { ReactNode } from 'react';
import { PRESENCE_ACCENT, PRESENCE_ACCENT_RGB, WEBSITE_TYPES } from '@/data/presence-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { PresenceSectionLabel } from './PresenceSectionLabel';

const accent = (a: number) => `rgba(${PRESENCE_ACCENT_RGB},${a})`;

function Bar({ w, strong }: { w: string; strong?: boolean }) {
  return (
    <span
      className="block h-1.5 rounded-full"
      style={{ width: w, background: strong ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)' }}
    />
  );
}

function WhoMock() {
  return (
    <div className="w-full max-w-[260px] rounded-xl border border-white/10 bg-[#070B12]/90 p-4 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {[0.9, 0.6, 0.35].map((o) => (
            <span
              key={o}
              className="h-8 w-8 rounded-full border-2 border-[#070B12]"
              style={{ background: `linear-gradient(135deg, ${accent(o)}, rgba(0,80,100,${o}))` }}
            />
          ))}
        </div>
        <div className="space-y-1.5">
          <Bar w="72px" strong />
          <Bar w="48px" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Bar w="100%" />
        <Bar w="88%" />
        <Bar w="64%" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['Registered', 'Certified', 'Est. 2011'].map((b) => (
          <span
            key={b}
            className="rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em]"
            style={{ borderColor: accent(0.35), color: PRESENCE_ACCENT, background: accent(0.06) }}
          >
            ✓ {b}
          </span>
        ))}
      </div>
    </div>
  );
}

function WhatMock() {
  return (
    <div className="w-full max-w-[260px] space-y-2">
      {['Consultation', 'Treatments', 'Packages'].map((s, i) => (
        <div
          key={s}
          className="flex items-center gap-3 rounded-xl border bg-[#070B12]/90 px-3.5 py-3 shadow-xl"
          style={{
            borderColor: i === 1 ? accent(0.45) : 'rgba(255,255,255,0.1)',
            transform: i === 1 ? 'translateX(14px)' : undefined,
            boxShadow: i === 1 ? `0 0 30px ${accent(0.18)}` : undefined,
          }}
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-lg font-mono text-[10px]"
            style={{ background: accent(i === 1 ? 0.2 : 0.08), color: PRESENCE_ACCENT }}
          >
            0{i + 1}
          </span>
          <span className="text-[13px] font-semibold text-white/85">{s}</span>
          <span className="ml-auto text-white/40">→</span>
        </div>
      ))}
    </div>
  );
}

function ReachMock() {
  return (
    <div className="w-full max-w-[260px] space-y-2.5">
      <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-white/[0.08] px-3.5 py-2 text-[12px] text-white/80">
        Hi, are you open on Saturday?
      </div>
      <div
        className="w-fit max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2 text-[12px] text-[#02040A]"
        style={{ background: PRESENCE_ACCENT }}
      >
        Yes! 9am – 6pm. Want to book a slot?
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#070B12]/90 px-3 py-2.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: PRESENCE_ACCENT, boxShadow: `0 0 10px ${PRESENCE_ACCENT}` }}
        />
        <span className="text-[11px] text-white/60">Brickfields, Kuala Lumpur</span>
        <span className="ml-auto font-mono text-[10px] text-white/35">Directions</span>
      </div>
    </div>
  );
}

const CARD_STYLE = { borderColor: 'rgba(255,255,255,0.14)' };

const PILLARS: { title: string; line: string; mock: ReactNode }[] = [
  { title: 'Who you are', line: 'Your story, your team, your credentials.', mock: <WhoMock /> },
  {
    title: 'What you do',
    line: 'Your services, explained so anyone can follow.',
    mock: <WhatMock />,
  },
  {
    title: 'How to reach you',
    line: 'Your location, hours, WhatsApp and enquiry form.',
    mock: <ReachMock />,
  },
];

export function PresenceWhatItIs() {
  return (
    <section className="relative overflow-hidden bg-[#04090F] px-6 py-12 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(40% 60% at 12% 0%, ${accent(0.22)}, transparent 72%)`,
            `radial-gradient(35% 55% at 95% 40%, rgba(0,150,170,0.22), transparent 72%)`,
            `radial-gradient(55% 60% at 50% 105%, rgba(0,110,130,0.25), transparent 72%)`,
            `radial-gradient(30% 40% at 50% 55%, ${accent(0.06)}, transparent 70%)`,
          ].join(', '),
          filter: 'blur(12px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />

      <GlowDivider position="top" rgb={PRESENCE_ACCENT_RGB} />
      <GlowDivider position="bottom" rgb={PRESENCE_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <PresenceSectionLabel>What Presence Actually Is</PresenceSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              A business website,{' '}
              <span className="font-serif italic font-normal" style={{ color: PRESENCE_ACCENT }}>
                built and written
              </span>{' '}
              for you.
            </h2>
          </div>
          <p className="text-[16px] leading-[1.6] text-white/65 lg:pb-2">
            Not a template you fill in yourself. Just the three things a customer needs to trust
            that you&apos;re real.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <li
              key={p.title}
              className="group relative overflow-hidden rounded-3xl border bg-[#050A10] transition-shadow duration-300"
              style={CARD_STYLE}
            >
              <div
                className="relative flex h-40 items-center justify-center overflow-hidden border-b border-white/[0.06] px-6 transition-transform duration-500 group-hover:scale-[1.03]"
                style={{
                  background: `radial-gradient(70% 80% at 50% 100%, ${accent(0.16)}, transparent 70%)`,
                  backgroundColor: 'rgba(255,255,255,0.01)',
                }}
              >
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
                <div aria-hidden className="relative flex w-full scale-[0.72] justify-center">
                  {p.mock}
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-mono text-[11px] tracking-[0.2em]"
                    style={{ color: PRESENCE_ACCENT }}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="text-[19px] font-bold tracking-[-0.015em] text-white">
                    {p.title}
                  </h3>
                </div>
                <p className="mt-2 text-[15px] leading-[1.6] text-white/60">{p.line}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-3xl border bg-[#050A10] px-7 py-5 md:px-10" style={CARD_STYLE}>
          <p className="text-[15px] text-white/70 md:text-[16px]">
            From a simple landing page all the way to a custom application built around how your
            business runs.
          </p>
          <ol className="relative mt-5 grid grid-cols-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
            <span
              aria-hidden
              className="absolute left-0 right-0 top-[5px] hidden h-px lg:block"
              style={{ background: `linear-gradient(90deg, ${accent(0.15)}, ${accent(0.7)})` }}
            />
            {WEBSITE_TYPES.map((t, i) => (
              <li key={t.number} className="relative pr-3">
                <span
                  className="relative block h-[11px] w-[11px] rounded-full border-2 border-[#02040A]"
                  style={{
                    background: PRESENCE_ACCENT,
                    opacity: 0.35 + (i / (WEBSITE_TYPES.length - 1)) * 0.65,
                    boxShadow: `0 0 12px ${accent(0.6)}`,
                  }}
                />
                <span className="mt-3 block text-[13px] font-semibold leading-snug text-white/85">
                  {t.name}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">
                  {t.timeline}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
