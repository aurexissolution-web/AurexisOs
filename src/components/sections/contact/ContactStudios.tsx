// src/components/sections/contact/ContactStudios.tsx
import { STUDIOS } from '@/data/contact-config';
import { ContactStudioCard } from './ContactStudioCard';

const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactStudios() {
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
            Where we work
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
            Two studios.
            <br />
            One{' '}
            <span
              className="font-serif"
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#00F0FF',
                letterSpacing: '-0.03em',
              }}
            >
              handshake
            </span>{' '}
            away.
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
          We split the team between Kuala Lumpur and Sungai Petani — KL for client-facing work, SP for deep build. Walk-ins by appointment; coffee&rsquo;s on us.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[22px]">
        {STUDIOS.map((s) => (
          <ContactStudioCard key={s.city} studio={s} />
        ))}
      </div>
    </section>
  );
}
