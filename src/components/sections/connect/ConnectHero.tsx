// src/components/sections/connect/ConnectHero.tsx
import { Bot, CalendarCheck, Flame, TriangleAlert, UserRound } from 'lucide-react';
import {
  CONNECT_ACCENT,
  CONNECT_ACCENT_RGB,
  CONNECT_WHATSAPP_URL,
  BILLING_CHANGE_NOTE,
} from '@/data/connect-config';
import { ConnectSectionLabel } from './ConnectSectionLabel';

const accent = (a: number) => `rgba(${CONNECT_ACCENT_RGB},${a})`;

// Illustrative shared-inbox conversation for the hero panel — not real client data.
const CHATS = [
  { name: 'Aisyah', last: 'Can I book a cleaning on Sat?', tag: 'Hot lead', hot: true },
  { name: '+60 12-8… ', last: 'How much for braces?', tag: 'Qualifying' },
  { name: 'Mr Lim', last: 'Thanks, see you Monday', tag: 'Booked' },
];

function InboxPanel() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border bg-[#0B0716]/90 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      style={{ borderColor: accent(0.3) }}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto font-mono text-[11px] text-white/45">Team inbox · WhatsApp</span>
        <span
          className="flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ background: accent(0.14), color: CONNECT_ACCENT }}
        >
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full motion-reduce:animate-none"
            style={{ background: CONNECT_ACCENT }}
          />
          Replying 24/7
        </span>
      </div>

      <div className="grid grid-cols-[0.9fr_1.1fr]">
        <ul className="border-r border-white/[0.08]">
          {CHATS.map((c, i) => (
            <li
              key={c.name}
              className="border-b border-white/[0.06] px-3 py-2.5"
              style={i === 0 ? { background: accent(0.08) } : undefined}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-semibold text-white/90">{c.name}</span>
                <span
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider"
                  style={
                    c.hot
                      ? { background: accent(0.2), color: CONNECT_ACCENT }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  {c.hot && <Flame className="h-2.5 w-2.5" />}
                  {c.tag}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-[10.5px] text-white/45">{c.last}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 p-3">
          <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-white/[0.08] px-3 py-2 text-[11px] text-white/80">
            Hi, can I book a cleaning on Saturday?
          </div>
          <div className="ml-auto w-fit max-w-[90%]">
            <span className="mb-1 flex items-center justify-end gap-1 font-mono text-[8px] uppercase tracking-wider text-white/40">
              <Bot className="h-2.5 w-2.5" /> Auto-reply
            </span>
            <div
              className="rounded-2xl rounded-br-md px-3 py-2 text-[11px] text-[#0B0716]"
              style={{ background: CONNECT_ACCENT }}
            >
              Sure! 10:00 or 11:30 available. Which suits you?
            </div>
          </div>
          <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-white/[0.08] px-3 py-2 text-[11px] text-white/80">
            11:30 please
          </div>
          <div
            className="flex items-center gap-2 rounded-lg border px-2.5 py-2"
            style={{ borderColor: accent(0.35), background: accent(0.08) }}
          >
            <CalendarCheck className="h-3.5 w-3.5" style={{ color: CONNECT_ACCENT }} />
            <span className="text-[10.5px] text-white/80">Booked · Sat 11:30</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5">
        <UserRound className="h-3.5 w-3.5 text-white/45" />
        <span className="text-[10.5px] text-white/55">
          Lead logged to your sheet · assigned to front desk
        </span>
      </div>
    </div>
  );
}

export function ConnectHero() {
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden px-6 pb-12 pt-28">
      <video
        aria-hidden
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/videos/solutions/connect-poster.jpg"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      >
        <source src="/videos/solutions/connect-hero.mp4" type="video/mp4" />
      </video>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="[&_span]:[text-shadow:0_0_10px_rgba(0,0,0,0.95),0_0_24px_rgba(0,0,0,0.8)] [&_span:last-child]:!text-white">
            <ConnectSectionLabel>04 · Your Leads</ConnectSectionLabel>
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
            Every enquiry landed in one WhatsApp,{' '}
            <span className="font-serif italic font-normal" style={{ color: CONNECT_ACCENT }}>
              mixed in with everything else.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.6] text-white/90 [text-shadow:0_0_10px_rgba(0,0,0,0.9),0_0_28px_rgba(0,0,0,0.7)] md:text-[16px]">
            Connect is the WhatsApp side of Aurexis — from moving your business off a personal
            number, to a fully automated channel that captures, qualifies, books and follows up
            while you&apos;re doing the work.
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
              href={CONNECT_WHATSAPP_URL}
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
            <TriangleAlert
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: CONNECT_ACCENT }}
              strokeWidth={2}
            />
            <span>
              {BILLING_CHANGE_NOTE.body}{' '}
              <a
                href={BILLING_CHANGE_NOTE.linkHref}
                className="underline underline-offset-2"
                style={{ color: CONNECT_ACCENT, textDecorationColor: accent(0.5) }}
              >
                {BILLING_CHANGE_NOTE.linkLabel}
              </a>
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
            <InboxPanel />
          </div>
          <figcaption className="mt-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-white/55 [text-shadow:0_0_10px_rgba(0,0,0,0.9)]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: CONNECT_ACCENT }}
            />
            Every enquiry answered, logged and routed
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
