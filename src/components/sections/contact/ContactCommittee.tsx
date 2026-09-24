// src/components/sections/contact/ContactCommittee.tsx
import { FOUNDERS } from '@/data/contact-config';
import { ContactFounderCard } from './ContactFounderCard';
import { ContactCommitteeCTA } from './ContactCommitteeCTA';

const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactCommittee() {
  return (
    <section
      className="py-16 md:py-24"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <header
        className="grid items-end grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-14 mb-10 md:mb-14"
      >
        <div>
          <p
            className="inline-flex items-center font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#00F0FF',
              margin: '0 0 14px',
              gap: 10,
            }}
          >
            <span aria-hidden style={{ width: 20, height: 1, background: '#00F0FF' }} />
            The Committee
          </p>
          <h2
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 'clamp(36px, 4.4vw, 60px)',
              lineHeight: 1,
              letterSpacing: '-0.035em',
              margin: 0,
              color: '#f5f5f7',
            }}
          >
            Founders take
            <br />
            every{' '}
            <span
              className="font-serif"
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#00F0FF',
                letterSpacing: '-0.03em',
              }}
            >
              first call.
            </span>
          </h2>
        </div>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: '#94a3b8',
            maxWidth: 540,
            margin: 0,
          }}
        >
          No SDRs. No &ldquo;discovery&rdquo; reps. The two of us split the room — one of us will be on your call, and the same person will be on the project if you proceed.{' '}
          <em
            className="font-serif"
            style={{
              color: '#f5f5f7',
              fontStyle: 'italic',
              fontSize: 18,
            }}
          >
            We do the work we sell.
          </em>
        </p>
      </header>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12 mx-auto w-full"
        style={{ maxWidth: 760 }}
      >
        {FOUNDERS.map((f) => (
          <ContactFounderCard key={f.name} founder={f} />
        ))}
      </div>

      <ContactCommitteeCTA />
    </section>
  );
}
