import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getInsightPosts } from '@/lib/insights';
import { getCaseStudies } from '@/lib/case-studies';

export const revalidate = 3600;

const STATIC: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/solutions', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/solutions/presence', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/solutions/flow', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/solutions/core', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/solutions/connect', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/solutions/ai-readiness-audit', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/work', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/insights', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, cases] = await Promise.all([
    getInsightPosts().catch(() => []),
    getCaseStudies().catch(() => []),
  ]);

  return [
    ...STATIC.map((s) => ({
      url: `${SITE_URL}${s.path}`,
      changeFrequency: s.changeFrequency,
      priority: s.priority,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/insights/${p.slug}`,
      lastModified: p.updated_at ?? p.published_at,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...cases.map((c) => ({
      url: `${SITE_URL}/work/${c.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
