# Aurexis Services Sub-Pages — Finished Copy

> Production-ready copy for `/services/ai`, `/services/web`, and `/services/app`. Drop into Astro/Next.js components as-is. Companion to `COPY_PAGES.md` (which covers Home, About, Services index, Demos, Portfolio, Blog, Contact, /clinics).

**Document version:** 1.0 · **Date:** 2026-05-03 · **Status:** Production-ready

---

## Voice rules followed throughout

- Lead with outcome, not technology
- Italic cyan signature on every major headline (one word, display serif)
- Specialist, not generalist
- Malaysian context as advantage (PDPA, LHDN, RM, multilingual)
- Pair every claim with a number or mechanism
- No banned phrases: ~~cutting-edge · innovative solutions · synergy · game-changing · revolutionary · best-in-class · leverage (verb) · in today's fast-paced world~~

---

## Page structure (universal — same shape for all 3)

Each sub-page follows this 9-section pattern. Content changes per pillar, structure does not.

```

2.  Hero  (eyebrow + italic-cyan headline + subhead with price band + ONE CTA)
3.  The pain we solve  (3 pain cards specific to this pillar)
4.  What we build  (5 deliverables)
5.  Use cases  (4 example projects)
6.  Process  (4 steps)
7.  Why Aurexis vs. the alternatives  (comparison block — replaces dedicated Pricing)
8.  FAQ  (4–5 questions specific to this pillar)
9.  CTA + Related  (primary CTA + cross-links to other 3 pillars)
10. Footer  (shared component)
```

---

## Cross-page consistency rules

- All hero subheads include a one-line price reference (e.g., "Typical builds RM 15-60k, scoped per project")
- All CTAs go to WhatsApp OR Calendly — no generic "Contact us" forms
- All FAQs include ONE pricing-related question (since we removed dedicated Pricing section)
- All pages cross-link to the other 3 sub-pages in the "Related" block
- Lighthouse target: 90+ desktop, 85+ mobile

---

## Table of Contents

- [Page 1 — AI Workflows & Agents (`/services/ai`)](#page-1--ai-workflows--agents-servicesai)
- [Page 2 — Web Platforms (`/services/web`)](#page-2--web-platforms-servicesweb)
- [Page 3 — Mobile Apps (`/services/app`)](#page-3--mobile-apps-servicesapp)
- [Mobile-Specific Rules](#mobile-specific-rules-all-3-pages)
- [SEO Meta (per page)](#seo-meta-per-page)
- [Build Status & Effort](#build-status--effort)

---

# Page 1 — AI Workflows & Agents (`/services/ai`)

## Section 1 — Sticky Nav
Shared component. "Services" parent link active; "AI" highlighted in dropdown.

---

## Section 2 — Hero

**Eyebrow (mono caps cyan):**
`COMPONENT · AI`

**Headline (display serif, italic cyan word):**
> *"AI agents that **replace** machine-level work."*

**Subhead (sans, max 3 lines, with price band woven in):**
> *"Custom AI receptionists, internal copilots, and automation agents — trained on your specific business, integrated with your real workflows. Typical builds RM 15-60k, scoped per project. Not a chatbot. A worker."*

**Primary CTA:** `[ Try Our AI Receptionist → ]` (links to /demos)
**Secondary text link:** `Or message us on WhatsApp →`

---

## Section 3 — The Pain We Solve

**Eyebrow:** `THE PROBLEM`
**Headline:** *"Manual admin is **eating** your margin."*

### 3 pain cards

**Card 1**
- Mono label: `01 ─── VOLUME`
- Headline: **30–40% of staff time is on routine work.**
- Body: *"Booking confirmations. Appointment reminders. Status updates. Data re-entry. Compliance reporting. Each task takes minutes. Across a week, it eats days."*
- Stat: `~RM 3,000–5,000/month per admin staff doing replaceable work`

**Card 2**
- Mono label: `02 ─── GENERIC AI DOESN'T FIT`
- Headline: **Off-the-shelf chatbots don't know your business.**
- Body: *"They give generic answers. They miss the context. They escalate everything to a human anyway. The result is worse than no chatbot — it actively hurts your brand."*
- Stat: `~70% of off-the-shelf chatbot conversations end in escalation`

**Card 3**
- Mono label: `03 ─── HEADCOUNT ISN'T SCALING`
- Headline: **Hiring more people stopped working.**
- Body: *"Wages climb 8% annually. Skilled admin staff cost RM 3-5k/month before EPF and SOCSO. Adding people for repetitive work is the slowest, most expensive path to growth."*
- Stat: `RM 1,700+ minimum wage and rising`

**Closing line:**
> *"You don't need a chatbot. You need a worker."*

---

## Section 4 — What We Build

**Eyebrow:** `THE OFFER`
**Headline:** *"AI **agents**, not chatbots."*

### 5 deliverables

**01 — AI Receptionists**
*"24/7 customer-facing agents on WhatsApp, web, or voice. Books appointments, answers FAQs, qualifies leads, escalates intelligently. Trained on YOUR business — not OpenAI's defaults."*

**02 — Internal Copilots**
*"Your team asks questions in plain English; the copilot answers from your knowledge base, SOPs, past projects, and company data. Replaces 'who knows X?' Slack messages."*

**03 — Automation Agents**
*"Repetitive admin handled in the background — data entry, follow-ups, status checks, scheduling, supplier reorders, customer service triage."*

**04 — Document & Quote Generators**
*"Templated outputs from a few inputs. Quotes, proposals, contracts, intake forms, compliance reports — generated in seconds, branded to your business."*

**05 — Compliance Automations**
*"LHDN e-invoice generation. PDPA logging. SST reporting. Audit trails. The compliance work done invisibly, every day, with no manual touching."*

---

## Section 5 — Use Cases

**Eyebrow:** `EXAMPLES`
**Headline:** *"What this looks like **in practice**."*

### 4 use case cards

**Use Case 1 — Dental Clinic**
- Industry: Healthcare
- The agent: AI receptionist on WhatsApp
- Does: Books appointments · Sends 24h reminders · Reschedules · Answers common patient questions
- Result: Saves 4-6 hrs/week of receptionist time. No-show rate drops 30-50%.

**Use Case 2 — Law Firm**
- Industry: Legal Services
- The agent: Internal copilot for case research
- Does: Summarizes case files · Drafts intake letters · Surfaces relevant precedents · Answers questions about ongoing matters
- Result: Junior associates 2-3× faster on research tasks.

**Use Case 3 — F&B Chain**
- Industry: Food & Beverage
- The agent: Operations automation
- Does: Tracks supplier deliveries · Flags inventory shortages · Generates reorder requests · Sends daily ops summary
- Result: Owner stops checking each outlet manually. 1 hour/day saved.

**Use Case 4 — Property Agency**
- Industry: Real Estate
- The agent: Quote and listing generator
- Does: Turns property specs into branded PDFs · Drafts WhatsApp listings · Generates valuation summaries
- Result: Listings ready in 2 minutes instead of 30.

---

## Section 6 — Process

**Eyebrow:** `HOW WE BUILD`
**Headline:** *"Four steps. **Six** weeks."*

### 4 steps

**01 — Workflow Audit (Week 1)**
*"We map every admin task in your business. We identify what's automatable today and what's not. Output: a written automation roadmap with priorities."*

**02 — Agent Design (Week 2)**
*"We design the system prompt, the knowledge base, the escalation rules, the tone of voice. We build a working prototype on your real data."*

**03 — Build & Training (Weeks 3–5)**
*"We build the agent, integrate it with your tools (WhatsApp, your CRM, your booking system), and train it on real conversations. You see daily progress."*

**04 — Launch + Tuning (Week 6+)**
*"Agent goes live. We watch it work for 30 days, retrain on actual edge cases, and tune escalation thresholds. You start seeing the ROI in week 3 of live use."*

---

## Section 7 — Why Aurexis vs. the Alternatives

**Eyebrow:** `THE COMPARISON`
**Headline:** *"Why **custom** AI — not a chatbot widget."*

### Comparison table

| | Generic ChatGPT subscription | Off-the-shelf chatbot widget | **Aurexis Custom AI** |
|---|---|---|---|
| Knows your business | ❌ No | ⚠️ Trained on FAQs only | ✅ Trained on your data |
| Integrates with your tools | ❌ Separate workflow | ⚠️ Limited webhooks | ✅ Native integrations |
| Owns the data | ❌ OpenAI does | ⚠️ Vendor does | ✅ You do |
| PDPA-compliant by design | ⚠️ Depends on use | ⚠️ Depends on vendor | ✅ Yes, contractually |
| Routes to humans intelligently | ❌ No | ⚠️ Basic rules | ✅ Custom escalation logic |
| Multi-language (incl. Bahasa) | ⚠️ Generic | ⚠️ Limited | ✅ Native, tuned |
| Long-term cost (3 years) | RM 5-10k/yr × 3 | RM 24k+/yr × 3 | One build + retainer |
| **Verdict** | *Powerful, generic* | *Templated, shallow* | *Built for your business* |

**Closing line:**
> *"Generic AI is configured. Aurexis agents are built — for your specific business, your specific workflows, your specific patients or customers."*

---

## Section 8 — FAQ

**Eyebrow:** `QUESTIONS`
**Headline:** *"Things people **ask** us."*

### 5 questions

**Q1 — What does this cost?**
*"Typical AI builds fall between RM 15,000 and RM 60,000, depending on scope, integrations, and training data volume. Optional retainer of RM 1,500-5,000/month for ongoing tuning and new use cases. Every project is scoped individually — discovery calls are free."*

**Q2 — What models do you use?**
*"Anthropic Claude as the default. We pick the right model for the task — sometimes mixed (e.g., Claude for reasoning, smaller models for classification). We're model-agnostic; the value is in how we build, not which API we call."*

**Q3 — What about hallucinations?**
*"We design for graceful escalation. The agent flags uncertainty and routes to a human. Hallucination risk is low because we ground every response in your real data — not the model's training set. We measure this, tune it, and report it monthly during the retainer."*

**Q4 — Can it handle Malay / Bahasa?**
*"Yes. Multilingual is a Malaysian advantage we lean into. Most of our agents handle English + Bahasa Malaysia, sometimes plus Mandarin or Tamil depending on your customer mix."*

**Q5 — Will my data be safe?**
*"Your data is yours. We use API access (no training on your data). We sign DPAs. PDPA-compliant by design — minimal data collection, encrypted at rest, documented data flows. We're SST-registered."*

---

## Section 9 — CTA + Related

**Headline:** *"Ready to **try** one?"*
**Subhead:** *"See our AI Receptionist live, or message us about a custom build."*

**Primary CTA:** `[ See AI Receptionist Live → ]` (links to /demos)
**Secondary CTA:** `[ WhatsApp us about an AI build → ]`

### Related (cross-links)

> *"Components: [The Ecosystem →](/services/ecosystem) · [Web Platforms →](/services/web) · [Mobile Apps →](/services/app)"*

---

## Section 10 — Footer
Shared component.

---

# Page 2 — Web Platforms (`/services/web`)

## Section 1 — Sticky Nav
Shared component. "Services" parent active; "Web" highlighted in dropdown.

---

## Section 2 — Hero

**Eyebrow:** `COMPONENT · WEB`

**Headline:** *"Websites that **actually** load."*

**Subhead:**
> *"Custom-built websites, e-commerce stores, and customer portals. Performance-first — Lighthouse 90+ as default, not aspiration. Typical builds RM 15-50k, scoped per project. No WordPress bloat. No Wix limitations."*

**Primary CTA:** `[ See Our Work → ]` (links to /portfolio)
**Secondary text link:** `Or message us on WhatsApp →`

---

## Section 3 — The Pain We Solve

**Eyebrow:** `THE PROBLEM`
**Headline:** *"Most Malaysian SME sites are **costing** you customers."*

### 3 pain cards

**Card 1**
- Mono label: `01 ─── SPEED`
- Headline: **Slow sites kill conversion.**
- Body: *"Most Malaysian SME sites load in 4–9 seconds on mobile. Every 1 second of delay drops conversion by 7%. By the time your hero loads, half your visitors have left."*
- Stat: `Average local SME site: Lighthouse 35–55`

**Card 2**
- Mono label: `02 ─── TEMPLATES`
- Headline: **Templates make you look generic.**
- Body: *"Wix, Squarespace, GoDaddy templates make you look like every other shop in town. There's no premium signal. Customers can't tell you apart from your competitor's identical layout."*
- Stat: `~80% of Malaysian SME sites use one of 5 popular templates`

**Card 3**
- Mono label: `03 ─── LOCK-IN`
- Headline: **You can't extend a template.**
- Body: *"The moment you need a custom feature — a calculator, a booking flow, an integration — the platform fights you. You're locked in. Migrating later is expensive."*
- Stat: `Migration off Wix/Squarespace typically takes 4-8 weeks`

**Closing line:**
> *"Your website is your front door. It should open fast and look like yours alone."*

---

## Section 4 — What We Build

**Eyebrow:** `THE OFFER`
**Headline:** *"Custom-built. **Performance**-first."*

### 5 deliverables

**01 — Marketing Websites**
*"Custom-built sites that convert — not brochures. Lighthouse 90+ default. Designed around your conversion path: lead capture, calculator, demo, WhatsApp, or call."*

**02 — E-commerce Stores**
*"Custom storefronts (or Shopify-fluent if you prefer). Integrated payments — Stripe, FPX, Boost, GrabPay. Order ops dashboards. Built to scale past 1,000 orders/month without breaking."*

**03 — Customer Portals**
*"Login, dashboard, self-service. Patients book appointments. Clients see project status. Subscribers manage billing. Reduces support burden, increases retention."*

**04 — Lead-Capture Pages**
*"Single-purpose pages for ad campaigns, calculators, or lead magnets. Built to convert at 3-7% (vs. 1-2% for typical Malaysian SME pages)."*

**05 — Booking & Intake Systems**
*"Replace your form-on-WordPress with a real system. Calendar integration, payment collection, email + WhatsApp confirmations, no-show reminders, automatic CRM updates."*

---

## Section 5 — Use Cases

**Eyebrow:** `EXAMPLES`
**Headline:** *"What this looks like **in practice**."*

### 4 use case cards

**Use Case 1 — Service Business**
- Industry: Local services (cleaning, repair, tuition)
- The build: Marketing site + WhatsApp lead intake + booking
- Result: Inbound leads up 3-5×; time-to-first-reply drops from 8 hrs to 5 min.

**Use Case 2 — Direct-to-Consumer Brand**
- Industry: F&B / Beauty / Health
- The build: Custom Shopify-fluent storefront + ops dashboard + automated fulfilment
- Result: Owner manages 1,000 orders/month with one ops person instead of three.

**Use Case 3 — B2B Agency**
- Industry: Marketing / Consulting / IT
- The build: Case study site + lead-capture pages for ad campaigns
- Result: Cold ad traffic converts at 4-6% instead of 1-2%.

**Use Case 4 — Membership / Subscription**
- Industry: Gym / Course / Community
- The build: Gated content + Stripe-integrated subscription billing
- Result: Monthly recurring revenue stack visible, churn measurable, retention improvable.

---

## Section 6 — Process

**Eyebrow:** `HOW WE BUILD`
**Headline:** *"Four steps. **Six** weeks."*

### 4 steps

**01 — Strategy & Wireframe (Week 1)**
*"We map your information architecture, key conversion paths, and SEO keyword targets. Output: a written wireframe document — every page, every section, every CTA."*

**02 — Design (Week 2)**
*"High-fidelity designs in your design system. Mobile-first, dark-mode-ready (if your brand calls for it), accessibility-checked (WCAG 2.2 AA)."*

**03 — Build (Weeks 3–5)**
*"Astro for marketing sites. Next.js for app-like sites. Tailwind for styling. We commit small, ship to staging daily, and demo every Friday."*

**04 — Launch + 30-Day Support (Week 6+)**
*"Deploy to Cloudflare or Vercel. Set up analytics (GA4 + Meta Pixel). DNS cutover. Then 30 days of standby — anything breaks, we fix it."*

---

## Section 7 — Why Aurexis vs. the Alternatives

**Eyebrow:** `THE COMPARISON`
**Headline:** *"Why custom — **not** WordPress, Wix, or a freelancer."*

### Comparison table

| | WordPress + plugins | Wix / Squarespace template | Cheap freelance build | **Aurexis Web** |
|---|---|---|---|---|
| Performance (Lighthouse) | ⚠️ 50-70 typical | ⚠️ 60-80 typical | ⚠️ 40-70 typical | ✅ 90+ default |
| Customization ceiling | ⚠️ Plugin-limited | ❌ Template-limited | ⚠️ Skill-dependent | ✅ Anything |
| Maintenance burden | ❌ Plugin updates weekly | ⚠️ Vendor lock-in | ❌ Fragile code | ✅ Clean codebase |
| You own the code | ⚠️ Yes but messy | ❌ Locked to vendor | ⚠️ Depends | ✅ Clean repo, yours |
| Loads fast on Malaysian 4G | ❌ Often no | ⚠️ Sometimes | ⚠️ Maybe | ✅ Always |
| Accessibility (WCAG AA) | ⚠️ Plugin-dependent | ⚠️ Template-dependent | ❌ Usually skipped | ✅ Built in |
| SEO foundation | ⚠️ Plugin-dependent | ⚠️ Template-limited | ⚠️ Variable | ✅ Built in |
| **Verdict** | *Cheap, fragile, slow* | *Fast launch, hits wall* | *Hit or miss* | *Built once, scales* |

**Closing line:**
> *"You can build a site for RM 2,000. You'll spend RM 20,000 fixing it within 18 months. Or you build it right the first time."*

---

## Section 8 — FAQ

**Eyebrow:** `QUESTIONS`
**Headline:** *"Things people **ask** us."*

### 5 questions

**Q1 — What does this cost?**
*"Typical web builds fall between RM 15,000 and RM 50,000 depending on scope, page count, integrations, and CMS needs. Optional retainer of RM 1,000-3,000/month for ongoing improvements. Every project is scoped individually — discovery calls are free."*

**Q2 — What stack do you build on?**
*"Astro for marketing sites — fast static HTML by default. Next.js for app-like sites with auth and dynamic data. Tailwind for styling. Cloudflare or Vercel for hosting. No WordPress, no Wix, no Webflow."*

**Q3 — Can I edit content myself after launch?**
*"Yes. We integrate a CMS (Sanity, Payload, or Contentlayer) so non-developers can update copy, images, blog posts, and case studies. Training included."*

**Q4 — What about SEO?**
*"Built in from day one. Schema.org markup, semantic HTML, fast Core Web Vitals, sitemap.xml, robots.txt, Open Graph images, canonical URLs. We don't add SEO at the end — we build for it from the start."*

**Q5 — Will it integrate with my existing tools (Zoho, Stripe, WhatsApp, etc.)?**
*"Almost always yes. Most major SaaS tools have APIs. We integrate WhatsApp Business, Stripe, FPX, GrabPay, Zoho (Books, Mail, Forms), Xero, SQL Account, Mailchimp, MailerLite, and most CRMs. Tools without APIs are sometimes worth replacing — we'll tell you honestly during scoping."*

---

## Section 9 — CTA + Related

**Headline:** *"Want a site that **actually** loads?"*
**Subhead:** *"See our portfolio, or message us about a custom build."*

**Primary CTA:** `[ See Our Work → ]` (links to /portfolio)
**Secondary CTA:** `[ WhatsApp us about a web build → ]`

### Related

> *"Components: [The Ecosystem →](/services/ecosystem) · [AI Workflows →](/services/ai) · [Mobile Apps →](/services/app)"*

---

## Section 10 — Footer
Shared component.

---

# Page 3 — Mobile Apps (`/services/app`)

## Section 1 — Sticky Nav
Shared component. "Services" parent active; "App" highlighted in dropdown.

---

## Section 2 — Hero

**Eyebrow:** `COMPONENT · APP`

**Headline:** *"Mobile apps that **integrate**, not float."*

**Subhead:**
> *"iOS and Android apps built to talk to the rest of your stack — your website, your AI, your operations system. Typical builds RM 30-120k, scoped per project. Not standalone islands. Connected."*

**Primary CTA:** `[ See an App Demo → ]` (links to /demos)
**Secondary text link:** `Or message us on WhatsApp →`

---

## Section 3 — The Pain We Solve

**Eyebrow:** `THE PROBLEM`
**Headline:** *"Most agency-built apps are **islands**."*

### 3 pain cards

**Card 1**
- Mono label: `01 ─── DISCONNECTED`
- Headline: **Apps that don't talk to your stack.**
- Body: *"Most agency-built apps live in their own database. Customer data lives there and nowhere else. Web and app become two parallel businesses. Your team manually syncs them — or doesn't, and chaos ensues."*
- Stat: `~70% of SME apps don't share a backend with their website`

**Card 2**
- Mono label: `02 ─── QUALITY`
- Headline: **A 3-star app hurts your business.**
- Body: *"In 2026, customers Google your app before downloading. A 3-star rating signals 'low effort' or 'broken.' They don't download. The app you paid RM 60k for is invisible."*
- Stat: `Apps with <4.0 stars get 60% fewer downloads`

**Card 3**
- Mono label: `03 ─── WRONG STACK`
- Headline: **Most agencies push React Native because it's cheaper for them.**
- Body: *"Sometimes React Native is right. Sometimes native is right. Most agencies pick whichever is cheaper for them to build — not whichever is best for your business. We pick based on your actual needs."*
- Stat: `~85% of Malaysian agencies use React Native by default, regardless of fit`

**Closing line:**
> *"Your app should feel like part of your business, not a side project."*

---

## Section 4 — What We Build

**Eyebrow:** `THE OFFER`
**Headline:** *"Apps that **earn** their place on the home screen."*

### 5 deliverables

**01 — Internal Staff Apps**
*"Operations, dispatch, field service. Your team uses this daily. Built to be fast, offline-capable where needed, and tightly integrated with your operations backend."*

**02 — Customer-Facing Apps**
*"Loyalty, ordering, account management, booking. Designed to actually be downloaded and used — not abandoned after first install."*

**03 — Hybrid Platforms**
*"One backend serving both web and app. Same data, same logic, two interfaces. Built right, this is the most efficient way to ship a product across channels."*

**04 — Push + WhatsApp Integrations**
*"Re-engagement built in. Push notifications for the platform-native moments; WhatsApp Business API for the conversations. Together, they keep customers active."*

**05 — Offline-First Architectures**
*"For field work, low-connectivity environments, or critical operations. The app keeps working when the network doesn't, syncs cleanly when it does."*

---

## Section 5 — Use Cases

**Eyebrow:** `EXAMPLES`
**Headline:** *"What this looks like **in practice**."*

### 4 use case cards

**Use Case 1 — Auto Workshop Staff App**
- Industry: Auto Service
- The build: Service dispatch + customer history + photo uploads + technician assignment
- Result: Workshop ops time per job drops 30%; customer satisfaction up because nothing falls through cracks.

**Use Case 2 — Restaurant Chain App**
- Industry: F&B
- The build: Loyalty + ordering + push notifications for offers + WhatsApp re-engagement
- Result: Returning customer frequency 2× higher than non-app customers.

**Use Case 3 — Logistics Field App**
- Industry: Logistics / Delivery
- The build: Driver dispatch + proof of delivery + offline-first architecture + signature capture
- Result: Drivers no longer rely on WhatsApp for job assignments; delivery proof is auditable.

**Use Case 4 — Healthcare Patient App**
- Industry: Clinics / Specialist Practices
- The build: Appointment booking + records access + secure messaging + PDPA-compliant by design
- Result: Patient retention up; admin call volume down.

---

## Section 6 — Process

**Eyebrow:** `HOW WE BUILD`
**Headline:** *"Four steps. **Eight** to ten weeks."*

### 4 steps

**01 — Strategy & Wireframe (Weeks 1–2)**
*"We decide native vs. React Native based on your actual needs (not on what's cheaper for us). We map every screen and interaction. Output: clickable wireframe + technical decision document."*

**02 — Design (Weeks 2–3)**
*"High-fidelity designs matched to platform conventions — iOS Human Interface Guidelines or Material You, depending on platform priority. Mobile-native motion and microinteraction specs."*

**03 — Build & Beta (Weeks 4–8)**
*"We ship to TestFlight (iOS) and Play Console internal testing (Android) within the first 2 weeks of build. You're using the app while we're still building it. Daily commits, weekly demos."*

**04 — Launch + 30-Day Support (Weeks 9–10+)**
*"Apple App Store + Google Play submission. We handle review responses and any first-round feedback. Then 30 days of standby for crashes, bugs, and quick iterations."*

---

## Section 7 — Why Aurexis vs. the Alternatives

**Eyebrow:** `THE COMPARISON`
**Headline:** *"Why custom — **not** no-code or off-shore."*

### Comparison table

| | No-code (Glide, Adalo, FlutterFlow) | Cheap off-shore agency | **Aurexis App** |
|---|---|---|---|
| App Store quality | ❌ Often rejected | ⚠️ Hit or miss | ✅ Built for review pass |
| Integrates with your stack | ❌ Limited | ⚠️ Inconsistent | ✅ Native |
| Performance on real devices | ❌ Slow on Android | ⚠️ Variable | ✅ 60fps default |
| Extensibility later | ❌ Locked to platform | ⚠️ Spaghetti code | ✅ Clean codebase |
| Communication during build | ✅ Self-serve | ❌ Time zones, language | ✅ Direct WhatsApp to founder |
| Code ownership | ⚠️ Platform-dependent | ⚠️ Often no clean handover | ✅ Clean repo, yours |
| Native-grade UX | ❌ No | ⚠️ Sometimes | ✅ Always |
| Local context (PDPA, BM, RM) | ❌ Generic | ⚠️ Surface-level | ✅ Built in |
| **Verdict** | *Fast and cheap, hits ceiling* | *Hidden cost in rework* | *Done right, once* |

**Closing line:**
> *"A no-code app is fine for a prototype. A custom-built app is what you ship when the business actually depends on it."*

---

## Section 8 — FAQ

**Eyebrow:** `QUESTIONS`
**Headline:** *"Things people **ask** us."*

### 5 questions

**Q1 — What does this cost?**
*"Typical app builds fall between RM 30,000 and RM 120,000 depending on platform (iOS, Android, or both), feature scope, and backend integrations. Optional retainer of RM 2,000-6,000/month for OS updates and feature iteration. Every project is scoped individually — discovery calls are free."*

**Q2 — React Native or native?**
*"Depends on the use case. React Native for most internal/dual-platform apps with mostly forms and lists. Native (Swift/Kotlin) for performance-critical apps, complex animations, or apps that need deep platform features (CallKit, HealthKit, ARKit, etc.). We'll recommend based on what's right for you, not what's cheap for us."*

**Q3 — Will you submit to the App Store and Play Store?**
*"Yes. We handle Apple App Store and Google Play submission, review responses, and first-round feedback resolution. App Store accounts are yours (not ours) — you own the listing forever."*

**Q4 — Can you take over an existing app?**
*"Sometimes. We do a codebase audit first. If the foundation is decent, we continue. If it's a tangle of half-broken plugins and undocumented decisions, rebuilding is usually faster than fixing. We'll tell you honestly which one applies."*

**Q5 — How long until the app is live in the store?**
*"Build takes 6-10 weeks. Apple review is usually 24-72 hours. Google Play review is 1-7 days. Total: ~2.5-3 months from kickoff to live in the stores. Internal beta testing (TestFlight, Play Console) is available from week 3 of the build."*

---

## Section 9 — CTA + Related

**Headline:** *"Want an app that **actually** gets used?"*
**Subhead:** *"See live demos, or message us about a custom build."*

**Primary CTA:** `[ See App Demos → ]` (links to /demos)
**Secondary CTA:** `[ WhatsApp us about an app build → ]`

### Related

> *"Components: [The Ecosystem →](/services/ecosystem) · [AI Workflows →](/services/ai) · [Web Platforms →](/services/web)"*

---

## Section 10 — Footer
Shared component.

---

# Mobile-Specific Rules (all 3 pages)

- [ ] Hero subhead reflows to 4 lines max on 375px width
- [ ] Pain points / What we build / Use cases stack vertically (1-col mobile, 3-col desktop)
- [ ] FAQ becomes accordion (collapsed by default, tap to expand)
- [ ] Comparison tables convert to **stacked card view** on mobile (each row becomes a card with the alternatives as labels) — never horizontal scroll
- [ ] CTAs stay above the fold on mobile (sticky if needed)
- [ ] All touch targets ≥44×44px
- [ ] Floating WhatsApp button (global) repositioned safely above iOS bottom safe area

---

# SEO Meta (per page)

| Page | Title (≤60 chars) | Description (≤155 chars) | Target keyword |
|---|---|---|---|
| `/services/ai` | AI Agents & Automation Malaysia — Aurexis Solution | Custom AI receptionists, internal copilots, automation agents. Built on Claude. Trained on your business. RM 15-60k. | `AI agents Malaysia` · `AI receptionist Malaysia` |
| `/services/web` | Custom Web Development Malaysia — Aurexis | Performance-first websites, e-commerce, and customer portals for Malaysian businesses. Lighthouse 90+ default. RM 15-50k. | `custom web development Malaysia` |
| `/services/app` | Custom Mobile App Development Malaysia — Aurexis | iOS and Android apps for Malaysian businesses. React Native or native — we pick what's right. RM 30-120k. | `mobile app development Malaysia` |

---

# Build Status & Effort

| Page | Sections | Effort | Copy ready? |
|---|---|---|---|
| `/services/ai` | 9 sections | 2.5 hrs build | ✅ This doc |
| `/services/web` | 9 sections | 2.5 hrs build | ✅ This doc |
| `/services/app` | 9 sections | 2.5 hrs build | ✅ This doc |

**Total dev work: ~7.5 hours of focused build for all 3 sub-pages.** No founder blockers — every section's copy is locked here.

---

# Voice Reminders for the Builder

When in doubt during build, these are the rules:

1. **Lead with outcome.** Every section opens with what changes for the buyer, not with what we use technically.
2. **One italic cyan word per major headline.** Display serif italic, color `--cyan`. Never zero, never three.
3. **No banned phrases.** Grep before shipping: cutting-edge · innovative solutions · synergy · game-changing · revolutionary · best-in-class · leverage (verb) · in today's fast-paced world.
4. **Pair every claim with a number.** "Saves time" is weak. "Saves 4-6 hrs/week" is right.
5. **Malaysian context wins.** RM not USD. PDPA not GDPR. WhatsApp not "messenger". Local, specific, real.
6. **Comparison tables on mobile become stacked cards** — never horizontal scroll. WCAG accessibility.

---

**Document version:** 1.0
**Date:** 2026-05-03
**Status:** Production-ready
**Companion docs:**
- [REDESIGN_BRIEF.md](REDESIGN_BRIEF.md) — full site spec
- [COPY_PAGES.md](COPY_PAGES.md) — Home, About, Services index, Demos, Portfolio, Blog, Contact, /clinics
- [BUILD_PROMPT.md](BUILD_PROMPT.md) — code handoff prompt
- [DESIGN_PROMPT.md](DESIGN_PROMPT.md) — design phase prompt
- [HOMEPAGE_DESIGN_PROMPT.md](HOMEPAGE_DESIGN_PROMPT.md) — homepage motion + 3D detail
