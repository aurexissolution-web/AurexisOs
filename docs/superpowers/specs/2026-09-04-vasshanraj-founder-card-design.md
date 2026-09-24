# Vasshan Raj Digital Card + Multi-Person Founder Card Design

## Status

Approved by conversational brainstorming on 2026-09-04.

## Goal

Add a second digital name card at `/vasshanraj` for Vasshan Raj (Chief Technology Officer), reusing the visual system and functionality already shipped for `/sanjay` (see `2026-07-14-cinematic-founder-card-design.md`). The current implementation hardcodes everything to Sanjay as a singleton; this generalizes it to a small registry so a third card doesn't require re-touching every file.

## Data Model

Replace `src/data/founder-card.ts` with `src/data/founder-cards.ts`:

- `type FounderCardData` — all currently-hardcoded per-person fields (identity, contact, links, vCard/share copy, `cardPath`), plus two new fields:
  - `isFounder: boolean` — `true` only for Sanjay. Controls whether the Organization JSON-LD `founder` reference points at this person, and which hero eyebrow label is used.
  - `eyebrowLabel: string` — the first segment of the hero eyebrow tag (`"Founder-led"` for Sanjay, `"Engineering-led"` for Vasshan). The second segment (`"Business systems"`) stays a shared constant.
- `FOUNDER_CARDS: Record<"sanjay" | "vasshanraj", FounderCardData>` — the registry.
- `getFounderCard(slug: string): FounderCardData | undefined`.
- Shared, company-level exports stay top-level (not duplicated per card): `SITE_URL`, `IS_PRODUCTION`, `CAPABILITIES`, `ownershipPrinciple`, `aiPrinciple`, `COMPANY_LINKEDIN`.
- Sanjay's entry no longer cross-references `FOUNDERS` from `contact-config.ts` (that indirection existed only to avoid retyping his name/portrait once; now that the file holds multiple explicit person objects, it's simpler to just state each field directly).
- Vasshan's card is **not** added to `FOUNDERS` in `contact-config.ts` and does **not** appear in `ContactCommittee` on `/contact` — confirmed scoped to the card only.

## Components

`FounderHero`, `PrimaryActions`, `ConnectSection`, `FounderFooter` currently import the Sanjay singleton directly and also hardcode "Sanjay" text in several `aria-label`s. Convert all four to accept a `card: FounderCardData` prop and read all copy — including aria-labels — from it. `Capabilities` (reads the shared `CAPABILITIES` constant) and `OwnershipPanel` (fully static company copy) are unchanged.

`FounderHero`'s eyebrow tag reads `card.eyebrowLabel` instead of the hardcoded `"Founder-led"`.

## Routes

Next.js requires real per-segment files, so each person keeps `src/app/<slug>/page.tsx`, `opengraph-image.tsx`, and `twitter-image.tsx` — but these become thin wrappers around shared logic:

- `src/components/founder-card/FounderCardPage.tsx` exports `buildFounderCardMetadata(card)` and `<FounderCardPage card={card} />` (the shared JSX tree + `structuredData()` currently inlined in `src/app/sanjay/page.tsx`). `structuredData()` only includes the `founder` field on the Organization node when `card.isFounder` is true.
- `src/lib/founder-card/og-image.tsx` exports `renderFounderOgImage(card)`, used by both people's `opengraph-image.tsx`.
- `src/app/sanjay/page.tsx` and `src/app/vasshanraj/page.tsx` each just pick their card from `FOUNDER_CARDS` and call the shared builder/component.
- `src/lib/founder-card/routes.ts`'s `isFounderCardRoute` (used by `SmoothScrollProvider` to disable Lenis on card pages) extends its hardcoded path list from just `/sanjay` to `/sanjay` and `/vasshanraj`. (This repo's `node --test` setup has no path-alias resolver, so `routes.ts` deriving its paths from the `FOUNDER_CARDS` registry via a `@/` import would make it untestable by direct execution — it stays a small, dependency-free literal list instead, which the existing test already exercises for real. A third card means adding one line here in addition to its registry entry.)

## vCard / API

- `buildVCard(card: FounderCardData)` in `src/lib/founder-card/vcard.ts` takes the card as a parameter instead of importing the singleton.
- `src/app/api/vcard/route.ts` moves to `src/app/api/vcard/[slug]/route.ts`, looks up `FOUNDER_CARDS[slug]`, and 404s on an unknown slug.
- `PrimaryActions`' "Save Contact" link changes from the hardcoded `/api/vcard` href to `` `/api/vcard/${card.slug}` ``.

## Vasshan Raj's Content

| Field | Value |
|---|---|
| Name | Vasshan Raj |
| Title | Chief Technology Officer |
| `isFounder` | `false` |
| `eyebrowLabel` | `"Engineering-led"` |
| Email | vasshanraj@aurexissolution.com |
| Phone (display) | +60 11-6960 6717 |
| Phone (tel/WhatsApp link) | +601169606717 |
| LinkedIn | https://www.linkedin.com/in/vasshan-raj (tracking params stripped) |
| Instagram | https://www.instagram.com/aurexissolution (shared company account, same as Sanjay's card) |
| Booking URL | https://cal.com/vasshan-raj/30min |
| Portrait | `public/images/vasshan-raj.jpg`, processed from the supplied photo |
| Positioning line | "Engineering the data and AI infrastructure that make Aurexis systems reliable, visible and yours to own." |
| Card path | `/vasshanraj` |
| vCard filename | `vasshan-raj-aurexis.vcf` |

The positioning line and vCard note are written to reflect his CTO/engineering role — no founder or co-founder language anywhere on his card or in its structured data.

## Tests

`tests/founder-card-composition.test.mjs` currently asserts on Sanjay's page source literally (e.g. `<FounderHero\s*\/>` with no props, hardcoded strings in `founder-card.ts`). Rewrite it to check the shared contract instead — `FounderCardPage` receives the expected component tree, both route files pick the right registry entry, `isFounder` correctly gates the JSON-LD `founder` field — and add equivalent coverage for the Vasshan route/card. `tests/founder-card-routes.test.mjs` extends to assert `isFounderCardRoute("/vasshanraj")` is `true` alongside the existing `/sanjay` cases.

## Verification

- Composition/route tests, `npm run lint`, `npm run build`.
- `npm run dev`, load `/vasshanraj` in the browser: verify portrait, all contact actions (call, WhatsApp, Save Contact, LinkedIn, Instagram, email, booking link), OG/Twitter image render, and that `/sanjay` is visually and functionally unchanged.
- Hit `/api/vcard/vasshanraj` and `/api/vcard/sanjay` directly and confirm both download a valid, correctly-addressed `.vcf`.
