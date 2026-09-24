// src/components/sections/connect/ConnectProblem.tsx
import Image from 'next/image';
import { Check } from 'lucide-react';
import {
  PROBLEM_INTRO,
  WHAT_CONNECT_FIXES,
  CONNECT_ACCENT,
  CONNECT_ACCENT_RGB,
  CONNECT_DEEP_RGB,
  CONNECT_PROBLEM_IMAGE,
} from '@/data/connect-config';
import { SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { ConnectSectionLabel } from './ConnectSectionLabel';

const accent = (a: number) => `rgba(${CONNECT_ACCENT_RGB},${a})`;
const deep = (a: number) => `rgba(${CONNECT_DEEP_RGB},${a})`;

// Illustrative unanswered enquiries — shown until CONNECT_PROBLEM_IMAGE is set.
const UNREAD = [
  { who: '+60 17-2… ', msg: 'Hi, still open today?', time: '11:42 PM' },
  { who: 'Priya', msg: 'How much for a full service?', time: '10:15 PM' },
  { who: 'Mum', msg: 'Dinner at 8 tomorrow ok?', time: '9:58 PM', personal: true },
  { who: '+60 11-5… ', msg: 'Can I get a quote for 3 units?', time: '9:31 PM' },
  { who: 'Uncle Ravi', msg: '[Photo] Happy Deepavali!', time: '8:07 PM', personal: true },
];

function UnreadPhone() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[330px]">
      <div className="overflow-hidden rounded-[2.2rem] border-[6px] border-[#1A1526] bg-[#0B0913] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <span className="font-mono text-[10px] text-white/50">7:58 AM</span>
          <span className="h-4 w-16 rounded-full bg-black" />
          <span className="font-mono text-[10px] text-white/50">42%</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 pb-3">
          <span className="text-[17px] font-bold text-white">Chats</span>
          <span className="rounded-full bg-red-400/15 px-2 py-0.5 font-mono text-[10px] text-red-300">
            27 unread
          </span>
        </div>
        <ul>
          {UNREAD.map((c) => (
            <li
              key={c.who}
              className="flex items-center gap-3 border-b border-white/[0.05] px-5 py-3"
            >
              <span className="h-9 w-9 shrink-0 rounded-full bg-white/10" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-white/85">{c.who}</span>
                  <span className="font-mono text-[9.5px] text-white/35">{c.time}</span>
                </span>
                <span className="block truncate text-[12px] text-white/50">{c.msg}</span>
              </span>
              {!c.personal && <span className="h-2 w-2 shrink-0 rounded-full bg-red-300/80" />}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="absolute -bottom-4 -right-4 rounded-xl border px-3 py-2 font-mono text-[10px] text-white/70 shadow-2xl"
        style={{ borderColor: accent(0.35), background: '#120E1F' }}
      >
        Enquiry at 9:31 PM · <span style={{ color: CONNECT_ACCENT }}>seen next morning</span>
      </div>
    </div>
  );
}

export function ConnectProblem() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.12] bg-[#08050F] px-6">
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
          <ConnectSectionLabel>The Problem</ConnectSectionLabel>
          <h2
            className="max-w-xl font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(30px, 4vw, 52px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Whoever replies first{' '}
            <span className="font-serif italic font-normal" style={{ color: CONNECT_ACCENT }}>
              gets the job.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/70 md:text-[16px]">
            {PROBLEM_INTRO}
          </p>

          <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/40">
            What Connect fixes
          </p>
          <ul className="mt-3 grid gap-2.5">
            {WHAT_CONNECT_FIXES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[14px] leading-[1.55] text-white/75"
              >
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md"
                  style={{ background: accent(0.14), color: CONNECT_ACCENT }}
                >
                  <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[400px] lg:ml-auto">
          {CONNECT_PROBLEM_IMAGE ? (
            <Image
              src={CONNECT_PROBLEM_IMAGE}
              alt="A phone full of unanswered customer messages"
              width={928}
              height={1152}
              sizes="(min-width: 1024px) 400px, 90vw"
              className="h-auto w-full rounded-2xl border border-white/[0.12] object-cover shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <UnreadPhone />
          )}
        </div>
      </div>
    </section>
  );
}
