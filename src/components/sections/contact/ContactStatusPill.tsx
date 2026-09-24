// src/components/sections/contact/ContactStatusPill.tsx
'use client';

import { useEffect, useState } from 'react';
import { STUDIO_TIMEZONE } from '@/data/contact-config';

function formatKLTime(): string {
  return new Intl.DateTimeFormat('en-MY', {
    timeZone: STUDIO_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function ContactStatusPill() {
  const [time, setTime] = useState('--:--');

  useEffect(() => {
    setTime(formatKLTime());
    const id = setInterval(() => setTime(formatKLTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-flex items-center gap-2.5 backdrop-blur-md font-mono"
      style={{
        padding: '9px 16px',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.02)',
        fontSize: 10.5,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#94a3b8',
      }}
    >
      <span
        aria-hidden
        className="inline-block rounded-full motion-safe:animate-[contactRosterPulse_2.4s_ease-in-out_infinite]"
        style={{
          width: 7,
          height: 7,
          background: '#10B981',
          boxShadow: '0 0 8px #10B981',
        }}
      />
      <b style={{ color: '#10B981', fontWeight: 500 }}>Live</b>
      <span>· KL {time} MYT</span>
    </span>
  );
}
