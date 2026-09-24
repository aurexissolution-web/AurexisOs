# Contact — Studio Roster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/contact` with the approved "Studio Roster" layout — site Navbar + Hero + Committee (3 founders with CTA) + Studios (2 cards with SVG city silhouettes) + Brief (form with real submission) + FAQ + site Footer. Wire form submissions to a new `contact_messages` Supabase table with optional Telegram notification.

**Architecture:** Thin server-component composer in `src/app/contact/page.tsx` wires 13 contact-specific section components inside the existing site `<Navbar />` and `<Footer />`. Only 2 client islands (StatusPill clock, BriefForm state). New `/api/contact` route handles form POSTs. New `contact_messages` table stores submissions (server-write-only via service role).

**Tech Stack:** Next.js 16 App Router · React 19 server components · TypeScript strict · Tailwind 4 + inline styles · Supabase Postgres + RLS · optional Telegram bot API (existing pattern from `/api/tickets/notify`).

**Spec:** [docs/superpowers/specs/2026-05-21-contact-studio-roster-design.md](docs/superpowers/specs/2026-05-21-contact-studio-roster-design.md)

**Mockup (frozen):** [.superpowers/brainstorm/contact-2026-05-20/content/direction-m-area17.html](.superpowers/brainstorm/contact-2026-05-20/content/direction-m-area17.html) — server still running at `http://localhost:6034/direction-m-area17.html`.

---

## Project conventions (read once before starting)

- **No automatic commits.** Per `CLAUDE.md`, do not commit unless the user explicitly says so. Each task ends with an *optional* commit step — execute it only if the user has approved committing for this session.
- **No test runner.** This codebase has no unit-test framework wired up. Verification per task is `npm run lint` + `npm run build` + (where relevant) opening `http://localhost:3001/contact` in the browser.
- **Fonts.** CSS vars live in `src/app/globals.css`: `--font-instrument-serif`, `--font-plus-jakarta`, `--font-geist-mono`. Use them via inline `style={{ fontFamily: 'var(--font-instrument-serif)' }}` — Tailwind utilities for these vars are not defined.
- **Site Navbar + Footer.** The page MUST use `<Navbar />` from `@/components/layout/Navbar` and `<Footer />` from `@/components/layout/Footer`. Do NOT create a contact-specific nav or footer. This is the load-bearing course-correction from the previous (rejected) design.
- **Server components by default.** Only `ContactStatusPill` and `ContactBriefForm` get `"use client"`. Everything else is server.
- **Class name convention.** All CSS classes added to `globals.css` use the `contact-roster-` prefix to avoid collisions with any past contact-related styles (the earlier rounds were torn down, but discipline matters).
- **Existing types live in** `src/types/portal.ts`. Don't create a separate file — extend in place.
- **Migration applies via Supabase dashboard.** This project has no `migrate` npm script. The implementer writes the migration file; the **user applies it manually** before the page can be browser-tested.

---

## Task 1: Create migration `013_contact_messages.sql`

**Files:**
- Create: `supabase/migrations/013_contact_messages.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 013_contact_messages.sql
-- Stores submissions from the /contact form. Public anonymous writes are NOT
-- allowed — submissions go through /api/contact using the service role.
-- Admin viewing is out of scope; reads happen via direct DB access for now.

CREATE TABLE contact_messages (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  intent       TEXT         NOT NULL,
  name         TEXT         NOT NULL,
  email        TEXT         NOT NULL,
  company      TEXT,
  stage        TEXT,
  message      TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  notified_at  TIMESTAMPTZ
);

ALTER TABLE contact_messages
  ADD CONSTRAINT contact_messages_intent_check
    CHECK (intent IN (
      'new-project', 'ai-agent', 'existing-client',
      'press-partnerships', 'careers'
    ));

ALTER TABLE contact_messages
  ADD CONSTRAINT contact_messages_email_check
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX contact_messages_created_at_idx
  ON contact_messages (created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- No public policies: this table is server-write-only via the service role.
```

- [ ] **Step 2: Verify file exists**

```bash
ls -la /Users/sanjaygunabalan2626gmail.com/Documents/AurexisOS/supabase/migrations/013_contact_messages.sql
```
Expected: file present, non-zero size.

> **Do NOT apply the migration.** The user applies it manually via the Supabase dashboard SQL editor before browser-testing the form. This is the same pattern as migration 012 from the portfolio plan.

- [ ] **Step 3: (Optional) Commit**

```bash
git add supabase/migrations/013_contact_messages.sql
git commit -m "feat(contact): add contact_messages migration (013)"
```

---

## Task 2: Extend types in `src/types/portal.ts`

**Files:**
- Modify: `src/types/portal.ts` (append new types at end of file)

- [ ] **Step 1: Locate the end of the file**

Use the Read tool on `src/types/portal.ts`. Note the line count — additions go at the end after any existing exports.

- [ ] **Step 2: Append the new types**

Use Edit to append the following at the end of the file (after the last existing export, separated by a blank line):

```ts

// ── /contact types ─────────────────────────────────────────
export type ContactIntent =
  | 'new-project'
  | 'ai-agent'
  | 'existing-client'
  | 'press-partnerships'
  | 'careers';

export type ContactAccent = 'cyan' | 'violet' | 'cyan-mix';

export interface Founder {
  initials: string;
  name: string;
  role: string;
  blurb: string;
  brings: string;
  accent: ContactAccent;
  available: boolean;
}

export interface Studio {
  city: string;
  country: string;
  role: string;
  address: string;
  addressNote: string;
  accent: 'cyan' | 'violet';
  skyline: 'kl' | 'sp';
}

export interface FAQ {
  q: string;
  a: string;
}

export interface ContactMessage {
  id: string;
  intent: ContactIntent;
  name: string;
  email: string;
  company: string | null;
  stage: string | null;
  message: string;
  created_at: string;
  notified_at: string | null;
}
```

- [ ] **Step 3: Verify lint**

```bash
npm run lint
```
Expected: clean. New types are exported but unused; that's fine (consumers come in later tasks).

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/types/portal.ts
git commit -m "feat(contact): add ContactIntent, Founder, Studio, FAQ, ContactMessage types"
```

---

## Task 3: Append CSS to `globals.css`

**Files:**
- Modify: `src/app/globals.css` (append to end)

- [ ] **Step 1: Check for collisions**

```bash
grep -cE "(contactRosterRise|contactRosterPulse|contact-roster-faq)" /Users/sanjaygunabalan2626gmail.com/Documents/AurexisOS/src/app/globals.css
```
Expected: `0`. If non-zero, the rename to `contact-roster-` was meant to avoid this — if it still collides, append `-v2` to the keyframe/class names and update the components in later tasks accordingly.

- [ ] **Step 2: Append the new CSS to the END of `src/app/globals.css`**

```css

/* ── /contact (Studio Roster) ──────────────────────────── */
@keyframes contactRosterRise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes contactRosterPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}

/* FAQ native <details> accordion */
.contact-roster-faq details summary { list-style: none; }
.contact-roster-faq details summary::-webkit-details-marker { display: none; }
.contact-roster-faq details summary .contact-roster-faq-toggle {
  transition: transform 0.25s ease, color 0.25s ease;
}
.contact-roster-faq details[open] summary .contact-roster-faq-toggle {
  transform: rotate(45deg);
  color: #00F0FF;
}
```

- [ ] **Step 3: Verify**

```bash
npm run lint
grep -c "contactRosterRise" src/app/globals.css
grep -c "contactRosterPulse" src/app/globals.css
grep -c "contact-roster-faq-toggle" src/app/globals.css
```
Expected: lint clean; first count = 1; second count = 1; third count = 2.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/app/globals.css
git commit -m "feat(contact): add roster reveal + pulse + faq accordion CSS"
```

---

## Task 4: Create `src/data/contact-config.ts`

**Files:**
- Create: `src/data/contact-config.ts`

- [ ] **Step 1: Write the config**

```ts
// src/data/contact-config.ts
import type { Founder, Studio, ContactIntent, FAQ } from '@/types/portal';

export const STUDIO_TIMEZONE = 'Asia/Kuala_Lumpur';
export const STUDIO_HOURS = 'Mon–Fri · 10–18 MYT';
export const REPLY_WINDOW_LABEL = '~24h';
export const STRATEGY_SESSION_LEN_MIN = 45;

const WA_DIGITS = process.env.NEXT_PUBLIC_AUREXIS_WHATSAPP || '60164071129';

export const CHANNELS = {
  email: 'aurexissolution@gmail.com',
  phone: '+60164071129',
  phoneDigits: WA_DIGITS,
  whatsappUrl: `https://wa.me/${WA_DIGITS}`,
  bookingUrl: '/contact#brief',
} as const;

// Founders — REPLACE the placeholder names + initials before production launch.
export const FOUNDERS: ReadonlyArray<Founder> = [
  {
    initials: 'SG',
    name: 'Sanjay Gunabalan',
    role: 'Co-founder · Engineering',
    blurb: 'Full-stack engineer. Leads architecture, AI integrations, and post-launch ops. Takes new-project intros.',
    brings: 'stack audits, scoping, "what to build vs. delete" calls.',
    accent: 'cyan',
    available: true,
  },
  {
    initials: 'CF',
    name: '[Co-founder · 2]',
    role: 'Co-founder · Product & Design',
    blurb: 'Product designer turned operator. Leads brand, product UX, and client relationships. Joins strategy sessions for product-led work.',
    brings: 'product framing, UX teardowns, brand+go-to-market.',
    accent: 'violet',
    available: true,
  },
  {
    initials: 'CF',
    name: '[Co-founder · 3]',
    role: 'Co-founder · AI & Systems',
    blurb: 'Systems and AI lead. Owns agent design, data pipelines, and the "how do we automate this" problems.',
    brings: 'AI scoping, agent architecture, automation roadmaps.',
    accent: 'cyan-mix',
    available: true,
  },
];

export const STUDIOS: ReadonlyArray<Studio> = [
  {
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    role: 'Headquarters',
    address: 'Kuala Lumpur, MY',
    addressNote: 'Exact location on appointment',
    accent: 'cyan',
    skyline: 'kl',
  },
  {
    city: 'Sungai Petani',
    country: 'Kedah',
    role: 'Build floor',
    address: 'Sungai Petani, Kedah',
    addressNote: 'Exact location on appointment',
    accent: 'violet',
    skyline: 'sp',
  },
];

export const CONTACT_INTENTS: ReadonlyArray<{ id: ContactIntent; label: string }> = [
  { id: 'new-project', label: 'New project' },
  { id: 'ai-agent', label: 'AI & agent work' },
  { id: 'existing-client', label: 'Existing client' },
  { id: 'press-partnerships', label: 'Press & partnerships' },
  { id: 'careers', label: 'Careers' },
];

export const COMPANY_STAGES: ReadonlyArray<string> = [
  'Idea / pre-seed',
  'Early-stage startup',
  'Series A · B',
  'Growth · Series C+',
  'Enterprise',
];

export const FAQ_ITEMS: ReadonlyArray<FAQ> = [
  {
    q: 'Is the 45-minute call really free?',
    a: 'Yes. No card, no "trial" pricing, no obligation. We treat the call as our cost of qualifying the engagement — you walk out with a written summary either way.',
  },
  {
    q: "What if I'm just exploring?",
    a: "Then exploring is what the session is for. About a third of the calls we run end with us telling someone they don't need to hire anyone yet.",
  },
  {
    q: 'Do you sign mutual NDAs?',
    a: 'Yes — from the first message if you ask. We use our standard mutual NDA; happy to redline yours if you have one.',
  },
  {
    q: 'How fast do you actually reply?',
    a: "Within a working day, every time. WhatsApp on +60 16-407 1129 if it's urgent.",
  },
  {
    q: "Who's on the other end?",
    a: "One of the three of us — the same person who'd be on the project. We don't do SDRs.",
  },
];

export const HERO_COPY = {
  eyebrow: 'Contact · Studio open today',
  titleLines: ['Three founders.', 'Two studios.'],
  titleClose: { plain: 'One', italic: 'call', stroke: 'away' },
  lede: 'A real engineer reads every message and replies within a working day. Briefs, RFPs, "is this even possible" questions — bring all of it. We work with founders building products that need to actually ship.',
};
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/data/contact-config.ts
git commit -m "feat(contact): add static config (founders, studios, FAQ, intents)"
```

---

## Task 5: Create `/api/contact` route

**Files:**
- Create: `src/app/api/contact/route.ts`

- [ ] **Step 1: Write the route handler**

```ts
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const VALID_INTENTS = new Set([
  'new-project',
  'ai-agent',
  'existing-client',
  'press-partnerships',
  'careers',
]);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface Errors {
  intent?: string;
  name?: string;
  email?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent, name, email, company, stage, message } = body as Record<string, unknown>;

    const errors: Errors = {};
    if (typeof intent !== 'string' || !VALID_INTENTS.has(intent)) {
      errors.intent = 'Please pick a valid topic.';
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Please tell us your name.';
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      errors.email = 'Please give us a working email address.';
    }
    if (typeof message !== 'string' || message.trim().length === 0) {
      errors.message = 'Please write a short message.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        intent,
        name: (name as string).trim(),
        email: (email as string).trim(),
        company: typeof company === 'string' && company.trim() ? company.trim() : null,
        stage: typeof stage === 'string' && stage.trim() ? stage.trim() : null,
        message: (message as string).trim(),
      })
      .select('id')
      .single();

    if (insertError || !insertData) {
      console.error('[/api/contact] insert error:', insertError);
      return NextResponse.json(
        { error: 'Could not save your message. Try again, or email us directly.' },
        { status: 500 },
      );
    }

    // Fire-and-forget Telegram notification if configured
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text = [
        `📨 *New contact message*`,
        ``,
        `*Intent:* ${intent}`,
        `*Name:* ${(name as string).trim()}`,
        `*Email:* ${(email as string).trim()}`,
        `*Company:* ${(company as string)?.trim?.() || '—'}`,
        `*Stage:* ${(stage as string)?.trim?.() || '—'}`,
        ``,
        `*Message:*`,
        (message as string).trim(),
        ``,
        `_via /contact form_`,
      ].join('\n');

      try {
        const res = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text,
              parse_mode: 'Markdown',
            }),
          },
        );
        if (res.ok) {
          await supabaseAdmin
            .from('contact_messages')
            .update({ notified_at: new Date().toISOString() })
            .eq('id', insertData.id);
        } else {
          console.error('[/api/contact] telegram non-ok:', await res.text());
        }
      } catch (err) {
        console.error('[/api/contact] telegram fetch failed:', err);
      }
    }

    return NextResponse.json({ ok: true, id: insertData.id });
  } catch (err) {
    console.error('[/api/contact] unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Try emailing us directly.' },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean. Build should list `/api/contact` as a route.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/app/api/contact/route.ts
git commit -m "feat(contact): add /api/contact POST handler with optional Telegram"
```

---

## Task 6: Create `KLSkyline` component

**Files:**
- Create: `src/components/sections/contact/KLSkyline.tsx`

- [ ] **Step 1: Write the SVG component**

```tsx
// src/components/sections/contact/KLSkyline.tsx
export function KLSkyline() {
  return (
    <svg
      viewBox="0 0 600 110"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 right-0 w-full h-[110px] block"
      aria-hidden
    >
      {/* Background buildings */}
      <rect fill="rgba(255,255,255,0.10)" x="0" y="65" width="40" height="45" />
      <rect fill="rgba(255,255,255,0.10)" x="42" y="78" width="28" height="32" />
      <rect fill="rgba(255,255,255,0.10)" x="72" y="55" width="38" height="55" />
      <rect fill="rgba(255,255,255,0.14)" x="112" y="62" width="50" height="48" />
      <rect fill="rgba(255,255,255,0.10)" x="164" y="74" width="34" height="36" />
      <rect fill="rgba(255,255,255,0.14)" x="200" y="50" width="42" height="60" />
      {/* Petronas Towers */}
      <polygon fill="rgba(0,240,255,0.45)" points="252,40 254,16 258,8 262,16 264,40 264,110 252,110" />
      <polygon fill="rgba(0,240,255,0.45)" points="266,38 268,32 270,28 272,32 274,38 274,110 266,110" />
      <polygon fill="rgba(0,240,255,0.45)" points="280,40 282,16 286,8 290,16 292,40 292,110 280,110" />
      <polygon fill="rgba(0,240,255,0.45)" points="294,38 296,32 298,28 300,32 302,38 302,110 294,110" />
      {/* More background */}
      <rect fill="rgba(255,255,255,0.14)" x="306" y="58" width="44" height="52" />
      <rect fill="rgba(255,255,255,0.10)" x="352" y="72" width="36" height="38" />
      <rect fill="rgba(255,255,255,0.14)" x="390" y="65" width="46" height="45" />
      <rect fill="rgba(255,255,255,0.10)" x="438" y="76" width="32" height="34" />
      <rect fill="rgba(255,255,255,0.14)" x="472" y="60" width="40" height="50" />
      <rect fill="rgba(255,255,255,0.10)" x="514" y="74" width="36" height="36" />
      <rect fill="rgba(255,255,255,0.14)" x="552" y="68" width="48" height="42" />
    </svg>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/KLSkyline.tsx
git commit -m "feat(contact): add KL skyline SVG with Petronas Towers"
```

---

## Task 7: Create `SungaiPetaniSkyline` component

**Files:**
- Create: `src/components/sections/contact/SungaiPetaniSkyline.tsx`

- [ ] **Step 1: Write the SVG component**

```tsx
// src/components/sections/contact/SungaiPetaniSkyline.tsx
export function SungaiPetaniSkyline() {
  return (
    <svg
      viewBox="0 0 600 110"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 right-0 w-full h-[110px] block"
      aria-hidden
    >
      <rect fill="rgba(255,255,255,0.10)" x="0" y="82" width="36" height="28" />
      <rect fill="rgba(255,255,255,0.14)" x="38" y="74" width="44" height="36" />
      <rect fill="rgba(255,255,255,0.10)" x="84" y="86" width="32" height="24" />
      <rect fill="rgba(255,255,255,0.10)" x="118" y="70" width="50" height="40" />
      <rect fill="rgba(255,255,255,0.14)" x="170" y="78" width="38" height="32" />
      {/* Mid-rise tower */}
      <polygon fill="rgba(167,139,250,0.45)" points="218,60 220,52 224,46 228,52 230,60 230,110 218,110" />
      <rect fill="rgba(255,255,255,0.14)" x="234" y="74" width="42" height="36" />
      <rect fill="rgba(255,255,255,0.10)" x="278" y="82" width="30" height="28" />
      <rect fill="rgba(255,255,255,0.14)" x="310" y="72" width="46" height="38" />
      <rect fill="rgba(255,255,255,0.10)" x="358" y="86" width="34" height="24" />
      {/* Mosque dome silhouette */}
      <path fill="rgba(167,139,250,0.45)" d="M 396 90 q 18 -22 36 0 L 432 110 L 396 110 Z" />
      <rect fill="rgba(255,255,255,0.10)" x="436" y="84" width="34" height="26" />
      <rect fill="rgba(255,255,255,0.14)" x="472" y="76" width="42" height="34" />
      <rect fill="rgba(255,255,255,0.10)" x="516" y="84" width="32" height="26" />
      <rect fill="rgba(255,255,255,0.14)" x="550" y="78" width="50" height="32" />
    </svg>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/SungaiPetaniSkyline.tsx
git commit -m "feat(contact): add Sungai Petani skyline SVG with mosque dome"
```

---

## Task 8: Create `ContactStatusPill` (client)

**Files:**
- Create: `src/components/sections/contact/ContactStatusPill.tsx`

- [ ] **Step 1: Write the client component**

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
  const [time, setTime] = useState('--:--');

  useEffect(() => {
    setTime(formatKLTime());
    const id = setInterval(() => setTime(formatKLTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-flex items-center gap-2.5 backdrop-blur-md"
      style={{
        padding: '9px 16px',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.02)',
        fontFamily: MONO,
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
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactStatusPill.tsx
git commit -m "feat(contact): add live KL-time status pill (client island)"
```

---

## Task 9: Create `ContactHero`

**Files:**
- Create: `src/components/sections/contact/ContactHero.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactHero.tsx
import { HERO_COPY, REPLY_WINDOW_LABEL } from '@/data/contact-config';
import { ContactStatusPill } from './ContactStatusPill';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

const RISE = 'motion-safe:opacity-0 motion-safe:animate-[contactRosterRise_0.8s_cubic-bezier(0.4,0,0.2,1)_forwards]';

export function ContactHero() {
  return (
    <section
      className="grid items-end gap-16"
      style={{
        gridTemplateColumns: '1fr auto',
        padding: '88px 0 80px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div>
        <p
          className={`${RISE} inline-flex items-center`}
          style={{
            animationDelay: '0.05s',
            fontFamily: MONO,
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
            style={{
              fontFamily: SERIF,
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
        className={`${RISE} flex flex-col items-end`}
        style={{ animationDelay: '0.32s', gap: 16, paddingBottom: 6 }}
      >
        <ContactStatusPill />
        <div className="text-right">
          <div
            style={{
              fontFamily: SERIF,
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
            style={{
              fontFamily: MONO,
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
```

- [ ] **Step 2: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactHero.tsx
git commit -m "feat(contact): add Hero with stagger reveal and live status side"
```

---

## Task 10: Create `ContactFounderCard`

**Files:**
- Create: `src/components/sections/contact/ContactFounderCard.tsx`

- [ ] **Step 1: Write the component (uses globals.css classes, no styled-jsx)**

```tsx
// src/components/sections/contact/ContactFounderCard.tsx
import type { Founder, ContactAccent } from '@/types/portal';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

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
          aspectRatio: '4 / 5',
          background: portraitBg(founder.accent),
          backgroundColor: '#0a1020',
        }}
      >
        {/* Grain overlay */}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            opacity: 0.45,
            mixBlendMode: 'overlay',
          }}
        />
        {/* Initials mark */}
        <span
          aria-hidden
          className="contact-roster-founder-initials absolute inset-0 flex items-center justify-center"
          style={{
            fontFamily: SERIF,
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
        {/* Available pill */}
        {founder.available && (
          <span
            className="absolute z-[2] inline-flex items-center gap-2 backdrop-blur-md"
            style={{
              top: 14,
              right: 14,
              padding: '5px 11px',
              borderRadius: 999,
              background: 'rgba(2,4,10,0.55)',
              border: '1px solid rgba(255,255,255,0.10)',
              fontFamily: MONO,
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
          style={{
            fontFamily: MONO,
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
          style={{
            fontFamily: SERIF,
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
          style={{
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontFamily: MONO,
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
```

The hover behavior lives in `globals.css` (next step).

- [ ] **Step 2: Append founder hover CSS to `globals.css`**

Append at the END of `src/app/globals.css` (right below the `.contact-roster-faq` rules added in Task 3):

```css

/* Founder card hover (the inline style uses var(--accent) set per card) */
.contact-roster-founder:hover {
  border-color: var(--accent, #00F0FF) !important;
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}
.contact-roster-founder:hover .contact-roster-founder-initials {
  color: var(--accent, #00F0FF) !important;
  transform: scale(1.04);
}
```

- [ ] **Step 3: Verify lint**

```bash
npm run lint
```
Expected: clean.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactFounderCard.tsx src/app/globals.css
git commit -m "feat(contact): add FounderCard with portrait + hover lift"
```

---

## Task 11: Create `ContactCommitteeCTA`

**Files:**
- Create: `src/components/sections/contact/ContactCommitteeCTA.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactCommitteeCTA.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CHANNELS, STRATEGY_SESSION_LEN_MIN, STUDIO_HOURS } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
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
          style={{
            fontFamily: SERIF,
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
          style={{
            fontFamily: MONO,
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
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactCommitteeCTA.tsx
git commit -m "feat(contact): add Committee CTA bar with cyan glow button"
```

---

## Task 12: Create `ContactCommittee` composer

**Files:**
- Create: `src/components/sections/contact/ContactCommittee.tsx`

- [ ] **Step 1: Write the composer**

```tsx
// src/components/sections/contact/ContactCommittee.tsx
import { FOUNDERS } from '@/data/contact-config';
import { ContactFounderCard } from './ContactFounderCard';
import { ContactCommitteeCTA } from './ContactCommitteeCTA';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactCommittee() {
  return (
    <section
      style={{
        padding: '96px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Section header */}
      <header
        className="grid items-end"
        style={{
          gridTemplateColumns: '1fr 1.5fr',
          gap: 56,
          marginBottom: 56,
        }}
      >
        <div>
          <p
            className="inline-flex items-center"
            style={{
              fontFamily: MONO,
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
              style={{
                fontFamily: SERIF,
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
          No SDRs. No &ldquo;discovery&rdquo; reps. The three of us split the room — one of us will be on your call, and the same person will be on the project if you proceed.{' '}
          <em
            style={{
              color: '#f5f5f7',
              fontStyle: 'italic',
              fontFamily: SERIF,
              fontSize: 18,
            }}
          >
            We do the work we sell.
          </em>
        </p>
      </header>

      {/* 3-up founder grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 20,
          marginBottom: 48,
        }}
      >
        {FOUNDERS.map((f) => (
          <ContactFounderCard key={f.name} founder={f} />
        ))}
      </div>

      <ContactCommitteeCTA />
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactCommittee.tsx
git commit -m "feat(contact): add Committee composer (3 founders + CTA bar)"
```

---

## Task 13: Create `ContactStudioCard`

**Files:**
- Create: `src/components/sections/contact/ContactStudioCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/contact/ContactStudioCard.tsx
import type { Studio } from '@/types/portal';
import { CHANNELS, STUDIO_HOURS } from '@/data/contact-config';
import { KLSkyline } from './KLSkyline';
import { SungaiPetaniSkyline } from './SungaiPetaniSkyline';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
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
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{ height: 260, background: imageBg(studio.accent) }}
      >
        <span
          className="absolute inline-flex items-center gap-2 backdrop-blur-md"
          style={{
            top: 18,
            left: 20,
            padding: '6px 11px',
            borderRadius: 999,
            background: 'rgba(2,4,10,0.55)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: MONO,
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
        <Skyline />
      </div>

      {/* Body */}
      <div className="flex flex-col" style={{ padding: 26, gap: 18 }}>
        <p
          style={{
            fontFamily: MONO,
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
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              color: accentHex,
            }}
          >
            {studio.country}
          </span>
        </h3>
        <dl
          className="grid"
          style={{
            gridTemplateColumns: 'auto 1fr',
            gap: '8px 18px',
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontFamily: MONO,
            fontSize: 12,
            color: '#cbd5e1',
            margin: 0,
          }}
        >
          <dt
            style={{
              color: '#475569',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: 9.5,
              alignSelf: 'center',
            }}
          >
            Address
          </dt>
          <dd style={{ margin: 0 }}>
            {studio.address} · <span style={{ color: '#475569' }}>{studio.addressNote}</span>
          </dd>
          <dt
            style={{
              color: '#475569',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: 9.5,
              alignSelf: 'center',
            }}
          >
            Phone
          </dt>
          <dd style={{ margin: 0 }}>
            <a
              href={`tel:${CHANNELS.phone}`}
              style={{
                color: '#f5f5f7',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                paddingBottom: 1,
              }}
            >
              {CHANNELS.phone}
            </a>
          </dd>
          <dt
            style={{
              color: '#475569',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: 9.5,
              alignSelf: 'center',
            }}
          >
            Email
          </dt>
          <dd style={{ margin: 0 }}>
            <a
              href={`mailto:${CHANNELS.email}`}
              style={{
                color: '#f5f5f7',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                paddingBottom: 1,
              }}
            >
              {CHANNELS.email}
            </a>
          </dd>
        </dl>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#475569',
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            margin: 0,
          }}
        >
          <span
            className="inline-flex items-center"
            style={{ color: '#10B981', gap: 7 }}
          >
            <span
              aria-hidden
              className="inline-block rounded-full"
              style={{ width: 5, height: 5, background: '#10B981', boxShadow: '0 0 5px #10B981' }}
            />
            Open now
          </span>{' '}
          · {STUDIO_HOURS}
        </p>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Add studio hover CSS to globals.css**

Append to `src/app/globals.css`:

```css
.contact-roster-studio:hover {
  border-color: var(--accent, #00F0FF) !important;
  transform: translateY(-2px);
}
```

- [ ] **Step 3: Verify lint**

```bash
npm run lint
```
Expected: clean.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactStudioCard.tsx src/app/globals.css
git commit -m "feat(contact): add StudioCard with skyline + meta"
```

---

## Task 14: Create `ContactStudios` composer

**Files:**
- Create: `src/components/sections/contact/ContactStudios.tsx`

- [ ] **Step 1: Write the composer**

```tsx
// src/components/sections/contact/ContactStudios.tsx
import { STUDIOS } from '@/data/contact-config';
import { ContactStudioCard } from './ContactStudioCard';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

export function ContactStudios() {
  return (
    <section
      style={{
        padding: '96px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <header
        className="grid items-end"
        style={{
          gridTemplateColumns: '1fr 1.5fr',
          gap: 56,
          marginBottom: 56,
        }}
      >
        <div>
          <p
            className="inline-flex items-center"
            style={{
              fontFamily: MONO,
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
              style={{
                fontFamily: SERIF,
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

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {STUDIOS.map((s) => (
          <ContactStudioCard key={s.city} studio={s} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactStudios.tsx
git commit -m "feat(contact): add Studios composer (2 studio cards)"
```

---

## Task 15: Create `ContactBriefForm` (client)

**Files:**
- Create: `src/components/sections/contact/ContactBriefForm.tsx`

- [ ] **Step 1: Write the client component**

```tsx
// src/components/sections/contact/ContactBriefForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { ContactIntent } from '@/types/portal';
import { CONTACT_INTENTS, COMPANY_STAGES, CHANNELS } from '@/data/contact-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

type FormState = 'idle' | 'sending' | 'sent' | 'error';
interface FieldErrors {
  intent?: string;
  name?: string;
  email?: string;
  message?: string;
}

const inputBase: React.CSSProperties = {
  background: 'rgba(2,4,10,0.5)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 8,
  padding: '12px 14px',
  color: '#f5f5f7',
  fontSize: 14,
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
};

const labelBase: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#94a3b8',
};

export function ContactBriefForm() {
  const [intent, setIntent] = useState<ContactIntent>('new-project');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState(COMPANY_STAGES[0]);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [topError, setTopError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState('sending');
    setErrors({});
    setTopError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, name, email, company, stage, message }),
      });
      if (res.ok) {
        setState('sent');
        return;
      }
      if (res.status === 422) {
        const body = (await res.json()) as { errors?: FieldErrors };
        setErrors(body.errors ?? {});
        setState('idle');
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setTopError(body.error ?? 'Something went wrong. Try emailing us directly.');
      setState('error');
    } catch {
      setTopError('Network error. Try emailing us directly.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div
        className="flex flex-col items-start"
        style={{
          padding: 32,
          gap: 18,
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 12,
        }}
      >
        <div
          className="inline-flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.4)',
          }}
        >
          <Check className="w-5 h-5" style={{ color: '#10B981' }} />
        </div>
        <h3
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: '-0.015em',
            margin: 0,
            color: '#f5f5f7',
          }}
        >
          Got it — we&rsquo;ll come back to you within a working day.
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: '#94a3b8', margin: 0 }}>
          Look for a reply from <b style={{ color: '#f5f5f7', fontWeight: 500 }}>{CHANNELS.email}</b>. If it&rsquo;s urgent, WhatsApp us on{' '}
          <a
            href={CHANNELS.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#00F0FF',
              borderBottom: '1px solid rgba(0,240,255,0.4)',
              textDecoration: 'none',
            }}
          >
            {CHANNELS.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col" style={{ gap: 18 }} onSubmit={handleSubmit} noValidate>

      {topError && (
        <p
          style={{
            padding: '10px 14px',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8,
            color: '#fca5a5',
            fontSize: 13,
            margin: 0,
          }}
        >
          {topError}
        </p>
      )}

      <div className="flex flex-col" style={{ gap: 7 }}>
        <label style={labelBase}>What are you here for?</label>
        <div className="flex flex-wrap" style={{ gap: 7 }}>
          {CONTACT_INTENTS.map((i) => {
            const active = i.id === intent;
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => setIntent(i.id)}
                style={{
                  padding: '7px 13px',
                  border: `1px solid ${active ? '#00F0FF' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 999,
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: '0.12em',
                  color: active ? '#02040A' : '#cbd5e1',
                  background: active ? '#00F0FF' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                {i.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="flex flex-col" style={{ gap: 7 }}>
          <label style={labelBase}>
            Your name <span style={{ color: '#00F0FF', marginLeft: 3 }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maya Ramachandran"
            style={inputBase}
          />
          {errors.name && (
            <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.name}</span>
          )}
        </div>
        <div className="flex flex-col" style={{ gap: 7 }}>
          <label style={labelBase}>
            Work email <span style={{ color: '#00F0FF', marginLeft: 3 }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maya@orbital.com"
            style={inputBase}
          />
          {errors.email && (
            <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.email}</span>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="flex flex-col" style={{ gap: 7 }}>
          <label style={labelBase}>Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Orbital Treasury"
            style={inputBase}
          />
        </div>
        <div className="flex flex-col" style={{ gap: 7 }}>
          <label style={labelBase}>Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            style={inputBase}
          >
            {COMPANY_STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 7 }}>
        <label style={labelBase}>
          Tell us about the work <span style={{ color: '#00F0FF', marginLeft: 3 }}>*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What you're building, what's stuck, rough timeline, what success looks like. The more context, the sharper our reply."
          style={{ ...inputBase, resize: 'vertical', minHeight: 130 }}
        />
        {errors.message && (
          <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.message}</span>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap" style={{ gap: 16, paddingTop: 4 }}>
        <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5, margin: 0 }}>
          By submitting, you agree to our{' '}
          <a
            href="/privacy-policy"
            style={{ color: '#94a3b8', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.15)' }}
          >
            privacy policy
          </a>
          .<br />
          We never share your details.
        </p>
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{
            gap: 10,
            padding: '12px 22px',
            background: '#00F0FF',
            color: '#02040A',
            border: 'none',
            borderRadius: 10,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0,240,255,0.2)',
            transitionDuration: '0.25s',
          }}
        >
          {state === 'sending' ? 'Sending…' : 'Send the brief'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactBriefForm.tsx
git commit -m "feat(contact): add BriefForm client island with submit + success state"
```

---

## Task 16: Create `ContactBrief` composer

**Files:**
- Create: `src/components/sections/contact/ContactBrief.tsx`

- [ ] **Step 1: Write the composer**

```tsx
// src/components/sections/contact/ContactBrief.tsx
import { ContactBriefForm } from './ContactBriefForm';

const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';
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
      style={{
        padding: '96px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="grid items-start" style={{ gridTemplateColumns: '1fr 1.4fr', gap: 56 }}>
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
              style={{
                fontFamily: SERIF,
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
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005)), rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 16,
            padding: 32,
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
```

- [ ] **Step 2: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactBrief.tsx
git commit -m "feat(contact): add Brief composer (aside checks + form card)"
```

---

## Task 17: Create `ContactFAQ`

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
      className="contact-roster-faq"
      style={{ padding: '96px 0' }}
    >
      <div className="grid" style={{ gridTemplateColumns: '1fr 1.6fr', gap: 56 }}>
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
          Common
          <br />
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#00F0FF',
            }}
          >
            questions.
          </span>
        </h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={item.q}
              open={i === 0}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                borderTop: i === 0 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                padding: '20px 0',
              }}
            >
              <summary
                className="flex items-center justify-between cursor-pointer"
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: 17,
                  color: '#f5f5f7',
                  letterSpacing: '-0.005em',
                  gap: 24,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: '0.22em',
                    color: '#00F0FF',
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ flex: 1 }}>{item.q}</span>
                <span
                  className="contact-roster-faq-toggle"
                  aria-hidden
                  style={{
                    color: '#475569',
                    fontSize: 22,
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  +
                </span>
              </summary>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#94a3b8',
                  maxWidth: 660,
                  margin: '14px 0 0',
                  paddingRight: 40,
                  paddingLeft: 'calc(10.5px * 5)',
                }}
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/contact/ContactFAQ.tsx
git commit -m "feat(contact): add FAQ (native details accordion)"
```

---

## Task 18: Rewrite `src/app/contact/page.tsx`

**Files:**
- Modify: `src/app/contact/page.tsx` (full overwrite)

- [ ] **Step 1: Read existing file**

Use Read on `src/app/contact/page.tsx` to satisfy the Write prerequisite (the file is currently the restored original 318-line client component).

- [ ] **Step 2: Overwrite with the new composer**

```tsx
// src/app/contact/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ContactHero } from '@/components/sections/contact/ContactHero';
import { ContactCommittee } from '@/components/sections/contact/ContactCommittee';
import { ContactStudios } from '@/components/sections/contact/ContactStudios';
import { ContactBrief } from '@/components/sections/contact/ContactBrief';
import { ContactFAQ } from '@/components/sections/contact/ContactFAQ';

export const metadata = {
  title: 'Contact — Aurexis Solution',
  description:
    'Three founders, two studios, one call away. Book a 45-minute strategy session — we audit your stack, surface the bottlenecks, and walk you out with a real roadmap.',
};

export default function ContactPage() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: '#02040A', color: '#f5f5f7' }}
    >
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto" style={{ maxWidth: 1240, padding: '0 40px' }}>
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
```

- [ ] **Step 3: Verify lint + build**

```bash
npm run lint && npm run build
```
Expected: clean. `/contact` route should appear in the build summary, NOT marked as `"use client"`. Acceptable status symbols: `○ Static`, `ƒ Dynamic`.

- [ ] **Step 4: Browser check (after migration is applied)**

Open `http://localhost:3001/contact`. Expected:
- Site `<Navbar />` at top.
- Hero with stagger reveal, status pill showing current KL time.
- Committee section with 3 founder cards + CTA bar.
- Studios section with 2 cards + KL/SP skyline SVGs.
- Brief section with form on right + checks aside on left.
- FAQ with first item open.
- Site `<Footer />` at bottom.
- No console errors.

> **If form submission errors:** the migration `013_contact_messages.sql` may not have been applied yet. Apply via the Supabase dashboard SQL editor (paste the file contents and run) before testing form submission.

- [ ] **Step 5: (Optional) Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "feat(contact): rewrite page.tsx as server composer using site Navbar + Footer"
```

---

## Task 19: Final verification pass

**Files:** none — pure verification.

- [ ] **Step 1: Cold lint + build**

```bash
rm -rf .next
npm run lint
npm run build
```
Expected: both succeed. The build summary should show `/contact` and `/api/contact` routes.

- [ ] **Step 2: Visual diff vs mockup**

Open both:
- `http://localhost:3001/contact` (production)
- `http://localhost:6034/direction-m-area17.html` (mockup)

Walk top-to-bottom at 1440px width and confirm a close match for:
- Hero (statement, hollow-stroke "away.", italic "call", status pill, KPI)
- Committee header + 3 founder cards (portrait gradients, initials, hover behavior, "Brings to the call →" lines)
- Committee CTA bar (cyan glow, hover lift)
- Studios (skyline SVGs visible — Petronas Towers in cyan, mosque dome in violet)
- Brief (form on right, checks aside on left)
- FAQ (first item open, +/× toggle on click)

- [ ] **Step 3: Form submission flow**

Open `/contact`, fill the form with valid data, submit. Expected:
- Button changes to "Sending…", then form swaps to success state.
- A new row appears in `contact_messages` table.
- If Telegram env vars are configured, a message arrives in the configured chat and the row's `notified_at` is populated.

Submit invalid data (e.g., missing required fields). Expected:
- Inline field errors appear.
- Form does NOT swap to success state.

- [ ] **Step 4: Reduced-motion check**

Chrome DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload `/contact`. Expected:
- Hero stagger does NOT animate (elements appear instantly).
- Status pill emerald dot does NOT pulse.
- Hover effects on founders/studios still work.
- FAQ toggle still works.

- [ ] **Step 5: Keyboard a11y**

Tab through `/contact`. All interactive elements should be focusable in logical order: Navbar links → Hero CTA targets → Committee CTA button → Studio links → form intent chips → form fields → submit → FAQ summaries → Footer links. Visible focus rings on each.

- [ ] **Step 6: Mobile (390px)**

DevTools → device mode → iPhone 14 (390×844). Reload. Expected:
- Hero 2-col collapses to 1-col (status side below the lede).
- Committee 3-up collapses to 1-up vertical stack.
- CTA bar wraps (text on top, button below).
- Studios 2-up collapses to 1-up.
- Brief 2-col collapses to 1-col.
- FAQ 2-col collapses to 1-col.
- No horizontal scroll.

> Mobile breakpoints are acceptable to be imperfect for this scope. Document any major breaks for a follow-up; don't try to fix in this pass.

- [ ] **Step 7: Report results**

Summarize: lint ✅, build ✅, visual match ✅, form submit ✅ (or note env-var/migration prerequisites), reduced-motion ✅, a11y ✅, mobile (note any deltas). Hand control back.

- [ ] **Step 8: (Optional) Final commit + handoff note**

If the user has approved commits and per-task commits weren't done, this is the moment for a single feature commit. Otherwise, summarize what's uncommitted.

**Out-of-scope reminders for future sessions:**
- Admin UI to read `contact_messages` (will be added when admin portal is redesigned).
- Real Cal.com booking URL (currently `bookingUrl: '/contact#brief'` — scrolls to form. Replace with real URL when ready).
- Real co-founder 2 & 3 names + initials (currently `[Co-founder · 2]` / `[Co-founder · 3]` / `CF` initials in `contact-config.ts`).
- Real photography (currently gradient + serif-initial fallback in founder cards).
- Email notification channel (currently Telegram only — Telegram is wired because the infra already exists; email via Resend/SendGrid is a separate spec).
- CAPTCHA / rate limiting on the form.
