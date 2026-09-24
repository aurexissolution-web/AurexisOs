// src/app/contact/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ContactHero } from '@/components/sections/contact/ContactHero';
import { ContactCommittee } from '@/components/sections/contact/ContactCommittee';
import { ContactStudios } from '@/components/sections/contact/ContactStudios';
import { ContactBrief } from '@/components/sections/contact/ContactBrief';
import { ContactFAQ } from '@/components/sections/contact/ContactFAQ';

export const metadata = {
  title: 'Contact — Aurexis Solution',
  description:
    'Three founders, two studios, one call away. Book a 45-minute strategy session — we audit your stack, surface the bottlenecks, and walk you out with a real roadmap.',
};

export default function ContactPage() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: '#02040A', color: '#f5f5f7' }}
    >
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
          <ContactHero />
          <ContactCommittee />
          <ContactStudios />
          <ContactBrief />
          <ContactFAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
}
