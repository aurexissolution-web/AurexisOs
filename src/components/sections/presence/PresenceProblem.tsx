// src/components/sections/presence/PresenceProblem.tsx
import Image from 'next/image';
import { PRESENCE_ACCENT_RGB } from '@/data/presence-config';
import { SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { PresenceSectionLabel } from './PresenceSectionLabel';

export function PresenceProblem() {
  const accent = (a: number) => `rgba(${PRESENCE_ACCENT_RGB},${a})`;

  return (
    <section className="relative overflow-hidden border-t border-white/[0.12] bg-[#04090F] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(45% 90% at 72% 0%, ${accent(0.26)}, transparent 72%)`,
            `radial-gradient(38% 70% at 90% 55%, rgba(0,150,170,0.24), transparent 72%)`,
            `radial-gradient(50% 70% at 45% 105%, rgba(0,110,130,0.24), transparent 72%), radial-gradient(30% 50% at 60% 45%, ${accent(0.07)}, transparent 70%)`,
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
          <PresenceSectionLabel>The Problem</PresenceSectionLabel>
          <h2
            className="max-w-xl font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(30px, 4vw, 52px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            If they can&apos;t find you, they call someone else.
          </h2>
          <p className="mt-5 max-w-lg text-balance text-[16px] leading-[1.6] text-white/85 md:text-[17px]">
            This isn&apos;t about looks. It&apos;s about customers you never get to talk to.
          </p>

          <div className="mt-8 max-w-xl space-y-5 text-[15px] leading-[1.7] text-white/70 md:text-[16px]">
            <p>
              Someone hears about your business — on Google, from a friend, or from your signboard.
              The first thing they do is look you up online. If you have no website, they can&apos;t
              tell if you&apos;re real.
            </p>
            <p>
              They also compare you with other businesses. They pick the one that&apos;s easy to
              find and easy to read about. An old website, a broken link, or no website all say the
              same thing: &ldquo;Are they still open?&rdquo;
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[400px] lg:ml-auto">
          <Image
            src="/images/presence/problem.jpg"
            alt="A person searching on their phone and getting no results"
            width={928}
            height={1152}
            sizes="(min-width: 1024px) 400px, 90vw"
            className="h-auto w-full rounded-2xl border border-white/[0.12] object-cover shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]"
          />
        </div>
      </div>
    </section>
  );
}
