// src/data/core-config.ts
// Static content for /solutions/core. Prices and copy are verbatim from
// the Core pricing sheet — Malaysia only, do not add Singapore figures.
import type {
  CoreWorkStep,
  CoreSetupTier,
  CoreCareTier,
  CoreChoiceRow,
  CoreAddOnItem,
  CoreTier,
  CoreSaasSpend,
  CoreBottleneck,
  CoreDataMigration,
  CoreTimeline,
  CoreBudget,
  CoreMeetingPreference,
} from '@/types/core';

// Core's brand periwinkle (matches its accent in solutions-services.ts), plus a
// deep indigo for secondary glows so the page reads distinct from the others.
export const CORE_ACCENT = '#8FA8F0';
export const CORE_ACCENT_RGB = '143,168,240';
export const CORE_DEEP_RGB = '46,62,150';

export const CORE_WHATSAPP_URL =
  "https://wa.me/60164071129?text=Hi%20Aurexis%2C%20I%27m%20interested%20in%20Core";

export const PROBLEM_INTRO =
  "Off-the-shelf software makes sense until it doesn't. When your business runs across five different subscriptions, none of which quite fit how you actually work, the cost of stitching them together starts to exceed the cost of building something that fits. Core is that system — built once, around your business, not the other way around.";

export const WHAT_CORE_FIXES = [
  "Running the business across spreadsheets, notebooks and a handful of subscriptions that don't talk to each other",
  'Paying for software features you don’t use, while missing the one feature you actually need',
  'Nobody able to answer a simple question — "what did we agree with this client?" — without digging through old chats',
  'Staff working around the software instead of through it',
];

export const PROBLEM_CALLOUT = {
  heading: 'Built because we needed it.',
  body: "Keluarga Ledger — the operations dashboard we built for a wiring contractor running on a notebook and a spreadsheet that didn't always agree — is the model Core is built on. One place, not five.",
};

export const BUILD_VS_BUY_INTRO =
  "Not every business needs Core. We'll tell you honestly if off-the-shelf software still fits — that's the conversation that builds trust for the bigger project later.";

export const BUILD_HEADING = 'Consider a Custom Build When...';
export const BUILD_REASONS = [
  'Your stacked software subscriptions exceed roughly RM5,000/month',
  'No combination of off-the-shelf tools fits how you actually work',
];

export const BUY_HEADING = 'Stick With Off-The-Shelf When...';
export const BUY_NOTE =
  'Below that line, buy. A RM90/month booking tool or a RM50/user CRM is genuinely the right answer for most small businesses. Core exists for the businesses that have outgrown what a subscription can do.';

export const HOW_WE_WORK: CoreWorkStep[] = [
  { number: '01', title: 'Discovery session', description: 'We map what you actually do today' },
  { number: '02', title: 'Written scope', description: 'Exactly what gets built, in plain language' },
  { number: '03', title: 'Fixed quote', description: 'No hourly surprises' },
  { number: '04', title: 'Staged payment', description: 'Tied to delivery milestones, not the calendar' },
  { number: '05', title: 'Handover', description: 'Documentation and training' },
];

export const SETUP_TIERS: CoreSetupTier[] = [
  {
    number: '01',
    name: 'Core Starter',
    price: 'From RM2,525',
    bestFor: 'One process, properly systemised',
    timeline: '4–8 weeks',
    carePlan: 'Required',
    includes: [
      'One core module — job tracking, inventory, or booking, built around how you actually work',
      'Admin dashboard',
      'Role-based access — owner and staff see what they need to',
      'Migration of existing data from spreadsheets or your current system',
      'Handover training',
    ],
  },
  {
    number: '02',
    name: 'Core Growth',
    price: 'From RM5,255',
    bestFor: 'Multiple connected modules — inventory, CRM, job tracking',
    timeline: '8–14 weeks',
    carePlan: 'Required',
    includes: [
      'Everything in Starter, plus:',
      'Two to three connected modules working from one dataset',
      'LHDN e-Invoice (MyInvois) integration',
      'Multi-user with permission tiers',
      'Reporting dashboard',
      'API integrations — accounting software, POS, or another system you already run',
    ],
  },
  {
    number: '03',
    name: 'Core Enterprise',
    price: 'Quoted',
    bestFor: 'Multi-branch, multi-user, deep integrations',
    timeline: 'From 4 months',
    carePlan: 'Required',
    includes: [
      'Everything in Growth, plus:',
      'Multi-branch or multi-location support',
      'Custom business logic and approval chains',
      'Full data migration and legacy system extraction',
      'Named response time during business hours',
      'Ongoing feature roadmap, not a one-off delivery',
    ],
  },
];

export const SETUP_TIERS_NOTE = 'Scoped and quoted after a discovery session.';

export const CARE_PLANS_INTRO =
  'Required on every Core project. A custom system has no vendor helpline, no community forum, no "just Google it." When something breaks, the person who built it is the only one who can fix it — that’s us.';

export const CARE_TIERS: CoreCareTier[] = [
  {
    name: 'Care Basic',
    price: 'From RM485/mo',
    features: [
      'Bug fixes',
      'Security patches and dependency updates',
      'Hosting and database management',
      'Email support',
      'Data-health uplift',
    ],
  },
  {
    name: 'Care Growth',
    price: 'From RM925/mo',
    features: [
      'Everything in Basic, plus:',
      'Minor feature requests',
      'Priority-response support',
      'Monthly check-in',
    ],
  },
  {
    name: 'Care Enterprise',
    price: 'Quoted',
    features: [
      'Everything in Growth, plus:',
      'Named response time (business hours)',
      'Quarterly review',
      'Integration monitoring',
    ],
  },
];

export const CARE_CHOICE_ROWS: CoreChoiceRow[] = [
  { project: 'Core Starter project', plan: 'Care Basic' },
  { project: 'Core Growth project', plan: 'Care Growth' },
  { project: 'Core Enterprise project', plan: 'Care Enterprise' },
];

export const CARE_FOOTNOTE =
  'Care plans are billed monthly and sized to your system, so a bigger build gets more support and faster response.';

export const CARE_AI_UPLIFT_NOTE =
  'Optional uplift on any Care tier — AI insights review: monthly AI-generated business-health commentary, human-reviewed. +RM500–1,500/mo.';

export const ADD_ONS_INTRO =
  'Quoted separately, on top of any Core package. These are the parts of a custom build that vary most, so we price them individually rather than guessing them into the headline number.';

export const ADD_ONS: CoreAddOnItem[] = [
  {
    name: 'Data migration',
    description: 'Moving your existing data — spreadsheets, old system, or both — in cleanly',
    price: 'From RM1,825',
  },
  {
    name: 'Data cleaning & deduplication',
    description: 'Untangling duplicate, inconsistent or stale records before they go into Core',
    price: 'Quote on request',
  },
  {
    name: 'Spreadsheet-to-app conversion',
    description: 'Turning a working spreadsheet into a proper app, without changing how your team already uses it',
    price: 'Quote on request',
  },
  {
    name: 'BI dashboard build',
    description: 'A reporting dashboard built around the numbers you actually check',
    price: 'Quote on request',
  },
  {
    name: 'PDPA technical documentation',
    description: 'Documentation covering how the system stores, processes and protects personal data',
    price: 'Quote on request',
  },
  {
    name: 'Extra module',
    description: 'An additional connected module beyond your package',
    price: 'From RM4,250',
  },
  {
    name: 'Accounting integration',
    description: 'Two-way sync with Xero, QuickBooks, AutoCount or SQL',
    price: 'From RM2,825',
  },
  {
    name: 'Marketplace integration',
    description: 'Shopee, Lazada or TikTok Shop, synced automatically',
    price: 'From RM1,825',
  },
  {
    name: 'Government portal integration',
    description: 'MyInvois',
    price: 'From RM4,250',
  },
  {
    name: 'Multi-branch premium',
    description: 'Extending a single-location build to multiple sites',
    price: '+45–100% of setup',
  },
  {
    name: 'Mobile companion app',
    description: 'iOS or Android app connected to your system',
    price: 'From RM13,025',
  },
  {
    name: 'Legacy system extraction',
    description: "Pulling data out of a system you're retiring",
    price: 'From RM1,825',
  },
  {
    name: 'Team training',
    description: 'Half-day session for your staff',
    price: 'From RM825',
  },
  {
    name: 'AI narrative layer on dashboards',
    description: 'Plain-language summaries and anomaly flags added to a BI dashboard build',
    price: 'From RM1,825',
  },
  {
    name: 'Predictive module',
    description: 'Sales, demand or churn forecasting attached to a Core build',
    price: 'From RM6,825',
  },
  {
    name: 'AI advisor reasoning layer',
    description: 'An LLM that reads your dashboards and database and returns written recommendations',
    price: 'From RM3,825',
  },
];

export const ADD_ON_BUNDLE_NOTE = {
  heading: 'Most common combination.',
  body: 'Core Growth + data migration + accounting integration — the system replaces the notebook and connects to the books you already keep.',
};

export const QUOTE_CAPACITY_NOTE =
  'Core projects run for months and get our full attention while active. We run a limited number of Growth and Enterprise builds at any one time — ask about current availability before committing to a timeline.';

export const QUOTE_TIER_OPTIONS: CoreTier[] = ['Starter', 'Growth', 'Enterprise', 'Not sure yet'];

export const QUOTE_SAAS_SPEND_OPTIONS: CoreSaasSpend[] = [
  'Under RM1,000',
  'RM1,000–5,000',
  'RM5,000–15,000',
  'Over RM15,000',
  'Not sure',
];

export const QUOTE_BOTTLENECK_OPTIONS: CoreBottleneck[] = [
  'Job tracking',
  'Inventory',
  'Client records',
  'Reporting',
  'Multi-branch coordination',
  'Other',
];

export const QUOTE_DATA_MIGRATION_OPTIONS: CoreDataMigration[] = [
  'Yes, spreadsheets',
  'Yes, another system',
  'Yes, both',
  'No, starting fresh',
];

export const QUOTE_TIMELINE_OPTIONS: CoreTimeline[] = ['Within 3 months', '3–6 months', 'Flexible'];

export const QUOTE_BUDGET_OPTIONS: CoreBudget[] = ['Under RM25k', 'RM25k–60k', 'RM60k+', 'Not sure'];

// Problem-section photo in public/images/core/. While null, the section shows a
// coded stack of monthly subscription bills instead.
export const CORE_PROBLEM_IMAGE: string | null = null;

export const QUOTE_MEETING_OPTIONS: CoreMeetingPreference[] = ['Online', 'Face to face'];

export const CLOSING_TERMS = [
  'Care plans are billed monthly. Minimum 6 months, then month-to-month.',
  'Setup: staged payments tied to delivery milestones, agreed in writing before work begins.',
  'Add-ons are quoted individually and confirmed before work starts.',
  'Prices shown are typical ranges, not fixed quotes. Prices exclude SST where applicable. All prices in Malaysian Ringgit.',
];
