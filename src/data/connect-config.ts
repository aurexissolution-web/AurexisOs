// src/data/connect-config.ts
// Static content for /solutions/connect. Prices and copy are verbatim from
// the Connect pricing sheet — Malaysia only, do not add Singapore figures.
import type {
  ConnectSetupTier,
  ConnectManagementTier,
  ConnectChoiceRow,
  ConnectBillRow,
  ConnectRateRow,
  ConnectMonthLineItem,
  ConnectAddOnItem,
  ConnectTier,
  ConnectHasMetaAccount,
  ConnectEnquiryVolume,
  ConnectTimeline,
  ConnectBudget,
  ConnectMeetingPreference,
} from '@/types/connect';

// Connect's brand lavender (matches its accent in solutions-services.ts), plus a
// deep violet for secondary glows so the page reads distinct from the others.
export const CONNECT_ACCENT = '#B08FF0';
export const CONNECT_ACCENT_RGB = '176,143,240';
export const CONNECT_DEEP_RGB = '84,44,160';

export const CONNECT_WHATSAPP_URL =
  "https://wa.me/60164071129?text=Hi%20Aurexis%2C%20I%27m%20interested%20in%20Connect";

export const BILLING_CHANGE_NOTE = {
  body: 'Meta is changing WhatsApp billing on 1 October — service replies and utility messages inside the 24-hour window become billable. A payment method must be on file with Meta by 30 September.',
  linkLabel: 'Full detail below.',
  linkHref: '#billing-change',
};

export const PROBLEM_INTRO =
  "Customers already message businesses on WhatsApp — the question is whether anyone answers fast enough, and whether the enquiry survives being buried in a personal chat list. When it doesn't, the enquiry goes to whoever replies first. That's usually not you.";

export const WHAT_CONNECT_FIXES = [
  "Enquiries arriving in someone's personal WhatsApp, mixed in with everything else",
  'No way to tell a serious buyer from a casual question',
  "No way to flag what's urgent, so urgent waits with the rest",
  "After-hours messages read the next morning — by which time they've called someone else",
  'No record of who asked what, or what was promised',
];

export const SETUP_TIERS: ConnectSetupTier[] = [
  {
    number: '01',
    name: 'Connect Starter',
    price: 'From RM2,250',
    bestFor: 'Getting off a personal number, properly',
    timeline: '3–7 days',
    managementPlan: 'Recommended',
    includes: [
      'WhatsApp Business API account setup and Meta verification',
      'One business number, fully verified',
      'Greeting and away messages',
      'Three message templates, submitted and approved',
      'One lead-capture flow',
      'Click-to-chat links and QR codes for your site, shopfront and printed material',
      'Shared team inbox so more than one person can reply',
      'Handover training for your team',
    ],
  },
  {
    number: '02',
    name: 'Connect Growth',
    price: 'From RM4,250',
    bestFor: 'Capturing and qualifying leads automatically',
    timeline: '2–3 weeks',
    managementPlan: 'Recommended',
    includes: [
      'Everything in Starter, plus:',
      'Chatbot flow answering your most common questions',
      "Lead qualification — the bot asks what you'd ask, and scores the answer",
      'Automatic routing to the right person or department',
      'Eight message templates, submitted and approved',
      'CRM or Google Sheets integration — every lead logged automatically',
      'Opt-in consent capture, recorded and compliant',
      'Human handover rules, so the bot knows when to step aside',
      'Follow-up sequence for leads that go quiet',
    ],
  },
  {
    number: '03',
    name: 'Connect Pro',
    price: 'From RM6,250',
    bestFor: 'Full automation with compliant broadcasting',
    timeline: '3–5 weeks',
    managementPlan: 'Required',
    includes: [
      'Everything in Growth, plus:',
      'AI assistant trained on your own documents, prices and FAQs',
      'Multiple conversation flows for different services or audiences',
      'Appointment booking inside the chat',
      'Payment link generation',
      'Broadcast system with consent management and opt-out handling',
      'Second language — Bahasa Malaysia, Chinese or Tamil',
      'Analytics dashboard — enquiries, response times, conversion',
      'Abandoned-enquiry recovery',
    ],
  },
  {
    number: '04',
    name: 'Connect Custom',
    price: 'Custom quote',
    bestFor: 'Multi-branch, multi-channel, deep integrations',
    timeline: 'From 4 weeks',
    managementPlan: 'Required',
    includes: [
      'Multiple numbers, branches or brands',
      'Multi-channel — WhatsApp, Instagram, Messenger, Telegram in one inbox',
      'Integration with your existing system, POS, booking platform or ERP',
      'Custom AI agent with role-based knowledge',
      'Advanced routing across teams and locations',
      'Custom reporting',
      'Named response time during business hours',
    ],
  },
];

export const SETUP_TIERS_NOTE = 'Scoped and quoted after a discovery session.';

export const MANAGEMENT_TIERS: ConnectManagementTier[] = [
  {
    name: 'Care',
    price: 'RM785/mo',
    features: [
      'Account monitoring and uptime',
      'Template maintenance and renewals',
      'Flow adjustments 1 hr/mo',
      'Monthly performance report',
    ],
  },
  {
    name: 'Manage',
    price: 'RM1,625/mo',
    features: [
      'Everything in Care, plus:',
      'Flow adjustments 4 hrs/mo',
      '2 broadcast campaigns built and sent/month',
      'New template creation and Meta approval',
      'Follow-up sequence optimisation',
      'Lead quality review',
    ],
  },
  {
    name: 'Scale',
    price: 'RM3,250/mo',
    features: [
      'Everything in Manage, plus:',
      'Flow adjustments 10 hrs/mo',
      '4 broadcast campaigns/month',
      'AI tuning and new intents',
      'A/B testing on campaigns',
      'Priority support',
      'Multiple numbers supported',
      'Quarterly strategy call',
    ],
  },
];

export const MANAGEMENT_FOOTNOTE = 'Additional hours beyond your plan: RM250/hour.';

export const MANAGEMENT_CHOICE_ROWS: ConnectChoiceRow[] = [
  { need: 'Just need the channel kept working and templates valid', plan: 'Care' },
  { need: 'Want to actively market to your list and improve conversion', plan: 'Manage' },
  { need: 'Run WhatsApp as a primary sales channel', plan: 'Scale' },
];

export const BILLING_INTRO =
  'Most businesses are surprised by their first WhatsApp invoice because three separate charges land from three different places. We tell you upfront so you can budget properly.';

export const THREE_BILLS: ConnectBillRow[] = [
  {
    name: 'Meta',
    chargedBy: 'Charged by Meta directly to your account',
    description: 'Per message sent, billed to the card on your Meta Business account.',
  },
  {
    name: 'Platform',
    chargedBy: 'Charged by your messaging platform provider',
    description:
      'Monthly software fee for the inbox, automation and dashboard. Typical range: RM150–1,200/month.',
  },
  {
    name: 'Aurexis',
    chargedBy: 'Charged by us',
    description:
      "Setup fee, then your monthly management plan. We don't mark up Meta fees or platform fees.",
  },
];

export const META_RATES: ConnectRateRow[] = [
  {
    name: 'Marketing',
    description: 'Promotions, offers, re-engagement. Opt-in required.',
    rate: 'RM0.3467/msg',
  },
  {
    name: 'Utility',
    description: 'Order updates, appointment reminders, delivery notices.',
    rate: 'RM0.0564/msg',
  },
  {
    name: 'Authentication',
    description: 'One-time passcodes, login verification.',
    rate: 'RM0.0564/msg',
  },
  {
    name: 'Service',
    description: 'Your replies within 24 hours of a customer message.',
    rate: 'See the change note below.',
  },
];

export const META_RATE_CALLOUT =
  'A marketing broadcast to 1,000 contacts costs roughly RM347 in Meta fees alone. Choosing the right category matters — sending an appointment reminder as a marketing template instead of a utility one costs about six times more.';

export const BILLING_CHANGE_ALERT = {
  heading: 'Changing 1 October 2026',
  points: [
    "Each business number gets 1,000 free service messages per month. Beyond that, they're charged at the utility rate (RM0.0564). The allowance resets monthly and doesn't roll over.",
    'Utility templates sent inside an open 24-hour window become billable from the first message — the 1,000 free allowance does not cover them.',
    'Incoming customer messages stay free, and the 72-hour window opened by Click-to-WhatsApp ads stays free.',
    'Action required: a payment method must be on file with Meta before 30 September 2026, or service message delivery stops.',
    "We build your flows to work with this — deflecting routine questions to automation, keeping threads efficient, and using the right message category every time.",
  ],
};

export const REAL_MONTH_ITEMS: ConnectMonthLineItem[] = [
  { label: 'Platform fee', amount: 'RM299' },
  { label: '2 broadcasts to 1,000 contacts', amount: 'RM694' },
  { label: '500 appointment reminders (utility)', amount: 'RM28' },
  { label: 'Aurexis Manage plan', amount: 'RM1,625' },
];

export const REAL_MONTH_TOTAL = { label: 'Total', amount: '≈ RM2,646' };

export const REAL_MONTH_FOOTNOTE =
  'Illustrative only. Your actual Meta cost depends entirely on how many messages you send and in which category. Malaysian SST of 8% applies to digital services and platform fees where relevant.';

export const BILLING_COMPLIANCE_NOTE =
  'Compliance is built in from Growth upward — recorded opt-in capture, an unsubscribe path that actually works, and a contact list that separates consented from non-consented numbers. PDPA 2024 penalties reach RM1,000,000; direct-marketing breaches up to RM200,000 or 2 years. Broadcasting without compliance is what gets accounts banned and businesses fined.';

export const ADD_ONS: ConnectAddOnItem[] = [
  {
    name: 'Extra language',
    description: 'BM, Chinese or Tamil, including rojak and mixed-language handling',
    price: 'From RM1,825',
  },
  {
    name: 'Extra number or branch',
    description: 'Additional WhatsApp number set up and connected',
    price: 'From RM825',
  },
  {
    name: 'CRM integration',
    description: 'Sync conversations and leads into your CRM',
    price: 'From RM925',
  },
  {
    name: 'Booking integration',
    description: 'Book appointments inside the chat',
    price: 'From RM925',
  },
  {
    name: 'Payment collection',
    description: 'Send payment links in conversation',
    price: 'From RM485',
  },
  {
    name: 'Click-to-WhatsApp ads setup',
    description: 'Facebook and Instagram ads that open straight into chat',
    price: 'From RM485',
  },
  {
    name: 'Product catalogue',
    description: 'Browsable catalogue inside WhatsApp',
    price: 'From RM485',
  },
  {
    name: 'Instagram and Messenger',
    description: 'Same inbox, more channels',
    price: 'From RM1,425',
  },
  {
    name: 'Data import',
    description: 'Bring your existing contact list in, cleaned and consent-tagged',
    price: 'From RM825',
  },
  {
    name: 'Team training',
    description: 'Half-day session for your staff',
    price: 'From RM825',
  },
];

export const ADD_ON_BUNDLE_NOTE =
  'Most popular bundle — Connect Growth + extra language + booking integration + Manage plan. The setup most clinics, workshops and service businesses end up with.';

export const QUOTE_TIER_OPTIONS: ConnectTier[] = ['Starter', 'Growth', 'Pro', 'Custom', 'Not sure yet'];

export const QUOTE_HAS_META_OPTIONS: ConnectHasMetaAccount[] = ['Yes', 'No', 'Not sure'];

export const QUOTE_ENQUIRY_VOLUME_OPTIONS: ConnectEnquiryVolume[] = [
  'Under 50',
  '50–200',
  '200–1,000',
  'Over 1,000',
  'Not sure',
];

export const QUOTE_TIMELINE_OPTIONS: ConnectTimeline[] = [
  'Before 1 October (Meta deadline)',
  'Within a month',
  'Within 3 months',
  'Flexible',
];

export const QUOTE_BUDGET_OPTIONS: ConnectBudget[] = ['Under RM3k', 'RM3k–8k', 'RM8k+', 'Not sure'];

// Problem-section photo in public/images/connect/. While null, the section shows
// a coded phone with unanswered enquiries instead.
export const CONNECT_PROBLEM_IMAGE: string | null = null;

export const QUOTE_MEETING_OPTIONS: ConnectMeetingPreference[] = ['Online', 'Face to face'];

export const CLOSING_TERMS = [
  'Management plans are billed monthly. Minimum 6 months, then month-to-month.',
  'Setup: 50% to start, 50% on go-live.',
  "Meta message fees and platform fees are billed separately, at cost. We don't mark them up.",
  "Meta reviews its message rates quarterly and may change them with one month's notice.",
  'All prices in Malaysian Ringgit.',
];
