// src/app/solutions/core/page.tsx
import { Navbar } from '@/components/layout/Navbar';
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

export const metadata = {
  title: 'Core — Aurexis Solution',
  description:
    'Core is the custom-operations side of Aurexis — from one process properly systemised, to a full multi-branch operations platform built once, around your business, instead of stitched from five subscriptions.',
};

export default function CorePage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
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
