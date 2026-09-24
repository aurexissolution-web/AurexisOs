// src/components/sections/contact/ContactStudioCard.tsx
import Image from 'next/image';
import type { Studio } from '@/types/portal';
import { CHANNELS, STUDIO_HOURS } from '@/data/contact-config';
import { KLSkyline } from './KLSkyline';
import { SungaiPetaniSkyline } from './SungaiPetaniSkyline';

const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

const ACCENT_HEX: Record<Studio['accent'], string> = {
  cyan: '#00F0FF',
  violet: '#A78BFA',
};

function imageBg(accent: Studio['accent']): string {
  if (accent === 'cyan') {
    return [
      'linear-gradient(180deg, rgba(2,4,10,0) 0%, rgba(2,4,10,0.65) 100%)',
      'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,240,255,0.16), transparent 65%)',
      'linear-gradient(180deg, #0a1525 0%, #050a15 100%)',
    ].join(', ');
  }
  return [
    'linear-gradient(180deg, rgba(2,4,10,0) 0%, rgba(2,4,10,0.65) 100%)',
    'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(167,139,250,0.14), transparent 65%)',
    'linear-gradient(180deg, #0e0a1c 0%, #060410 100%)',
  ].join(', ');
}

export function ContactStudioCard({ studio }: { studio: Studio }) {
  const accentHex = ACCENT_HEX[studio.accent];
  const Skyline = studio.skyline === 'kl' ? KLSkyline : SungaiPetaniSkyline;

  return (
    <article
      className="contact-roster-studio overflow-hidden"
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.015)',
        transition: 'border-color 0.3s ease, transform 0.3s cubic-bezier(.4,.2,.2,1)',
        ['--accent' as string]: accentHex,
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{ height: 260, background: studio.imageSrc ? '#050a15' : imageBg(studio.accent) }}
      >
        {studio.imageSrc ? (
          <>
            <Image
              src={studio.imageSrc}
              alt={`${studio.city} — Aurexis studio`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, rgba(2,4,10,0.55) 0%, rgba(2,4,10,0.15) 35%, rgba(2,4,10,0.75) 100%), radial-gradient(ellipse 80% 70% at 50% 110%, ${accentHex}22, transparent 65%)`,
              }}
            />
          </>
        ) : (
          <Skyline />
        )}
        <span
          className="absolute z-[2] inline-flex items-center gap-2 backdrop-blur-md font-mono"
          style={{
            top: 18,
            left: 20,
            padding: '6px 11px',
            borderRadius: 999,
            background: 'rgba(2,4,10,0.55)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 9.5,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#cbd5e1',
          }}
        >
          <span
            aria-hidden
            className="inline-block rounded-full"
            style={{ width: 6, height: 6, background: accentHex, boxShadow: `0 0 5px ${accentHex}` }}
          />
          Studio · {studio.city}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col" style={{ padding: 26, gap: 18 }}>
        <p
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: accentHex,
            margin: 0,
          }}
        >
          {studio.role}
        </p>
        <h3
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 26,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#f5f5f7',
          }}
        >
          {studio.city},{' '}
          <span
            className="font-serif"
            style={{
              fontStyle: 'italic',
              fontWeight: 400,
              color: accentHex,
            }}
          >
            {studio.country}
          </span>
        </h3>
        <dl
          className="grid font-mono"
          style={{
            gridTemplateColumns: 'auto 1fr',
            gap: '8px 18px',
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 12,
            color: '#cbd5e1',
            margin: 0,
          }}
        >
          <dt style={{ color: '#475569', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 9.5, alignSelf: 'center' }}>Address</dt>
          <dd style={{ margin: 0 }}>
            {studio.address} · <span style={{ color: '#475569' }}>{studio.addressNote}</span>
          </dd>
          <dt style={{ color: '#475569', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 9.5, alignSelf: 'center' }}>Phone</dt>
          <dd style={{ margin: 0 }}>
            <a href={`tel:${CHANNELS.phone}`} style={{ color: '#f5f5f7', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 1 }}>{CHANNELS.phone}</a>
          </dd>
          <dt style={{ color: '#475569', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 9.5, alignSelf: 'center' }}>Email</dt>
          <dd style={{ margin: 0 }}>
            <a href={`mailto:${CHANNELS.email}`} style={{ color: '#f5f5f7', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 1 }}>{CHANNELS.email}</a>
          </dd>
        </dl>
        <p
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#475569',
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            margin: 0,
          }}
        >
          <span className="inline-flex items-center" style={{ color: '#10B981', gap: 7 }}>
            <span aria-hidden className="inline-block rounded-full" style={{ width: 5, height: 5, background: '#10B981', boxShadow: '0 0 5px #10B981' }} />
            Available by appointment
          </span>{' '}
          · {STUDIO_HOURS}
        </p>
      </div>
    </article>
  );
}
