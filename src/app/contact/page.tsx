// src/app/contact/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ContactHero } from '@/components/sections/contact/ContactHero';
import { ContactCommittee } from '@/components/sections/contact/ContactCommittee';
import { ContactStudios } from '@/components/sections/contact/ContactStudios';
import { ContactBrief } from '@/components/sections/contact/ContactBrief';
import { ContactFAQ } from '@/components/sections/contact/ContactFAQ';

export const metadata = {
  title: 'Contact Aurexis Solution | Free 45-Min Call, Kuala Lumpur',
  description:
    'Three founders, two studios, one call away. Book a free 45-minute strategy session: we audit your stack, find the bottlenecks and hand you a roadmap.',
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
