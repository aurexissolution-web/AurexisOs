// src/components/sections/contact/ContactBrief.tsx
import { ContactBriefForm } from './ContactBriefForm';

const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

const CHECKS = [
  'Reply within a working day, every time.',
  'Mutual NDA from the first message if you ask for one.',
  'Free 45-minute strategy session before any quote.',
  'If we\'re not a fit, we point you at someone who is.',
];

export function ContactBrief() {
  return (
    <section
      id="brief"
      className="py-16 md:py-24"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="grid items-start grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14">
        <aside>
          <h2
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 'clamp(36px, 4.4vw, 60px)',
              lineHeight: 1,
              letterSpacing: '-0.035em',
              margin: '0 0 18px',
              color: '#f5f5f7',
            }}
          >
            Send us
            <br />a{' '}
            <span
              className="font-serif"
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#00F0FF',
              }}
            >
              brief.
            </span>
          </h2>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.6,
              color: '#94a3b8',
              margin: '0 0 28px',
            }}
          >
            Whatever you have — an idea, a doc, a 90-second voice note. We&rsquo;ll come back with real questions, not a sales deck.
          </p>
          <ul className="flex flex-col list-none" style={{ padding: 0, margin: 0, gap: 12 }}>
            {CHECKS.map((c) => (
              <li
                key={c}
                className="flex relative"
                style={{
                  fontSize: 13.5,
                  color: '#cbd5e1',
                  lineHeight: 1.5,
                  paddingLeft: 26,
                }}
              >
                <span
                  aria-hidden
                  className="absolute flex items-center justify-center"
                  style={{
                    left: 0,
                    top: 3,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: '1px solid #00F0FF',
                    background: 'rgba(0,240,255,0.12)',
                    color: '#00F0FF',
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  ✓
                </span>
                {c}
              </li>
            ))}
          </ul>
        </aside>

        <div
          className="relative overflow-hidden p-5 sm:p-8"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005)), rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 16,
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          }}
        >
          <span
            aria-hidden
            className="absolute"
            style={{
              top: 0,
              left: '8%',
              right: '8%',
              height: 1,
              background:
                'linear-gradient(to right, transparent, rgba(0,240,255,0.45), transparent)',
            }}
          />
          <ContactBriefForm />
        </div>
      </div>
    </section>
  );
}
