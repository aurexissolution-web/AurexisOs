// src/app/solutions/ai-readiness-audit/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { AUDIT_TIERS } from '@/data/audit-config';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo';
import { Footer } from '@/components/layout/Footer';
import { NextSolution } from '@/components/sections/solutions/NextSolution';
import { AuditHero } from '@/components/sections/audit/AuditHero';
import { AuditWhyThisExists } from '@/components/sections/audit/AuditWhyThisExists';
import { AuditTiers } from '@/components/sections/audit/AuditTiers';
import { AuditCreditWorks } from '@/components/sections/audit/AuditCreditWorks';
import { AuditGrantFunding } from '@/components/sections/audit/AuditGrantFunding';
import { AuditQuoteForm } from '@/components/sections/audit/AuditQuoteForm';
import { AuditClosingTerms } from '@/components/sections/audit/AuditClosingTerms';

const LOWEST = AUDIT_TIERS[0].price.replace(/^From /, "");

export const metadata = {
  title: 'AI Readiness Audit for SMEs | Aurexis Solution',
  description: `A short paid diagnostic from Aurexis Solution showing where AI actually helps your Malaysian business. Written roadmap, grant-fundable, from ${LOWEST}.`,
  alternates: { canonical: '/solutions/ai-readiness-audit' },
};

const JSON_LD = [
  serviceJsonLd({
    slug: 'ai-readiness-audit',
    name: 'AI Readiness Audit',
    description: "The AI Readiness Audit is Aurexis Solution's paid diagnostic: a ranked list of where AI helps a business, a written roadmap, and grant eligibility for HRD Corp and MSME Digital Grant.",
    tiers: AUDIT_TIERS.map((t) => ({ name: t.name, price: t.price })),
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'AI Readiness Audit', path: '/solutions/ai-readiness-audit' },
  ]),
];

export default function AiReadinessAuditPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <JsonLd data={JSON_LD} />
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
