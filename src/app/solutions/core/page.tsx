// src/app/solutions/core/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { SETUP_TIERS } from '@/data/core-config';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo';
import { Footer } from '@/components/layout/Footer';
import { NextSolution } from '@/components/sections/solutions/NextSolution';
import { CoreHero } from '@/components/sections/core/CoreHero';
import { CoreProblem } from '@/components/sections/core/CoreProblem';
import { CoreBuildVsBuy } from '@/components/sections/core/CoreBuildVsBuy';
import { CoreSetupTiers } from '@/components/sections/core/CoreSetupTiers';
import { CoreCarePlans } from '@/components/sections/core/CoreCarePlans';
import { CoreAddOns } from '@/components/sections/core/CoreAddOns';
import { CoreQuoteForm } from '@/components/sections/core/CoreQuoteForm';
import { CoreClosingTerms } from '@/components/sections/core/CoreClosingTerms';

const LOWEST = SETUP_TIERS[0].price.replace(/^From /, "");

export const metadata = {
  title: 'Custom Business Software | Core by Aurexis Solution',
  description: `Core by Aurexis Solution builds custom operations systems for Malaysian businesses, so you stop stitching five subscriptions together. From ${LOWEST}.`,
  alternates: { canonical: '/solutions/core' },
};

const JSON_LD = [
  serviceJsonLd({
    slug: 'core',
    name: 'Core',
    description: "Core is Aurexis Solution's custom operations platform: job tracking, inventory, booking and reporting built once around how your business runs.",
    tiers: SETUP_TIERS.map((t) => ({ name: t.name, price: t.price })),
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Core', path: '/solutions/core' },
  ]),
];

export default function CorePage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <JsonLd data={JSON_LD} />
      <Navbar />
      <main className="flex-1">
        <CoreHero />
        <CoreProblem />
        <CoreBuildVsBuy />
        <CoreSetupTiers />
        <CoreCarePlans />
        <CoreAddOns />
        <CoreQuoteForm />
        <CoreClosingTerms />
        <NextSolution current="/solutions/core" />
      </main>
      <Footer />
    </div>
  );
}
