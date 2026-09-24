# Cinematic Founder Card Design

## Status

Approved by the supplied pixel-match mockup and implementation brief on 2026-07-14. The mockup is the visual source of truth; this document records, rather than reinterprets, it.

## Composition

- Replace the centred SaaS-style card with a full-width, near-black editorial canvas.
- Desktop uses a 1180–1280px asymmetric hero: brand and founder identity on the left, a large unboxed portrait on the right, with a restrained diagonal cyan motif above it.
- Mobile order is logo, dominant portrait, founder-led eyebrow, two-line serif name, role, location, value statement, and actions.
- Below the hero: three unboxed capability columns on desktop and a divided icon list on mobile; one ownership panel; a compact connect section; and a minimal footer.
- The page contains no chatbot, QR code, fake phone chrome, hamburger menu, statistics, testimonials, or additional marketing copy.

## Visual System

- Background: continuous `#020405` with quiet radial light, vignette, and fine grain.
- Text: warm ivory `#f1eee8`; secondary `#abb1b5`; muted `#767f86`.
- Accent: Aurexis cyan `#22c8ce`, limited to icons, small labels, the hero diagonal, panel edge, and the single primary CTA.
- Sanjay's name uses an editorial serif at approximately 88px desktop and 50px mobile. Business text uses the existing Plus Jakarta Sans.
- The portrait uses `/images/cto.jpg`, scaled to dominate the hero, cropped to preserve the face and glasses, and faded into the canvas with CSS masks/gradients rather than a bordered card.
- Motion is limited to 180–400ms entrance and hover transitions and is disabled for reduced-motion users.

## Functionality

- Preserve the existing Cal.com, WhatsApp, email, website, LinkedIn, privacy, and `/api/vcard` values and behavior from `src/data/founder-card.ts`.
- All actions remain keyboard-operable with visible focus treatment and at least 44px tap targets.
- Existing metadata, structured data, analytics events, chatbot suppression, and Lenis route suppression remain intact.

## Responsive Targets

- Validate 320, 375, 390, 430, 768, 1024, and 1440px widths.
- At desktop widths, the first viewport must read as an editorial founder campaign with the portrait occupying roughly half the hero.
- At mobile widths, the portrait stays large and the complete page remains concise, with no overflow or clipped copy.

## Verification

- Run composition tests, existing route/visibility tests, focused ESLint, TypeScript type-check, and production build.
- Exercise every link and the VCF endpoint in the browser.
- Perform at least two visual comparison passes at 390px and 1440px, correcting the five largest mismatches after each pass.
- Save final production screenshots under `artifacts/`.
