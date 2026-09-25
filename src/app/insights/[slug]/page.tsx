// src/app/insights/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InsightsDetailHero } from '@/components/sections/insights/InsightsDetailHero';
import { InsightsPostBody } from '@/components/sections/insights/InsightsPostBody';
import { InsightsClosingCTA } from '@/components/sections/insights/InsightsClosingCTA';
import { getInsightPostBySlug } from '@/lib/insights';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, breadcrumbJsonLd, orgId } from '@/lib/seo';

// A post can be published at any time — never statically cache this route.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getInsightPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Aurexis Solution`,
    description: post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at ?? post.published_at,
      ...(post.cover_image_url && { images: [post.cover_image_url] }),
    },
  };
}

export default async function InsightPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getInsightPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/insights/${post.slug}`,
      mainEntityOfPage: `${SITE_URL}/insights/${post.slug}`,
      datePublished: post.published_at,
      dateModified: post.updated_at ?? post.published_at,
      inLanguage: 'en-MY',
      author: { '@id': orgId },
      publisher: { '@id': orgId },
      ...(post.cover_image_url && { image: post.cover_image_url }),
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Insights', path: '/insights' },
      { name: post.title, path: `/insights/${post.slug}` },
    ]),
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <JsonLd data={jsonLd} />
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
