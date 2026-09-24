// src/components/sections/contact/ContactHero.tsx
import { HERO_COPY, REPLY_WINDOW_LABEL } from '@/data/contact-config';
import { ContactStatusPill } from './ContactStatusPill';

const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

const RISE = 'motion-safe:opacity-0 motion-safe:animate-[contactRosterRise_0.8s_cubic-bezier(0.4,0,0.2,1)_forwards]';

export function ContactHero() {
  return (
    <section
      className="grid items-end gap-8 md:gap-16 grid-cols-1 md:grid-cols-[1fr_auto] pt-16 pb-14 md:pt-[88px] md:pb-20"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div>
        <p
          className={`${RISE} inline-flex items-center font-mono`}
          style={{
            animationDelay: '0.05s',
            fontSize: 11,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: '#00F0FF',
            margin: '0 0 32px',
            gap: 12,
          }}
        >
          <span aria-hidden style={{ width: 28, height: 1, background: '#00F0FF' }} />
          {HERO_COPY.eyebrow}
        </p>

        <h1
          className={RISE}
          style={{
            animationDelay: '0.12s',
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 'clamp(52px, 8vw, 116px)',
            lineHeight: 0.94,
            letterSpacing: '-0.045em',
            margin: '0 0 28px',
            color: '#f5f5f7',
            maxWidth: 920,
          }}
        >
          {HERO_COPY.titleLines[0]}
          <br />
          {HERO_COPY.titleLines[1]}
          <br />
          <span
            className="font-serif"
            style={{
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#00F0FF',
              letterSpacing: '-0.035em',
            }}
          >
            {HERO_COPY.titleClose.plain}{' '}{HERO_COPY.titleClose.italic}
          </span>{' '}
          <span
            style={{
              color: 'transparent',
              WebkitTextStroke: '1.5px #475569',
              padding: '0 2px',
            }}
          >
            {HERO_COPY.titleClose.stroke}
          </span>
          .
        </h1>

        <p
          className={RISE}
          style={{
            animationDelay: '0.25s',
            fontSize: 17,
            lineHeight: 1.55,
            color: '#94a3b8',
            maxWidth: 540,
            margin: 0,
          }}
        >
          {HERO_COPY.lede}
        </p>
      </div>

      <aside
        className={`${RISE} flex flex-col items-start md:items-end`}
        style={{ animationDelay: '0.32s', gap: 16, paddingBottom: 6 }}
      >
        <ContactStatusPill />
        <div className="text-left md:text-right">
          <div
            className="font-serif"
            style={{
              fontStyle: 'italic',
              fontSize: 64,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: '#00F0FF',
            }}
          >
            {REPLY_WINDOW_LABEL}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#475569',
              marginTop: 6,
            }}
          >
            Reply window
          </div>
        </div>
      </aside>
    </section>
  );
}
