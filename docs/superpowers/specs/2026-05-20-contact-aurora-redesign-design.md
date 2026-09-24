# `/contact` Redesign — Aurora Hero — Design Spec

**Status:** Direction & refined mockup approved by user — 2026-05-20
**Mockup (frozen reference):** [.superpowers/brainstorm/contact-2026-05-20/content/direction-h-aurora.html](.superpowers/brainstorm/contact-2026-05-20/content/direction-h-aurora.html)
**Replaces:** [src/app/contact/page.tsx](src/app/contact/page.tsx)

---

## Context

The current `/contact` page is a competent two-column layout (left = editorial copy + contact details + NDA card + social proof, right = chrome-wrapped Cal.com embed) marked `"use client"` with heavy Framer Motion staggers. Its visual register predates the editorial system the rest of the site has shipped, and it offers no fallback paths for visitors who don't want to commit to a calendar slot.

After three rounds of brainstorming (`A/B/C` editorial-layout variants → rejected as "same as /portfolio"; `D/E/F` off-palette experiments → rejected as "out of brand"; `G/H/I` brand-palette-strict redesigns), the user approved **Direction H — Aurora Hero**: a full-viewport animated aurora hero, inline Cal embed in a dedicated booking section with agenda sidebar, then FAQ + testimonial + multi-channel alternatives + directory + footer. Strictly within the existing Aurexis palette (dark `#02040A` + cyan/violet/amber accents).

The refined mockup adds — beyond the original H — a sticky glass nav with persistent "Book →" CTA, a trusted-by logo strip, inline Cal embed with month+slots flow, agenda/outcomes sidebar, "calendar full?" alternatives bar (WhatsApp/Telegram/Email), FAQ accordion, named testimonial, copy-to-clipboard contact directory, and integrated footer.

---

## Architecture

```
src/app/contact/page.tsx                          ← thin server composer (was "use client")
src/components/sections/contact/
├── ContactStickyNav.tsx                          ← floating glass nav, position: fixed (server)
├── ContactAurora.tsx                             ← animated mesh background (server, pure CSS)
├── ContactHero.tsx                               ← composes status pill + headline + CTA row + trusted-by + scroll cue
├── ContactStatusPill.tsx                         ← "Live · KL HH:MM MYT · Available" with KL local time (client)
├── ContactTrustedBy.tsx                          ← horizontal logo strip (server)
├── ContactBooking.tsx                            ← section wrapper: heading + book card
├── ContactCalEmbed.tsx                           ← Cal.com `<Cal />` wrapper, branded (client)
├── ContactBookingSidebar.tsx                     ← agenda + outcomes + pre-call brief note (server)
├── ContactAlternatives.tsx                       ← "calendar full?" 3-button row (server)
├── ContactFAQ.tsx                                ← 4-question accordion using native <details> (server)
├── ContactTestimonial.tsx                        ← single pull quote + attribution (server)
├── ContactDirectory.tsx                          ← 3-up Email/Phone/Studios with CopyButton islands
├── ContactCopyButton.tsx                         ← small client-island copy-to-clipboard button (client)
└── ContactFooter.tsx                             ← NDA + social-proof avatars + social + sig (server)

src/data/contact-config.ts                        ← static config: channels, FAQ, testimonial, agenda, etc.
src/app/globals.css                               ← append: aurora keyframes, scroll cue, faq toggle, dot pulse
```

### Why this shape

- Mirrors the section-component pattern established in `src/components/sections/services/` and `src/components/sections/portfolio/`. Today's `page.tsx` mixes layout + animation + state + Cal config in 318 lines; splitting into focused server components with named client islands matches the codebase's prevailing approach.
- **Server-first with surgical client islands.** Only the bits that genuinely need JS (`ContactStatusPill` clock, `ContactCalEmbed` iframe, `ContactCopyButton` clipboard) become client components. Everything else (Sticky Nav, Hero, Aurora, Booking layout, Sidebar, Alternatives, FAQ, Testimonial, Directory shell, Footer) is server-rendered. Result: indexable HTML, faster TTFB, no React hydration for static sections.
- **`<details>` for the FAQ** (no JS). The browser handles the accordion natively.
- **The page does NOT use the site-wide `<Navbar />` or `<Footer />`.** The mockup has its own sticky nav and its own footer with contact-specific content (NDA reassurance + social proof + Privacy/Terms/Cal.com sig). This is a deliberate "/contact is its own world" choice — the page is a self-contained funnel.

### Data flow

No DB calls. All page content is static, sourced from `src/data/contact-config.ts`. The Cal.com embed loads on mount (client-side iframe).

---

## Sections in detail

### Sticky nav

[src/components/sections/contact/ContactStickyNav.tsx](src/components/sections/contact/ContactStickyNav.tsx)

Client component (`"use client"`). Floats top-center of viewport with `position: fixed; top: 16px; left: 50%; transform: translateX(-50%)`. Glassy pill with backdrop-blur, rounded-full, 1px white-10 border.

Three columns: brand mark (`✦ Aurexis` in Instrument Serif italic) → nav links (Work · Services · Lab · Contact in mono uppercase) → primary CTA (`Book →` cyan pill).

**Scroll behavior:** Always visible. Same visual treatment at every scroll position. Implementation can be pure CSS (`position: fixed`); no JS required. The "fade back when in hero" idea was considered and rejected as overengineering — the glass treatment already softens the nav enough that it doesn't fight the hero headline.

**Nav link targets:** `/work`, `/services`, `/the-lab`, and `#book` (in-page anchor). Verify these route names against the live `src/app/` directory before final wiring — the current site uses `/portfolio` not `/work`; the spec ships with the correct paths picked up from there.

### Aurora background

[src/components/sections/contact/ContactAurora.tsx](src/components/sections/contact/ContactAurora.tsx)

Server component. Pure JSX divs positioned absolutely inside the hero section. Four radial-gradient "layer" divs, each a circle with `mix-blend-mode: screen` and `filter: blur(80px)`, each animated with its own CSS keyframe (`hDrift1` through `hDrift4`, 22–32s ease-in-out alternate). One vignette `::before` to fade the edges to `#02040A`; one grain `::after` overlay.

**Reduced-motion:** All four `hDrift*` animations gated by `motion-safe:` (Tailwind utility) so users with `prefers-reduced-motion: reduce` see a static aurora. Static state still looks rich; the motion is a bonus.

### Hero

[src/components/sections/contact/ContactHero.tsx](src/components/sections/contact/ContactHero.tsx)

Server component. `<section>` with `min-height: 100vh`, padding, flex-column centered. Composes:

1. `<ContactAurora />` (positioned absolute, behind)
2. `<ContactStatusPill />` (positioned top-right)
3. Centered hero block:
   - Kicker line: `— Booking — 45 min strategy session —` (monospace cyan)
   - Headline `<h1>`: `Open` line + line break + `a project.` in gradient italic (`linear-gradient(120deg, #00F0FF, #A78BFA 60%, #FBBF24)` clipped to text). `clamp(80px, 13vw, 184px)`, Plus Jakarta black weight 900, line-height 0.88, letter-spacing -0.05em.
   - Sub: italic serif lede, "Forty-five free minutes…" with `<b>a real roadmap</b>` highlight.
   - CTA row: primary cyan `Book a session →` pill + secondary `WhatsApp now` glass pill side by side.
4. `<ContactTrustedBy />` below CTA row
5. Scroll cue at bottom: monospace caption "Scroll for the calendar" + animated dropping line.

### Status pill (live time)

[src/components/sections/contact/ContactStatusPill.tsx](src/components/sections/contact/ContactStatusPill.tsx)

Client component. Renders `Live · KL HH:MM MYT · Available` with a pulsing cyan dot. Uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kuala_Lumpur'` to render the current KL time, updating once per minute via `setInterval`. Server-render shows `Live · KL —:— MYT · Available` as a fallback to prevent hydration mismatch — the time hydrates client-side on mount.

### Trusted-by strip

[src/components/sections/contact/ContactTrustedBy.tsx](src/components/sections/contact/ContactTrustedBy.tsx)

Server component. Renders a horizontal flex-wrap of 6 logos, alternating Instrument Serif italic and Plus Jakarta black uppercase for visual variety (matches the Vercel/Linear pattern). Above the logos: small monospace `Trusted by founders shipping at` caption.

Data source: `TRUSTED_BY` constant array in `contact-config.ts`. Each entry is `{ name: string; style: 'serif' | 'sans' }`. The spec ships with the 6 names from the mockup (Orbital, LUMEO, ClearSky, NYX, Aroma, MIRA POS), which the user can edit in the config. If/when we wire this to live `portfolio_items` data, we replace the static array with a server fetch — out of scope for this spec.

### Booking section

[src/components/sections/contact/ContactBooking.tsx](src/components/sections/contact/ContactBooking.tsx)

Server component shell. `<section id="book">` with subtle radial cyan wash backdrop (`linear-gradient(180deg, transparent, rgba(0,240,255,.015) 30%, transparent)`).

Section header: kicker (`Pick your time`) → h2 (`Forty-five minutes, / on us.` with `on us.` in italic-serif gradient) → lede paragraph.

Below: `<ContactBookingCard>` — a grid `1.4fr / 1fr` (12-col equivalent) glass card containing:
- LEFT (~58%): `<ContactCalEmbed />`
- RIGHT (~42%): `<ContactBookingSidebar />`

Card has 1px white-8 border, rounded-2xl, `padding: 36px`, top rim-light hairline (linear-gradient stripe at `::before`).

### Cal embed

[src/components/sections/contact/ContactCalEmbed.tsx](src/components/sections/contact/ContactCalEmbed.tsx)

Client component (required by `@calcom/embed-react`). Imports `Cal`, `getCalApi` from `@calcom/embed-react`.

Same Cal config as the current page:
```tsx
useEffect(() => {
  (async () => {
    const cal = await getCalApi({ namespace: CAL_NAMESPACE });
    cal('ui', {
      styles: { branding: { brandColor: '#00F0FF' } },
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
  })();
}, []);

return (
  <Cal
    namespace={CAL_NAMESPACE}
    calLink={CAL_LINK}
    style={{ width: '100%', height: '100%', overflow: 'scroll' }}
    config={{ layout: 'month_view', hideEventTypeDetails: 'false' }}
  />
);
```

Constants `CAL_NAMESPACE = 'strategy-session'` and `CAL_LINK = 'aurexis-solution/45min'` live in `contact-config.ts` (currently inlined in the live page).

Wrapped in a custom-styled outer container — `background: rgba(2,4,10,.6)`, 1px white-8 border, rounded-xl, `padding: 22px`, `backdrop-filter: blur(10px)`. Min-height 540px so the Cal iframe has space to fully render its month + slots flow without internal scroll.

**Important — the mockup is deceptive here.** The mockup hand-renders a fake month-grid + slots panel + timezone footer inside the wrapper to *suggest* what Cal.com will look like. In production we do NOT render any of that ourselves — Cal.com's iframe paints its own month picker, slot selector, header, and footer. Our wrapper is just the editorial frame: border + radius + padding + backdrop-blur. Cal.com's iframe goes inside.

### Booking sidebar (agenda + outcomes + pre-brief)

[src/components/sections/contact/ContactBookingSidebar.tsx](src/components/sections/contact/ContactBookingSidebar.tsx)

Server component. Three stacked blocks:

1. **Agenda** — `<h3>` "Agenda · What we cover", `<ul>` with 3 items (cyan ◇ bullets). Data from `AGENDA` array in config.
2. **Outcomes** — same shape as Agenda. Heading "Outcomes · What you leave with", `<ul>` with 3 items (violet ◆ bullets). Data from `OUTCOMES` array.
3. **Pre-call brief note** — italic serif callout with violet left-border. Copy: "You'll get a 3-question form by email immediately after booking. It takes ~90 seconds…"

Each block is a `padding: 22px; border: 1px solid rgba(255,255,255,.06); border-radius: 12px; background: rgba(255,255,255,.015)` card. Stacked with 24px gaps.

### Alternatives

[src/components/sections/contact/ContactAlternatives.tsx](src/components/sections/contact/ContactAlternatives.tsx)

Server component. Single horizontal card, `max-width: 1080px`, 3-col grid (`auto / 1fr / auto`).

- LEFT: italic serif lead "**Calendar full?** Reach us another way…"
- CENTER: 3 pill buttons (WhatsApp · Telegram · Email a brief), each with a colored dot indicator (WA green `#25D366`, TG blue `#0088CC`, Email cyan `#00F0FF`).
- RIGHT: monospace "Typical response · under 4 hours · working days"

Links built from `CHANNELS` constants in config:
- WhatsApp: `https://wa.me/${stripNonDigits(channels.phone)}`
- Telegram: `https://t.me/${channels.telegramHandle}` *(TBD by user — see Data section)*
- Email: `mailto:${channels.email}`

### FAQ

[src/components/sections/contact/ContactFAQ.tsx](src/components/sections/contact/ContactFAQ.tsx)

Server component. Section header (kicker "Common questions" + h2 "Before you / book.") + `<ContactFAQ />` body.

The FAQ body is a vertical stack of `<details>` elements, no JS. Each item:

```tsx
<details>
  <summary>
    <span><span className="num">01</span> &nbsp; {question}</span>
    <span className="toggle">+</span>
  </summary>
  <p className="a">{answer}</p>
</details>
```

CSS: hide the native `summary` marker, replace with a `+` that rotates to `×` (via `transform: rotate(45deg)`) when `[open]`. Border-bottom on each detail; border-top on the first. Question type in Instrument Serif italic 22px; answer in Plus Jakarta 15px gray.

First item rendered with `open` attribute (so the page lands with FAQ #1 already expanded).

Data from `FAQ_ITEMS` array in config. Ships with the 4 questions from the mockup.

### Testimonial

[src/components/sections/contact/ContactTestimonial.tsx](src/components/sections/contact/ContactTestimonial.tsx)

Server component. Section with subtle radial violet wash backdrop. Centered max-width-880 column.

Decorative oversized cyan italic quote-mark `"` (140px, opacity 0.35) positioned above-center. `<blockquote>` in Instrument Serif italic, `clamp(28px, 4vw, 44px)`, line-height 1.25, with one `<em>` accent in cyan italic. `<p class="attrib">` below with `<b>Name</b> · Role · Company` in monospace uppercase.

Data from `TESTIMONIAL` constant. Ships with the Orbital Treasury placeholder; user replaces with a real quote.

### Directory

[src/components/sections/contact/ContactDirectory.tsx](src/components/sections/contact/ContactDirectory.tsx)

Server component shell with 3 client-island copy buttons.

Section header (kicker "Direct lines" + h2 "Or just / ring us."). Below: 3-up grid (`grid-cols-3`, 1px gap creating the border-grid effect, outer 1px border + rounded-2xl, overflow hidden).

Three cells:
1. **Email** — label, `<a href="mailto:...">`, italic serif note, `<ContactCopyButton text={email} />`.
2. **Phone · WhatsApp · Telegram** — label, `<a href="tel:...">`, note "Same number on all three…", copy button.
3. **Studios** — label, two address lines (Kuala Lumpur · Sungai Petani), italic serif note "Walk-ins by appointment only. Coffee's on us." No copy button.

### Copy button (client island)

[src/components/sections/contact/ContactCopyButton.tsx](src/components/sections/contact/ContactCopyButton.tsx)

Client component (`"use client"`). Small button: `Copy →`. On click, calls `navigator.clipboard.writeText(text)`, swaps label to `Copied ✓` for 1.5s, then reverts. Pure CSS for the styling (matches mockup).

### Footer

[src/components/sections/contact/ContactFooter.tsx](src/components/sections/contact/ContactFooter.tsx)

Server component. Top border, padding, max-width 1200.

Row 1 (3-col grid): LEFT = NDA serif italic paragraph; CENTER = social-proof avatars (4 DiceBear circles) + "50+ founders have filed a session"; RIGHT = social link list (Instagram · LinkedIn · X · Facebook).

Row 2 (sig line): LEFT = "Aurexis Solution · Built in Kuala Lumpur · 2026"; RIGHT = Privacy · Terms · Powered by Cal.com.

Social links from `SOCIAL_LINKS` config constant (same data as the existing /contact page).

---

## Data model

**No DB changes.** All page content is static config.

### `src/data/contact-config.ts`

```ts
export const STRATEGY_SESSION_LENGTH_MIN = 45;
export const STUDIO_HOURS = 'Mon–Fri · 10–18 MYT';
export const STUDIO_TIMEZONE = 'Asia/Kuala_Lumpur';

// Cal.com
export const CAL_NAMESPACE = 'strategy-session';
export const CAL_LINK = 'aurexis-solution/45min';
export const CAL_BRAND_COLOR = '#00F0FF';

// Channels
export const CHANNELS = {
  email: 'aurexissolution@gmail.com',
  phone: '+60164071129',          // dial string
  phoneDigits: '60164071129',     // for wa.me/...
  telegramHandle: 'aurexissolution', // TBD — confirm real handle
} as const;

// Studios
export const STUDIOS = [
  { city: 'Kuala Lumpur', country: 'Malaysia' },
  { city: 'Sungai Petani', country: 'Kedah' },
] as const;

// Hero copy
export const HERO = {
  kicker: 'Booking — 45 min strategy session',
  titleLineOne: 'Open',
  titleLineTwo: 'a project.',
  sub: 'Forty-five free minutes. We audit your stack, surface the bottlenecks, and walk you out with a real roadmap.',
  primaryCta: 'Book a session',
  secondaryCta: 'WhatsApp now',
};

// Trusted-by
export const TRUSTED_BY: ReadonlyArray<{ name: string; style: 'serif' | 'sans' }> = [
  { name: 'Orbital', style: 'serif' },
  { name: 'LUMEO', style: 'sans' },
  { name: 'ClearSky', style: 'serif' },
  { name: 'NYX', style: 'sans' },
  { name: 'Aroma', style: 'serif' },
  { name: 'MIRA POS', style: 'sans' },
];

// Agenda + outcomes
export const AGENDA: ReadonlyArray<string> = [
  'Walk through your stack — data, infra, AI, surfaces.',
  'Pinpoint the bottleneck quietly costing you the most.',
  'Map the next 3 moves — what to build, what to delete.',
];
export const OUTCOMES: ReadonlyArray<string> = [
  'A written audit summary in your inbox within 24h.',
  'An honest read on whether we\'re a fit — or who is.',
  'A concrete next-step plan, even if you never hire us.',
];

// FAQ — full copy lives in the mockup at
// .superpowers/brainstorm/contact-2026-05-20/content/direction-h-aurora.html (search for "h-faq").
// The implementation plan should transcribe those four answers verbatim into this array.
export const FAQ_ITEMS: ReadonlyArray<{ q: string; a: string }> = [
  { q: 'Is the 45-minute call really free?', a: /* from mockup */ },
  { q: 'What if I\'m just exploring and not ready to hire?', a: /* from mockup */ },
  { q: 'What if I\'m not technical?', a: /* from mockup */ },
  { q: 'Who\'ll be on the other end of the call?', a: /* from mockup */ },
];

// Testimonial. The mockup renders the full quote, then one fragment in <em> for emphasis.
// To avoid the fragile pattern of "split the quote string by substring match", we split
// the data here: the `quote` is the lead-up, the `emphasis` is the part rendered as <em>.
// The component concatenates them with a space.
export const TESTIMONIAL = {
  quote: 'They walked us through every bottleneck in the first call. By the end, we had a roadmap our own team couldn\'t have written.',
  emphasis: 'Three weeks later we were shipping again.',
  author: 'Maya R.',
  role: 'Head of Product',
  company: 'Orbital Treasury',
};

// Social
export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Instagram', href: 'https://www.instagram.com/aurexissolution?...' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/aurexissolution/' },
  { label: 'X', href: 'https://x.com/aurexissolution?s=21' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/18HRuAqL75/?mibextid=wwXIfr' },
];

// Site nav targets (verify against live routes)
export const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Work', href: '/portfolio' },
  { label: 'Services', href: '/services' },
  { label: 'Lab', href: '/the-lab' },
  { label: 'Contact', href: '#book' },
];
```

### Environment variables

`NEXT_PUBLIC_AUREXIS_WHATSAPP` exists in `.env.example` and is already referenced by `src/components/sections/FinalCTA.tsx`. The new `ContactAlternatives` and `ContactHero` should use it for the WhatsApp link, falling back to the hardcoded `60164071129` when unset (which is the existing pattern).

No new env vars needed.

### `CHANNELS.telegramHandle` is TBD

The mockup links to `https://t.me/aurexissolution` as a placeholder. **Before the implementation lands, the user confirms whether that handle exists, or provides the correct one.** If Telegram isn't a real channel, drop the Telegram button entirely and the alternatives bar becomes 2-up (WhatsApp + Email).

---

## Reusable primitives

Imported as-is:
- `cn` from [src/lib/utils.ts](src/lib/utils.ts) — class composition.
- `Cal`, `getCalApi` from `@calcom/embed-react` (already a project dep).
- Lucide icons: `ArrowRight`, `Phone`, `Mail`, `MapPin`, `MessageCircle`, `Send`.

Deliberately NOT reused:
- `<Navbar />` and `<Footer />` from `src/components/layout/` — the new `/contact` is a self-contained funnel with its own `ContactStickyNav` and `ContactFooter`. This breaks site-cohesion convention; it's an intentional design choice to make the booking experience feel like a focused destination rather than a generic site page.
- `<NeonButton />` — the hero CTA is a plain `<Link>` styled with a cyan-pill class. Matches the editorial register's preference for plain links over a NeonButton component.
- Framer Motion — the page is animation-light. The aurora drift, pulse dots, FAQ toggle, and CTA arrow nudge are all pure CSS. The sticky nav's appearance behavior is a single `useEffect` with scroll listener. No Framer Motion dependency on this page.

---

## Animation discipline

| Element | Mechanism | Reduced-motion |
|---|---|---|
| Aurora layer drift (4 layers) | CSS `@keyframes` ease-in-out alternate, 22–32s loops | `motion-safe:` gate; static aurora otherwise |
| Pulsing cyan dot (status pill, footer avatars context) | CSS `@keyframes` 2s opacity loop | `motion-safe:` gate; static dot otherwise |
| Scroll cue dropping line | CSS `@keyframes` translateY 2.4s loop | `motion-safe:` gate; static caption otherwise |
| FAQ `+` to `×` toggle | CSS transition on `[open]` selector | Respected automatically (transition only on user click) |
| CTA arrow nudge on hover | CSS transition | Respected automatically (hover-triggered) |
| Sticky nav appearance on scroll | `useEffect` + scroll listener + class toggle | No motion; opacity step is instant (no animation) |
| Copy button label swap | CSS transition between "Copy →" and "Copied ✓" | Respected automatically (transition is opacity/color, not transform) |

No `IntersectionObserver`, no count-ups, no Lenis tie-ins, no Framer Motion.

---

## Verification

After the implementation plan executes:

1. **Static checks**
   - `npm run lint` clean.
   - `npm run build` clean. `/contact` should appear as a server-rendered route (no `"use client"` on `page.tsx`). Client-component files should be limited to: `ContactStatusPill`, `ContactCalEmbed`, `ContactCopyButton`. The build summary should show `/contact` as `ƒ Dynamic` or `○ Static` depending on Next's analysis.
   - TypeScript strict clean.

2. **Hero**
   - Aurora background animates with four drifting blurred orbs; reduced-motion mode renders a static aurora.
   - Status pill shows current KL time formatted `HH:MM` and updates every 60s.
   - Primary CTA scrolls smoothly to `#book` (CSS `scroll-behavior: smooth` on `html`).
   - Secondary WhatsApp CTA opens `https://wa.me/${digits}` in a new tab.

3. **Sticky nav**
   - Visible at page load.
   - Persists through all scroll positions.
   - "Book →" CTA scrolls to `#book`.
   - Other nav links route to `/portfolio`, `/services`, `/the-lab`.

4. **Cal embed**
   - Renders Cal.com booking widget at `aurexis-solution/45min`.
   - Brand color is `#00F0FF`.
   - Picking a date and a slot, then completing booking, lands on the Cal.com confirmation screen. The actual booking flow is Cal.com's — we just frame it.
   - Cal embed loads without console errors on a clean cache (no broken iframe, no failed asset fetches in the network tab).

5. **Alternatives bar**
   - WhatsApp link opens `wa.me/${digits}`.
   - Telegram link opens `t.me/${handle}` (if handle is provided; otherwise button is omitted at build time based on config).
   - Email link opens default mail client with `aurexissolution@gmail.com`.

6. **FAQ**
   - First `<details>` is open on page load.
   - Clicking any summary expands/collapses without page jump.
   - `+` rotates to `×` on open.
   - Works with JavaScript disabled (it's native HTML).

7. **Directory**
   - Email and phone cells have a "Copy →" button that copies the value and shows "Copied ✓" for 1.5s.
   - `<a href="mailto:...">` and `<a href="tel:...">` are present and functional.

8. **A11y + reduced motion**
   - Keyboard tab order: sticky nav links → CTA → page content top to bottom (Hero CTAs → Cal embed → Alternatives buttons → FAQ summaries → Directory copy buttons → Footer links).
   - All interactive elements have visible focus rings (browser default or our cyan ring).
   - `<h1>`, `<h2>` heading structure is logical (single h1 in hero; h2 per section).
   - DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → aurora is static, pulse dots are static, scroll cue is static.

9. **Responsive**
   - 1440px: matches the mockup at [.superpowers/brainstorm/contact-2026-05-20/content/direction-h-aurora.html](.superpowers/brainstorm/contact-2026-05-20/content/direction-h-aurora.html) to a close tolerance.
   - 1024px: 3-up directory becomes 2-up + 1-up below, or single column with vertical stacking — design decision noted in the implementation plan.
   - 768px: Cal embed takes full width, agenda sidebar moves below it. Hero h1 scales down via `clamp()`.
   - 390px (iPhone 14): sticky nav stays usable (may need to drop nav links and keep brand + CTA only), hero h1 readable, FAQ usable. The 3-up directory stacks to 1-up. Booking card stacks vertically (Cal then sidebar).

10. **Browser visual match**
    - Eye-check against the frozen mockup at 1440px wide. The aurora colors, type sizes, glass-card styles, sticky nav position, and section rhythm should align within a tight tolerance.

---

## Out of scope (handled separately)

- Server-side analytics tracking for booking completion (separate observability spec).
- Replacement of placeholder testimonial / trusted-by names with real client data. Ships with the mockup defaults; user edits in config.
- A custom lead-capture form. Alternatives bar routes to email/WhatsApp/Telegram instead.
- Live linkage between `TRUSTED_BY` and the `portfolio_items` Supabase table. Static config for this scope; dynamic linkage is a follow-up.
- Site-wide nav unification. `/contact` is intentionally its own funnel.
- A "post-booking" confirmation page. Cal.com handles its own confirmation flow.
- Internationalization. Page ships in English with Bahasa already mentioned in the agenda copy ("English · Bahasa" implicit in our practice but not surfaced on this page).
- Image optimization or hero photography. The aurora is the hero; no images on the page.
