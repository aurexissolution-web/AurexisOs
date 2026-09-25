// src/data/audit-config.ts
// Static content for /solutions/ai-readiness-audit. Prices and copy are
// verbatim from the internal analysis — Malaysia only.
import type {
  AuditTierCard,
  AuditGrant,
  AuditTier,
  AuditStage,
  AuditBiggestQuestion,
  AuditGrantInterest,
  AuditMeetingPreference,
} from '@/types/audit';

// The Audit's brand gold (matches its accent in solutions-services.ts), plus a
// deep amber for secondary glows so the page reads distinct from the others.
export const AUDIT_ACCENT = '#F0C88F';
export const AUDIT_ACCENT_RGB = '240,200,143';
export const AUDIT_DEEP_RGB = '150,92,30';

export const AUDIT_WHATSAPP_URL =
  "https://wa.me/60164071129?text=Hi%20Aurexis%2C%20I%27m%20interested%20in%20the%20AI%20Readiness%20Audit";

export const HERO_SUBHEAD =
  "The AI Readiness Audit is a short paid diagnostic — you get a written roadmap that maps where AI actually helps in your business, and where it doesn't. Grant-fundable. Credited against a Core build if you go ahead.";

export const WHY_INTRO =
  "Most business owners have heard \"you should be using AI\" for two years and still don't know what it means for their specific business. A full custom build is too big a first cheque. Free readiness scorecards don't leave you with anything you can act on. This is the honest middle.";

export const WHAT_YOU_GET = [
  'A ranked list of where AI actually helps in your business — and where it doesn’t',
  'A written roadmap you keep, not a scorecard that expires',
  'Grant screening — whether HRD Corp SBL-Khas or MSME Digital Grant MADANI could offset implementation cost',
  'A recommendation on whether you need Core, Flow, Connect, or nothing yet',
];

export const TIERS_INTRO = "One-off. Pick the tier that matches how deep you want to go.";

export const AUDIT_TIERS: AuditTierCard[] = [
  {
    number: '01',
    name: 'Audit Light',
    price: 'From RM1,525',
    bestFor: 'A ranked list to start conversations with',
    timeline: '1 week',
    delivery: 'async',
    includes: [
      'Questionnaire and setup review',
      'Remote analysis of your existing spreadsheets, software and workflows',
      'Ranked list of AI opportunities',
      'One-page written summary',
      'No calls required',
    ],
  },
  {
    number: '02',
    name: 'Audit Full',
    price: 'From RM3,250',
    bestFor: 'A written roadmap you can act on',
    timeline: '2 weeks',
    delivery: 'discovery call + workshop',
    includes: [
      'Everything in Light, plus:',
      'Discovery call',
      'On-site or remote workflow mapping — we sit with you and map what you actually do today',
      'Full written roadmap document, prioritised',
      'Grant screening for HRD Corp and MSME Digital Grant',
      '30-minute walkthrough of the roadmap',
    ],
  },
];

export const CREDIT_HEADING = 'IF YOU SIGN A CORE BUILD, WE CREDIT THE AUDIT FEE';

export const CREDIT_PARAGRAPHS = [
  'If you sign a Core build within 60 days of the audit delivery, we credit the full audit fee against the Core setup cost. Full tier credited against any Core build. Light tier credited against Core Starter or above.',
  'The point of the audit is to help you decide honestly — not to double-charge. If the answer is "you don’t need Core yet," we tell you that, and you keep the roadmap.',
];

export const GRANT_INTRO =
  'Both audit tiers may qualify for Malaysian grant support. We help you identify which applies before you commit.';

export const GRANTS: AuditGrant[] = [
  {
    name: 'HRD Corp SBL-Khas',
    description: 'Levy offset for AI advisory, audits and training. Up to RM10,500/day depending on scope.',
  },
  {
    name: 'MSME Digital Grant MADANI',
    description: '50% matching grant for digital adoption, up to RM5,000 per eligible MSME.',
  },
];

export const GRANT_FOOTNOTE =
  'Grant eligibility is set by HRD Corp and MDEC, not by us. Verify your eligibility before relying on this page.';

export const QUOTE_INTRO =
  "Tell us where you are. We'll WhatsApp you within a business day to confirm scope and start the audit.";

export const QUOTE_TIER_OPTIONS: AuditTier[] = ['Audit Light', 'Audit Full', 'Not sure yet'];

export const QUOTE_AI_STAGE_OPTIONS: AuditStage[] = [
  "Haven't tried anything",
  'Team uses ChatGPT informally',
  "We've bought one AI tool",
  "We've built something",
  'Not sure',
];

export const QUOTE_BIGGEST_QUESTION_OPTIONS: AuditBiggestQuestion[] = [
  'Where AI could save time',
  'Where AI could increase revenue',
  "Whether we're ready for a custom build",
  'Whether a grant applies to us',
  'Other',
];

export const QUOTE_GRANT_INTEREST_OPTIONS: AuditGrantInterest[] = ['Yes', 'No', 'Not sure'];

// Why-section photo in public/images/audit/. While null, the section shows a
// coded roadmap document instead.
export const AUDIT_PROBLEM_IMAGE: string | null = null;

export const QUOTE_MEETING_OPTIONS: AuditMeetingPreference[] = ['Online', 'Face to face'];

export const CLOSING_TERMS = [
  'Audit fee credited against Core build if signed within 60 days.',
  'Full tier credited against any Core build; Light tier credited against Core Starter or above.',
  'All prices in Malaysian Ringgit.',
];
