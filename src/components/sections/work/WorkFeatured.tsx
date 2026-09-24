// src/components/sections/work/WorkFeatured.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CaseStudy } from '@/types/case-study';
import { WORK_ACCENT } from '@/data/work-config';

export function WorkFeatured({ item }: { item: CaseStudy }) {
  return (
    <section className="border-t border-white/[0.08] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/work/${item.slug}`}
          className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20 md:grid-cols-2"
        >
          {item.screenshotUrl ? (
            <div className="relative aspect-[16/10] overflow-hidden bg-black/40 md:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.screenshotUrl}
                alt={item.clientName}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
          ) : null}

          <div className="flex flex-col justify-center gap-4 p-8 md:p-10">
            <span
              className="font-mono text-[11px] uppercase tracking-[0.32em]"
              style={{ color: WORK_ACCENT }}
            >
              {item.industry}
            </span>
            <h2 className="font-serif text-2xl italic leading-[1.15] tracking-[-0.01em] text-white md:text-3xl">
              {item.outcomeHeadline}
            </h2>
            <p className="text-[14px] leading-[1.6] text-white/60 md:text-[15px]">{item.problem}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
              {item.clientName}
            </p>
            <span
              className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white"
            >
              Read the story
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: WORK_ACCENT }}
              />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
