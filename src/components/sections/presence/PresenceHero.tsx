// src/components/sections/presence/PresenceHero.tsx
import Image from 'next/image';
import {
  PRESENCE_ACCENT,
  PRESENCE_ACCENT_RGB,
  PRESENCE_HERO_SHOWCASE,
  PRESENCE_WHATSAPP_URL,
} from '@/data/presence-config';
import { PresenceSectionLabel } from './PresenceSectionLabel';

export function PresenceHero() {
  const { client, url, imageSrc } = PRESENCE_HERO_SHOWCASE;
  const accent = (a: number) => `rgba(${PRESENCE_ACCENT_RGB},${a})`;

  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden px-6 pb-12 pt-28">
      <video
        aria-hidden
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/videos/solutions/presence-poster.jpg"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      >
        <source src="/videos/solutions/presence-hero.mp4" type="video/mp4" />
      </video>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="[&_span]:[text-shadow:0_0_10px_rgba(0,0,0,0.95),0_0_24px_rgba(0,0,0,0.8)] [&_span:last-child]:!text-white">
            <PresenceSectionLabel>01 · Your Website</PresenceSectionLabel>
          </div>

          <h1
            className="max-w-3xl font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(34px, 4.4vw, 60px)',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              textShadow: '0 2px 4px rgba(0,0,0,0.35), 0 4px 32px rgba(0,0,0,0.6)',
            }}
          >
            Search for the business. Get nothing — or a site that looks{' '}
            <span className="font-serif italic font-normal" style={{ color: PRESENCE_ACCENT }}>
              abandoned.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.6] text-white/90 [text-shadow:0_0_10px_rgba(0,0,0,0.9),0_0_28px_rgba(0,0,0,0.7)] md:text-[16px]">
            Presence is the website side of Aurexis — from a 3-page landing page to a custom web
            application built around how your business actually runs.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <a
              href="#get-a-quote"
              className="inline-flex items-center gap-2 rounded-full border px-9 py-4 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02040A]"
              style={{ borderColor: accent(0.4), background: 'rgba(2,4,10,0.55)' }}
            >
              Get a Quote
            </a>
            <a
              href={PRESENCE_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#02040A]/55 px-9 py-4 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02040A]"
            >
              WhatsApp us
            </a>
          </div>
        </div>

        {/* Customer showcase */}
        <figure className="relative mx-auto w-full max-w-[560px]">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[32px] blur-3xl"
            style={{ background: accent(0.18) }}
          />
          <div
            className="overflow-hidden rounded-xl border bg-[#070B12] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] "
            style={{
              borderColor: accent(0.25),
              transform: 'perspective(1400px) rotateY(-8deg) rotateX(4deg)',
            }}
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </span>
              <span className="mx-auto rounded-md bg-white/[0.05] px-4 py-1 font-mono text-[11px] text-white/45">
                {url}
              </span>
              <span className="w-10" aria-hidden />
            </div>
            <div className="relative aspect-[16/10] w-full">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={`${client} website, built by Aurexis`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 540px, 90vw"
                  className="object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">
                  Customer screenshot
                </div>
              )}
            </div>
          </div>
          <figcaption className="mt-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: PRESENCE_ACCENT }}
            />
            Built by Aurexis · {client}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
