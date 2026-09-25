// src/app/work/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WorkDetailHero } from '@/components/sections/work/WorkDetailHero';
import { WorkDetailSection } from '@/components/sections/work/WorkDetailSection';
import { WorkDetailScreenshot } from '@/components/sections/work/WorkDetailScreenshot';
import { WorkClosingCTA } from '@/components/sections/work/WorkClosingCTA';
import { getCaseStudies, getCaseStudyBySlug } from '@/lib/case-studies';
import { WorkDetailExtras } from '@/components/sections/work/WorkDetailExtras';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, breadcrumbJsonLd, orgId } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getCaseStudies()).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCaseStudyBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.clientName}: ${item.outcomeHeadline} | Aurexis Solution`,
    description: item.summary || item.outcomeHeadline,
    alternates: { canonical: `/work/${item.slug}` },
    ...(item.screenshotUrl && { openGraph: { images: [item.screenshotUrl] } }),
  };
}

export default async function WorkCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCaseStudyBySlug(slug);
  if (!item) notFound();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `${item.clientName}: ${item.outcomeHeadline}`,
      description: item.summary || item.outcomeHeadline,
      url: `${SITE_URL}/work/${item.slug}`,
      creator: { '@id': orgId },
      about: item.industry,
      ...(item.screenshotUrl && { image: item.screenshotUrl }),
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Work', path: '/work' },
      { name: item.clientName, path: `/work/${item.slug}` },
    ]),
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <JsonLd data={jsonLd} />
      <Navbar />
      <main className="flex-1">
        <WorkDetailHero item={item} />
        <WorkDetailExtras item={item} placement="top" />
        <WorkDetailSection label="The Problem">{item.problem}</WorkDetailSection>
        <WorkDetailSection label="What Was Built">{item.whatWasBuilt}</WorkDetailSection>
        <WorkDetailSection label="The Result">{item.result}</WorkDetailSection>
        {item.screenshotUrl && (
          <WorkDetailScreenshot screenshotUrl={item.screenshotUrl} clientName={item.clientName} />
        )}
        <WorkDetailExtras item={item} placement="bottom" />
        <WorkClosingCTA clientName={item.clientName} />
      </main>
      <Footer />
    </div>
  );
}
