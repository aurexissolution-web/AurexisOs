# Vasshan Raj Digital Card + Multi-Person Founder Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a digital name card at `/vasshanraj` for Vasshan Raj (CTO), by generalizing the current Sanjay-only founder-card feature into a small multi-person registry.

**Architecture:** Replace the `src/data/founder-card.ts` singleton with a `FOUNDER_CARDS` registry keyed by slug (`src/data/founder-cards.ts`). Convert the founder-card components that currently import the singleton directly (`FounderHero`, `PrimaryActions`, `ConnectSection`, `FounderFooter`) into components that take a `card` prop. Extract the page composition/metadata/JSON-LD and the OG-image rendering — currently duplicated inline in `src/app/sanjay/page.tsx` and `opengraph-image.tsx` — into shared builders (`FounderCardPage.tsx`, `og-image.tsx`) so each person's route files stay thin. The vCard API becomes a dynamic `[slug]` route.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `node:test` for tests (existing convention in `tests/`), `sharp` (already a dev dependency, used by the existing composition test).

---

## Before you start

Full spec: `docs/superpowers/specs/2026-09-04-vasshanraj-founder-card-design.md`.

Vasshan's raw photo is at the repo root: `PHOTO-2026-09-04-00-31-54.jpg` (1086×1448).

Run tests with: `node --test tests/founder-card-composition.test.mjs tests/founder-card-routes.test.mjs tests/founder-cards-data.test.mjs tests/founder-card-vcard.test.mjs tests/founder-card-vcard-route.test.mjs` (substitute the specific file for the task you're on — some of these files don't exist until their task creates them).

---

### Task 1: Multi-person data registry

**Files:**
- Create: `src/data/founder-cards.ts`
- Test: `tests/founder-cards-data.test.mjs`

This is additive — `src/data/founder-card.ts` (the old singleton) is untouched and nothing is repointed yet. That happens in Task 3.

- [ ] **Step 1: Write the failing test**

Create `tests/founder-cards-data.test.mjs`.

Note on style: this repo's `node --test` setup has no path-alias resolver, so a test can only `import` and execute a `.ts` source file if that file's own imports are either relative-with-no-alias or `import type` (type-only imports are erased by Node's native TS stripping without ever being resolved — confirmed against the existing `contact-config.ts`, which already does this). `founder-cards.ts` will import `CHANNELS` from `@/data/contact-config` (a bare `@/` specifier), which only Next's bundler can resolve — not raw `node --test`. So, matching this codebase's existing convention for exactly this situation (see the pre-existing `founder-card-composition.test.mjs`), this test reads the source as text and asserts on it rather than importing it:

```javascript
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/data/founder-cards.ts", import.meta.url),
  "utf8",
);

test("registry has exactly sanjay and vasshanraj", () => {
  assert.match(
    source,
    /export const FOUNDER_CARDS:[^=]*=\s*\{\s*sanjay,\s*vasshanraj,\s*\};/,
  );
});

test("sanjay is marked as the founder", () => {
  assert.match(source, /slug:\s*"sanjay"/);
  assert.match(source, /name:\s*"Sanjay Gunabalan"/);
  assert.match(source, /title:\s*"Founder & CEO"/);
  assert.match(source, /isFounder:\s*true/);
  assert.match(source, /eyebrowLabel:\s*"Founder-led"/);
  assert.match(source, /email:\s*"ceo\.sanjay@aurexissolution\.com"/);
  assert.match(source, /cardPath:\s*"\/sanjay"/);
  assert.match(source, /vcardFileName:\s*"sanjay-gunabalan-aurexis\.vcf"/);
});

test("vasshanraj is CTO, not a founder", () => {
  assert.match(source, /slug:\s*"vasshanraj"/);
  assert.match(source, /name:\s*"Vasshan Raj"/);
  assert.match(source, /title:\s*"Chief Technology Officer"/);
  assert.match(source, /isFounder:\s*false/);
  assert.match(source, /eyebrowLabel:\s*"Engineering-led"/);
  assert.match(source, /email:\s*"vasshanraj@aurexissolution\.com"/);
  assert.match(source, /phoneDisplay:\s*"\+60 11-6960 6717"/);
  assert.match(source, /phoneLink:\s*"\+601169606717"/);
  assert.match(source, /linkedin:\s*"https:\/\/www\.linkedin\.com\/in\/vasshan-raj"/);
  assert.match(source, /linkedinIsPersonal:\s*true/);
  assert.match(source, /instagramUrl:\s*"https:\/\/www\.instagram\.com\/aurexissolution"/);
  assert.match(source, /bookingUrl:\s*"https:\/\/cal\.com\/vasshan-raj\/30min"/);
  assert.match(source, /cardPath:\s*"\/vasshanraj"/);
  assert.match(source, /vcardFileName:\s*"vasshan-raj-aurexis\.vcf"/);
  assert.match(source, /portrait:\s*"\/images\/vasshan-raj\.jpg"/);
});

test("exports a getFounderCard lookup helper", () => {
  assert.match(source, /export function getFounderCard/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/founder-cards-data.test.mjs`
Expected: FAIL — `src/data/founder-cards.ts` does not exist yet (the `readFile` call throws `ENOENT`).

- [ ] **Step 3: Write the registry**

Create `src/data/founder-cards.ts`:

```typescript
// src/data/founder-cards.ts
// Central, typed content configuration for Aurexis digital name cards.
// One entry per person, keyed by the URL slug their card lives at.
import { CHANNELS } from "@/data/contact-config";

/** Canonical production origin (non-www). One host used for EVERY absolute URL:
 * metadata, JSON-LD, QR target, vCard, and sharing — so they never diverge. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aurexissolution.com"
).replace(/\/+$/, "");

/** Whether this deployment is the confirmed production host (drives robots). */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

const COMPANY_LINKEDIN = "https://www.linkedin.com/company/aurexissolution/";
const PERSONAL_LINKEDIN = (process.env.NEXT_PUBLIC_FOUNDER_LINKEDIN_URL || "").trim();

export interface FounderCardData {
  slug: "sanjay" | "vasshanraj";
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  initials: string;
  portrait: string | null;
  publicLocation: string;
  /** Drives whether the Organization JSON-LD `founder` field points at this
   * person, and which hero eyebrow label is used. Only true for a founder. */
  isFounder: boolean;
  eyebrowLabel: string;
  positioning: string;
  email: string;
  phoneDisplay: string;
  phoneLink: string;
  whatsappUrl: string;
  website: string;
  websiteDisplay: string;
  linkedin: string;
  /** true only when a real personal profile is configured; controls the label. */
  linkedinIsPersonal: boolean;
  instagramUrl: string;
  instagramDisplay: string;
  bookingUrl: string;
  privacyUrl: string;
  cardPath: string;
  cardUrl: string;
  vcardFileName: string;
  vcardNote: string;
}

const SANJAY_WHATSAPP_MESSAGE =
  "Hi Sanjay, I found your Aurexis digital card and would like to discuss a business systems requirement.";

const VASSHAN_WHATSAPP_MESSAGE =
  "Hi Vasshan, I found your Aurexis digital card and would like to discuss a business systems requirement.";

const sanjay: FounderCardData = {
  slug: "sanjay",
  name: "Sanjay Gunabalan",
  firstName: "Sanjay",
  lastName: "Gunabalan",
  title: "Founder & CEO",
  company: "Aurexis Solution",
  initials: "SG",
  portrait: "/images/cto.jpg",
  publicLocation: "Malaysia",
  isFounder: true,
  eyebrowLabel: "Founder-led",
  positioning:
    "Turning scattered operations into connected, visible and manageable business systems.",
  email: "ceo.sanjay@aurexissolution.com",
  phoneDisplay: "+60 16-407 1129",
  phoneLink: CHANNELS.phone,
  whatsappUrl: `${CHANNELS.whatsappUrl}?text=${encodeURIComponent(SANJAY_WHATSAPP_MESSAGE)}`,
  website: SITE_URL,
  websiteDisplay: SITE_URL.replace(/^https?:\/\//, ""),
  linkedin: PERSONAL_LINKEDIN || COMPANY_LINKEDIN,
  linkedinIsPersonal: Boolean(PERSONAL_LINKEDIN),
  instagramUrl: "https://www.instagram.com/aurexissolution",
  instagramDisplay: "@aurexissolution",
  bookingUrl:
    (process.env.NEXT_PUBLIC_FOUNDER_BOOKING_URL || "").trim() ||
    "https://cal.com/aurexis-solution/discoverycall",
  privacyUrl: "/privacy-policy",
  cardPath: "/sanjay",
  cardUrl: `${SITE_URL}/sanjay`,
  vcardFileName: "sanjay-gunabalan-aurexis.vcf",
  vcardNote:
    "Founder & CEO of Aurexis Solution. Helping growing businesses turn scattered operations into connected, visible and manageable business systems.",
};

const vasshanraj: FounderCardData = {
  slug: "vasshanraj",
  name: "Vasshan Raj",
  firstName: "Vasshan",
  lastName: "Raj",
  title: "Chief Technology Officer",
  company: "Aurexis Solution",
  initials: "VR",
  portrait: "/images/vasshan-raj.jpg",
  publicLocation: "Malaysia",
  isFounder: false,
  eyebrowLabel: "Engineering-led",
  positioning:
    "Engineering the data and AI infrastructure that make Aurexis systems reliable, visible and yours to own.",
  email: "vasshanraj@aurexissolution.com",
  phoneDisplay: "+60 11-6960 6717",
  phoneLink: "+601169606717",
  whatsappUrl: `https://wa.me/601169606717?text=${encodeURIComponent(VASSHAN_WHATSAPP_MESSAGE)}`,
  website: SITE_URL,
  websiteDisplay: SITE_URL.replace(/^https?:\/\//, ""),
  linkedin: "https://www.linkedin.com/in/vasshan-raj",
  linkedinIsPersonal: true,
  instagramUrl: "https://www.instagram.com/aurexissolution",
  instagramDisplay: "@aurexissolution",
  bookingUrl: "https://cal.com/vasshan-raj/30min",
  privacyUrl: "/privacy-policy",
  cardPath: "/vasshanraj",
  cardUrl: `${SITE_URL}/vasshanraj`,
  vcardFileName: "vasshan-raj-aurexis.vcf",
  vcardNote:
    "Chief Technology Officer of Aurexis Solution. Engineering the data and AI infrastructure behind Aurexis client systems.",
};

export const FOUNDER_CARDS: Record<FounderCardData["slug"], FounderCardData> = {
  sanjay,
  vasshanraj,
};

export function getFounderCard(slug: string): FounderCardData | undefined {
  return (FOUNDER_CARDS as Record<string, FounderCardData>)[slug];
}

// ── Content blocks (data-driven rendering, shared across every card) ──

/** Three concise capabilities. No ™/® — plain names, short descriptions. */
export const CAPABILITIES: ReadonlyArray<{ name: string; body: string }> = [
  {
    name: "Business Systems Assessment",
    body: "Find gaps across workflows, tools, data and reporting.",
  },
  {
    name: "Workflow Improvement",
    body: "Simplify repetitive processes and connect disconnected work.",
  },
  {
    name: "Managed Operations",
    body: "Monitor, optimise and improve the system after launch.",
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/founder-cards-data.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/founder-cards.ts tests/founder-cards-data.test.mjs
git commit -m "feat: add multi-person founder card data registry"
```

---

### Task 2: Parameterize the vCard builder and add the dynamic vCard API route

**Files:**
- Modify: `src/lib/founder-card/vcard.ts`
- Modify: `src/app/api/vcard/route.ts` (repointed to the new registry, kept temporarily — deleted in Task 3 once the UI no longer links to it)
- Create: `src/app/api/vcard/[slug]/route.ts`
- Test: `tests/founder-card-vcard.test.mjs`
- Test: `tests/founder-card-vcard-route.test.mjs`

- [ ] **Step 1: Write the failing tests**

Create `tests/founder-card-vcard.test.mjs`. `vcard.ts`'s only import will be `import type { FounderCardData } from "@/data/founder-cards"` — type-only imports are erased by Node's TS stripping without ever being resolved, so this file (unlike most others in this feature) can be imported and genuinely executed by `node --test`. Use an inline fixture object shaped like `FounderCardData` rather than importing the real registry, so this test exercises `buildVCard`'s formatting/escaping logic in isolation:

```javascript
import assert from "node:assert/strict";
import test from "node:test";
import { buildVCard } from "../src/lib/founder-card/vcard.ts";

const baseCard = {
  slug: "vasshanraj",
  name: "Vasshan Raj",
  firstName: "Vasshan",
  lastName: "Raj",
  title: "Chief Technology Officer",
  company: "Aurexis Solution",
  initials: "VR",
  portrait: "/images/vasshan-raj.jpg",
  publicLocation: "Malaysia",
  isFounder: false,
  eyebrowLabel: "Engineering-led",
  positioning:
    "Engineering the data and AI infrastructure that make Aurexis systems reliable, visible and yours to own.",
  email: "vasshanraj@aurexissolution.com",
  phoneDisplay: "+60 11-6960 6717",
  phoneLink: "+601169606717",
  whatsappUrl: "https://wa.me/601169606717",
  website: "https://aurexissolution.com",
  websiteDisplay: "aurexissolution.com",
  linkedin: "https://www.linkedin.com/in/vasshan-raj",
  linkedinIsPersonal: true,
  instagramUrl: "https://www.instagram.com/aurexissolution",
  instagramDisplay: "@aurexissolution",
  bookingUrl: "https://cal.com/vasshan-raj/30min",
  privacyUrl: "/privacy-policy",
  cardPath: "/vasshanraj",
  cardUrl: "https://aurexissolution.com/vasshanraj",
  vcardFileName: "vasshan-raj-aurexis.vcf",
  vcardNote: "Chief Technology Officer of Aurexis Solution.",
};

test("builds a valid, correctly-addressed vCard", () => {
  const vcard = buildVCard(baseCard);
  assert.match(vcard, /^BEGIN:VCARD\r\n/);
  assert.match(vcard, /FN:Vasshan Raj\r\n/);
  assert.match(vcard, /ORG:Aurexis Solution\r\n/);
  assert.match(vcard, /TITLE:Chief Technology Officer\r\n/);
  assert.match(vcard, /TEL;TYPE=CELL,VOICE:\+601169606717\r\n/);
  assert.match(vcard, /EMAIL;TYPE=INTERNET,WORK:vasshanraj@aurexissolution\.com\r\n/);
  assert.match(vcard, /URL:https:\/\/aurexissolution\.com\/vasshanraj\r\n/);
  assert.match(
    vcard,
    /X-SOCIALPROFILE;TYPE=linkedin:https:\/\/www\.linkedin\.com\/in\/vasshan-raj\r\n/,
  );
  assert.match(vcard, /NOTE:Chief Technology Officer of Aurexis Solution\.\r\n/);
  assert.match(vcard, /END:VCARD\r\n$/);
});

test("escapes vCard special characters in the note", () => {
  const vcard = buildVCard({
    ...baseCard,
    vcardNote: "Line one\nComma, semi; back\\slash",
  });
  assert.match(vcard, /NOTE:Line one\\nComma\\, semi\\; back\\\\slash\r\n/);
});

test("omits the LinkedIn line when linkedin is empty", () => {
  const vcard = buildVCard({ ...baseCard, linkedin: "" });
  assert.doesNotMatch(vcard, /X-SOCIALPROFILE/);
});
```

Create `tests/founder-card-vcard-route.test.mjs`. Unlike `vcard.ts`, the route file has real value-imports (`getFounderCard`, `buildVCard`) via `@/` specifiers, which — same reasoning as Task 1 — `node --test` can't resolve without Next's bundler. Test it the same way as the data registry, by reading and asserting on the source:

```javascript
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(
  new URL("../src/app/api/vcard/[slug]/route.ts", import.meta.url),
  "utf8",
);

test("looks up the card by slug and 404s when it's unknown", () => {
  assert.match(routeSource, /getFounderCard\(slug\)/);
  assert.match(routeSource, /if \(!card\)/);
  assert.match(routeSource, /status:\s*404/);
});

test("serves the vCard with the right content type, filename, and cache header", () => {
  assert.match(routeSource, /"Content-Type":\s*"text\/vcard; charset=utf-8"/);
  assert.match(routeSource, /filename="\$\{card\.vcardFileName\}"/);
  assert.match(routeSource, /"Cache-Control":\s*"public, max-age=3600"/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/founder-card-vcard.test.mjs tests/founder-card-vcard-route.test.mjs`
Expected: FAIL — the current `buildVCard()` takes no arguments (it ignores the fixture and still reads the old Sanjay singleton internally, so the assertions on Vasshan's data fail), and `src/app/api/vcard/[slug]/route.ts` does not exist yet.

- [ ] **Step 3: Parameterize `buildVCard`**

Replace the contents of `src/lib/founder-card/vcard.ts`:

```typescript
// src/lib/founder-card/vcard.ts
// Pure builder for a valid, cross-device vCard 3.0. No dependencies so it can be
// unit-checked in isolation and reused by the /api/vcard/[slug] route.
import type { FounderCardData } from "@/data/founder-cards";

/** vCard 3.0 text escaping: backslash, newline, comma, semicolon. */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildVCard(card: FounderCardData): string {
  const p = card;

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    // N: Family;Given;Additional;Prefix;Suffix
    `N:${esc(p.lastName)};${esc(p.firstName)};;;`,
    `FN:${esc(p.name)}`,
    `ORG:${esc(p.company)}`,
    `TITLE:${esc(p.title)}`,
    `TEL;TYPE=CELL,VOICE:${p.phoneLink}`,
    `EMAIL;TYPE=INTERNET,WORK:${p.email}`,
    // Digital-card URL first (primary), then the company website.
    `URL:${p.cardUrl}`,
    `URL;TYPE=WORK:${p.website}`,
    // Public location only — never a residential/street address.
    `ADR;TYPE=WORK:;;;${esc(p.publicLocation)};;;`,
  ];

  if (p.linkedin) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${p.linkedin}`);
  }

  lines.push(`NOTE:${esc(p.vcardNote)}`);
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  // vCard requires CRLF line breaks.
  return lines.join("\r\n") + "\r\n";
}
```

- [ ] **Step 4: Create the dynamic API route**

Create `src/app/api/vcard/[slug]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { buildVCard } from "@/lib/founder-card/vcard";
import { getFounderCard } from "@/data/founder-cards";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const card = getFounderCard(slug);

  if (!card) {
    return NextResponse.json({ error: "Unknown card." }, { status: 404 });
  }

  try {
    const vcard = buildVCard(card);
    return new NextResponse(vcard, {
      status: 200,
      headers: {
        // Explicit type required — the site sets X-Content-Type-Options: nosniff.
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${card.vcardFileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[/api/vcard] failed to build vCard", err);
    return NextResponse.json(
      { error: "Unable to generate contact card." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 5: Repoint the old static route so the build keeps passing**

`src/app/api/vcard/route.ts` still imports the old singleton and calls `buildVCard()` with no arguments, which no longer compiles. Update it to use the new registry (it's still linked from `PrimaryActions` until Task 3, so keep it working, not delete it yet):

```typescript
import { NextResponse } from "next/server";
import { buildVCard } from "@/lib/founder-card/vcard";
import { FOUNDER_CARDS } from "@/data/founder-cards";

export const runtime = "nodejs";

export async function GET() {
  try {
    const vcard = buildVCard(FOUNDER_CARDS.sanjay);
    return new NextResponse(vcard, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${FOUNDER_CARDS.sanjay.vcardFileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[/api/vcard] failed to build vCard", err);
    return NextResponse.json(
      { error: "Unable to generate contact card." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/founder-card-vcard.test.mjs tests/founder-card-vcard-route.test.mjs`
Expected: PASS (5 tests: 3 in the vcard test, 2 in the route test)

- [ ] **Step 7: Commit**

```bash
git add src/lib/founder-card/vcard.ts src/app/api/vcard/route.ts src/app/api/vcard/[slug]/route.ts tests/founder-card-vcard.test.mjs tests/founder-card-vcard-route.test.mjs
git commit -m "feat: parameterize vCard builder and add dynamic /api/vcard/[slug] route"
```

---

### Task 3: Migrate components to card props, extract shared page/OG rendering, retire the old singleton

This is the big coupled change: `FounderHero`, `PrimaryActions`, `ConnectSection`, and `FounderFooter` all currently import the Sanjay singleton directly (and a few hardcode "Sanjay" in copy). They have to move to a `card` prop together, along with the page/metadata/OG-image builders that assemble them, because none of these files works correctly in isolation with only some of them converted.

**Files:**
- Modify: `src/components/founder-card/FounderHero.tsx`
- Modify: `src/components/founder-card/PrimaryActions.tsx`
- Modify: `src/components/founder-card/ConnectSection.tsx`
- Modify: `src/components/founder-card/FounderFooter.tsx`
- Create: `src/components/founder-card/FounderCardPage.tsx`
- Create: `src/lib/founder-card/og-image.tsx`
- Modify: `src/app/sanjay/page.tsx`
- Modify: `src/app/sanjay/opengraph-image.tsx`
- Delete: `src/data/founder-card.ts`
- Delete: `src/app/api/vcard/route.ts`
- Modify: `tests/founder-card-composition.test.mjs`

- [ ] **Step 1: Update the failing composition test**

Replace `tests/founder-card-composition.test.mjs`:

```javascript
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sharp from "sharp";

const pageCompositionSource = await readFile(
  new URL("../src/components/founder-card/FounderCardPage.tsx", import.meta.url),
  "utf8",
);

const connectSource = await readFile(
  new URL("../src/components/founder-card/ConnectSection.tsx", import.meta.url),
  "utf8",
);

const foundersDataSource = await readFile(
  new URL("../src/data/founder-cards.ts", import.meta.url),
  "utf8",
);

const heroSource = await readFile(
  new URL("../src/components/founder-card/FounderHero.tsx", import.meta.url),
  "utf8",
);

const footerSource = await readFile(
  new URL("../src/components/founder-card/FounderFooter.tsx", import.meta.url),
  "utf8",
);

const sanjayRouteSource = await readFile(
  new URL("../src/app/sanjay/page.tsx", import.meta.url),
  "utf8",
);

test("the shared page builder composes the approved cinematic founder-card sections", () => {
  assert.match(pageCompositionSource, /<FounderHero\s+card=\{card\}\s*\/>/);
  assert.match(pageCompositionSource, /<Capabilities\s*\/>/);
  assert.match(pageCompositionSource, /<OwnershipPanel\s*\/>/);
  assert.match(pageCompositionSource, /<ConnectSection\s+card=\{card\}\s*\/>/);
  assert.match(pageCompositionSource, /<FounderFooter\s+card=\{card\}\s*\/>/);
});

test("removes the previous centred SaaS-style component sequence", () => {
  assert.doesNotMatch(pageCompositionSource, /<Hero\s*\/>/);
  assert.doesNotMatch(pageCompositionSource, /<FounderProfile\s*\/>/);
  assert.doesNotMatch(pageCompositionSource, /<AboutAurexis\s*\/>/);
  assert.doesNotMatch(pageCompositionSource, /<TrustPoints\s*\/>/);
  assert.doesNotMatch(pageCompositionSource, /max-w-\[580px\]/);
});

test("the Organization JSON-LD only claims a founder relation for an actual founder", () => {
  assert.match(pageCompositionSource, /card\.isFounder\s*\?\s*\{\s*founder:/);
});

test("sanjay's route delegates to the shared page builder with his own card", () => {
  assert.match(sanjayRouteSource, /FOUNDER_CARDS\.sanjay/);
  assert.match(sanjayRouteSource, /<FounderCardPage\s+card=\{card\}\s*\/>/);
});

test("uses Instagram instead of duplicating WhatsApp in the connect grid", () => {
  assert.match(connectSource, /label:\s*"Instagram"/);
  assert.match(connectSource, /href:\s*card\.instagramUrl/);
  assert.doesNotMatch(connectSource, /label:\s*"WhatsApp"/);
  assert.match(
    foundersDataSource,
    /https:\/\/www\.instagram\.com\/aurexissolution/,
  );
});

test("uses Sanjay's dedicated CEO email and Vasshan's CTO email on their cards", () => {
  assert.match(
    foundersDataSource,
    /email:\s*"ceo\.sanjay@aurexissolution\.com"/,
  );
  assert.match(
    foundersDataSource,
    /email:\s*"vasshanraj@aurexissolution\.com"/,
  );
});

test("uses the approved discovery call booking route for sanjay and vasshan's own link", () => {
  assert.match(
    foundersDataSource,
    /https:\/\/cal\.com\/aurexis-solution\/discoverycall/,
  );
  assert.match(
    foundersDataSource,
    /https:\/\/cal\.com\/vasshan-raj\/30min/,
  );
});

test("sanjay is the only card marked isFounder", () => {
  assert.match(foundersDataSource, /isFounder:\s*true/);
  assert.match(foundersDataSource, /isFounder:\s*false/);
});

test("uses the approved value statement with only the growth phrase highlighted", () => {
  assert.match(
    heroSource,
    /Helping growing businesses cut operational waste, recover valuable time and create room for\s*<span className="fc-value-emphasis">more profitable growth<\/span>\./,
  );
  assert.doesNotMatch(
    heroSource,
    /Helping growing businesses operate with greater clarity, control and less manual work/,
  );
});

test("uses one genuinely transparent official logo in the header and footer", async () => {
  const expectedPath = "/brand/aurexis-logo-transparent.png";
  assert.match(heroSource, new RegExp(`src=["']${expectedPath}["']`));
  assert.match(footerSource, new RegExp(`src=["']${expectedPath}["']`));
  assert.doesNotMatch(heroSource, /mixBlendMode/);
  assert.doesNotMatch(footerSource, /mixBlendMode/);

  const logoPath = fileURLToPath(
    new URL("../public/brand/aurexis-logo-transparent.png", import.meta.url),
  );
  const { channels } = await sharp(logoPath).stats();
  assert.equal(channels.length, 4);
  assert.equal(channels[3].min, 0);
  assert.equal(channels[3].max, 255);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/founder-card-composition.test.mjs`
Expected: FAIL — `src/components/founder-card/FounderCardPage.tsx` does not exist yet, and the other files still read from the old singleton with no-prop JSX.

- [ ] **Step 3: Convert `FounderHero` to take a `card` prop**

Replace `src/components/founder-card/FounderHero.tsx`:

```typescript
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { FounderCardData } from "@/data/founder-cards";
import { PrimaryActions } from "./PrimaryActions";

export function FounderHero({ card }: { card: FounderCardData }) {
  return (
    <section className="fc-hero" aria-labelledby="founder-name">
      <div className="fc-hero-shell">
        <header className="fc-hero-logo fc-rise">
          <Image
            src="/brand/aurexis-logo-transparent.png"
            alt="Aurexis Solution"
            width={1546}
            height={368}
            priority
            sizes="(min-width: 768px) 190px, 142px"
            className="h-auto w-[142px] object-contain md:w-[190px]"
          />
        </header>

        <div className="fc-hero-portrait fc-rise" style={{ animationDelay: "70ms" }}>
          <span aria-hidden className="fc-hero-angle" />
          {card.portrait ? (
            <Image
              src={card.portrait}
              alt={`Portrait of ${card.name}, ${card.title} of ${card.company}`}
              fill
              priority
              sizes="(min-width: 1200px) 610px, (min-width: 768px) 48vw, 280px"
              className="fc-hero-portrait-image object-cover"
            />
          ) : (
            <div className="fc-portrait-fallback" aria-hidden>
              {card.initials}
            </div>
          )}
        </div>

        <div className="fc-hero-copy fc-rise" style={{ animationDelay: "120ms" }}>
          <p className="fc-eyebrow">
            <span>{card.eyebrowLabel}</span>
            <span aria-hidden>•</span>
            <span>Business systems</span>
          </p>

          <h1 id="founder-name" className="fc-founder-name">
            <span>{card.firstName}</span>
            <span>{card.lastName}</span>
          </h1>

          <p className="fc-founder-role">
            <span>{card.title}</span>
            <span aria-hidden className="fc-role-dot">•</span>
            <span>{card.company}</span>
          </p>

          <p className="fc-founder-location">
            <MapPin aria-hidden className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
            <span>{card.publicLocation}</span>
            <span aria-hidden className="fc-location-rule" />
            <span>Serving Malaysia &amp; Singapore</span>
          </p>

          <p className="fc-value-statement">
            Helping growing businesses cut operational waste, recover valuable time and create room for <span className="fc-value-emphasis">more profitable growth</span>.
          </p>

          <div className="fc-hero-actions">
            <PrimaryActions card={card} />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Convert `PrimaryActions` to take a `card` prop**

Replace `src/components/founder-card/PrimaryActions.tsx`:

```typescript
"use client";

import { CalendarDays, MessageCircle, UserRoundPlus, ArrowRight } from "lucide-react";
import type { FounderCardData } from "@/data/founder-cards";
import { track } from "@/lib/founder-card/analytics";

export function PrimaryActions({ card }: { card: FounderCardData }) {
  return (
    <section aria-label="Primary actions" className="flex flex-col gap-3">
      <a
        href={card.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("book_discovery_click")}
        aria-label={`Book a discovery call with ${card.name}`}
        className="fc-focus fc-primary-action group flex min-h-[58px] items-center gap-3 rounded-[12px] px-5 text-[14px] font-semibold transition duration-200 hover:-translate-y-[1px] sm:text-[15px]"
      >
        <CalendarDays className="h-[18px] w-[18px] shrink-0" aria-hidden strokeWidth={1.7} />
        <span className="flex-1 text-center">Book a Discovery Call</span>
        <ArrowRight
          className="h-[17px] w-[17px] shrink-0 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden
          strokeWidth={1.7}
        />
      </a>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={card.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click")}
          aria-label={`Message ${card.firstName} on WhatsApp`}
          className="fc-focus fc-secondary-action flex min-h-[54px] items-center justify-center gap-2.5 rounded-[11px] px-3 text-[13px] font-semibold transition duration-200 hover:-translate-y-[1px] min-[375px]:text-[14px]"
        >
          <MessageCircle
            className="h-[18px] w-[18px]"
            style={{ color: "var(--fc-accent)" }}
            aria-hidden
            strokeWidth={1.8}
          />
          WhatsApp
        </a>

        <a
          href={`/api/vcard/${card.slug}`}
          download={card.vcardFileName}
          onClick={() => track("save_contact_click")}
          aria-label={`Save ${card.name}'s contact card`}
          className="fc-focus fc-secondary-action flex min-h-[54px] items-center justify-center gap-2.5 rounded-[11px] px-3 text-[13px] font-semibold transition duration-200 hover:-translate-y-[1px] min-[375px]:text-[14px]"
        >
          <UserRoundPlus
            className="h-[18px] w-[18px]"
            style={{ color: "var(--fc-accent)" }}
            aria-hidden
            strokeWidth={1.8}
          />
          Save Contact
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Convert `ConnectSection` to take a `card` prop**

Replace `src/components/founder-card/ConnectSection.tsx`:

```typescript
"use client";

import { Globe2, Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import type { FounderCardData } from "@/data/founder-cards";
import { track } from "@/lib/founder-card/analytics";
import { SectionLabel } from "./SectionLabel";
import type { FounderCardEvent } from "@/lib/founder-card/analytics";

function buildContactItems(card: FounderCardData): ReadonlyArray<{
  label: string;
  value: string;
  href: string;
  icon: typeof Mail;
  event: FounderCardEvent;
  external?: boolean;
}> {
  return [
    {
      label: "Email",
      value: card.email,
      href: `mailto:${card.email}`,
      icon: Mail,
      event: "email_click",
    },
    {
      label: "Website",
      value: card.websiteDisplay,
      href: card.website,
      icon: Globe2,
      event: "website_click",
      external: true,
    },
    {
      label: "LinkedIn",
      value: card.linkedinIsPersonal ? card.name : card.company,
      href: card.linkedin,
      icon: Linkedin,
      event: "linkedin_click",
      external: true,
    },
    {
      label: "Instagram",
      value: card.instagramDisplay,
      href: card.instagramUrl,
      icon: Instagram,
      event: "instagram_click",
      external: true,
    },
  ];
}

export function ConnectSection({ card }: { card: FounderCardData }) {
  const contactItems = buildContactItems(card);
  return (
    <section aria-label={`Contact ${card.name}`}>
      <SectionLabel>Let&apos;s Connect</SectionLabel>
      <div className="fc-contact-grid">
        {contactItems.map(({ label, value, href, icon: Icon, event, external }) => (
          <a
            key={label}
            href={href}
            onClick={() => track(event)}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="fc-contact-item fc-focus"
            aria-label={`${label}: ${value}`}
          >
            <Icon aria-hidden className="fc-contact-icon" strokeWidth={1.55} />
            <span className="fc-contact-label">{label}</span>
            <span className="fc-contact-value">{value}</span>
          </a>
        ))}
      </div>

      <div className="fc-service-area">
        <span>
          <MapPin aria-hidden strokeWidth={1.6} />
          {card.publicLocation}
        </span>
        <i aria-hidden />
        <span>
          <Globe2 aria-hidden strokeWidth={1.5} />
          Serving Malaysia &amp; Singapore
        </span>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Convert `FounderFooter` to take a `card` prop**

Replace `src/components/founder-card/FounderFooter.tsx`:

```typescript
import Image from "next/image";
import type { FounderCardData } from "@/data/founder-cards";

export function FounderFooter({ card }: { card: FounderCardData }) {
  return (
    <footer className="fc-footer">
      <Image
        src="/brand/aurexis-logo-transparent.png"
        alt="Aurexis Solution"
        width={1546}
        height={368}
        sizes="(min-width: 768px) 154px, 132px"
        className="h-auto w-[132px] object-contain opacity-90 md:w-[154px]"
      />
      <div className="fc-footer-links">
        <a
          href={card.website}
          target="_blank"
          rel="noopener noreferrer"
          className="fc-focus"
        >
          {card.websiteDisplay}
        </a>
        <span aria-hidden />
        <a
          href={card.privacyUrl}
          className="fc-focus"
        >
          Privacy Policy
        </a>
      </div>
      <p className="fc-footer-copy">
        © 2026 Aurexis Solution. All rights reserved.
      </p>
    </footer>
  );
}
```

- [ ] **Step 7: Extract the shared page builder**

Create `src/components/founder-card/FounderCardPage.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import type { FounderCardData } from "@/data/founder-cards";
import { SITE_URL, IS_PRODUCTION } from "@/data/founder-cards";
import { FounderCardBackground } from "./FounderCardBackground";
import { FounderHero } from "./FounderHero";
import { Capabilities } from "./Capabilities";
import { OwnershipPanel } from "./OwnershipPanel";
import { ConnectSection } from "./ConnectSection";
import { FounderFooter } from "./FounderFooter";

export function buildFounderCardMetadata(card: FounderCardData): Metadata {
  const title = `${card.name} | ${card.title}, Aurexis Solution`;
  const description = `Connect with ${card.name}, ${card.title} of Aurexis Solution. Aurexis helps growing businesses reduce manual work, improve visibility and operate with greater control.`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: card.cardPath },
    // index/follow only on the confirmed production host; noindex everywhere else.
    robots: IS_PRODUCTION
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "profile",
      title,
      description,
      url: card.cardPath,
      siteName: "Aurexis Solution",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const founderCardViewport: Viewport = {
  themeColor: "#050709",
  colorScheme: "dark",
};

function structuredData(card: FounderCardData) {
  const portraitUrl = card.portrait ? `${SITE_URL}${card.portrait}` : undefined;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${card.cardUrl}#person`,
      name: card.name,
      givenName: card.firstName,
      familyName: card.lastName,
      jobTitle: card.title,
      url: card.cardUrl,
      ...(portraitUrl ? { image: portraitUrl } : {}),
      email: `mailto:${card.email}`,
      telephone: card.phoneLink,
      worksFor: { "@id": `${SITE_URL}#organization` },
      address: { "@type": "PostalAddress", addressCountry: "MY" },
      ...(card.linkedinIsPersonal ? { sameAs: [card.linkedin] } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: card.company,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/aurexis-logo-transparent.png`,
      description: card.positioning,
      email: card.email,
      areaServed: ["Malaysia", "Singapore"],
      ...(card.isFounder ? { founder: { "@id": `${card.cardUrl}#person` } } : {}),
      sameAs: ["https://www.linkedin.com/company/aurexissolution/"],
    },
  ];
}

/** A section wrapper that applies a subtle, staggered one-time load reveal
 * (disabled entirely under prefers-reduced-motion via the .fc-rise rule). */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`fc-rise ${className ?? ""}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function FounderCardPage({ card }: { card: FounderCardData }) {
  return (
    <>
      <div className="fc-page">
        <FounderCardBackground />
        <main className="fc-root fc-main relative z-10">
          <FounderHero card={card} />
          <div className="fc-content-shell">
            <Reveal delay={80} className="fc-section fc-capabilities-section">
              <Capabilities />
            </Reveal>
            <Reveal delay={140} className="fc-section fc-ownership-section">
              <OwnershipPanel />
            </Reveal>
            <Reveal delay={200} className="fc-section fc-connect-section">
              <ConnectSection card={card} />
            </Reveal>
            <Reveal delay={240}>
              <FounderFooter card={card} />
            </Reveal>
          </div>
        </main>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(card)) }}
      />
    </>
  );
}
```

- [ ] **Step 8: Extract the shared OG image renderer**

Create `src/lib/founder-card/og-image.tsx`:

```typescript
import { ImageResponse } from "next/og";
import type { FounderCardData } from "@/data/founder-cards";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export function founderOgAlt(card: FounderCardData): string {
  return `${card.name} — ${card.title}, Aurexis Solution`;
}

/** Premium, Aurexis-branded social card. Typographic (no external assets) so it
 * renders reliably at build/runtime. Dark canvas, restrained cyan detail. */
export function renderFounderOgImage(card: FounderCardData) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(160deg, #070c10 0%, #050709 60%)",
          padding: "76px 84px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(58% 62% at 50% -6%, rgba(66,213,215,0.16), transparent 60%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#42D5D7",
              display: "flex",
              boxShadow: "0 0 26px rgba(66,213,215,0.6)",
            }}
          />
          <div
            style={{
              color: "#cbd5e1",
              fontSize: 24,
              letterSpacing: 9,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Aurexis Solution
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#42D5D7",
              fontSize: 24,
              letterSpacing: 7,
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 100,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {card.name}
          </div>
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: 31,
            lineHeight: 1.35,
            maxWidth: 940,
            display: "flex",
          }}
        >
          {card.positioning}
        </div>
      </div>
    ),
    { ...ogImageSize },
  );
}
```

- [ ] **Step 9: Rewrite Sanjay's route files as thin wrappers**

Replace `src/app/sanjay/page.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import { FOUNDER_CARDS } from "@/data/founder-cards";
import {
  buildFounderCardMetadata,
  founderCardViewport,
  FounderCardPage,
} from "@/components/founder-card/FounderCardPage";

const card = FOUNDER_CARDS.sanjay;

export const metadata: Metadata = buildFounderCardMetadata(card);
export const viewport: Viewport = founderCardViewport;

export default function SanjayFounderCardPage() {
  return <FounderCardPage card={card} />;
}
```

Replace `src/app/sanjay/opengraph-image.tsx`:

```typescript
import { FOUNDER_CARDS } from "@/data/founder-cards";
import {
  founderOgAlt,
  ogImageSize,
  ogImageContentType,
  renderFounderOgImage,
} from "@/lib/founder-card/og-image";

const card = FOUNDER_CARDS.sanjay;

export const alt = founderOgAlt(card);
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OpenGraphImage() {
  return renderFounderOgImage(card);
}
```

`src/app/sanjay/twitter-image.tsx` already just re-exports from `./opengraph-image` — leave it unchanged, it keeps working against the new thin wrapper.

- [ ] **Step 10: Delete the retired singleton and static route**

```bash
git rm src/data/founder-card.ts src/app/api/vcard/route.ts
```

- [ ] **Step 11: Run tests to verify they pass**

Run: `node --test tests/founder-card-composition.test.mjs tests/founder-cards-data.test.mjs tests/founder-card-vcard.test.mjs tests/founder-card-vcard-route.test.mjs`
Expected: PASS (all tests)

- [ ] **Step 12: Type-check and lint**

Run: `npm run lint`
Expected: no errors (there is no longer any reference to `src/data/founder-card.ts` or `src/app/api/vcard/route.ts` anywhere — if lint or the TypeScript compiler flags a stale import, fix it before continuing).

- [ ] **Step 13: Commit**

```bash
git add -A src/components/founder-card src/lib/founder-card/og-image.tsx src/app/sanjay tests/founder-card-composition.test.mjs
git commit -m "refactor: parameterize founder-card components and extract shared page/OG builders"
```

---

### Task 4: Generalize the smooth-scroll route check

**Files:**
- Modify: `src/lib/founder-card/routes.ts`
- Modify: `tests/founder-card-routes.test.mjs`

Note: `routes.ts` currently has zero imports, which is exactly why `tests/founder-card-routes.test.mjs` can `import` and really execute it under plain `node --test` (no `@/`-alias resolver is configured there — see the note in Task 1). To keep that genuine behavioral test intact rather than downgrading to a source-text check, this task keeps `routes.ts` free of imports and adds Vasshan's path as a second literal, the same way it already hardcodes Sanjay's — it does not import `FOUNDER_CARDS` from the new registry.

- [ ] **Step 1: Write the failing test**

Replace `tests/founder-card-routes.test.mjs`:

```javascript
import assert from "node:assert/strict";
import test from "node:test";
import { isFounderCardRoute } from "../src/lib/founder-card/routes.ts";

test("matches every registered founder-card route namespace", () => {
  assert.equal(isFounderCardRoute("/sanjay"), true);
  assert.equal(isFounderCardRoute("/sanjay/example"), true);
  assert.equal(isFounderCardRoute("/vasshanraj"), true);
  assert.equal(isFounderCardRoute("/vasshanraj/example"), true);
});

test("does not match similarly named or unrelated routes", () => {
  assert.equal(isFounderCardRoute("/"), false);
  assert.equal(isFounderCardRoute("/services"), false);
  assert.equal(isFounderCardRoute("/sanjay-profile"), false);
  assert.equal(isFounderCardRoute("/vasshanraj-profile"), false);
  assert.equal(isFounderCardRoute(null), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/founder-card-routes.test.mjs`
Expected: FAIL — `isFounderCardRoute("/vasshanraj")` returns `false`.

- [ ] **Step 3: Generalize the route check**

Replace `src/lib/founder-card/routes.ts`:

```typescript
// Every founder-card route namespace. Add a new person's `cardPath` here
// too when they get a card — kept as a literal (not derived from
// src/data/founder-cards.ts) so this stays a plain, dependency-free,
// directly testable function.
const CARD_PATHS = ["/sanjay", "/vasshanraj"];

export function isFounderCardRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return CARD_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/founder-card-routes.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/founder-card/routes.ts tests/founder-card-routes.test.mjs
git commit -m "feat: generalize founder-card route matching to the whole registry"
```

---

### Task 5: Add the `/vasshanraj` route

**Files:**
- Create: `src/app/vasshanraj/page.tsx`
- Create: `src/app/vasshanraj/opengraph-image.tsx`
- Create: `src/app/vasshanraj/twitter-image.tsx`
- Test: extend `tests/founder-card-composition.test.mjs`

- [ ] **Step 1: Write the failing test**

Add to `tests/founder-card-composition.test.mjs` (after the existing `sanjayRouteSource` block, alongside its own new `readFile`):

```javascript
const vasshanrajRouteSource = await readFile(
  new URL("../src/app/vasshanraj/page.tsx", import.meta.url),
  "utf8",
);
```

And add this test at the end of the file:

```javascript
test("vasshanraj's route delegates to the shared page builder with his own card", () => {
  assert.match(vasshanrajRouteSource, /FOUNDER_CARDS\.vasshanraj/);
  assert.match(vasshanrajRouteSource, /<FounderCardPage\s+card=\{card\}\s*\/>/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/founder-card-composition.test.mjs`
Expected: FAIL — `src/app/vasshanraj/page.tsx` does not exist (file read throws `ENOENT`).

- [ ] **Step 3: Create Vasshan's route files**

Create `src/app/vasshanraj/page.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import { FOUNDER_CARDS } from "@/data/founder-cards";
import {
  buildFounderCardMetadata,
  founderCardViewport,
  FounderCardPage,
} from "@/components/founder-card/FounderCardPage";

const card = FOUNDER_CARDS.vasshanraj;

export const metadata: Metadata = buildFounderCardMetadata(card);
export const viewport: Viewport = founderCardViewport;

export default function VasshanFounderCardPage() {
  return <FounderCardPage card={card} />;
}
```

Create `src/app/vasshanraj/opengraph-image.tsx`:

```typescript
import { FOUNDER_CARDS } from "@/data/founder-cards";
import {
  founderOgAlt,
  ogImageSize,
  ogImageContentType,
  renderFounderOgImage,
} from "@/lib/founder-card/og-image";

const card = FOUNDER_CARDS.vasshanraj;

export const alt = founderOgAlt(card);
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OpenGraphImage() {
  return renderFounderOgImage(card);
}
```

Create `src/app/vasshanraj/twitter-image.tsx`:

```typescript
// Reuse the Open Graph image for the Twitter/X summary_large_image card.
export { default, size, contentType, alt } from "./opengraph-image";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/founder-card-composition.test.mjs`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/vasshanraj tests/founder-card-composition.test.mjs
git commit -m "feat: add /vasshanraj digital card route"
```

---

### Task 6: Process and add Vasshan's portrait

**Files:**
- Create: `public/images/vasshan-raj.jpg` (from repo-root `PHOTO-2026-09-04-00-31-54.jpg`)

There's no meaningful unit test for an image asset — verification here is visual (Task 7) and a manual dimension/size sanity check.

- [ ] **Step 1: Resize and save the portrait**

The source photo is 1086×1448. Match the scale of the existing portrait files (`public/images/cto.jpg` is 737×1024, `coo.jpg` is 1024×945) by capping the longest edge at 1024px and re-encoding at a moderate JPEG quality:

Run:
```bash
sips -Z 1024 -s formatOptions 82 "PHOTO-2026-09-04-00-31-54.jpg" --out public/images/vasshan-raj.jpg
```

- [ ] **Step 2: Verify the output**

Run: `sips -g pixelWidth -g pixelHeight public/images/vasshan-raj.jpg && ls -la public/images/vasshan-raj.jpg`
Expected: height 1024, width ~768, file size in the same ballpark as `cto.jpg`/`coo.jpg` (tens of KB, not hundreds).

- [ ] **Step 3: Remove the raw upload from the repo root**

It's no longer needed once the processed copy is in `public/images/`.

```bash
rm "PHOTO-2026-09-04-00-31-54.jpg"
```

- [ ] **Step 4: Commit**

```bash
git add public/images/vasshan-raj.jpg
git commit -m "feat: add Vasshan Raj's processed portrait"
```

---

### Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `node --test tests/founder-card-composition.test.mjs tests/founder-card-routes.test.mjs tests/founder-cards-data.test.mjs tests/founder-card-vcard.test.mjs tests/founder-card-vcard-route.test.mjs`
Expected: PASS, all tests.

- [ ] **Step 2: Lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds, and the output lists both `/sanjay` and `/vasshanraj` as generated routes (along with their `opengraph-image`/`twitter-image` routes and `/api/vcard/[slug]`).

- [ ] **Step 3: Manual browser check**

Run: `npm run dev`, then in the browser:
- Load `/vasshanraj` — confirm the portrait, name, "Chief Technology Officer" title, "Engineering-led" eyebrow tag, and all five actions (Book a Discovery Call → cal.com/vasshan-raj/30min, WhatsApp → his own number, Save Contact, Email, LinkedIn → linkedin.com/in/vasshan-raj, Instagram → @aurexissolution) work and point to the right destination.
- Hit `/api/vcard/vasshanraj` directly and confirm it downloads a `.vcf` that opens correctly and shows "Chief Technology Officer" (not "Founder & CEO").
- Reload `/sanjay` and confirm it is visually and functionally unchanged from before this change (portrait, "Founder-led" eyebrow, all actions, `/api/vcard/sanjay` download).
- View source on both pages and confirm the JSON-LD `Organization` node only has a `founder` field on `/sanjay`, not on `/vasshanraj`.

If any of this can't be verified in the browser in this environment, say so explicitly rather than claiming it works.
