# Contact Aurora Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/contact` with the approved "Aurora Hero" editorial layout — server-rendered with surgical client islands, real Cal.com booking embed, agenda + outcomes + alt-paths + FAQ + testimonial + directory + footer, all strictly within the Aurexis brand palette.

**Architecture:** Thin server-component composer in `src/app/contact/page.tsx` wires 13 section components in `src/components/sections/contact/`. Only four are `"use client"` (StatusPill clock, CalEmbed iframe, CopyButton clipboard — sticky nav is pure CSS server). All static content lives in `src/data/contact-config.ts`. Aurora background, dot pulse, scroll cue, and FAQ toggle are pure CSS keyframes in `globals.css`.

**Tech Stack:** Next.js 16 App Router · React 19 server components · TypeScript strict · Tailwind 4 + inline styles · `@calcom/embed-react` (already a dep).

**Spec:** [docs/superpowers/specs/2026-05-20-contact-aurora-redesign-design.md](docs/superpowers/specs/2026-05-20-contact-aurora-redesign-design.md)

**Mockup (frozen):** [.superpowers/brainstorm/contact-2026-05-20/content/direction-h-aurora.html](.superpowers/brainstorm/contact-2026-05-20/content/direction-h-aurora.html) — server still running at `http://localhost:6034/direction-h-aurora.html`.

---

## Project conventions (read once before starting)

- **No automatic commits.** Per `CLAUDE.md`, do not commit unless the user explicitly says so. Each task ends with an *optional* commit step — execute it only if the user has approved committing for this session.
- **No test runner.** This codebase has no unit-test framework wired up. Verification per task is `npm run lint` + `npm run build` + (where relevant) opening `http://localhost:3001/contact` in the browser.
- **Fonts.** CSS vars live in `src/app/globals.css`: `--font-instrument-serif`, `--font-plus-jakarta`, `--font-geist-mono`. Use them via inline `style={{ fontFamily: 'var(--font-instrument-serif)' }}` — Tailwind utilities for these vars are not defined.
- **Server components by default.** Add `"use client"` only to the four files explicitly marked client below. No hooks, no event handlers in JSX in server components.
- **The mockup hand-renders a fake Cal.com calendar.** In production we render `<Cal />` from `@calcom/embed-react` and let it paint its own UI. Do NOT transcribe the mockup's `.h-cal-grid` / `.h-slots` / `.h-cal-foot` HTML into the real component — they're visual stand-ins only.
- **The page does NOT use the site-wide `<Navbar />` or `<Footer />`.** Use the new `ContactStickyNav` and `ContactFooter` instead. This is intentional per the spec.

---

## Task 1: Create `contact-config.ts`

**Files:**
- Create: `src/data/contact-config.ts`

- [ ] **Step 1: Read the FAQ + agenda + outcomes copy from the mockup**

Open `.superpowers/brainstorm/contact-2026-05-20/content/direction-h-aurora.html` and find the four `<details>` blocks and the `<ul>` lists inside `.h-panel-block`. The exact strings are quoted verbatim below.

- [ ] **Step 2: Write the config file**

```ts
// src/data/contact-config.ts
export const STRATEGY_SESSION_LENGTH_MIN = 45;
export const STUDIO_HOURS = 'Mon–Fri · 10–18 MYT';
export const STUDIO_TIMEZONE = 'Asia/Kuala_Lumpur';

// Cal.com — same as the existing /contact page
export const CAL_NAMESPACE = 'strategy-session';
export const CAL_LINK = 'aurexis-solution/45min';
export const CAL_BRAND_COLOR = '#00F0FF';

// Channels. Fallback to hardcoded values if env vars not set.
const WA_DIGITS = process.env.NEXT_PUBLIC_AUREXIS_WHATSAPP || '60164071129';
export const CHANNELS = {
  email: 'aurexissolution@gmail.com',
  phone: '+60164071129',
  phoneDigits: WA_DIGITS,
  whatsappUrl: `https://wa.me/${WA_DIGITS}`,
  // Set telegramHandle to null to hide the Telegram button at build time.
  telegramHandle: 'aurexissolution' as string | null,
} as const;

export const STUDIOS = [
  { city: 'Kuala Lumpur', country: 'Malaysia' },
  { city: 'Sungai Petani', country: 'Kedah' },
] as const;

export const HERO = {
  kicker: 'Booking — 45 min strategy session',
  titleLineOne: 'Open',
  titleLineTwo: 'a project.',
  sub: 'Forty-five free minutes. We audit your stack, surface the bottlenecks, and walk you out with a real roadmap.',
  primaryCta: 'Book a session',
  secondaryCta: 'WhatsApp now',
};

export interface TrustedByEntry { name: string; style: 'serif' | 'sans' }
export const TRUSTED_BY: ReadonlyArray<TrustedByEntry> = [
  { name: 'Orbital', style: 'serif' },
  { name: 'LUMEO', style: 'sans' },
  { name: 'ClearSky', style: 'serif' },
  { name: 'NYX', style: 'sans' },
  { name: 'Aroma', style: 'serif' },
  { name: 'MIRA POS', style: 'sans' },
];

export const AGENDA: ReadonlyArray<string> = [
  'Walk through your stack — data, infra, AI, surfaces.',
  'Pinpoint the bottleneck quietly costing you the most.',
  'Map the next 3 moves — what to build, what to delete.',
];
export const OUTCOMES: ReadonlyArray<string> = [
  'A written audit summary in your inbox within 24h.',
  "An honest read on whether we're a fit — or who is.",
  'A concrete next-step plan, even if you never hire us.',
];

export const PRE_CALL_BRIEF =
  "You'll get a 3-question form by email immediately after booking. It takes ~90 seconds and means we walk into the call with context, not introductions.";

export const FAQ_ITEMS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Is the 45-minute call really free?',
    a: 'Yes — no charge, no "trial" pricing, no card needed. We treat it as our cost of qualifying the engagement. If we\'re not the right shop for your work, we\'ll point you somewhere that is.',
  },
  {
    q: "What if I'm just exploring and not ready to hire?",
    a: "Then exploring is exactly what the session is for. We'd rather help you sharpen the problem now than sell you the wrong solution later. About a third of the sessions we run end with us recommending you don't hire anyone yet.",
  },
  {
    q: "What if I'm not technical?",
    a: "Fine. We translate. The pre-call brief asks plain questions, and on the call we keep the language out of the way. You don't need to know what the words mean — you just need to know what you're trying to ship.",
  },
  {
    q: "Who'll be on the other end of the call?",
    a: "One of our two founding engineers. No SDRs, no \"discovery\" reps. The person on the call is the one who'll be on the project if you proceed.",
  },
];

export const TESTIMONIAL = {
  quote:
    "They walked us through every bottleneck in the first call. By the end, we had a roadmap our own team couldn't have written.",
  emphasis: 'Three weeks later we were shipping again.',
  author: 'Maya R.',
  role: 'Head of Product',
  company: 'Orbital Treasury',
};

export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/aurexissolution?igsh=eTJsb3J3aG9wcHc4&utm_source=qr',
  },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/aurexissolution/' },
  { label: 'X', href: 'https://x.com/aurexissolution?s=21' },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/18HRuAqL75/?mibextid=wwXIfr',
  },
];

export const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Work', href: '/portfolio' },
  { label: 'Services', href: '/services' },
  { label: 'Lab', href: '/the-lab' },
  { label: 'Contact', href: '#book' },
];
```

- [ ] **Step 3: Verify lint**

Run from `/Users/sanjaygunabalan2626gmail.com/Documents/AurexisOS`: `npm run lint`
Expected: clean (file has no consumers yet).

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/data/contact-config.ts
git commit -m "feat(contact): add static config (channels, FAQ, agenda, etc.)"
```

---

## Task 2: Append CSS to `globals.css`

**Files:**
- Modify: `src/app/globals.css` (append to end)

- [ ] **Step 1: Check for existing keyframe collisions**

Run from the project root:
```bash
grep -cE "@keyframes (contactAurora|contactPulse|contactScroll|contactFaqOpen)" src/app/globals.css
```
Expected: `0`. If non-zero, read the file and ensure the existing definitions match what we're about to add; otherwise pick non-clashing names.

- [ ] **Step 2: Append the new keyframes + small utility classes**

Append to the END of `src/app/globals.css`:

```css

/* ── /contact aurora keyframes ────────────────────────── */
@keyframes contactAurora1 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(120px, -80px) scale(1.15); }
}
@keyframes contactAurora2 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(-100px, 100px) scale(1.1); }
}
@keyframes contactAurora3 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(80px, -60px) scale(1.2); }
}
@keyframes contactAurora4 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(-70px, 90px) scale(1.08); }
}

/* ── /contact dot pulse (status pill, alt-buttons) ───── */
@keyframes contactPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ── /contact scroll cue (the line that drops) ───────── */
@keyframes contactScrollCue {
  0%   { transform: translateY(-8px); opacity: 0; }
  30%  { opacity: 1; }
  100% { transform: translateY(0); opacity: 0; }
}

/* ── /contact FAQ accordion: native <details> chevron ── */
.contact-faq details summary { list-style: none; }
.contact-faq details summary::-webkit-details-marker { display: none; }
.contact-faq details summary .contact-faq-toggle {
  transition: transform 0.25s ease, color 0.25s ease;
}
.contact-faq details[open] summary .contact-faq-toggle {
  transform: rotate(45deg);
  color: #00F0FF;
}
```

- [ ] **Step 3: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/app/globals.css
git commit -m "feat(contact): add aurora + pulse + scroll-cue + faq CSS"
```

---

## Task 3: Create `ContactStickyNav`

**Files:**
- Create: `src/components/sections/contact/ContactStickyNav.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactStickyNav.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NAV_LINKS } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

export function ContactStickyNav() {
  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 backdrop-blur-xl backdrop-saturate-150"
      style={{
        padding: '10px 14px 10px 22px',
        background: 'rgba(2,4,10,0.72)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 999,
        boxShadow:
          '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}
    >
      <Link
        href="/"
        className="text-white"
        style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, letterSpacing: '-0.01em', textTransform: 'none' }}
      >
        <span style={{ color: '#00F0FF' }}>✦ </span>
        Aurexis
      </Link>

      <ul className="hidden md:flex gap-[22px] list-none m-0 p-0">
        {NAV_LINKS.filter((l) => l.href !== '#book').map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[#94a3b8] hover:text-white transition-colors no-underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="#book"
        className="inline-flex items-center gap-2 font-bold no-underline transition-shadow"
        style={{
          padding: '8px 16px',
          background: '#00F0FF',
          color: '#02040A',
          borderRadius: 999,
          letterSpacing: '0.08em',
          boxShadow: '0 0 16px rgba(0,240,255,0.4)',
        }}
      >
        Book
        <ArrowRight className="w-3 h-3" style={{ fontFamily: SERIF }} />
      </Link>
    </nav>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean. Component compiles even though no page imports it yet.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactStickyNav.tsx
git commit -m "feat(contact): add sticky glass nav with persistent Book CTA"
```

---

## Task 4: Create `ContactAurora`

**Files:**
- Create: `src/components/sections/contact/ContactAurora.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactAurora.tsx

/**
 * Four mix-blend-mode: screen orbs that drift behind the hero.
 * Pure CSS — keyframes live in globals.css (contactAurora1..4).
 * Wrapped in motion-safe so reduced-motion users see a static aurora.
 */
export function ContactAurora() {
  return (
    <>
      <div
        aria-hidden
        className="absolute pointer-events-none z-0"
        style={{
          inset: '-20%',
          filter: 'blur(80px)',
          opacity: 0.9,
        }}
      >
        <span
          className="absolute rounded-full motion-safe:animate-[contactAurora1_22s_ease-in-out_infinite_alternate]"
          style={{
            top: '10%',
            left: '5%',
            width: '60%',
            height: '50%',
            background: 'radial-gradient(circle, #00F0FF, transparent 60%)',
            mixBlendMode: 'screen',
          }}
        />
        <span
          className="absolute rounded-full motion-safe:animate-[contactAurora2_26s_ease-in-out_infinite_alternate]"
          style={{
            top: '30%',
            right: '5%',
            width: '55%',
            height: '55%',
            background: 'radial-gradient(circle, #7C3AED, transparent 60%)',
            mixBlendMode: 'screen',
          }}
        />
        <span
          className="absolute rounded-full motion-safe:animate-[contactAurora3_32s_ease-in-out_infinite_alternate]"
          style={{
            bottom: '5%',
            left: '25%',
            width: '45%',
            height: '40%',
            background: 'radial-gradient(circle, #F59E0B, transparent 60%)',
            mixBlendMode: 'screen',
            opacity: 0.55,
          }}
        />
        <span
          className="absolute rounded-full motion-safe:animate-[contactAurora4_28s_ease-in-out_infinite_alternate]"
          style={{
            top: '5%',
            right: '25%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(circle, #A78BFA, transparent 60%)',
            mixBlendMode: 'screen',
            opacity: 0.55,
          }}
        />
      </div>

      {/* Vignette: fade edges to bg color */}
      <span
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, #02040A 90%)',
        }}
      />

      {/* Grain texture */}
      <span
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          opacity: 0.35,
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactAurora.tsx
git commit -m "feat(contact): add animated aurora background"
```

---

## Task 5: Create `ContactStatusPill`

**Files:**
- Create: `src/components/sections/contact/ContactStatusPill.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactStatusPill.tsx
'use client';

import { useEffect, useState } from 'react';
import { STUDIO_TIMEZONE } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';

function formatKLTime(): string {
  return new Intl.DateTimeFormat('en-MY', {
    timeZone: STUDIO_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function ContactStatusPill() {
  // Server render shows placeholder `--:--` to avoid hydration mismatch;
  // useEffect populates the real time on mount and refreshes every 60s.
  const [time, setTime] = useState('--:--');

  useEffect(() => {
    setTime(formatKLTime());
    const interval = setInterval(() => setTime(formatKLTime()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute top-8 right-8 z-[5] inline-flex items-center gap-2.5 backdrop-blur-md"
      style={{
        padding: '8px 14px',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 999,
        background: 'rgba(2,4,10,0.4)',
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: '#94a3b8',
      }}
    >
      <span
        aria-hidden
        className="inline-block rounded-full motion-safe:animate-[contactPulse_2s_infinite]"
        style={{
          width: 7,
          height: 7,
          background: '#00F0FF',
          boxShadow: '0 0 10px #00F0FF',
        }}
      />
      <span style={{ color: '#00F0FF' }}>Live</span>
      <span> · KL {time} MYT · Available</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactStatusPill.tsx
git commit -m "feat(contact): add live KL-time status pill (client island)"
```

---

## Task 6: Create `ContactTrustedBy`

**Files:**
- Create: `src/components/sections/contact/ContactTrustedBy.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactTrustedBy.tsx
import { TRUSTED_BY } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactTrustedBy() {
  return (
    <div className="relative z-[4] mt-16 text-center">
      <p
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: '#475569',
          marginBottom: 16,
        }}
      >
        Trusted by founders shipping at
      </p>
      <div className="flex items-center justify-center flex-wrap" style={{ gap: '36px 48px', opacity: 0.6 }}>
        {TRUSTED_BY.map(({ name, style }) => (
          <span
            key={name}
            style={
              style === 'serif'
                ? { fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: '#cbd5e1', letterSpacing: '-0.01em' }
                : { fontFamily: SANS, fontWeight: 800, fontSize: 18, color: '#cbd5e1', letterSpacing: '-0.02em', textTransform: 'uppercase' }
            }
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactTrustedBy.tsx
git commit -m "feat(contact): add trusted-by logo strip"
```

---

## Task 7: Create `ContactHero`

**Files:**
- Create: `src/components/sections/contact/ContactHero.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactHero.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CHANNELS, HERO } from '@/data/contact-config';
import { ContactAurora } from './ContactAurora';
import { ContactStatusPill } from './ContactStatusPill';
import { ContactTrustedBy } from './ContactTrustedBy';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactHero() {
  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: '100vh', padding: '80px 32px 60px' }}
    >
      <ContactAurora />
      <ContactStatusPill />

      <div className="relative z-[4] text-center" style={{ maxWidth: 1100 }}>
        <p
          className="inline-flex items-center"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#00F0FF',
            marginBottom: 32,
            gap: 14,
          }}
        >
          <span style={{ color: '#475569' }}>—</span>
          {HERO.kicker}
          <span style={{ color: '#475569' }}>—</span>
        </p>

        <h1
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 'clamp(80px, 13vw, 184px)',
            lineHeight: 0.88,
            letterSpacing: '-0.05em',
            margin: '0 0 28px',
            color: '#f5f5f7',
          }}
        >
          {HERO.titleLineOne}
          <br />
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              backgroundImage:
                'linear-gradient(120deg, #00F0FF, #A78BFA 60%, #FBBF24)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {HERO.titleLineTwo}
          </span>
        </h1>

        <p
          className="mx-auto"
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 'clamp(20px, 2.4vw, 28px)',
            color: '#cbd5e1',
            maxWidth: 620,
            margin: '0 auto 44px',
            lineHeight: 1.4,
          }}
        >
          Forty-five free minutes. We audit your stack, surface the bottlenecks, and walk you out with{' '}
          <b style={{ color: '#f5f5f7', fontWeight: 400 }}>a real roadmap</b>.
        </p>

        <div className="inline-flex items-center flex-wrap justify-center" style={{ gap: 18 }}>
          <Link
            href="#book"
            className="inline-flex items-center font-bold no-underline transition-transform hover:-translate-y-0.5"
            style={{
              gap: 14,
              padding: '18px 32px',
              background: '#00F0FF',
              color: '#02040A',
              borderRadius: 999,
              fontFamily: SANS,
              fontSize: 16,
              letterSpacing: '-0.01em',
              boxShadow: '0 8px 24px rgba(0,240,255,0.35), 0 0 60px rgba(0,240,255,0.25)',
            }}
          >
            {HERO.primaryCta}
            <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href={CHANNELS.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center backdrop-blur-md no-underline transition-colors"
            style={{
              gap: 8,
              padding: '16px 22px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f5f5f7',
              borderRadius: 999,
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <span
              aria-hidden
              className="inline-block rounded-full"
              style={{
                width: 14,
                height: 14,
                background: '#25D366',
                boxShadow: '0 0 8px rgba(37,211,102,0.5)',
              }}
            />
            {HERO.secondaryCta}
          </a>
        </div>
      </div>

      <ContactTrustedBy />

      {/* Scroll cue */}
      <div
        className="absolute z-[5] flex flex-col items-center"
        style={{
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          gap: 8,
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#475569',
        }}
      >
        Scroll for the calendar
        <span
          aria-hidden
          className="motion-safe:animate-[contactScrollCue_2.4s_ease-in-out_infinite]"
          style={{
            width: 1,
            height: 28,
            background: 'linear-gradient(to bottom, #475569, transparent)',
          }}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactHero.tsx
git commit -m "feat(contact): add hero composer (aurora + headline + CTA + trusted-by)"
```

---

## Task 8: Create `ContactCalEmbed`

**Files:**
- Create: `src/components/sections/contact/ContactCalEmbed.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactCalEmbed.tsx
'use client';

import { useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { CAL_BRAND_COLOR, CAL_LINK, CAL_NAMESPACE } from '@/data/contact-config';

/**
 * Editorial frame around the Cal.com iframe.
 *
 * IMPORTANT: Cal.com's iframe paints its own month picker, slot list, and
 * footer. We do NOT reimplement that UI — the mockup's fake calendar grid is
 * just a visual stand-in. This component is purely a styled wrapper +
 * `<Cal />` mount.
 */
export function ContactCalEmbed() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal('ui', {
        styles: { branding: { brandColor: CAL_BRAND_COLOR } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);

  return (
    <div
      className="backdrop-blur-md"
      style={{
        background: 'rgba(2,4,10,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 22,
        minHeight: 540,
      }}
    >
      <Cal
        namespace={CAL_NAMESPACE}
        calLink={CAL_LINK}
        style={{ width: '100%', height: '100%', minHeight: 500, overflow: 'auto' }}
        config={{ layout: 'month_view', hideEventTypeDetails: 'false' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean. The build will succeed without env vars because `@calcom/embed-react` is a pure UI dep — no server-side init.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactCalEmbed.tsx
git commit -m "feat(contact): add Cal.com embed wrapped in editorial frame"
```

---

## Task 9: Create `ContactBookingSidebar`

**Files:**
- Create: `src/components/sections/contact/ContactBookingSidebar.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactBookingSidebar.tsx
import { AGENDA, OUTCOMES, PRE_CALL_BRIEF } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

function Block({
  label,
  heading,
  items,
  bulletColor,
}: {
  label: string;
  heading: string;
  items: ReadonlyArray<string>;
  bulletColor: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.015)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 22,
      }}
    >
      <h3
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 22,
          lineHeight: 1.1,
          letterSpacing: '-0.015em',
          margin: '0 0 14px',
          color: '#f5f5f7',
        }}
      >
        <span
          style={{
            fontStyle: 'normal',
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#00F0FF',
            marginRight: 10,
            verticalAlign: 'middle',
          }}
        >
          {label}
        </span>
        {heading}
      </h3>
      <ul className="flex flex-col list-none m-0 p-0" style={{ gap: 10 }}>
        {items.map((item) => (
          <li
            key={item}
            className="relative"
            style={{
              paddingLeft: 20,
              fontSize: 13.5,
              color: '#cbd5e1',
              lineHeight: 1.5,
            }}
          >
            <span
              aria-hidden
              className="absolute"
              style={{
                left: 0,
                top: 0,
                color: bulletColor,
                fontSize: 9,
                lineHeight: 1.6,
              }}
            >
              {bulletColor === '#A78BFA' ? '◆' : '◇'}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContactBookingSidebar() {
  return (
    <aside className="flex flex-col" style={{ gap: 24 }}>
      <Block label="Agenda" heading="What we cover" items={AGENDA} bulletColor="#00F0FF" />
      <Block label="Outcomes" heading="What you leave with" items={OUTCOMES} bulletColor="#A78BFA" />

      <p
        style={{
          marginTop: 18,
          padding: '14px 18px',
          background: 'rgba(167,139,250,0.05)',
          borderLeft: '2px solid #A78BFA',
          borderRadius: '0 8px 8px 0',
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 13.5,
          color: '#cbd5e1',
          lineHeight: 1.45,
        }}
      >
        <b
          style={{
            display: 'block',
            color: '#A78BFA',
            fontStyle: 'normal',
            fontWeight: 500,
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Pre-call brief
        </b>
        {PRE_CALL_BRIEF}
      </p>
    </aside>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactBookingSidebar.tsx
git commit -m "feat(contact): add agenda + outcomes + pre-brief sidebar"
```

---

## Task 10: Create `ContactBooking`

**Files:**
- Create: `src/components/sections/contact/ContactBooking.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactBooking.tsx
import { ContactCalEmbed } from './ContactCalEmbed';
import { ContactBookingSidebar } from './ContactBookingSidebar';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactBooking() {
  return (
    <section
      id="book"
      className="relative mx-auto"
      style={{
        maxWidth: 1200,
        padding: '100px 40px',
        background:
          'linear-gradient(180deg, transparent, rgba(0,240,255,0.015) 30%, transparent)',
      }}
    >
      <header className="text-center" style={{ marginBottom: 48 }}>
        <p
          className="inline-flex items-center"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#00F0FF',
            marginBottom: 14,
            gap: 12,
          }}
        >
          <span style={{ color: '#475569', fontSize: 10 }}>◇</span>
          Pick your time
          <span style={{ color: '#475569', fontSize: 10 }}>◇</span>
        </p>
        <h2
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 'clamp(40px, 5.5vw, 72px)',
            lineHeight: 0.94,
            letterSpacing: '-0.035em',
            margin: '0 0 14px',
            color: '#f5f5f7',
          }}
        >
          Forty-five minutes,
          <br />
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              backgroundImage: 'linear-gradient(120deg, #00F0FF, #A78BFA)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            on us.
          </span>
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: '#94a3b8', maxWidth: 560, margin: '0 auto' }}>
          Pick a date on the left, time slots appear on the right. Booking confirms instantly to your inbox.
        </p>
      </header>

      <div
        className="grid mx-auto relative"
        style={{
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 32,
          maxWidth: 1080,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: 36,
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
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
              'linear-gradient(to right, transparent, rgba(0,240,255,0.45), transparent)',
          }}
        />

        <ContactCalEmbed />
        <ContactBookingSidebar />
      </div>
    </section>
  );
}
```

> **Mobile note:** at narrow widths, the 2-col grid above breaks awkwardly. For this scope we accept the desktop layout and let the Cal iframe's own responsive behavior handle small screens. A responsive split (single-column stack below `lg`) is a follow-up.

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactBooking.tsx
git commit -m "feat(contact): add booking section (Cal embed + sidebar)"
```

---

## Task 11: Create `ContactAlternatives`

**Files:**
- Create: `src/components/sections/contact/ContactAlternatives.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactAlternatives.tsx
import { CHANNELS } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

interface OptProps {
  href: string;
  label: string;
  dotColor: string;
  shadow: string;
}

function Opt({ href, label, dotColor, shadow }: OptProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center no-underline transition-colors hover:bg-white/[0.04]"
      style={{
        gap: 8,
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 999,
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.14em',
        color: '#f5f5f7',
      }}
    >
      <span
        aria-hidden
        className="inline-block rounded-full"
        style={{ width: 7, height: 7, background: dotColor, boxShadow: shadow }}
      />
      {label}
    </a>
  );
}

export function ContactAlternatives() {
  return (
    <section
      className="mx-auto"
      style={{ maxWidth: 1080, padding: '60px 40px' }}
    >
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: 'auto 1fr auto',
          gap: 32,
          padding: '28px 32px',
          background: 'rgba(2,4,10,0.5)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
        }}
      >
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 18,
            color: '#f5f5f7',
            lineHeight: 1.3,
            maxWidth: 260,
            margin: 0,
          }}
        >
          <b style={{ color: '#FBBF24', fontWeight: 400 }}>Calendar full?</b>
          <br />
          Reach us another way — we&rsquo;ll come back to you fast.
        </p>

        <div className="flex justify-center flex-wrap" style={{ gap: 10 }}>
          <Opt
            href={CHANNELS.whatsappUrl}
            label="WhatsApp"
            dotColor="#25D366"
            shadow="0 0 8px rgba(37,211,102,0.5)"
          />
          {CHANNELS.telegramHandle && (
            <Opt
              href={`https://t.me/${CHANNELS.telegramHandle}`}
              label="Telegram"
              dotColor="#0088CC"
              shadow="0 0 8px rgba(0,136,204,0.5)"
            />
          )}
          <Opt
            href={`mailto:${CHANNELS.email}`}
            label="Email a brief"
            dotColor="#00F0FF"
            shadow="0 0 8px rgba(0,240,255,0.5)"
          />
        </div>

        <div
          className="text-right"
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#475569',
          }}
        >
          <div>Typical response</div>
          <b style={{ color: '#94a3b8', fontWeight: 500, display: 'block', marginTop: 4 }}>
            under 4 hours · working days
          </b>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactAlternatives.tsx
git commit -m "feat(contact): add WhatsApp/Telegram/Email alternatives strip"
```

---

## Task 12: Create `ContactFAQ`

**Files:**
- Create: `src/components/sections/contact/ContactFAQ.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactFAQ.tsx
import { FAQ_ITEMS } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactFAQ() {
  return (
    <section
      className="mx-auto"
      style={{ maxWidth: 1200, padding: '100px 40px' }}
    >
      <header className="text-center" style={{ marginBottom: 48 }}>
        <p
          className="inline-flex items-center"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#00F0FF',
            marginBottom: 14,
            gap: 12,
          }}
        >
          <span style={{ color: '#475569', fontSize: 10 }}>◇</span>
          Common questions
          <span style={{ color: '#475569', fontSize: 10 }}>◇</span>
        </p>
        <h2
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 'clamp(40px, 5.5vw, 72px)',
            lineHeight: 0.94,
            letterSpacing: '-0.035em',
            margin: 0,
            color: '#f5f5f7',
          }}
        >
          Before you
          <br />
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              backgroundImage: 'linear-gradient(120deg, #00F0FF, #A78BFA)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            book.
          </span>
        </h2>
      </header>

      <div className="contact-faq mx-auto" style={{ maxWidth: 820 }}>
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              borderTop: i === 0 ? '1px solid rgba(255,255,255,0.08)' : undefined,
              padding: '22px 0',
            }}
          >
            <summary
              className="flex items-center justify-between cursor-pointer"
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontSize: 22,
                color: '#f5f5f7',
                letterSpacing: '-0.015em',
                gap: 18,
              }}
            >
              <span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontStyle: 'normal',
                    fontSize: 10.5,
                    letterSpacing: '0.26em',
                    color: '#00F0FF',
                    marginRight: 12,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.q}
              </span>
              <span
                aria-hidden
                className="contact-faq-toggle"
                style={{
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontSize: 28,
                  color: '#475569',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                +
              </span>
            </summary>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                lineHeight: 1.6,
                color: '#94a3b8',
                maxWidth: 680,
                margin: '14px 0 0',
                paddingRight: 40,
              }}
            >
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactFAQ.tsx
git commit -m "feat(contact): add FAQ accordion (native <details>)"
```

---

## Task 13: Create `ContactTestimonial`

**Files:**
- Create: `src/components/sections/contact/ContactTestimonial.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactTestimonial.tsx
import { TESTIMONIAL } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

export function ContactTestimonial() {
  return (
    <section
      className="mx-auto"
      style={{
        maxWidth: 1200,
        padding: '100px 40px',
        background:
          'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(124,58,237,0.06), transparent 70%)',
      }}
    >
      <div
        className="mx-auto text-center relative"
        style={{ maxWidth: 880 }}
      >
        <span
          aria-hidden
          className="absolute"
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 140,
            lineHeight: 1,
            color: '#00F0FF',
            opacity: 0.35,
            top: -50,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          &ldquo;
        </span>

        <blockquote
          className="relative z-[2]"
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 44px)',
            lineHeight: 1.25,
            color: '#f5f5f7',
            letterSpacing: '-0.02em',
            margin: '0 0 28px',
          }}
        >
          {TESTIMONIAL.quote}{' '}
          <em style={{ color: '#00F0FF', fontStyle: 'italic' }}>
            {TESTIMONIAL.emphasis}
          </em>
        </blockquote>

        <p
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: '#94a3b8',
          }}
        >
          <b style={{ color: '#f5f5f7', fontWeight: 500 }}>{TESTIMONIAL.author}</b>
          <span style={{ color: '#475569', margin: '0 10px' }}>·</span>
          {TESTIMONIAL.role}
          <span style={{ color: '#475569', margin: '0 10px' }}>·</span>
          {TESTIMONIAL.company}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactTestimonial.tsx
git commit -m "feat(contact): add testimonial pull-quote section"
```

---

## Task 14: Create `ContactCopyButton`

**Files:**
- Create: `src/components/sections/contact/ContactCopyButton.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactCopyButton.tsx
'use client';

import { useState } from 'react';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';

export function ContactCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API blocked (insecure context, etc.) — silently no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="self-start transition-colors"
      style={{
        marginTop: 4,
        padding: '3px 8px',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4,
        background: 'transparent',
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '0.22em',
        color: copied ? '#00F0FF' : '#475569',
        borderColor: copied ? 'rgba(0,240,255,0.4)' : 'rgba(255,255,255,0.08)',
        cursor: 'pointer',
      }}
    >
      {copied ? 'Copied ✓' : 'Copy →'}
    </button>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactCopyButton.tsx
git commit -m "feat(contact): add copy-to-clipboard button (client island)"
```

---

## Task 15: Create `ContactDirectory`

**Files:**
- Create: `src/components/sections/contact/ContactDirectory.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactDirectory.tsx
import { CHANNELS, STUDIOS } from '@/data/contact-config';
import { ContactCopyButton } from './ContactCopyButton';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

function CellShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col transition-colors hover:bg-[rgba(0,240,255,0.025)]"
      style={{
        background: '#02040A',
        padding: '32px 26px',
        gap: 14,
      }}
    >
      <span
        className="inline-flex items-center"
        style={{
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#00F0FF',
          gap: 8,
        }}
      >
        <span
          aria-hidden
          className="inline-block rounded-full"
          style={{ width: 6, height: 6, background: '#00F0FF', boxShadow: '0 0 6px #00F0FF' }}
        />
        {label}
      </span>
      {children}
    </div>
  );
}

const valStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 14.5,
  color: '#f5f5f7',
  wordBreak: 'break-word',
  lineHeight: 1.5,
};
const linkStyle: React.CSSProperties = {
  color: '#f5f5f7',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(0,240,255,0.25)',
  paddingBottom: 1,
};
const noteStyle: React.CSSProperties = {
  fontFamily: SERIF,
  fontStyle: 'italic',
  fontSize: 14,
  color: '#64748b',
  lineHeight: 1.45,
  marginTop: 'auto',
};

export function ContactDirectory() {
  return (
    <section
      className="mx-auto"
      style={{ maxWidth: 1200, padding: '100px 40px' }}
    >
      <header className="text-center" style={{ marginBottom: 48 }}>
        <p
          className="inline-flex items-center"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#00F0FF',
            marginBottom: 14,
            gap: 12,
          }}
        >
          <span style={{ color: '#475569', fontSize: 10 }}>◇</span>
          Direct lines
          <span style={{ color: '#475569', fontSize: 10 }}>◇</span>
        </p>
        <h2
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 'clamp(40px, 5.5vw, 72px)',
            lineHeight: 0.94,
            letterSpacing: '-0.035em',
            margin: 0,
            color: '#f5f5f7',
          }}
        >
          Or just
          <br />
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              backgroundImage: 'linear-gradient(120deg, #00F0FF, #A78BFA)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            ring us.
          </span>
        </h2>
      </header>

      <div
        className="grid mx-auto overflow-hidden"
        style={{
          maxWidth: 1080,
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 1,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
        }}
      >
        <CellShell label="Email">
          <span style={valStyle}>
            <a href={`mailto:${CHANNELS.email}`} style={linkStyle}>
              {CHANNELS.email}
            </a>
          </span>
          <span style={noteStyle}>
            Replied within a working day. Briefs, RFPs, casual notes — all welcome.
          </span>
          <ContactCopyButton text={CHANNELS.email} />
        </CellShell>

        <CellShell label="Phone · WhatsApp · Telegram">
          <span style={valStyle}>
            <a href={`tel:${CHANNELS.phone}`} style={linkStyle}>
              {CHANNELS.phone}
            </a>
          </span>
          <span style={noteStyle}>
            Same number on all three. We answer voice between 10–18 MYT.
          </span>
          <ContactCopyButton text={CHANNELS.phone} />
        </CellShell>

        <CellShell label="Studios">
          <span style={valStyle}>
            {STUDIOS.map((s, i) => (
              <span key={s.city}>
                {s.city}, {s.country}
                {i < STUDIOS.length - 1 && <br />}
              </span>
            ))}
          </span>
          <span style={noteStyle}>Walk-ins by appointment only. Coffee&rsquo;s on us.</span>
        </CellShell>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactDirectory.tsx
git commit -m "feat(contact): add 3-up contact directory with copy buttons"
```

---

## Task 16: Create `ContactFooter`

**Files:**
- Create: `src/components/sections/contact/ContactFooter.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactFooter.tsx
import { SOCIAL_LINKS } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

const AVATAR_BG = [
  'radial-gradient(circle at 30% 30%, rgba(0,240,255,0.55), rgba(0,240,255,0.05)), linear-gradient(135deg, #1a2030, #0f1420)',
  'radial-gradient(circle at 70% 30%, rgba(245,158,11,0.55), rgba(245,158,11,0.05)), linear-gradient(135deg, #1a2030, #0f1420)',
  'radial-gradient(circle at 30% 70%, rgba(167,139,250,0.55), rgba(167,139,250,0.05)), linear-gradient(135deg, #1a2030, #0f1420)',
  'radial-gradient(circle at 70% 70%, rgba(16,185,129,0.55), rgba(16,185,129,0.05)), linear-gradient(135deg, #1a2030, #0f1420)',
];

export function ContactFooter() {
  return (
    <footer
      className="mx-auto"
      style={{
        maxWidth: 1200,
        marginTop: 60,
        padding: '40px 40px 32px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 28,
          paddingBottom: 20,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 16,
        }}
      >
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 15,
            color: '#94a3b8',
            lineHeight: 1.45,
            margin: 0,
          }}
        >
          <b style={{ color: '#f5f5f7', fontWeight: 400 }}>Mutual NDA</b> from minute one. No screenshots, no sharing, no risk to your IP from the moment the call opens.
        </p>

        <div className="text-center">
          <div className="inline-flex items-center" style={{ gap: 12 }}>
            <div className="flex">
              {AVATAR_BG.map((bg, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="block rounded-full"
                  style={{
                    width: 26,
                    height: 26,
                    border: '2px solid #02040A',
                    marginLeft: i === 0 ? 0 : -6,
                    background: bg,
                  }}
                />
              ))}
            </div>
            <div
              className="text-left"
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#94a3b8',
              }}
            >
              <b style={{ color: '#f5f5f7', fontWeight: 500 }}>50+</b> founders have filed a session
            </div>
          </div>
        </div>

        <p
          className="text-right"
          style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', margin: 0 }}
        >
          {SOCIAL_LINKS.map((s, i) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="text-[#94a3b8] hover:text-[#00F0FF] transition-colors no-underline"
              style={{ marginLeft: i === 0 ? 0 : 14 }}
            >
              {s.label}
            </a>
          ))}
        </p>
      </div>

      <div
        className="flex justify-between"
        style={{
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#475569',
        }}
      >
        <span>Aurexis Solution · Built in Kuala Lumpur · 2026</span>
        <span>
          <a
            href="/privacy-policy"
            className="text-[#64748b] hover:text-[#94a3b8] no-underline transition-colors"
            style={{ marginLeft: 16 }}
          >
            Privacy
          </a>
          <a
            href="/terms-of-service"
            className="text-[#64748b] hover:text-[#94a3b8] no-underline transition-colors"
            style={{ marginLeft: 16 }}
          >
            Terms
          </a>
          <a
            href="https://cal.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#64748b] hover:text-[#94a3b8] no-underline transition-colors"
            style={{ marginLeft: 16 }}
          >
            Powered by Cal.com
          </a>
        </span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactFooter.tsx
git commit -m "feat(contact): add contact-specific footer"
```

---

## Task 17: Replace `src/app/contact/page.tsx`

**Files:**
- Modify: `src/app/contact/page.tsx` — full overwrite

- [ ] **Step 1: Read existing file once**

Use the Read tool on `/Users/sanjaygunabalan2626gmail.com/Documents/AurexisOS/src/app/contact/page.tsx`. The Write tool requires a prior Read.

- [ ] **Step 2: Overwrite the file**

```tsx
// src/app/contact/page.tsx
import { ContactStickyNav } from '@/components/sections/contact/ContactStickyNav';
import { ContactHero } from '@/components/sections/contact/ContactHero';
import { ContactBooking } from '@/components/sections/contact/ContactBooking';
import { ContactAlternatives } from '@/components/sections/contact/ContactAlternatives';
import { ContactFAQ } from '@/components/sections/contact/ContactFAQ';
import { ContactTestimonial } from '@/components/sections/contact/ContactTestimonial';
import { ContactDirectory } from '@/components/sections/contact/ContactDirectory';
import { ContactFooter } from '@/components/sections/contact/ContactFooter';

export const metadata = {
  title: 'Contact — Aurexis Solution',
  description:
    'Book a 45-minute strategy session with Aurexis. We audit your stack, surface the bottlenecks, and walk you out with a real roadmap.',
};

export default function ContactPage() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: '#02040A',
        color: '#f5f5f7',
        scrollBehavior: 'smooth',
      }}
    >
      <ContactStickyNav />
      <main className="flex-1">
        <ContactHero />
        <ContactBooking />
        <ContactAlternatives />
        <ContactFAQ />
        <ContactTestimonial />
        <ContactDirectory />
      </main>
      <ContactFooter />
    </div>
  );
}
```

> **Note:** Setting `scroll-behavior: smooth` on an inline `style` does not propagate to anchor-link scrolls (that's a property of the `<html>` root in CSS). The existing `globals.css` may already set it on `html`; verify by reading the file. If not, append `html { scroll-behavior: smooth; }` to `globals.css` to make the in-page anchor link `#book` scroll smoothly.

- [ ] **Step 3: Verify smooth-scroll is set on html**

```bash
grep -E "scroll-behavior.*smooth" src/app/globals.css
```
If no match, append to `globals.css`:

```css

html { scroll-behavior: smooth; }
```

- [ ] **Step 4: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean. The build summary should list `/contact` as a route. Verify there is no `"use client"` directive at the top of the new `page.tsx`.

- [ ] **Step 5: Browser check**

If the dev server isn't running, start it: `npm run dev`. Open `http://localhost:3001/contact`.

Expected:
- Sticky nav visible at top center.
- Hero renders with aurora background animating, headline + CTAs visible, status pill shows current KL time (e.g. `Live · KL 22:14 MYT · Available`).
- Scroll cue at bottom of hero.
- Booking section heads in around the next viewport with the Cal.com embed loaded.
- Alternatives bar below booking.
- FAQ with first item expanded.
- Testimonial section.
- Directory section with three cells.
- Footer at the bottom.
- No console errors, no React hydration mismatches.
- Clicking the "Book →" sticky-nav CTA scrolls smoothly to the booking section.
- Clicking a Copy button on the email cell copies the address and shows "Copied ✓" for 1.5s.

If the Cal embed shows a loading state forever, check that `NEXT_PUBLIC_SUPABASE_*` env vars aren't accidentally blocking the page (they only affect server-rendered Supabase fetches; the contact page does no Supabase fetch, so a Supabase config issue cannot block it).

- [ ] **Step 6: (Optional) Commit**

```bash
git add src/app/contact/page.tsx src/app/globals.css
git commit -m "feat(contact): wire page.tsx as server composer + smooth-scroll"
```

---

## Task 18: Final verification pass

**Files:** none — pure verification.

- [ ] **Step 1: Cold-cache lint + build**

```bash
rm -rf .next
npm run lint
npm run build
```
Expected: both succeed.

Examine the build output: `/contact` should be listed and should not warn about a `"use client"` directive on `page.tsx`. Client-component chunks should only include the four client islands (`ContactStatusPill`, `ContactCalEmbed`, `ContactCopyButton` — plus anything `@calcom/embed-react` pulls in).

- [ ] **Step 2: Visual diff vs mockup at 1440px**

Open `http://localhost:3001/contact` and `http://localhost:6034/direction-h-aurora.html` in two browser tabs at 1440px width. Walk top-to-bottom:

- Sticky nav: glass pill, brand mark + 3 nav links + Book CTA, positioned top-center.
- Hero: aurora drifts behind, status pill top-right, kicker + headline + sub + CTA row + WhatsApp pill, trusted-by strip below, scroll cue at bottom.
- Booking: section header → glass card → Cal embed LEFT (real iframe in production, may take a moment to load) + agenda/outcomes sidebar RIGHT.
- Alternatives: 3-col card with "Calendar full?" + buttons + response-time.
- FAQ: 4 expandable items, first open.
- Testimonial: cyan ghost quote-mark + italic blockquote + attrib.
- Directory: 3-up cells with copy buttons.
- Footer: NDA + social-proof + social links + sig with Privacy/Terms/Cal.com.

Flag any deltas larger than minor pixel-rounding differences.

- [ ] **Step 3: Reduced-motion check**

Chrome DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload `/contact`. Expected:
- Aurora is static (the four orbs sit still, no drift).
- Status pill pulse stops.
- Scroll cue stops dropping.
- Everything else (hover effects, FAQ toggle, copy-button label swap) still works.

- [ ] **Step 4: Keyboard a11y**

Tab through `/contact` from page load. Expected reachable in order:
1. Sticky nav: brand link → Work → Services → Lab → Book CTA.
2. Hero: primary `Book a session` CTA → WhatsApp secondary CTA.
3. Booking: Cal embed iframe focus (Cal.com handles internal tab order).
4. Alternatives: WhatsApp → Telegram → Email a brief.
5. FAQ: each `<summary>` is focusable; Enter/Space toggles open.
6. Directory: email link → copy button → phone link → copy button.
7. Footer: Instagram → LinkedIn → X → Facebook → Privacy → Terms → Cal.com.

All interactive elements should have visible focus rings.

- [ ] **Step 5: Mobile (390px)**

DevTools → device mode → iPhone 14 (390×844). Reload `/contact`. Expected:
- Sticky nav: nav links hidden (per `hidden md:flex`), only brand + Book CTA remain.
- Hero headline scales via `clamp()`.
- Trusted-by wraps onto multiple rows.
- Booking section: 2-col grid will visibly break (Cal + sidebar both squeezed). Acceptable for this scope — the responsive single-column stack is noted as a follow-up in the spec.
- Alternatives bar: 3-col grid breaks. Note this as a follow-up too.
- FAQ readable.
- Testimonial readable.
- Directory: 3-up grid breaks.
- Footer: 3-col grid breaks.

Mobile responsiveness is *partial* in this scope. Capture which sections need responsive love and add to a follow-up. Don't try to fix in this pass.

- [ ] **Step 6: Report results**

Summarize: lint ✅, build ✅, visual match ✅, reduced-motion ✅, a11y ✅, mobile (partial) ⚠️. List any deltas that need a follow-up before announcing done.

- [ ] **Step 7: (Optional) Final commit**

If the user has approved commits and per-task commits weren't done, this is the moment for a single feature commit. Otherwise, summarize what's uncommitted and hand control back to the user.
