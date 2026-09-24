// src/app/insights/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InsightsDetailHero } from '@/components/sections/insights/InsightsDetailHero';
import { InsightsPostBody } from '@/components/sections/insights/InsightsPostBody';
import { InsightsClosingCTA } from '@/components/sections/insights/InsightsClosingCTA';
import { getInsightPostBySlug } from '@/lib/insights';

// A post can be published at any time — never statically cache this route.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getInsightPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Aurexis Solution`,
    description: post.excerpt,
  };
}

export default async function InsightPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getInsightPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <Navbar />
      <main className="flex-1">
        <InsightsDetailHero post={post} />
        <InsightsPostBody body={post.body} />
        <InsightsClosingCTA />
      </main>
      <Footer />
    </div>
  );
}
