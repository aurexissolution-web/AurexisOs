// src/components/sections/core/CoreHero.tsx
import { AlertTriangle, Boxes, Briefcase, Building2 } from 'lucide-react';
import { CORE_ACCENT, CORE_ACCENT_RGB, CORE_WHATSAPP_URL } from '@/data/core-config';
import { CoreSectionLabel } from './CoreSectionLabel';

const accent = (a: number) => `rgba(${CORE_ACCENT_RGB},${a})`;

// Illustrative operations dashboard for the hero panel — not real client data.
const JOBS = [
  { id: 'J-318', site: 'Taman Melati · rewiring', status: 'On site', pct: 60 },
  { id: 'J-321', site: 'Shah Alam · DB board', status: 'Quoted', pct: 20 },
  { id: 'J-322', site: 'Cheras · inspection', status: 'Done', pct: 100 },
];

function OpsPanel() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border bg-[#07091A]/90 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      style={{ borderColor: accent(0.3) }}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto font-mono text-[11px] text-white/45">Operations · Today</span>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ background: accent(0.14), color: CORE_ACCENT }}
        >
          One system
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 p-4">
        {[
          { icon: <Briefcase className="h-3.5 w-3.5" />, k: 'Open jobs', v: '14' },
          { icon: <Boxes className="h-3.5 w-3.5" />, k: 'Stock items', v: '326' },
          { icon: <Building2 className="h-3.5 w-3.5" />, k: 'Branches', v: '3' },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <span
              className="grid h-6 w-6 place-items-center rounded-md"
              style={{ background: accent(0.16), color: CORE_ACCENT }}
            >
              {s.icon}
            </span>
            <span className="mt-2 block font-serif text-[24px] italic leading-none text-white">
              {s.v}
            </span>
            <span className="mt-1 block font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/40">
              {s.k}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 pb-2">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Jobs</p>
        <ul className="space-y-1.5">
          {JOBS.map((j) => (
            <li
              key={j.id}
              className="flex items-center gap-3 rounded-lg border border-white/[0.07] px-3 py-2"
            >
              <span className="font-mono text-[10px] text-white/45">{j.id}</span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-white/80">{j.site}</span>
              <span className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${j.pct}%`, background: CORE_ACCENT }}
                />
              </span>
              <span
                className="w-14 text-right font-mono text-[9px] uppercase tracking-[0.1em]"
                style={{ color: j.status === 'Done' ? CORE_ACCENT : 'rgba(255,255,255,0.55)' }}
              >
                {j.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="m-4 mt-3 flex items-center gap-2.5 rounded-lg border px-3 py-2.5"
        style={{ borderColor: accent(0.3), background: accent(0.06) }}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: CORE_ACCENT }} />
        <span className="text-[11.5px] text-white/75">
          Cable 2.5mm running low at Cheras — reorder suggested
        </span>
      </div>
    </div>
  );
}

export function CoreHero() {
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden px-6 pb-12 pt-28">
      <video
        aria-hidden
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/videos/solutions/core-poster.jpg"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      >
        <source src="/videos/solutions/core-hero.mp4" type="video/mp4" />
      </video>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="[&_span]:[text-shadow:0_0_10px_rgba(0,0,0,0.95),0_0_24px_rgba(0,0,0,0.8)] [&_span:last-child]:!text-white">
            <CoreSectionLabel>03 · Your Operations System</CoreSectionLabel>
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
            A wiring business run on a notebook and a spreadsheet that{' '}
            <span className="font-serif italic font-normal" style={{ color: CORE_ACCENT }}>
              didn&apos;t always agree.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.6] text-white/90 [text-shadow:0_0_10px_rgba(0,0,0,0.9),0_0_28px_rgba(0,0,0,0.7)] md:text-[16px]">
            Core is the custom-operations side of Aurexis — from one process properly systemised, to
            a full multi-branch operations platform built once, around your business, instead of
            stitched from five subscriptions.
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
              href={CORE_WHATSAPP_URL}
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
            <OpsPanel />
          </div>
          <figcaption className="mt-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-white/55 [text-shadow:0_0_10px_rgba(0,0,0,0.9)]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: CORE_ACCENT }}
            />
            Jobs, stock and branches — one place, not five
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
