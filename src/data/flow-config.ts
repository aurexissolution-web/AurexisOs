// src/data/flow-config.ts
// Static content for /solutions/flow. Prices and copy are verbatim from
// the Flow pricing sheet — Malaysia only, do not add Singapore figures.
import type {
  FlowSetupTier,
  FlowManagementTier,
  FlowChoiceRow,
  FlowAddOnItem,
  FlowTier,
  FlowAccountingPackage,
  FlowAdminHours,
  FlowLhdnStatus,
  FlowTimeline,
  FlowBudget,
  FlowMeetingPreference,
} from '@/types/flow';

// Flow's brand mint (matches its accent in solutions-services.ts), plus a deep
// green used for secondary glows so the page reads distinct from Presence.
export const FLOW_ACCENT = '#7FE8C4';
export const FLOW_ACCENT_RGB = '127,232,196';
export const FLOW_DEEP_RGB = '16,120,88';

export const FLOW_WHATSAPP_URL =
  "https://wa.me/60164071129?text=Hi%20Aurexis%2C%20I%27m%20interested%20in%20Flow";

export const COMPLIANCE_ALERT_NOTE = {
  body: 'LHDN e-Invoice is live and phased by turnover. Every Malaysian business is captured on a schedule — Flow Core includes',
  linkLabel: 'MyInvois onboarding',
  linkHref: '#compliance',
  after: 'by default.',
};

export const PROBLEM_INTRO =
  "Quotes typed out by hand, every time. Invoices that don't match the books. Payments chased from memory instead of by system — with time that should go into the actual work going into paperwork instead.";

export const WHAT_FLOW_FIXES = [
  'Quotes and invoices recreated from scratch for every client',
  "Payments going unnoticed for weeks because nobody's tracking who owes what",
  'Admin work happening at night, after a full day of real work',
  'No record of what was promised to which client, reconstructed from memory each time',
];

export const PROBLEM_CALLOUT = {
  heading: 'Built because we needed it.',
  body: 'Every enquiry into Aurexis used to be handled by hand. We built Flow to fix that for ourselves first, then started selling it.',
};

export const SETUP_TIERS: FlowSetupTier[] = [
  {
    number: '01',
    name: 'Flow Lite',
    price: 'From RM2,250',
    bestFor: 'One process, done properly',
    timeline: '1–2 weeks',
    managementPlan: 'Recommended',
    includes: [
      "One process automated — quote-to-invoice, or payment reminders, or another single flow you pick",
      'One to two app integrations',
      'Synced to one accounting package',
      'Handover documentation and a walkthrough',
    ],
  },
  {
    number: '02',
    name: 'Flow Core',
    price: 'From RM5,250',
    bestFor: 'Quotes, invoicing, reminders and compliance in one system',
    timeline: '2–4 weeks',
    managementPlan: 'Recommended',
    includes: [
      'Everything in Lite, plus:',
      'Three to four workflows — quotes, invoicing, payment reminders, automatic statements',
      'LHDN e-Invoice onboarding (MyInvois)',
      'Two to four app integrations',
      'Full testing before go-live',
      '30 days of post-launch support',
    ],
  },
  {
    number: '03',
    name: 'Flow Max',
    price: 'From RM12,085',
    bestFor: 'Full admin suite across multiple departments',
    timeline: '4–8 weeks',
    managementPlan: 'Required',
    includes: [
      'Everything in Core, plus:',
      'HR workflows — leave, claims, onboarding — or document generation and e-signature automation',
      'Multiple systems connected together',
      'Custom business logic and approval chains',
      'Full data mapping and migration',
    ],
  },
];

export const MANAGEMENT_TIERS: FlowManagementTier[] = [
  {
    name: 'Care',
    price: 'From RM525/mo',
    features: ['Monitoring and error fixes', 'Minor adjustments', 'Monthly report'],
  },
  {
    name: 'Manage',
    price: 'From RM1,125/mo',
    features: [
      'Everything in Care, plus:',
      '1 new or changed workflow per quarter',
      'Priority response',
    ],
  },
  {
    name: 'Partner',
    price: 'From RM2,025/mo',
    features: [
      'Everything in Manage, plus:',
      '1 new or changed workflow per month',
      'Quarterly optimisation review',
    ],
  },
];

export const MANAGEMENT_CHOICE_ROWS: FlowChoiceRow[] = [
  { need: "Just need what's built to keep working", plan: 'Care' },
  { need: 'Expect your processes to keep changing', plan: 'Manage' },
  { need: 'Want admin automation actively improved every month', plan: 'Partner' },
];

export const COMPLIANCE_INTRO =
  'Live now, phased by turnover. Every business is captured — this is the broadest compliance mandate in Malaysia, and the reason Flow Core includes e-Invoice onboarding by default.';

export const COMPLIANCE_ITEMS = [
  'Submitted via the MyInvois system, connected directly to your quote-to-invoice flow',
  'Validation, rejection handling and consolidated invoices built into the automation',
  'Works with Bukku, AutoCount, SQL and other MyInvois-ready accounting packages',
];

export const COMPLIANCE_FOOTNOTE =
  'Compliance dates and phases are set by LHDN, not by us. Verify your specific obligation date with your accountant before relying on this page.';

export const ADD_ONS: FlowAddOnItem[] = [
  {
    name: 'Extra integration',
    description: 'Connect one more app or system',
    price: 'From RM825',
  },
  {
    name: 'Accounting sync',
    description: 'Push data automatically into your accounting package',
    price: 'From RM1,825',
  },
  {
    name: 'E-signature integration',
    description: 'Documents signed and returned without printing',
    price: 'From RM835',
  },
  {
    name: 'Document generation',
    description: 'Auto-fill contracts, letters and quotes from templates',
    price: 'From RM1,425',
  },
  {
    name: 'HR workflow — leave & claims',
    description: 'Approval routing, automatically',
    price: 'From RM1,250',
  },
  {
    name: 'Staff onboarding workflow',
    description: 'New hire paperwork and setup, automated',
    price: 'From RM1,425',
  },
  {
    name: 'OCR / document extraction',
    description: 'Pull data automatically from scanned invoices or forms',
    price: 'From RM1,825',
  },
  {
    name: 'Notification workflows',
    description: 'Alerts to your team via Slack, Telegram or email',
    price: 'From RM485',
  },
  {
    name: 'Data import',
    description: 'Bring in existing client and invoice history, cleaned',
    price: 'From RM815',
  },
  {
    name: 'Team training',
    description: 'Half-day session for your staff',
    price: 'From RM815',
  },
];

export const ADD_ON_BUNDLE_NOTE =
  'Most popular bundle — Flow Core + accounting sync + notification workflows. The quote-to-cash cycle, connected to your books, with your team alerted the moment something needs attention.';

export const QUOTE_TIER_OPTIONS: FlowTier[] = ['Lite', 'Core', 'Max', 'Not sure yet'];

export const QUOTE_ACCOUNTING_PACKAGE_OPTIONS: FlowAccountingPackage[] = [
  'Bukku',
  'AutoCount',
  'SQL',
  'QuickBooks',
  'Xero',
  'Spreadsheet only',
  'None',
  'Other',
];

export const QUOTE_ADMIN_HOURS_OPTIONS: FlowAdminHours[] = [
  'Under 5',
  '5–15',
  '15–30',
  'Over 30',
  'Not sure',
];

export const QUOTE_LHDN_STATUS_OPTIONS: FlowLhdnStatus[] = [
  'Already compliant',
  'Working on it',
  "Haven't started",
  'Not sure if it applies to me',
];

export const QUOTE_TIMELINE_OPTIONS: FlowTimeline[] = [
  'ASAP',
  'Within a month',
  'Within 3 months',
  'Flexible',
];

export const QUOTE_BUDGET_OPTIONS: FlowBudget[] = ['Under RM5k', 'RM5k–12k', 'RM12k+', 'Not sure'];

// Problem-section photo in public/images/flow/. While null, the section shows a
// coded stack of overdue invoices instead.
export const FLOW_PROBLEM_IMAGE: string | null = null;

export const QUOTE_MEETING_OPTIONS: FlowMeetingPreference[] = ['Online', 'Face to face'];

export const CLOSING_TERMS = [
  'Management plans are billed monthly. Minimum 6 months, then month-to-month.',
  'Setup: 50% to start, 50% on go-live.',
  'Third-party tool costs (accounting software, automation platform subscriptions) are billed separately, at cost.',
  'All prices shown in Malaysian Ringgit.',
];
