// src/app/solutions/presence/page.tsx
import { Navbar } from '@/components/layout/Navbar';
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

export const metadata = {
  title: 'Presence — Aurexis Solution',
  description:
    'Presence is the website side of Aurexis — from a 3-page landing page to a custom web application built around how your business actually runs.',
};

export default function PresencePage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
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
