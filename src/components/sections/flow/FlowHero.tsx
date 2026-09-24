// src/components/sections/flow/FlowHero.tsx
import { BellRing, Check, FileText, Receipt, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  FLOW_ACCENT,
  FLOW_ACCENT_RGB,
  FLOW_WHATSAPP_URL,
  COMPLIANCE_ALERT_NOTE,
} from '@/data/flow-config';
import { FlowSectionLabel } from './FlowSectionLabel';

const accent = (a: number) => `rgba(${FLOW_ACCENT_RGB},${a})`;

// Illustrative quote-to-cash run for the hero panel — not real client data.
const STEPS: { icon: ReactNode; title: string; meta: string; status: string }[] = [
  {
    icon: <FileText aria-hidden className="h-4 w-4" />,
    title: 'Quote sent',
    meta: 'Q-2041 · RM 4,800 · auto-filled',
    status: 'Done',
  },
  {
    icon: <Receipt aria-hidden className="h-4 w-4" />,
    title: 'Invoice issued',
    meta: 'INV-2041 · synced to your books',
    status: 'Done',
  },
  {
    icon: <ShieldCheck aria-hidden className="h-4 w-4" />,
    title: 'e-Invoice validated',
    meta: 'MyInvois · LHDN',
    status: 'Valid',
  },
  {
    icon: <BellRing aria-hidden className="h-4 w-4" />,
    title: 'Payment reminder',
    meta: 'WhatsApp · in 3 days',
    status: 'Scheduled',
  },
];

function AutomationPanel() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border bg-[#050B0A]/90 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      style={{ borderColor: accent(0.28) }}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto font-mono text-[11px] text-white/45">
          Automation · Quote to cash
        </span>
        <span
          className="flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ background: accent(0.14), color: FLOW_ACCENT }}
        >
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full motion-reduce:animate-none"
            style={{ background: FLOW_ACCENT }}
          />
          Live
        </span>
      </div>

      <ol className="relative px-5 py-5">
        <span
          className="absolute bottom-10 left-[39px] top-10 w-px"
          style={{ background: `linear-gradient(${accent(0.6)}, ${accent(0.1)})` }}
        />
        {STEPS.map((step) => {
          const pending = step.status === 'Scheduled';
          return (
            <li key={step.title} className="relative flex items-center gap-4 py-2.5">
              <span
                className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
                style={{
                  borderColor: pending ? 'rgba(255,255,255,0.15)' : accent(0.45),
                  background: pending ? '#0B1211' : '#0B1D18',
                  color: pending ? 'rgba(255,255,255,0.5)' : FLOW_ACCENT,
                }}
              >
                {step.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-white">{step.title}</span>
                <span className="block truncate font-mono text-[10.5px] text-white/40">
                  {step.meta}
                </span>
              </span>
              <span
                className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em]"
                style={
                  pending
                    ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }
                    : { background: accent(0.14), color: FLOW_ACCENT }
                }
              >
                {!pending && <Check className="h-3 w-3" strokeWidth={3} />}
                {step.status}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-3 border-t border-white/10">
        {[
          ['Typed by hand', '0'],
          ['Chased from memory', '0'],
          ['Steps automated', '4'],
        ].map(([k, v]) => (
          <div key={k} className="border-r border-white/10 px-4 py-3 last:border-r-0">
            <span
              className="block font-serif text-[22px] italic leading-none"
              style={{ color: FLOW_ACCENT }}
            >
              {v}
            </span>
            <span className="mt-1 block font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/40">
              {k}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlowHero() {
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden px-6 pb-12 pt-28">
      <video
        aria-hidden
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/videos/solutions/flow-poster.jpg"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      >
        <source src="/videos/solutions/flow-hero.mp4" type="video/mp4" />
      </video>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="[&_span]:[text-shadow:0_0_10px_rgba(0,0,0,0.95),0_0_24px_rgba(0,0,0,0.8)] [&_span:last-child]:!text-white">
            <FlowSectionLabel>02 · Admin On Autopilot</FlowSectionLabel>
          </div>

          <h1
            className="max-w-3xl font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(32px, 4.2vw, 56px)',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              textShadow: '0 2px 4px rgba(0,0,0,0.35), 0 4px 32px rgba(0,0,0,0.6)',
            }}
          >
            Quotes, invoices, reminders —{' '}
            <span className="font-serif italic font-normal" style={{ color: FLOW_ACCENT }}>
              typed by hand, every time.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.6] text-white/90 [text-shadow:0_0_10px_rgba(0,0,0,0.9),0_0_28px_rgba(0,0,0,0.7)] md:text-[16px]">
            Flow is the admin-automation side of Aurexis — from one workflow done properly, to the
            whole quote-to-cash cycle connected to your books, with LHDN e-Invoice onboarding built
            in.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <a
              href="#get-a-quote"
              className="inline-flex items-center gap-2 rounded-full border px-9 py-4 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02040A]"
              style={{ borderColor: accent(0.45), background: 'rgba(2,4,10,0.55)' }}
            >
              Get a Quote
            </a>
            <a
              href={FLOW_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#02040A]/55 px-9 py-4 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02040A]"
            >
              WhatsApp us
            </a>
          </div>

          <p
            className="mt-7 flex max-w-xl items-start gap-2.5 rounded-2xl border bg-[#02040A]/60 px-4 py-3 text-[13px] leading-[1.55] text-white/80 backdrop-blur-sm"
            style={{ borderColor: accent(0.35) }}
          >
            <ShieldCheck
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: FLOW_ACCENT }}
              strokeWidth={2}
            />
            <span>
              {COMPLIANCE_ALERT_NOTE.body}{' '}
              <a
                href={COMPLIANCE_ALERT_NOTE.linkHref}
                className="underline underline-offset-2"
                style={{ color: FLOW_ACCENT, textDecorationColor: accent(0.5) }}
              >
                {COMPLIANCE_ALERT_NOTE.linkLabel}
              </a>{' '}
              {COMPLIANCE_ALERT_NOTE.after}
            </span>
          </p>
        </div>

        <figure className="relative mx-auto w-full max-w-[500px]">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[32px] blur-3xl"
            style={{ background: accent(0.16) }}
          />
          <div style={{ transform: 'perspective(1400px) rotateY(-8deg) rotateX(4deg)' }}>
            <AutomationPanel />
          </div>
          <figcaption className="mt-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-white/55 [text-shadow:0_0_10px_rgba(0,0,0,0.9)]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: FLOW_ACCENT }}
            />
            One quote, start to paid — no retyping
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
