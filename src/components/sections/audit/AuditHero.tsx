// src/components/sections/audit/AuditHero.tsx
import { BadgeCheck, Minus, Sparkles } from 'lucide-react';
import {
  AUDIT_ACCENT,
  AUDIT_ACCENT_RGB,
  AUDIT_WHATSAPP_URL,
  HERO_SUBHEAD,
} from '@/data/audit-config';
import { AuditSectionLabel } from './AuditSectionLabel';

const accent = (a: number) => `rgba(${AUDIT_ACCENT_RGB},${a})`;

// Illustrative audit output for the hero panel — not real client data.
const OPPORTUNITIES = [
  { rank: 1, area: 'Quote drafting from past jobs', impact: 90, verdict: 'High impact' },
  { rank: 2, area: 'Answering repeat WhatsApp questions', impact: 72, verdict: 'High impact' },
  { rank: 3, area: 'Monthly sales summary', impact: 48, verdict: 'Worth trying' },
];

function RoadmapPanel() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border bg-[#110D06]/90 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      style={{ borderColor: accent(0.3) }}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto font-mono text-[11px] text-white/45">AI readiness · Roadmap</span>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ background: accent(0.14), color: AUDIT_ACCENT }}
        >
          Yours to keep
        </span>
      </div>

      <div className="p-4">
        <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
          Where AI actually helps
        </p>
        <ol className="space-y-2">
          {OPPORTUNITIES.map((o) => (
            <li
              key={o.rank}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5"
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-serif text-[15px] italic"
                style={{ background: accent(0.16), color: AUDIT_ACCENT }}
              >
                {o.rank}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] text-white/85">{o.area}</span>
                <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${o.impact}%`, background: AUDIT_ACCENT }}
                  />
                </span>
              </span>
              <span className="w-20 shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.1em] text-white/50">
                {o.verdict}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.1] px-3 py-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-white/40">
              <Minus className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-[12.5px] text-white/45">Custom AI model</span>
            <span className="w-20 text-right font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">
              Not yet
            </span>
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-2 border-t border-white/10">
        <div className="flex items-center gap-2 border-r border-white/10 px-4 py-3">
          <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: AUDIT_ACCENT }} />
          <span className="text-[11px] text-white/70">Grant screening: HRD Corp</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0" style={{ color: AUDIT_ACCENT }} />
          <span className="text-[11px] text-white/70">Next step: Core Starter</span>
        </div>
      </div>
    </div>
  );
}

export function AuditHero() {
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden px-6 pb-12 pt-28">
      <video
        aria-hidden
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/videos/solutions/audit-poster.jpg"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      >
        <source src="/videos/solutions/audit-hero.mp4" type="video/mp4" />
      </video>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="[&_span]:[text-shadow:0_0_10px_rgba(0,0,0,0.95),0_0_24px_rgba(0,0,0,0.8)] [&_span:last-child]:!text-white">
            <AuditSectionLabel>05 · Start Here</AuditSectionLabel>
          </div>

          <h1
            className="max-w-3xl font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(30px, 4vw, 54px)',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              textShadow: '0 2px 4px rgba(0,0,0,0.35), 0 4px 32px rgba(0,0,0,0.6)',
            }}
          >
            Everyone says &ldquo;you should be using AI.&rdquo; Nobody says{' '}
            <span className="font-serif italic font-normal" style={{ color: AUDIT_ACCENT }}>
              which part,
            </span>{' '}
            or whether it&apos;s worth it for you.
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.6] text-white/90 [text-shadow:0_0_10px_rgba(0,0,0,0.9),0_0_28px_rgba(0,0,0,0.7)] md:text-[16px]">
            {HERO_SUBHEAD}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <a
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-full border px-9 py-4 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02040A]"
              style={{ borderColor: accent(0.45), background: 'rgba(2,4,10,0.55)' }}
            >
              Get Started
            </a>
            <a
              href={AUDIT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#02040A]/55 px-9 py-4 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02040A]"
            >
              WhatsApp us
            </a>
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-[500px]">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[32px] blur-3xl"
            style={{ background: accent(0.16) }}
          />
          <div style={{ transform: 'perspective(1400px) rotateY(-8deg) rotateX(4deg)' }}>
            <RoadmapPanel />
          </div>
          <figcaption className="mt-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-white/55 [text-shadow:0_0_10px_rgba(0,0,0,0.9)]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: AUDIT_ACCENT }}
            />
            A ranked roadmap — not a scorecard
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
