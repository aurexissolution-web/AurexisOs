// src/app/work/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WorkHero } from '@/components/sections/work/WorkHero';
import { WorkFeatured } from '@/components/sections/work/WorkFeatured';
import { WorkGrid } from '@/components/sections/work/WorkGrid';
import { WorkClosingCTA } from '@/components/sections/work/WorkClosingCTA';
import { getCaseStudies } from '@/lib/case-studies';

export const metadata = {
  title: 'Case Studies: Websites & Automation | Aurexis Solution',
  description:
    'Real Malaysian businesses, real systems. Case studies of the websites, automation and software Aurexis Solution built: the problem, the build, the result.',
};

// Admin publishes revalidate this path; the hourly fallback covers anything missed.
export const revalidate = 3600;

export default async function WorkPage() {
  const [featured, ...rest] = await getCaseStudies();

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <Navbar />
      <main className="flex-1">
        <WorkHero />
        {featured && <WorkFeatured item={featured} />}
        {rest.length > 0 && <WorkGrid items={rest} />}
        <WorkClosingCTA />
      </main>
      <Footer />
    </div>
  );
}
