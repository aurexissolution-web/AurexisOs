// src/app/solutions/ai-readiness-audit/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NextSolution } from '@/components/sections/solutions/NextSolution';
import { AuditHero } from '@/components/sections/audit/AuditHero';
import { AuditWhyThisExists } from '@/components/sections/audit/AuditWhyThisExists';
import { AuditTiers } from '@/components/sections/audit/AuditTiers';
import { AuditCreditWorks } from '@/components/sections/audit/AuditCreditWorks';
import { AuditGrantFunding } from '@/components/sections/audit/AuditGrantFunding';
import { AuditQuoteForm } from '@/components/sections/audit/AuditQuoteForm';
import { AuditClosingTerms } from '@/components/sections/audit/AuditClosingTerms';

export const metadata = {
  title: 'AI Readiness Audit — Aurexis Solution',
  description:
    'A short paid diagnostic that maps where AI actually helps in your business — and where it doesn’t. Written roadmap, grant-fundable, credited against a Core build if you decide to go ahead.',
};

export default function AiReadinessAuditPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <Navbar />
      <main className="flex-1">
        <AuditHero />
        <AuditWhyThisExists />
        <AuditTiers />
        <AuditCreditWorks />
        <AuditGrantFunding />
        <AuditQuoteForm />
        <AuditClosingTerms />
        <NextSolution current="/solutions/ai-readiness-audit" />
      </main>
      <Footer />
    </div>
  );
}
