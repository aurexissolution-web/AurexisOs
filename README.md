This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Digital Name Cards — `/sanjay`, `/vasshanraj`

Premium, mobile-first digital business cards — one per person, sharing the same page/component system. Live: **Sanjay Gunabalan, Founder & CEO** at `/sanjay`, and **Vasshan Raj, Chief Technology Officer** at `/vasshanraj`. Each works as a profile, contact card, and downloadable vCard, and funnels visitors to a discovery call.

**Live routes:** [`/sanjay`](http://localhost:3000/sanjay) · [`/vasshanraj`](http://localhost:3000/vasshanraj)

### Tech
Next.js App Router · React · TypeScript · Tailwind v4 · `lucide-react` icons. No new heavy dependencies. Each card is a thin server-component route delegating to a shared `FounderCardPage`; interactive leaves (actions) are client components. A restrained "liquid glass" system lives in `.fc-glass` / `.fc-surface` in `src/app/globals.css`.

### Where things live
| Concern | File |
|---|---|
| **All people's content, keyed by slug** | `src/data/founder-cards.ts` (a `FOUNDER_CARDS` registry; reuses `CHANNELS` from `src/data/contact-config.ts`) |
| Shared page shell, metadata, JSON-LD | `src/components/founder-card/FounderCardPage.tsx` |
| Per-person route (thin wrapper) | `src/app/sanjay/page.tsx`, `src/app/vasshanraj/page.tsx` |
| Social image (OG + Twitter) | `src/lib/founder-card/og-image.tsx` (shared renderer), `src/app/<slug>/opengraph-image.tsx` (+ `twitter-image.tsx`) per person |
| vCard download endpoint | `src/app/api/vcard/[slug]/route.ts` |
| vCard / analytics helpers | `src/lib/founder-card/*` |
| UI components | `src/components/founder-card/*` |
| Brand lockup | `public/brand/aurexis-logo-transparent.png` |

### Common edits
- **A person's details, positioning, share copy, vCard note** → edit their entry in `src/data/founder-cards.ts`. Contact facts shared across cards (e.g. the company phone) come from `src/data/contact-config.ts`.
- **Add a new card for someone new** → add an entry to `FOUNDER_CARDS` in `src/data/founder-cards.ts`, add their path to `CARD_PATHS` in `src/lib/founder-card/routes.ts`, and create `src/app/<slug>/page.tsx` + `opengraph-image.tsx` + `twitter-image.tsx` following the `/vasshanraj` files as a template.
- **Replace the logo** → swap `public/brand/aurexis-logo-transparent.png`, used by `FounderHero.tsx` and `FounderFooter.tsx`. Update the intrinsic `width`/`height` there if the aspect ratio changes.
- **Replace a portrait** → set `portrait` on that person's entry in `src/data/founder-cards.ts` (currently `/images/cto.jpg` for Sanjay, `/images/vasshan-raj.jpg` for Vasshan), or drop a new file at that path. If `portrait` is `null`, the card falls back to their initials.
- **Contact actions** → the grid (Email / Website / LinkedIn / Instagram) is in `ConnectSection.tsx`; the primary actions (booking, WhatsApp, Save Contact) are in `PrimaryActions.tsx`. Both read from the `card` prop.
- **vCard** → shape is in `src/lib/founder-card/vcard.ts` (`buildVCard(card)`); filename + note are per-person fields in `founder-cards.ts`.
- **Social image** → edit the shared renderer in `src/lib/founder-card/og-image.tsx` (applies to every person's card).
- **SEO** → title/description/robots/canonical are built per-card by `buildFounderCardMetadata()` in `FounderCardPage.tsx`.

### Environment variables
All are `NEXT_PUBLIC_` (safe to expose) — see `.env.example`:

| Var | Purpose | If unset |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for every absolute URL | `https://aurexissolution.com` |
| `NEXT_PUBLIC_FOUNDER_BOOKING_URL` | "Book a Discovery Call" destination | `https://cal.com/aurexis-solution/discoverycall` |
| `NEXT_PUBLIC_FOUNDER_LINKEDIN_URL` | Sanjay's personal LinkedIn | Falls back to the company page, labelled "Aurexis LinkedIn" |
| `NEXT_PUBLIC_CHECKLIST_URL` | Business Systems Health Checklist URL/PDF | **Section hidden in production** (dev shows a reminder) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | Analytics events are no-ops; card still works |

`VERCEL_ENV` (set automatically by Vercel) controls indexing: the page is `index,follow` **only** on the production deployment and `noindex,nofollow` on localhost and previews.

### Analytics
`src/lib/founder-card/analytics.ts` dispatches events (`book_discovery_click`, `save_contact_click`, `share_card_click`, `qr_section_view`, `call_click`, `whatsapp_click`, `email_click`, `website_click`, `linkedin_click`, `checklist_click`) to `window.gtag` / Vercel `va` if present, and safely no-ops otherwise. To enable GA, add the gtag snippet and set `NEXT_PUBLIC_GA_ID`.

### Verify / deploy
```bash
npm run lint
npm run build
npm run dev   # then open /sanjay
```
Deploys via the repo's existing Vercel Git integration. After deploy, set the env vars above in **Vercel → Settings → Environment Variables** and point the DNS so `www` → non-`www` (a 301 is also enforced in `next.config.ts`).

### Test the contact actions
Open `/sanjay` on a phone and confirm: Call dials the number · WhatsApp opens with the pre-filled message · Email opens a compose window · Website / LinkedIn open · **Save Contact** downloads `sanjay-gunabalan-aurexis.vcf` and imports cleanly · **Share Card** uses the native share sheet (or copies the link with a "Link copied" confirmation) · the **QR** scans to `/sanjay`.

### Launch checklist
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live origin.
- [ ] Add Sanjay's personal LinkedIn (`NEXT_PUBLIC_FOUNDER_LINKEDIN_URL`).
- [ ] Add the checklist URL/PDF (`NEXT_PUBLIC_CHECKLIST_URL`) to reveal that section.
- [ ] (Optional) Add `NEXT_PUBLIC_GA_ID` + the gtag snippet.
- [ ] Confirm the `www` → non-`www` redirect and that `/sanjay` indexes in production.

### Future enhancements (not built)
Apple/Google Wallet passes were intentionally left out of this version; the Identity Actions area is structured so a wallet action could be added later. Other options: CRM lead capture, download analytics, multi-language.
