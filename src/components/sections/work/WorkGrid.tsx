// src/components/sections/work/WorkGrid.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CaseStudy } from '@/types/case-study';
import { WORK_ACCENT } from '@/data/work-config';

function WorkCard({ item }: { item: CaseStudy }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.025] to-transparent transition-colors duration-300 hover:border-white/20"
    >
      {item.screenshotUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.screenshotUrl}
            alt={item.clientName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: WORK_ACCENT }}
        >
          {item.industry}
        </span>
        <h3 className="font-serif text-[19px] italic leading-[1.2] tracking-[-0.01em] text-white">
          {item.clientName}
        </h3>
        <p className="text-[13px] leading-[1.55] text-white/55">{item.summary || item.problem}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold text-white">
          Read the story
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: WORK_ACCENT }}
          />
        </span>
      </div>
    </Link>
  );
}

export function WorkGrid({ items }: { items: CaseStudy[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-white/[0.08] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {items.map((item) => (
            <WorkCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
