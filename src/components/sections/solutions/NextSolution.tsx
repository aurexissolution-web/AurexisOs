// src/components/sections/solutions/NextSolution.tsx
// End-of-page link to the next solution, in that solution's own colour.
// Order follows SERVICES in src/data/solutions-services.ts and wraps around.
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SERVICES } from '@/data/solutions-services';

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');

export function NextSolution({ current }: { current: string }) {
  const pages = SERVICES.filter((s) => s.detailHref);
  const index = pages.findIndex((s) => s.detailHref === current);
  if (index === -1) return null;
  const next = pages[(index + 1) % pages.length];
  const number = String(SERVICES.indexOf(next) + 1).padStart(2, '0');
  const c = rgb(next.accent);
  const accent = (a: number) => `rgba(${c},${a})`;

  return (
    <section className="px-6 py-12 md:py-16">
      <Link
        href={next.detailHref!}
        className="group relative mx-auto flex max-w-6xl flex-col gap-6 overflow-hidden rounded-3xl border p-6 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 md:flex-row md:items-center md:justify-between md:p-10"
        style={{
          borderColor: accent(0.3),
          background: `radial-gradient(60% 120% at 100% 50%, ${accent(0.16)}, transparent 70%), #05070D`,
          ['--tw-ring-color' as string]: accent(0.6),
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 1px ${accent(0.6)}, inset 0 0 60px -20px ${accent(0.5)}`,
          }}
        />

        <span className="relative flex items-center gap-5 md:gap-7">
          <span
            aria-hidden
            className="font-serif text-[64px] italic leading-none md:text-[88px]"
            style={{ color: 'transparent', WebkitTextStroke: `1px ${next.accent}` }}
          >
            {number}
          </span>
          <span>
            <span
              className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.28em]"
              style={{ color: next.accent }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: next.accent }}
              />
              Next · {next.category}
            </span>
            <span className="mt-2 block text-[30px] font-extrabold leading-none tracking-[-0.03em] text-white md:text-[40px]">
              {next.name}
            </span>
            <span className="mt-3 block max-w-lg font-serif text-[16px] italic leading-snug text-white/60 md:text-[18px]">
              {next.problemLine}
            </span>
          </span>
        </span>

        <span className="relative flex items-center gap-5 md:flex-col md:items-end md:gap-4">
          <span className="text-[13px] text-white/45">
            {next.pricePrefix}{' '}
            <span className="font-serif text-[22px] italic" style={{ color: next.accent }}>
              {next.priceAmount}
            </span>
          </span>
          <span
            className="grid h-14 w-14 place-items-center rounded-full border transition-all duration-300 group-hover:translate-x-1"
            style={{ borderColor: accent(0.6), background: accent(0.12), color: next.accent }}
          >
            <ArrowRight aria-hidden className="h-5 w-5" />
          </span>
        </span>
      </Link>
    </section>
  );
}
