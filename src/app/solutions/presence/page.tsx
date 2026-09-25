// src/app/solutions/presence/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { WEBSITE_TYPES } from '@/data/presence-config';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo';
import { Footer } from '@/components/layout/Footer';
import { NextSolution } from '@/components/sections/solutions/NextSolution';
import { PresenceHero } from '@/components/sections/presence/PresenceHero';
import { PresenceProblem } from '@/components/sections/presence/PresenceProblem';
import { PresenceWhatItIs } from '@/components/sections/presence/PresenceWhatItIs';
import { PresenceWebsiteTypes } from '@/components/sections/presence/PresenceWebsiteTypes';
import { PresenceAddOns } from '@/components/sections/presence/PresenceAddOns';
import { PresenceCarePlans } from '@/components/sections/presence/PresenceCarePlans';
import { PresenceWhoFor } from '@/components/sections/presence/PresenceWhoFor';
import { PresenceQuoteForm } from '@/components/sections/presence/PresenceQuoteForm';
import { PresenceClosingTerms } from '@/components/sections/presence/PresenceClosingTerms';

const LOWEST = WEBSITE_TYPES[0].price.replace(/^From /, "");

export const metadata = {
  title: 'Website Design in Malaysia | Presence by Aurexis Solution',
  description: `Presence by Aurexis Solution builds websites for Malaysian businesses: landing pages, business sites, stores and booking sites from ${LOWEST}. Fixed price.`,
  alternates: { canonical: '/solutions/presence' },
};

const JSON_LD = [
  serviceJsonLd({
    slug: 'presence',
    name: 'Presence',
    description: "Presence is Aurexis Solution's website service for Malaysian businesses: landing pages, business and corporate sites, online stores, booking sites, client portals and custom web applications.",
    tiers: WEBSITE_TYPES.map((t) => ({ name: t.name, price: t.price })),
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Presence', path: '/solutions/presence' },
  ]),
];

export default function PresencePage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <JsonLd data={JSON_LD} />
      <Navbar />
      <main className="flex-1">
        <PresenceHero />
        <PresenceProblem />
        <PresenceWhatItIs />
        <PresenceWebsiteTypes />
        <PresenceAddOns />
        <PresenceCarePlans />
        <PresenceWhoFor />
        <PresenceQuoteForm />
        <PresenceClosingTerms />
        <NextSolution current="/solutions/presence" />
      </main>
      <Footer />
    </div>
  );
}
