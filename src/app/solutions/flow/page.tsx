// src/app/solutions/flow/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { SETUP_TIERS } from '@/data/flow-config';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo';
import { Footer } from '@/components/layout/Footer';
import { NextSolution } from '@/components/sections/solutions/NextSolution';
import { FlowHero } from '@/components/sections/flow/FlowHero';
import { FlowProblem } from '@/components/sections/flow/FlowProblem';
import { FlowSetupTiers } from '@/components/sections/flow/FlowSetupTiers';
import { FlowManagementPlans } from '@/components/sections/flow/FlowManagementPlans';
import { FlowCompliance } from '@/components/sections/flow/FlowCompliance';
import { FlowAddOns } from '@/components/sections/flow/FlowAddOns';
import { FlowQuoteForm } from '@/components/sections/flow/FlowQuoteForm';
import { FlowClosingTerms } from '@/components/sections/flow/FlowClosingTerms';

const LOWEST = SETUP_TIERS[0].price.replace(/^From /, "");

export const metadata = {
  title: 'Business Automation in Malaysia | Flow by Aurexis Solution',
  description: `Flow by Aurexis Solution automates quotes, invoices, approvals and admin for Malaysian SMEs, with LHDN e-Invoice onboarding built in. From ${LOWEST}.`,
  alternates: { canonical: '/solutions/flow' },
};

const JSON_LD = [
  serviceJsonLd({
    slug: 'flow',
    name: 'Flow',
    description: "Flow is Aurexis Solution's admin automation service: quote-to-cash workflows connected to your accounting software, with LHDN e-Invoice onboarding.",
    tiers: SETUP_TIERS.map((t) => ({ name: t.name, price: t.price })),
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Flow', path: '/solutions/flow' },
  ]),
];

export default function FlowPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <JsonLd data={JSON_LD} />
      <Navbar />
      <main className="flex-1">
        <FlowHero />
        <FlowProblem />
        <FlowSetupTiers />
        <FlowManagementPlans />
        <FlowCompliance />
        <FlowAddOns />
        <FlowQuoteForm />
        <FlowClosingTerms />
        <NextSolution current="/solutions/flow" />
      </main>
      <Footer />
    </div>
  );
}
