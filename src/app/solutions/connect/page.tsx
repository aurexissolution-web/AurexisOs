// src/app/solutions/connect/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { SETUP_TIERS } from '@/data/connect-config';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo';
import { Footer } from '@/components/layout/Footer';
import { NextSolution } from '@/components/sections/solutions/NextSolution';
import { ConnectHero } from '@/components/sections/connect/ConnectHero';
import { ConnectProblem } from '@/components/sections/connect/ConnectProblem';
import { ConnectSetupTiers } from '@/components/sections/connect/ConnectSetupTiers';
import { ConnectManagementPlans } from '@/components/sections/connect/ConnectManagementPlans';
import { ConnectBilling } from '@/components/sections/connect/ConnectBilling';
import { ConnectAddOns } from '@/components/sections/connect/ConnectAddOns';
import { ConnectQuoteForm } from '@/components/sections/connect/ConnectQuoteForm';
import { ConnectClosingTerms } from '@/components/sections/connect/ConnectClosingTerms';

const LOWEST = SETUP_TIERS[0].price.replace(/^From /, "");

export const metadata = {
  title: 'WhatsApp Business API | Connect by Aurexis Solution',
  description: `Connect by Aurexis Solution sets up the WhatsApp Business API for Malaysian businesses: capture, qualify, book and follow up on every enquiry. From ${LOWEST}.`,
  alternates: { canonical: '/solutions/connect' },
};

const JSON_LD = [
  serviceJsonLd({
    slug: 'connect',
    name: 'Connect',
    description: "Connect is Aurexis Solution's WhatsApp lead system: Meta-verified WhatsApp Business API, shared team inbox, automated follow-up and booking.",
    tiers: SETUP_TIERS.map((t) => ({ name: t.name, price: t.price })),
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Connect', path: '/solutions/connect' },
  ]),
];

export default function ConnectPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <JsonLd data={JSON_LD} />
      <Navbar />
      <main className="flex-1">
        <ConnectHero />
        <ConnectProblem />
        <ConnectSetupTiers />
        <ConnectManagementPlans />
        <ConnectBilling />
        <ConnectAddOns />
        <ConnectQuoteForm />
        <ConnectClosingTerms />
        <NextSolution current="/solutions/connect" />
      </main>
      <Footer />
    </div>
  );
}
