# `/contact` Redesign — The Studio Roster — Design Spec

**Status:** Direction & refined mockup approved by user — 2026-05-21
**Mockup (frozen reference):** [.superpowers/brainstorm/contact-2026-05-20/content/direction-m-area17.html](.superpowers/brainstorm/contact-2026-05-20/content/direction-m-area17.html)
**Replaces:** [src/app/contact/page.tsx](src/app/contact/page.tsx) (the original 318-line client component, restored in the earlier teardown)
**Supersedes:** [docs/superpowers/specs/2026-05-20-contact-aurora-redesign-design.md](docs/superpowers/specs/2026-05-20-contact-aurora-redesign-design.md) (Aurora Hero direction — rejected after build)

---

## Context

The current `/contact` page is the original 318-line `"use client"` component — competent but off-brand against the editorial visual system the rest of the site ships. Five rounds of brainstorming explored editorial-dispatch variants (rejected as "same as /portfolio"), off-palette experiments (rejected as "out of brand"), in-palette minimal directions (rejected as "too basic"), and SaaS-minimal references (rejected as "not enough information").

Round 5 grounded the work in three real premium agency references (AREA17, MetaLab, DEPT). The user picked **M (AREA17-style)** with these specific changes:

1. **Remove the "Recently shipped for" client logos strip** — Aurexis hasn't shipped publicly yet, so fake credibility is worse than none.
2. **The founders section ("The Committee") becomes the credibility move** — three real co-founders, with portrait-style cards and a "Brings to the call →" line per founder.
3. **Add a CTA button in the Committee section** — direct path from "meet the founders" to "book a session with them."
4. **Use the site's standard `<Navbar />` and `<Footer />`** — the page should feel cohesive with the rest of the site, not standalone.
5. **Premium and aesthetic execution** — confident typographic hierarchy, refined imagery (SVG city silhouettes instead of generic gradient blobs), restrained color (cyan dominant, violet sparing, amber removed, emerald only for status signals), subtle but real motion.

The frozen mockup at [direction-m-area17.html](.superpowers/brainstorm/contact-2026-05-20/content/direction-m-area17.html) is the visual source of truth. Production must match its density, typography, palette discipline, and section rhythm closely.

---

## Architecture

```
src/app/contact/page.tsx                              ← thin server composer (was 318-line client)
src/components/sections/contact/
├── ContactHero.tsx                                   ← server: kicker + headline + lede + status side
├── ContactStatusPill.tsx                             ← client: live KL time pill
├── ContactCommittee.tsx                              ← server: section composer for The Committee
├── ContactFounderCard.tsx                            ← server: single founder card (portrait + body)
├── ContactCommitteeCTA.tsx                           ← server: CTA bar below the founders
├── ContactStudios.tsx                                ← server: 2-up studio cards + section head
├── ContactStudioCard.tsx                             ← server: single studio card (image + body)
├── KLSkyline.tsx                                     ← server: inline SVG of KL skyline w/ Petronas
├── SungaiPetaniSkyline.tsx                           ← server: inline SVG of SP skyline w/ mosque
├── ContactBrief.tsx                                  ← server: section composer (aside + form)
├── ContactBriefForm.tsx                              ← client: form state + submit handler
└── ContactFAQ.tsx                                    ← server: native <details> accordion

src/data/contact-config.ts                            ← founders, FAQ, channels, studios, intents

src/app/api/contact/route.ts                          ← POST handler: validate + write + (optional) notify
src/types/portal.ts                                   ← add ContactMessage interface
supabase/migrations/013_contact_messages.sql          ← contact_messages table + RLS

src/app/globals.css                                   ← append: hero reveal keyframes, pulse, faq accordion
```

### Why this shape

- **Sections mirror the established pattern** in [src/components/sections/portfolio/](src/components/sections/portfolio/) — each section is a focused server component, the page is a thin composer.
- **Skylines as their own components** (`KLSkyline`, `SungaiPetaniSkyline`) — they're chunky SVGs that would clutter the studio card if inlined. Separated, they're easy to swap if/when real photography lands.
- **Only two client islands** — `ContactStatusPill` (interval-based clock update) and `ContactBriefForm` (form state + submit). Everything else is server-rendered.
- **Page uses site `<Navbar />` and `<Footer />`** — not a standalone funnel. This is the explicit user-requested course-correction from the earlier Aurora direction.

### Data flow

- Page is fully server-rendered. No DB fetches — all content is static from `contact-config.ts`.
- Form submission: client component posts JSON to `/api/contact`. The route handler validates input (basic Zod schema), inserts a row into `contact_messages` via `supabaseAdmin`, optionally fires a Telegram notification if `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` are set, and returns 200/422/500. Form swaps to a success state on 200.

---

## Sections in detail

### Hero

[src/components/sections/contact/ContactHero.tsx](src/components/sections/contact/ContactHero.tsx)

Server component. Two-column grid (`1fr auto`) with a bottom-border rule:

- **Left:** mono-cyan eyebrow "Contact · Studio open today" → giant `<h1>` "Three founders. / Two studios. / One *call* away." (Plus Jakarta 800 with one italic Instrument Serif accent on "call" in cyan, and a hollow-stroke treatment on "away" using `-webkit-text-stroke`) → lede paragraph with a `<b>` highlight.
- **Right side:** `<ContactStatusPill />` (live KL time, glassy pill) + a KPI block (giant italic serif `~24h` + small mono label "Reply window").

Subtle page-load reveal: staggered fade-up on the four hero elements via CSS `@keyframes rise` gated by `motion-safe:`.

### Status Pill (client)

[src/components/sections/contact/ContactStatusPill.tsx](src/components/sections/contact/ContactStatusPill.tsx)

`"use client"`. Renders `[●] Live · KL HH:MM MYT` with the emerald dot pulsing. Time format uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kuala_Lumpur'`, `hour12: false`. Server render shows placeholder `--:--` to avoid hydration mismatch; `useEffect` populates on mount and refreshes every 60s.

### The Committee — section composer

[src/components/sections/contact/ContactCommittee.tsx](src/components/sections/contact/ContactCommittee.tsx)

Server component. Section padding 96px vert + bottom-border rule (matches other sections).

- Section header: 2-col split (`1fr 1.5fr`). Left = mono "The Committee" label + giant h2 "Founders take / every *first call.*" (italic serif accent on "first call" in cyan). Right = supporting sub copy.
- Below: 3-up grid of `<ContactFounderCard />` (one per founder from config).
- Below grid: `<ContactCommitteeCTA />` bar.

### Founder Card

[src/components/sections/contact/ContactFounderCard.tsx](src/components/sections/contact/ContactFounderCard.tsx)

Server component. Props: `{ founder: Founder; accent: 'cyan' | 'violet' | 'cyan-mix' }`.

Renders a 4:5 portrait area on top with:
- Layered radial gradient suggesting headshot lighting (different gradient per accent variant).
- Subtle grain overlay (`background-image: radial-gradient(...)` + `mix-blend-mode: overlay`).
- "Available" pill top-right (emerald dot + glassy bg).
- Large italic serif initials (`clamp(80px, 11vw, 140px)`) centered, color-shifts from `rgba(255,255,255,0.18)` to the accent color on card hover.

Below the portrait, the card body has:
- Role line (mono caps, accent color)
- Founder name (Instrument Serif italic, 30px)
- Blurb (2-line sans body, gray)
- Top-rule + "**Brings to the call →** ..." mono line in accent color

Card hover lifts (`translateY(-3px)`) and gets accent border color + shadow. All CSS, no JS.

**Accent assignment from data:** founder 1 = cyan, founder 2 = violet, founder 3 = cyan-mix (cyan + faint violet wash). This is a deliberate restraint — cyan dominant, violet sparing, no amber.

### Committee CTA

[src/components/sections/contact/ContactCommitteeCTA.tsx](src/components/sections/contact/ContactCommitteeCTA.tsx)

Server component. Single horizontal bar below the 3-up founder grid. Subtle cyan gradient background, top hairline glow.

- LEFT: Instrument Serif italic "Book a 45-min session with the committee." + mono sub "Free · Mutual NDA · Mon–Fri · 10–18 MYT"
- RIGHT: Cyan pill button "Open the calendar →" with cyan glow shadow, hover lift.

Link target: `/contact#brief` for now (scrolls to the form section); when Cal.com routing is wired, point at the booking URL directly.

### The Studios — section composer

[src/components/sections/contact/ContactStudios.tsx](src/components/sections/contact/ContactStudios.tsx)

Server component. Same section padding + bottom-border. Section header pattern matches Committee: 2-col with "Where we work" label + h2 "Two studios. / One *handshake* away." + supporting sub.

Below: 2-up grid of `<ContactStudioCard />`.

### Studio Card

[src/components/sections/contact/ContactStudioCard.tsx](src/components/sections/contact/ContactStudioCard.tsx)

Server component. Props: `{ studio: Studio; accent: 'cyan' | 'violet'; skyline: ReactNode }`.

Renders:
- Top: 260px image area with the appropriate skyline SVG positioned at the bottom (`<KLSkyline />` or `<SungaiPetaniSkyline />`). Background layer is a radial wash in the accent color. City label pill (glassy) top-left.
- Body: role line (mono caps), city `<h3>` with the country in italic serif accent, meta `<dl>` (address / phone / email — phone & email as `<a>` links with cyan underlines), bottom hours line with green "Open now" indicator.

Card hover lifts and gets accent border color.

### KL Skyline

[src/components/sections/contact/KLSkyline.tsx](src/components/sections/contact/KLSkyline.tsx)

Server component. Inline SVG, `viewBox="0 0 600 110"`, `preserveAspectRatio="none"`, 100% width × 110px height.

Content: ~16 rectangle background buildings in two tint variants (`rgba(255,255,255,0.10)` and `0.14`) plus the iconic **Petronas Twin Towers** rendered as 4 stacked polygons (2 towers × 2 spires each), filled in cyan at 45% opacity. Towers positioned center, slightly off-axis to suggest depth.

Exact path data lives in this component; not abstracted further. This is the "design signature" of the KL studio card.

### Sungai Petani Skyline

[src/components/sections/contact/SungaiPetaniSkyline.tsx](src/components/sections/contact/SungaiPetaniSkyline.tsx)

Server component. Same SVG shape as KL but a smaller-town skyline: lower-rise rectangles, one mid-rise tower at left-center, and a **mosque dome silhouette** (an `<path>` with a half-circle dome on a wider rectangle base) in violet at 45% opacity. Mosque positioned in the right-center to balance the composition.

### The Brief — form section

[src/components/sections/contact/ContactBrief.tsx](src/components/sections/contact/ContactBrief.tsx)

Server component. Two-column split (`1fr 1.4fr`):

- **Aside (left):** h2 "Send us / a *brief.*" + lede + 4-item check list ("Reply within a working day…" etc.). Checks rendered as cyan-bordered circles with cyan checkmarks.
- **Form card (right):** the `<ContactBriefForm />` client island wrapped in a styled card (glass background + top rim-light hairline).

### Brief Form (client)

[src/components/sections/contact/ContactBriefForm.tsx](src/components/sections/contact/ContactBriefForm.tsx)

`"use client"`. Form fields:

1. **Intent chips row** — five toggle chips: "New project" (default selected), "AI & agent work", "Existing client", "Press & partnerships", "Careers". Stored as `intent` enum.
2. **Name** (required, text)
3. **Email** (required, email)
4. **Company** (optional, text)
5. **Stage** (select with 5 options: Idea/pre-seed · Early-stage startup · Series A·B · Growth/Series C+ · Enterprise)
6. **Message** (required, textarea — DB just enforces NOT NULL; no extra length minimum)

Submit handler:
- Disables button + shows "Sending…" state during request
- POSTs `{ intent, name, email, company, stage, message }` to `/api/contact`
- On 200: swap entire form to success state ("Got it — we'll come back to you within a working day. Look for a reply from `aurexissolution@gmail.com`.")
- On 422 (validation): show inline field errors
- On 500: show top-level error ("Something went wrong. Try emailing us directly: …")

Privacy note + submit button in `submit-row` (flex-between). Submit button has cyan glow + hover lift.

### FAQ

[src/components/sections/contact/ContactFAQ.tsx](src/components/sections/contact/ContactFAQ.tsx)

Server component. Native `<details>` accordion (no JS). Two-column shell: h2 "Common / *questions.*" on left, the question list on right.

Each `<details>` block:
- `<summary>` with: mono cyan number (`01`, `02`, ...) + question text + `+` toggle that rotates to `×` via CSS on `[open]`.
- `<p class="a">` answer below.

First question opens by default.

Data from `FAQ_ITEMS` array in `contact-config.ts`. Ships with the 5 questions from the mockup.

---

## Data model

### `src/data/contact-config.ts`

```ts
import type { Founder, Studio, ContactIntent, FAQ } from '@/types/portal';

export const STUDIO_TIMEZONE = 'Asia/Kuala_Lumpur';
export const STUDIO_HOURS = 'Mon–Fri · 10–18 MYT';
export const REPLY_WINDOW_LABEL = '~24h';
export const STRATEGY_SESSION_LEN = 45;

export const CHANNELS = {
  email: 'aurexissolution@gmail.com',
  phone: '+60164071129',
  phoneDigits: process.env.NEXT_PUBLIC_AUREXIS_WHATSAPP || '60164071129',
  bookingUrl: '/contact#brief', // placeholder; replace with Cal.com link when wired
} as const;

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
    initials: 'CF',                    // ← REPLACE with real initials
    name: '[Co-founder · 2]',          // ← REPLACE with real name
    role: 'Co-founder · Product & Design',
    blurb: 'Product designer turned operator. Leads brand, product UX, and client relationships. Joins strategy sessions for product-led work.',
    brings: 'product framing, UX teardowns, brand+go-to-market.',
    accent: 'violet',
    available: true,
  },
  {
    initials: 'CF',                    // ← REPLACE
    name: '[Co-founder · 3]',          // ← REPLACE
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
  { q: 'Is the 45-minute call really free?', a: 'Yes. No card, no "trial" pricing, no obligation. We treat the call as our cost of qualifying the engagement — you walk out with a written summary either way.' },
  { q: "What if I'm just exploring?", a: "Then exploring is what the session is for. About a third of the calls we run end with us telling someone they don't need to hire anyone yet." },
  { q: 'Do you sign mutual NDAs?', a: 'Yes — from the first message if you ask. We use our standard mutual NDA; happy to redline yours if you have one.' },
  { q: 'How fast do you actually reply?', a: 'Within a working day, every time. WhatsApp on +60 16-407 1129 if it\'s urgent.' },
  { q: "Who's on the other end?", a: "One of the three of us — the same person who'd be on the project. We don't do SDRs." },
];

export const HERO_COPY = {
  eyebrow: 'Contact · Studio open today',
  titleLines: ['Three founders.', 'Two studios.'],
  titleClose: { plain: 'One', italic: 'call', stroke: 'away' },
  lede: 'A real engineer reads every message and replies within a working day. Briefs, RFPs, "is this even possible" questions — bring all of it. We work with founders building products that need to actually ship.',
};

export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Instagram', href: 'https://www.instagram.com/aurexissolution?igsh=eTJsb3J3aG9wcHc4&utm_source=qr' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/aurexissolution/' },
  { label: 'X', href: 'https://x.com/aurexissolution?s=21' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/18HRuAqL75/?mibextid=wwXIfr' },
];
```

### Type additions to `src/types/portal.ts`

```ts
export type ContactIntent =
  | 'new-project' | 'ai-agent' | 'existing-client'
  | 'press-partnerships' | 'careers';

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
  role: string;             // "Headquarters" | "Build floor"
  address: string;
  addressNote: string;
  accent: 'cyan' | 'violet';
  skyline: 'kl' | 'sp';
}

export interface FAQ { q: string; a: string }

export interface ContactMessage {
  id: string;
  intent: ContactIntent;
  name: string;
  email: string;
  company: string | null;
  stage: string | null;
  message: string;
  created_at: string;
  notified_at: string | null;       // when Telegram notification was sent (null if not configured)
}
```

### Migration `013_contact_messages.sql`

```sql
-- 013_contact_messages.sql
-- Stores submissions from the /contact form. Public anonymous writes are NOT
-- allowed — submissions go through /api/contact using the service role.

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
-- Admin viewing is out of scope for this spec; will be added when the
-- admin portal is redesigned.
```

### API route `src/app/api/contact/route.ts`

`POST` handler:
1. Parse JSON body, validate with a Zod schema (or hand-rolled validation matching the CHECK constraints).
2. On validation failure, return `422` with `{ errors: { field: message } }`.
3. Insert row into `contact_messages` via `supabaseAdmin`. On Postgres error, return `500`.
4. If `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` are set, fire-and-forget a Telegram message: `[Aurexis · /contact] {intent} from {name} <{email}> · {company || '—'}\n{message}`. On send success, update `notified_at = NOW()` on the row. Telegram failure does NOT block the 200 response — it's a non-fatal side effect.
5. Return `200` with `{ ok: true }`.

The handler matches the existing pattern in `src/app/api/tickets/notify/route.ts` (already uses Telegram bot).

---

## Reusable primitives

Imported as-is:
- **`<Navbar />`** from [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) — site standard, NOT a contact-specific replacement.
- **`<Footer />`** from [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) — site standard.
- **`supabaseAdmin`** from [src/lib/supabase/server.ts](src/lib/supabase/server.ts) — server-side DB writes.
- **`cn`** from [src/lib/utils.ts](src/lib/utils.ts) — class composition.
- Lucide icons: `ArrowRight` (CTA arrows), `Check` (success state).
- Design tokens from [src/app/globals.css](src/app/globals.css): `--font-instrument-serif`, `--font-plus-jakarta`, `--font-geist-mono`.

Deliberately NOT reused:
- The earlier (deleted) `ContactStickyNav` and `ContactFooter` — the user explicitly rejected the "standalone funnel" pattern.
- Framer Motion — page is animation-light. Hero stagger reveal is pure CSS; founder card hover, FAQ toggle, button hover are all CSS transitions.

---

## Animation discipline

| Element | Mechanism | Reduced-motion |
|---|---|---|
| Hero stagger reveal (eyebrow → h1 → lede → side) | CSS `@keyframes rise` with `animation-delay` per element | Gated by `@media (prefers-reduced-motion: no-preference)` |
| Status pill emerald-dot pulse | CSS `@keyframes pulse` (opacity) | `motion-safe:` gate |
| Founder portrait initial color-shift on hover | CSS `transition` on `color` + `transform` | Respected (hover-triggered) |
| Founder card lift on hover | CSS `transition` on `transform` + `box-shadow` | Respected (hover-triggered) |
| FAQ `+` → `×` toggle | CSS `transition` on `transform` triggered by `[open]` | Respected (user-triggered) |
| Studio card lift on hover | CSS `transition` | Respected (hover-triggered) |
| Submit button hover lift + glow | CSS `transition` | Respected (hover-triggered) |
| Form submit "Sending…" → success transition | React state swap with CSS opacity transition (~250ms) | Respected (user-triggered) |

No Framer Motion. No `IntersectionObserver` scroll reveals. No count-ups.

---

## Verification

After implementation:

1. **Static checks**
   - `npm run lint` clean.
   - `npm run build` clean. `/contact` route appears as server-rendered. No `"use client"` on `page.tsx`. Contact-specific client-component files limited to exactly `ContactStatusPill` and `ContactBriefForm` (the site `<Navbar />` and `<Footer />` are also client, but they're external to this work).
   - TypeScript strict clean.

2. **Migration**
   - `013_contact_messages.sql` applies cleanly. Verify table + constraint + index + RLS enabled via `\d contact_messages`.

3. **Page renders (browser, 1440px)**
   - Site `<Navbar />` at top (sticky), site `<Footer />` at bottom — visually matches other pages.
   - Hero: status pill shows current KL time, headline renders with italic "call" + hollow-stroke "away", stagger fade-up animates on first load.
   - Committee: 3 founder cards with portrait gradients, initials, "Brings to the call →" lines. Hover lifts each card + color-shifts the initial mark.
   - Committee CTA bar with cyan button visible right below the founders.
   - Studios: 2 cards with KL skyline (Petronas Towers in cyan) and SP skyline (mosque dome in violet) visible at the bottom of each image area.
   - Brief: form on right with all fields, chips toggleable, NDA on left as part of the checks.
   - FAQ: first item open, click toggles others, `+` rotates to `×`.

4. **Form submission flow**
   - Submit with valid data → 200 response, form swaps to success state, row appears in `contact_messages` table.
   - Submit with missing required field → 422, inline error visible.
   - Submit with malformed email → 422, inline error visible.
   - With Telegram env vars set: Telegram bot receives message; `notified_at` populated on the row.
   - Without Telegram env vars: row still inserts, `notified_at` is null, no error.

5. **A11y + reduced motion**
   - Tab order: navbar → hero CTA targets → committee card links (if any) → CTA button → studio links → form fields → submit → FAQ summaries → footer links.
   - All interactive elements have visible focus rings.
   - Headings are logical (`<h1>` once in hero, `<h2>` per section, `<h3>` on cards).
   - DevTools → emulate `prefers-reduced-motion: reduce` → hero stagger doesn't animate, pulse dots stop, everything else (hover effects) still works.

6. **Mobile (390px)**
   - Hero 2-col collapses to 1-col stack (status side below the lede).
   - Committee 3-up collapses to 1-up vertical stack; card portrait stays 4:5.
   - CTA bar wraps (text on top, button below).
   - Studios 2-up collapses to 1-up.
   - Brief 2-col collapses to 1-col (aside above form).
   - FAQ 2-col collapses to 1-col.
   - Form fields full-width, no horizontal scroll.

7. **Visual diff vs mockup**
   - Compare `http://localhost:3001/contact` against `http://localhost:6034/direction-m-area17.html` at 1440px. Should match closely in spacing, typography, color application, and overall rhythm.

---

## Out of scope (deferred or follow-up)

- **Admin viewing of contact_messages.** No admin UI in this scope. Submissions are stored; reading requires direct Supabase access until the admin portal redesign covers it.
- **Real founder photography.** The portrait cards use a gradient + serif-initial treatment as a strong fallback. When real headshots are ready, the founder card swaps to an `<img>` element with the same aspect ratio; the gradient becomes a fallback for image-load errors.
- **Real co-founder names.** The data ships with `[Co-founder · 2]` and `[Co-founder · 3]` placeholders. User fills these into `contact-config.ts` before launch.
- **Cal.com booking link.** The Committee CTA currently scrolls to the brief form section. When the user provides the real Cal.com booking link, `CHANNELS.bookingUrl` updates and the CTA opens the calendar directly.
- **CAPTCHA / rate limiting on the form.** Out of scope for v1. If spam becomes an issue, add Cloudflare Turnstile or a simple rate limit (e.g., max 5 submissions per IP per hour) in a follow-up.
- **Email reply via Resend/SendGrid** (instead of Telegram) as the notification channel. Telegram is the path of least resistance because the infrastructure already exists in this codebase (`/api/tickets/notify`). Swapping to email is a separate spec.
- **Featured project preview / case study peek.** Considered but cut — the page already has the Committee + Studios as credibility. Adding case studies would conflict with the "we haven't shipped publicly yet" reality.
- **Multilingual content.** Page ships English-only. Bahasa support is a separate i18n pass when the rest of the site adopts it.
