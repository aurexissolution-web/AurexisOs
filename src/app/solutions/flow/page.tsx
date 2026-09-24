// src/app/solutions/flow/page.tsx
import { Navbar } from '@/components/layout/Navbar';
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

export const metadata = {
  title: 'Flow — Aurexis Solution',
  description:
    'Flow is the admin-automation side of Aurexis — from one workflow done properly, to the whole quote-to-cash cycle connected to your books, with LHDN e-Invoice onboarding built in.',
};

export default function FlowPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
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
