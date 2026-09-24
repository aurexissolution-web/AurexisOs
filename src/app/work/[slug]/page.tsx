// src/app/work/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WorkDetailHero } from '@/components/sections/work/WorkDetailHero';
import { WorkDetailSection } from '@/components/sections/work/WorkDetailSection';
import { WorkDetailScreenshot } from '@/components/sections/work/WorkDetailScreenshot';
import { WorkClosingCTA } from '@/components/sections/work/WorkClosingCTA';
import { getCaseStudies, getCaseStudyBySlug } from '@/data/case-studies';

export function generateStaticParams() {
  return getCaseStudies().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCaseStudyBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.clientName} — Aurexis Solution`,
    description: item.outcomeHeadline,
  };
}

export default async function WorkCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCaseStudyBySlug(slug);
  if (!item) notFound();

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <Navbar />
      <main className="flex-1">
        <WorkDetailHero item={item} />
        <WorkDetailSection label="The Problem">{item.problem}</WorkDetailSection>
        <WorkDetailSection label="What Was Built">{item.whatWasBuilt}</WorkDetailSection>
        <WorkDetailSection label="The Result">{item.result}</WorkDetailSection>
        {item.screenshotUrl && (
          <WorkDetailScreenshot screenshotUrl={item.screenshotUrl} clientName={item.clientName} />
        )}
        <WorkClosingCTA clientName={item.clientName} />
      </main>
      <Footer />
    </div>
  );
}
