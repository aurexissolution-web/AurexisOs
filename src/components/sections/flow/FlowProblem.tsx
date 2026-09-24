// src/components/sections/flow/FlowProblem.tsx
import Image from 'next/image';
import { AlertCircle, Check } from 'lucide-react';
import {
  PROBLEM_INTRO,
  WHAT_FLOW_FIXES,
  PROBLEM_CALLOUT,
  FLOW_ACCENT,
  FLOW_ACCENT_RGB,
  FLOW_DEEP_RGB,
  FLOW_PROBLEM_IMAGE,
} from '@/data/flow-config';
import { SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { FlowSectionLabel } from './FlowSectionLabel';

const accent = (a: number) => `rgba(${FLOW_ACCENT_RGB},${a})`;
const deep = (a: number) => `rgba(${FLOW_DEEP_RGB},${a})`;

// Illustrative overdue invoices — shown until FLOW_PROBLEM_IMAGE is set.
const OVERDUE = [
  { no: 'INV-1031', who: 'Tan Engineering', amount: 'RM 2,450', days: 34 },
  { no: 'INV-1038', who: 'Kedai Runcit Aman', amount: 'RM 780', days: 21 },
  { no: 'INV-1042', who: 'Wira Logistics', amount: 'RM 6,120', days: 12 },
];

function OverdueStack() {
  return (
    <div aria-hidden className="relative mx-auto h-[470px] w-full max-w-[380px]">
      {OVERDUE.map((inv, i) => (
        <div
          key={inv.no}
          className="absolute inset-x-0 rounded-2xl border border-white/10 bg-[#0A100F]/95 p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
          style={{
            top: `${i * 128}px`,
            transform: `rotate(${[-4, 2.5, -1.5][i]}deg) translateX(${[-10, 14, 0][i]}px)`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-white/45">{inv.no}</span>
            <span className="flex items-center gap-1.5 rounded-full bg-red-400/10 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-red-300">
              <AlertCircle className="h-3 w-3" />
              {inv.days} days overdue
            </span>
          </div>
          <p className="mt-3 text-[15px] font-semibold text-white/85">{inv.who}</p>
          <div className="mt-3 flex items-end justify-between">
            <span className="space-y-1.5">
              <span className="block h-1.5 w-32 rounded-full bg-white/10" />
              <span className="block h-1.5 w-20 rounded-full bg-white/10" />
            </span>
            <span className="font-serif text-[22px] italic text-white/70">{inv.amount}</span>
          </div>
        </div>
      ))}
      <div
        className="absolute -bottom-2 right-0 rounded-xl border px-3 py-2 font-mono text-[10px] text-white/70 shadow-2xl"
        style={{ borderColor: accent(0.35), background: '#0A1411' }}
      >
        Last chased: <span style={{ color: FLOW_ACCENT }}>“I think last month?”</span>
      </div>
    </div>
  );
}

export function FlowProblem() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.12] bg-[#040A09] px-6">
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
          <FlowSectionLabel>The Problem</FlowSectionLabel>
          <h2
            className="max-w-xl font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(30px, 4vw, 52px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Your evenings are going to{' '}
            <span className="font-serif italic font-normal" style={{ color: FLOW_ACCENT }}>
              paperwork.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/70 md:text-[16px]">
            {PROBLEM_INTRO}
          </p>

          <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/40">
            What Flow fixes
          </p>
          <ul className="mt-3 grid gap-2.5">
            {WHAT_FLOW_FIXES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[14px] leading-[1.55] text-white/75"
              >
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md"
                  style={{ background: accent(0.14), color: FLOW_ACCENT }}
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
          {FLOW_PROBLEM_IMAGE ? (
            <Image
              src={FLOW_PROBLEM_IMAGE}
              alt="A business owner doing invoices late at night"
              width={928}
              height={1152}
              sizes="(min-width: 1024px) 400px, 90vw"
              className="h-auto w-full rounded-2xl border border-white/[0.12] object-cover shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <OverdueStack />
          )}
        </div>
      </div>
    </section>
  );
}
