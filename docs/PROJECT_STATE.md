# AurexisOS — Project State & Continuity Notes

Living handoff doc, committed to the repo so it survives even a full machine wipe (unlike an assistant's local memory files). Written 2026-09-10. Update this whenever a meaningful chunk of work lands or an open item changes status — treat "recently shipped" as a rolling window, not a permanent log (git history is the permanent log).

## What this project is

**AurexisOS** — the Aurexis Solution marketing site + client portal. Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4. Supabase is the backend (auth, Postgres, storage — migrations in `supabase/migrations/`). Stripe for payments. Cal.com, Three.js/Spline, Framer Motion, Lenis on the marketing surface. Full working agreement (mandatory skills, Supabase rules, guardrails) is in `CLAUDE.md` at the repo root — read that first in any fresh session.

Git remote: `github.com/aurexissolution-web/aurexissolutionOS`, default branch `main`.

## Repo state as of 2026-09-10

`main` is clean and fully pushed to `origin/main` (nothing local-only, nothing unpushed). Latest commit: `d8148e5`.

## Recently shipped (most recent first)

0. **Unused-code cleanup (2026-09-14, uncommitted — done in a non-git copy at `/Volumes/SSD/aurexissolutionOS-main`)** — removed everything no route reaches: 24 orphaned components/libs (old marketing sections, carousels, globe/map, tabs, `LeaveReviewModal`, `src/lib/supabase/hooks.ts`), the client-portal leftover API routes (`upload-doc`, `download-doc`, `delete-client`, `tickets/notify`, `stripe/checkout`, `stripe/webhook`, `reviews`), 9 npm packages (`@react-three/drei`, `canvas-confetti`, `simplex-noise`, `@radix-ui/react-avatar`, `cobe`, `embla-carousel-react`, `react-simple-maps`, `react-wrap-balancer`, `@types/canvas-confetti`), ~6.8 MB of unreferenced `public/` images, dead functions/types, unused CSS vars, and the Stripe CSP/env entries. **Stripe is no longer wired up anywhere** — the "Stripe for payments" line above is now historical. Pre-deletion backup: `/Volumes/SSD/aurexissolutionOS-removed-backup-2026-09-14.tar.gz`. Verified: 32/32 tests, lint clean, `next build` passes.
1. **Multi-person digital name cards** (`/sanjay`, `/vasshanraj`) — see the "Digital name cards" section below for the full architecture. This was a significant refactor: what used to be a single hardcoded Sanjay-only system became a small registry supporting multiple people, with a real bug fix along the way (a prototype-pollution lookup bug in the vCard API) and an analytics attribution fix (card clicks are now tagged with which person's card they came from).
2. **Solutions + Tech Ecosystem mega-menus** (`1514dcc`) — new dropdown mega-menus in the navbar replacing the old flat nav links, plus `/solutions` and `/solutions/business-systems-assessment` landing pages and a `/tech-ecosystem` page. Data in `src/data/navigation.ts` / `src/data/solutions.ts`, menu components `SolutionsMenu.tsx` / `TechEcosystemMenu.tsx`, nav click tracking in `src/lib/navigation/`. This landed in the same session as the founder-card work but is an unrelated feature — built before this session started, committed as-is without deep review of its own internals.
3. **ESLint config** (`c8132ad`) — `.agents/**` (Codex tooling scripts) excluded from lint, since they're not app source and were producing unrelated pre-existing lint noise.

## Open items / known issues

- **DB/storage leftovers from the removed client portal — deliberately NOT dropped (needs explicit sign-off, deletes data).** Tables `feedback` and `leads` are never queried; `tickets` is only read by `/api/health` (the keepalive ping — switch that query to another table before dropping it). Storage buckets `avatars` and `legal-docs` are no longer used by any code. Dropping any of these = a new migration.
- **Login middleware default points at a removed route.** `middleware.ts` falls back to `/portal/client` when a signed-in user hits `/login` without `?redirect=`; that page no longer exists (portal is admin-only). Should be `/portal/admin`.
- **⚠️ Security: a GitHub Personal Access Token is embedded in plaintext in the git remote URL.** Run `git remote -v` and you'll see it in `origin`'s URL (`https://<token>@github.com/...`). This means the token sits in `.git/config` unencrypted. It should be rotated (revoke it on GitHub → Settings → Developer settings → Personal access tokens) and the remote reconfigured to use a credential helper or SSH instead of an inline token. **Not yet fixed** — flagged twice in conversation, never actioned.
- **Vasshan Raj doesn't have marketing QR/share image assets yet.** Sanjay has `marketing/sanjay-namecard/` (2160×2700 and 1080×1350 PNGs for print/share). Vasshan's card (`/vasshanraj`) works fully as a live page + vCard, but nobody has generated the equivalent printable/shareable QR artwork for him yet. Natural next step if asked — see the brand/poster pipeline notes below for how the Sanjay ones were made.
- **Deploy status unconfirmed.** No `.vercel/project.json` in this checkout, so I can't confirm from the repo alone whether pushes to `main` trigger an automatic production deploy. If host is Vercel-connected-to-GitHub, the push that landed the founder-card work should have triggered a deploy — check the hosting dashboard to confirm `/vasshanraj` is actually live at the production URL, don't assume it from the push alone.
- **Lab admin portal — deferred, unrelated to the above.** `/the-lab` page reads from empty static data exports (`src/data/lab-explorations.ts`, `src/data/lab-notes.ts`) and renders just Hero + Newsletter. User explicitly deferred building the admin portal for it on 2026-05-07. See "Lab admin portal" section below for the recommended approach and open design questions if/when this gets picked back up.
- **Environment gotcha (already hit twice, may recur after a fresh machine setup):** `npm run build` can fail with `Error: turbo.createProject is not supported by the wasm bindings` if `node_modules/@next/swc-darwin-arm64/` is missing its native `.node` binary (directory present, binary absent — looks installed but isn't). Fix: `npm install @next/swc-darwin-arm64@<next-version-in-package.json>` (a plain `npm install` alone reported "up to date" and did NOT fix it — had to force-reinstall that specific package). This happened in a git worktree the first time and in the main checkout's own `node_modules` the second time, so it's an environment/npm-cache quirk, not something tied to worktrees specifically. After a full laptop reset + fresh `npm install`, this most likely will NOT recur (fresh installs don't usually leave a package half-installed) — but if `npm run build` fails with that exact error, this is why.

## Digital name cards — `/sanjay`, `/vasshanraj`

Premium, mobile-first digital business cards — one per person, sharing one page/component system. Live: **Sanjay Gunabalan, Founder & CEO** at `/sanjay`, and **Vasshan Raj, Chief Technology Officer** at `/vasshanraj`. Each is a profile + contact card + downloadable vCard, funneling visitors to a Cal.com discovery call.

**Architecture (as of 2026-09-10):**

| Concern | File |
|---|---|
| All people's content, keyed by slug | `src/data/founder-cards.ts` — a `FOUNDER_CARDS` registry (`FOUNDER_CARDS.sanjay`, `FOUNDER_CARDS.vasshanraj`), `getFounderCard(slug)` lookup, shared `CAPABILITIES` |
| Shared page shell, metadata, JSON-LD | `src/components/founder-card/FounderCardPage.tsx` |
| Per-person route (thin wrapper) | `src/app/sanjay/page.tsx`, `src/app/vasshanraj/page.tsx` |
| Social image (OG + Twitter) | `src/lib/founder-card/og-image.tsx` (shared renderer) + `src/app/<slug>/opengraph-image.tsx` (+`twitter-image.tsx`) per person |
| vCard download endpoint | `src/app/api/vcard/[slug]/route.ts` (dynamic — `/api/vcard/sanjay`, `/api/vcard/vasshanraj`) |
| vCard builder | `src/lib/founder-card/vcard.ts` — `buildVCard(card)`, pure function |
| Smooth-scroll suppression on card routes | `src/lib/founder-card/routes.ts` — `isFounderCardRoute()`, deliberately a hardcoded path literal list (not derived from the registry) so it stays directly unit-testable without a module-resolver this repo doesn't have |
| UI components (all take a `card` prop) | `src/components/founder-card/FounderHero.tsx`, `PrimaryActions.tsx`, `ConnectSection.tsx`, `FounderFooter.tsx`, `Capabilities.tsx`, `OwnershipPanel.tsx` (static), `FounderCardBackground.tsx` (static) |
| Analytics event tracking | `src/lib/founder-card/analytics.ts` — `track(event, { card: card.slug, ... })`; every `track()` call site now passes the card's slug so Sanjay's and Vasshan's clicks are attributable separately |
| Brand lockup used on cards | `public/brand/aurexis-logo-transparent.png` |
| Portraits | `public/images/cto.jpg` (Sanjay — yes, the filename says "cto" but it's Sanjay's, a pre-existing naming quirk), `public/images/vasshan-raj.jpg` (Vasshan) |

**Non-obvious/important:**
- `SITE_URL` in `founder-cards.ts` is the one canonical origin (non-www, `https://aurexissolution.com`, from `NEXT_PUBLIC_SITE_URL`) reused for every absolute URL per card — metadata, JSON-LD, vCard, sharing — so they never diverge.
- Every card entry has `isFounder: boolean` and `eyebrowLabel: string`. `isFounder` gates whether the Organization JSON-LD `founder` field points at that person (only `true` for Sanjay) and which hero eyebrow tag shows ("Founder-led" vs "Engineering-led" for Vasshan). This exists specifically because the user was explicit: *"just remember he is just the CTO"* — no founder/co-founder language anywhere on Vasshan's card, in its metadata, or in its structured data.
- Vasshan's contact details are his own, not shared with Sanjay's: own phone/WhatsApp number (`+60 11-6960 6717`), own LinkedIn (`linkedin.com/in/vasshan-raj`), own Cal.com booking link (`cal.com/vasshan-raj/30min`). Instagram is the one thing both cards share — the company account `@aurexissolution`.
- To add a third person's card: add an entry to `FOUNDER_CARDS` in `founder-cards.ts`, add their path to `CARD_PATHS` in `routes.ts`, create `src/app/<slug>/page.tsx` + `opengraph-image.tsx` + `twitter-image.tsx` following `/vasshanraj`'s files as a template, and add a portrait to `public/images/`. This is documented in the README's "Digital Name Cards" section too.
- Tests: `tests/founder-cards-data.test.mjs`, `tests/founder-card-vcard.test.mjs`, `tests/founder-card-vcard-route.test.mjs`, `tests/founder-card-composition.test.mjs`, `tests/founder-card-routes.test.mjs` — 24 tests total, all passing as of the last check. Most are source-text regex assertions rather than real imports/execution, because this repo's `node --test` setup has no `@/` path-alias resolver — `buildVCard()` and `isFounderCardRoute()` are the two exceptions that get real execution, since both happen to have zero or type-only imports.
- Full design/implementation history: `docs/superpowers/specs/2026-09-04-vasshanraj-founder-card-design.md` and `docs/superpowers/plans/2026-09-04-vasshanraj-founder-card.md` in this repo.

## Brand assets & poster pipeline

- **Logo files** (`public/brand/`): `aurexis-logo-transparent.png` is what's actually used in production UI (cards, navbar). `aurexis-logo-white.png` is a tight horizontal white lockup used for marketing/poster work — gotcha: it reports `hasAlpha: yes` but has a **baked pure-black background**, so on a dark poster it shows an ugly black box unless you un-matte it from black (alpha = max(r,g,b), then unpremultiply) first. `Aurexis_Full_Logo.png` is genuinely transparent but is the dark-ink version (only good on light backgrounds).
- **Brand colours:** bg `#030506`, surface `#090D10`, primary text `#F3F1EC` (warm off-white), muted `#AAB1B6`, accent cyan `#24CBD0` (keep ≤10% of any design), hairline `rgba(255,255,255,0.10)`. Site sans is Plus Jakarta Sans; Manrope also reads on-brand.
- **Poster/marketing-image pipeline that works well:** hand-built self-contained HTML/CSS (embed font + logo as data URIs) → Playwright screenshot at 2× deviceScaleFactor → `sips -z H W` downscale to exact px. Don't use an image generator for logo/exact-copy work — it garbles both. Example deliverables: `marketing/iv-bantu-kawan/`, `marketing/sanjay-namecard/`.

## Lab admin portal (deferred, unrelated to recent work)

`/the-lab` reads from empty static exports in `src/data/lab-explorations.ts` and `src/data/lab-notes.ts` (`LAB_FEATURED = null`, both arrays empty) — page renders Hero + Newsletter only, all other sections return `null`. User wants an admin portal for this eventually but explicitly deferred it on 2026-05-07. Recommended approach when picked back up:

1. DB migration: `lab_explorations` + `lab_notes` tables + a `lab-thumbnails` storage bucket, RLS admin-write/public-read, mirroring `supabase/migrations/008_create_blog_bucket.sql`'s pattern.
2. Swap the static exports for async Supabase fetches — the `LabExploration`/`LabNote` type contracts already exist and consumers are typed against them, so the UI shouldn't need to change.
3. Admin UI at `/portal/admin/lab/page.tsx` with tabs for Explorations + Notes, mirroring `src/app/portal/admin/blog/page.tsx`.
4. API routes `/api/lab/explorations/route.ts` and `/api/lab/notes/route.ts`, mirroring `src/app/api/blog/route.ts`.

Open design questions, never answered — resolve before building:
- Full admin UI now, or DB + data layer first with Supabase Studio as an interim editor?
- Featured rotation: a single `is_featured` row, or a `featured_until` timestamp?
- Thumbnails: one per exploration, or a gallery (multiple)?
- Do Lab Notes link to `/blog/[slug]` (i.e. notes ARE blog posts) or are they independent content?

## Working conventions worth knowing

- Worktree-based feature work goes in `.worktrees/<branch-name>/` (gitignored) — created via `git worktree add`, cleaned up with `git worktree remove` + `git branch -d` after merging. Keeps in-progress unrelated work on `main` undisturbed while a feature branch is built and reviewed.
- This repo's `node --test` has no path-alias (`@/...`) resolver — tests that need to exercise a file with `@/` value-imports use source-text regex assertions instead of real `import`/execution (an established, deliberate pattern here, not a shortcut). Files with only relative or type-only imports can be executed for real.
- Don't commit or push without being explicitly asked (per `CLAUDE.md`). Don't bypass pre-commit hooks.
