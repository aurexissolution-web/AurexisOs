// src/app/work/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WorkHero } from '@/components/sections/work/WorkHero';
import { WorkFeatured } from '@/components/sections/work/WorkFeatured';
import { WorkGrid } from '@/components/sections/work/WorkGrid';
import { WorkClosingCTA } from '@/components/sections/work/WorkClosingCTA';
import { getCaseStudies } from '@/data/case-studies';

export const metadata = {
  title: 'Our Work — Aurexis Solution',
  description: 'Real businesses, real systems — case studies from projects we’ve built.',
};

export default function WorkPage() {
  const [featured, ...rest] = getCaseStudies();

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
