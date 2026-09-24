// src/components/sections/contact/ContactFounderCard.tsx
import Image from 'next/image';
import type { Founder, ContactAccent } from '@/types/portal';

const ACCENT_HEX: Record<ContactAccent, string> = {
  cyan: '#00F0FF',
  violet: '#A78BFA',
  'cyan-mix': '#00F0FF',
};

function portraitBg(accent: ContactAccent): string {
  if (accent === 'cyan') {
    return [
      'radial-gradient(ellipse 40% 35% at 50% 38%, rgba(255,255,255,0.10), transparent 70%)',
      'radial-gradient(ellipse 80% 100% at 50% 110%, rgba(0,240,255,0.30), transparent 60%)',
      'linear-gradient(180deg, #0e1a2c 0%, #050b16 100%)',
    ].join(', ');
  }
  if (accent === 'violet') {
    return [
      'radial-gradient(ellipse 40% 35% at 50% 38%, rgba(255,255,255,0.10), transparent 70%)',
      'radial-gradient(ellipse 80% 100% at 50% 110%, rgba(167,139,250,0.30), transparent 60%)',
      'linear-gradient(180deg, #181030 0%, #0a0820 100%)',
    ].join(', ');
  }
  // cyan-mix
  return [
    'radial-gradient(ellipse 40% 35% at 50% 38%, rgba(255,255,255,0.08), transparent 70%)',
    'radial-gradient(ellipse 80% 100% at 50% 110%, rgba(0,240,255,0.20), transparent 65%)',
    'radial-gradient(ellipse 50% 50% at 70% 30%, rgba(167,139,250,0.18), transparent 60%)',
    'linear-gradient(180deg, #12162a 0%, #060914 100%)',
  ].join(', ');
}

export function ContactFounderCard({ founder }: { founder: Founder }) {
  const accentHex = ACCENT_HEX[founder.accent];

  return (
    <article
      className="contact-roster-founder flex flex-col overflow-hidden"
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.015)',
        transition:
          'border-color 0.35s ease, transform 0.35s cubic-bezier(.4,.2,.2,1), box-shadow 0.35s ease',
        ['--accent' as string]: accentHex,
      }}
    >
      {/* Portrait area */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: '1 / 1',
          background: portraitBg(founder.accent),
          backgroundColor: '#0a1020',
        }}
      >
        {founder.imageSrc ? (
          <Image
            src={founder.imageSrc}
            alt={founder.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 50vw, 370px"
          />
        ) : (
          <span
            aria-hidden
            className="contact-roster-founder-initials absolute inset-0 flex items-center justify-center font-serif"
            style={{
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(80px, 11vw, 140px)',
              letterSpacing: '-0.04em',
              color: 'rgba(255,255,255,0.18)',
              transition: 'color 0.4s ease, transform 0.4s cubic-bezier(.4,.2,.2,1)',
            }}
          >
            {founder.initials}
          </span>
        )}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            opacity: founder.imageSrc ? 0.18 : 0.45,
            mixBlendMode: 'overlay',
          }}
        />
        {founder.imageSrc && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{
              height: '40%',
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(2,4,10,0.55) 100%)',
            }}
          />
        )}
        {/* Available pill */}
        {founder.available && (
          <span
            className="absolute z-[2] inline-flex items-center gap-2 backdrop-blur-md font-mono"
            style={{
              top: 14,
              right: 14,
              padding: '5px 11px',
              borderRadius: 999,
              background: 'rgba(2,4,10,0.55)',
              border: '1px solid rgba(255,255,255,0.10)',
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#cbd5e1',
            }}
          >
            <span
              aria-hidden
              className="inline-block rounded-full"
              style={{
                width: 5,
                height: 5,
                background: '#10B981',
                boxShadow: '0 0 5px #10B981',
              }}
            />
            Available
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col" style={{ padding: '22px 22px 24px', gap: 14 }}>
        <p
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: accentHex,
            margin: 0,
          }}
        >
          {founder.role}
        </p>
        <h3
          className="font-serif"
          style={{
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 30,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#f5f5f7',
          }}
        >
          {founder.name}
        </h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: '#94a3b8', margin: 0 }}>
          {founder.blurb}
        </p>
        <p
          className="font-mono"
          style={{
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11,
            letterSpacing: '0.04em',
            color: '#64748b',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          <b style={{ color: accentHex, fontWeight: 500 }}>Brings to the call →</b>{' '}
          {founder.brings}
        </p>
      </div>
    </article>
  );
}
