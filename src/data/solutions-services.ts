// src/data/solutions-services.ts
// Single source of truth for the five /solutions rows — the /solutions page,
// its hero-chat picker, SolutionsServiceRows, and the Ask Aurexis AI system
// prompt (src/app/api/ai/route.ts) all read from this array, so pricing and
// positioning can never drift out of sync between the page and the chat.

export interface SolutionsService {
  name: string;
  category: string;
  /** Per-service accent — used only for the category dot, numeral outline, and arrow border. */
  accent: string;
  problemLine: string;
  body: string;
  pricePrefix?: string;
  priceAmount: string;
  priceSuffix?: string;
  /** When set, the row's arrow links here (in-app) instead of the WhatsApp deep link. */
  detailHref?: string;
  /** Row's own checklist — falls back to the shared placeholder bullets when omitted. */
  bullets?: string[];
  /** Full WhatsApp deep link override — falls back to the auto-generated one when omitted. */
  ctaHref?: string;
}

export const SERVICES: SolutionsService[] = [
  {
    name: "Presence",
    category: "YOUR WEBSITE",
    accent: "#5EE3DA",
    problemLine: "Search for the business. Get nothing — or a site that looks abandoned.",
    body: "No way for a customer to check they're real. Comparing two businesses, they pick the one they can find.",
    pricePrefix: "From",
    priceAmount: "RM1,850",
    detailHref: "/solutions/presence",
    bullets: [
      "3-page site minimum, mobile-first design",
      "Enquiry form connected to your email + WhatsApp click-to-chat button",
      "Domain, hosting, SSL and basic on-page SEO set up",
    ],
  },
  {
    name: "Flow",
    category: "ADMIN ON AUTOPILOT",
    accent: "#7FE8C4",
    problemLine: "Quotes, invoices, reminders — typed by hand, every time.",
    body: "Time that should have gone into the work went into retyping the same document.",
    pricePrefix: "From",
    priceAmount: "RM2,800",
    detailHref: "/solutions/flow",
    bullets: [
      "One process automated — quotes, invoicing, or payment reminders",
      "LHDN e-Invoice (MyInvois) onboarding built in from Flow Core tier up",
      "Synced to your accounting package, fully tested before go-live",
    ],
  },
  {
    name: "Core",
    category: "YOUR OPERATIONS SYSTEM",
    accent: "#8FA8F0",
    problemLine: "A wiring business run on a notebook and a spreadsheet that didn't always agree.",
    body: "No way to tell if a job made money until long after it was done — and paperwork every night after a full day on site.",
    pricePrefix: "From",
    priceAmount: "RM15,000",
    detailHref: "/solutions/core",
    bullets: [
      "One core module — job tracking, inventory or booking — built around how you actually work",
      "Admin dashboard with role-based access for owner and staff",
      "Migration of your existing spreadsheets, plus handover training",
    ],
  },
  {
    name: "Connect",
    category: "YOUR LEADS",
    accent: "#B08FF0",
    problemLine: "Every enquiry landed in one WhatsApp, mixed in with everything else.",
    body: "No way to tell a serious lead from a casual question. Things sat until someone happened to open the chat.",
    pricePrefix: "From",
    priceAmount: "RM2,500",
    detailHref: "/solutions/connect",
    bullets: [
      "WhatsApp Business API set up and Meta-verified on your own number",
      "Lead-capture flow with click-to-chat links and QR codes",
      "Shared team inbox — every enquiry logged, nothing lost in a personal chat",
    ],
  },
  {
    name: "AI Readiness Audit",
    category: "START HERE",
    accent: "#F0C88F",
    problemLine:
      'Everyone says "you should be using AI." Nobody says which part, or whether it\'s worth it for you.',
    body: "A short paid diagnostic that maps where AI actually helps in your business — and where it doesn't. Written roadmap, grant-fundable, credited against a Core build if you decide to go ahead.",
    pricePrefix: "From",
    priceAmount: "RM1,500",
    detailHref: "/solutions/ai-readiness-audit",
    bullets: [
      "Ranked list of where AI actually helps in your business",
      "Written roadmap you keep, not a scorecard",
      "Grant-fundable via HRD Corp and MSME Digital Grant",
      "Fee credited against a Core build if you sign within 60 days",
    ],
    ctaHref:
      "https://wa.me/60164071129?text=Hi%20Aurexis%2C%20I%27m%20interested%20in%20the%20AI%20Readiness%20Audit",
  },
];
