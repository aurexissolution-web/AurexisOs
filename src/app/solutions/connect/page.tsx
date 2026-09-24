// src/app/solutions/connect/page.tsx
import { Navbar } from '@/components/layout/Navbar';
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

export const metadata = {
  title: 'Connect — Aurexis Solution',
  description:
    'Connect is the WhatsApp side of Aurexis — from moving your business off a personal number, to a fully automated channel that captures, qualifies, books and follows up while you’re doing the work.',
};

export default function ConnectPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
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
