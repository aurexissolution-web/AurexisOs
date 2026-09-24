// src/components/sections/insights/InsightsGrid.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { InsightPost } from '@/types/insights';
import { INSIGHTS_ACCENT, formatInsightDate } from '@/data/insights-config';

function InsightCard({ post }: { post: InsightPost }) {
  return (
    <Link
      href={`/insights/${post.slug}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.025] to-transparent p-6 transition-colors duration-300 hover:border-white/20"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
        {formatInsightDate(post.published_at)}
      </span>
      <h3 className="font-serif text-xl italic leading-[1.2] tracking-[-0.01em] text-white">
        {post.title}
      </h3>
      <p className="text-[13.5px] leading-[1.55] text-white/55">{post.excerpt}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold text-white">
        Read
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: INSIGHTS_ACCENT }}
        />
      </span>
    </Link>
  );
}

export function InsightsGrid({ posts }: { posts: InsightPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-white/[0.08] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {posts.map((post) => (
            <InsightCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
