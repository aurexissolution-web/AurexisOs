# Founder Card Premium Refinement Design

## Direction

Refine the existing `/sanjay` founder card into a restrained editorial-luxury identity page. The composition remains intimate and single-column, but grows from a 480px mobile-like column to a controlled 580px desktop measure. The visual hierarchy comes from typography, portrait scale, matte materials, spacing, and a small angular Aurexis motif—not additional content or visual effects.

Two alternatives were rejected:

- A desktop split layout would feel like a full corporate landing page rather than a digital card.
- A stacked bento/card system would reinforce the generic SaaS/dashboard quality the brief asks to remove.

## Composition

Keep the exact approved order: official logo, hero, founder identity, three actions, About Aurexis, capabilities, trust, contact, and footer. No navigation, QR code, assistant, extra services, testimonials, metrics, or invented claims are introduced.

The hero uses the approved headline with controlled three-line wrapping on larger screens and natural wrapping on mobile. The desktop headline reaches approximately 56px; the supporting sentence receives stronger contrast and a wider measure.

The founder identity becomes the main material surface. Sanjay’s portrait increases to roughly 96×118px on mobile and 110×134px on desktop. A matte charcoal surface, internal highlight, quiet shadow, and one angular corner accent replace the generic profile-card treatment.

The primary CTA becomes deep charcoal with off-white text, a restrained cyan edge, and a contained directional detail. WhatsApp and Save Contact remain equal secondary actions with real destinations.

About and capabilities read as one editorial passage with numbered rows and fine dividers. Trust keeps the ownership statement as the strongest highlighted line. Contact becomes more legible, neutral by default, and two-column only where the width supports it. The footer gains a slightly larger logo, readable links, and a deliberate divider.

## Background and Motion

Use a continuous `#030507` page background with a very subtle static radial spotlight behind the upper composition. The background belongs to the full page rather than a fixed viewport layer, eliminating the full-page screenshot seam.

Disable the global Lenis wrapper for `/sanjay` and nested founder-card routes. The card needs native scrolling, and the existing global smooth-scroll transform causes duplicated sections in full-page browser captures. Other routes retain Lenis.

Motion stays limited to the existing one-time fade/up reveal and 160–240ms interaction transitions, with reduced-motion support.

## Responsive and Accessibility

- Support 320, 375, 390, 430, 768, and 1440px viewport widths.
- Use 20px mobile horizontal padding, 24px from small tablets upward, and a 580px maximum content width.
- Preserve semantic headings, descriptive alt text, 44px+ tap targets, keyboard focus rings, and real anchor destinations.
- Keep the official logo and existing portrait dimensions explicit to prevent layout shift.

## Verification

- Add a route predicate test covering exact and nested `/sanjay` paths so the native-scroll exception cannot leak to other pages.
- Run focused tests, application lint, production build, and browser console checks.
- Verify booking, WhatsApp, vCard, email, website, LinkedIn, and privacy destinations.
- Inspect all required viewport widths and capture final full-page screenshots at approximately 390px and 1440px.

