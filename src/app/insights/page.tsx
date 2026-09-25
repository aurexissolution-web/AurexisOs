// src/app/insights/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InsightsHero } from '@/components/sections/insights/InsightsHero';
import { InsightsGrid } from '@/components/sections/insights/InsightsGrid';
import { InsightsClosingCTA } from '@/components/sections/insights/InsightsClosingCTA';
import { getInsightPosts } from '@/lib/insights';

export const metadata = {
  title: 'Insights on Automation & AI for SMEs | Aurexis Solution',
  description:
    'Plain-language notes from the Aurexis Solution team on business automation, AI, WhatsApp, LHDN e-Invoice and building software for Malaysian SMEs.',
};

// Newly published posts must show up without a redeploy.
export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const posts = await getInsightPosts();

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <Navbar />
      <main className="flex-1">
        <InsightsHero />
        <InsightsGrid posts={posts} />
        <InsightsClosingCTA />
      </main>
      <Footer />
    </div>
  );
}
