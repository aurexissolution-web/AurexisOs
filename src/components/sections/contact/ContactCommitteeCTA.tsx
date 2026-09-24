// src/components/sections/contact/ContactCommitteeCTA.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CHANNELS, STRATEGY_SESSION_LEN_MIN, STUDIO_HOURS } from '@/data/contact-config';

const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactCommitteeCTA() {
  return (
    <div
      className="relative flex items-center justify-between flex-wrap overflow-hidden"
      style={{
        gap: 24,
        padding: '24px 28px',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14,
        background:
          'linear-gradient(135deg, rgba(0,240,255,0.06), rgba(0,240,255,0.02) 60%), rgba(255,255,255,0.015)',
      }}
    >
      {/* Top rim-light hairline */}
      <span
        aria-hidden
        className="absolute"
        style={{
          top: 0,
          left: '8%',
          right: '8%',
          height: 1,
          background:
            'linear-gradient(to right, transparent, rgba(0,240,255,0.6), transparent)',
        }}
      />

      <div className="flex items-baseline flex-wrap" style={{ gap: 14 }}>
        <span
          className="font-serif"
          style={{
            fontStyle: 'italic',
            fontSize: 24,
            lineHeight: 1.1,
            color: '#f5f5f7',
            letterSpacing: '-0.015em',
          }}
        >
          Book a {STRATEGY_SESSION_LEN_MIN}-min session with the committee.
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#64748b',
          }}
        >
          <span style={{ color: '#334155', marginRight: 10 }}>·</span>
          Free · Mutual NDA · {STUDIO_HOURS}
        </span>
      </div>

      <Link
        href={CHANNELS.bookingUrl}
        className="inline-flex items-center transition-all hover:-translate-y-0.5"
        style={{
          gap: 10,
          padding: '13px 22px',
          borderRadius: 10,
          background: '#00F0FF',
          color: '#02040A',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '-0.005em',
          textDecoration: 'none',
          flexShrink: 0,
          boxShadow: '0 6px 20px rgba(0,240,255,0.25)',
          transitionDuration: '0.25s',
        }}
      >
        Open the calendar
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
