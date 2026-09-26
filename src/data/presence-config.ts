// src/data/presence-config.ts
// Static content for /solutions/presence. Prices and copy are verbatim from
// the Presence pricing sheet — do not round, estimate, or add rows here.
import type {
  PresenceWebsiteType,
  PresenceAddOnCategory,
  PresenceCarePlanGroup,
  QuoteWebsiteType,
  QuoteHasWebsite,
  QuoteTimeline,
  QuoteBudget,
  QuoteMeetingPreference,
} from '@/types/presence';

export const PRESENCE_ACCENT = '#5EE3DA';
export const PRESENCE_ACCENT_RGB = '94,227,218';

export const PRESENCE_WHATSAPP_URL =
  "https://wa.me/60164071129?text=Hi%20Aurexis%2C%20I%27m%20interested%20in%20Presence";

export const INCLUDED_EVERYWHERE =
  'Included in every website at no extra cost: mobile-responsive design · SSL certificate · contact form · favicon and brand assets · basic page structure for search engines · handover training.';

export const WEBSITE_TYPES: PresenceWebsiteType[] = [
  {
    number: '01',
    name: 'Landing Page',
    price: 'From RM1,525',
    bestFor: 'Campaigns, single offer, ads',
    timeline: '3–7 days',
    carePlan: 'Optional, recommended',
    includes: [
      '3-page site minimum',
      'Mobile-first design',
      'Enquiry form to email',
      'WhatsApp click-to-chat',
      'Basic on-page SEO',
      'Google Analytics tracking',
    ],
  },
  {
    number: '02',
    name: 'Business Site',
    price: 'From RM3,250',
    bestFor: 'Small businesses getting online properly',
    timeline: '2–3 weeks',
    carePlan: 'Recommended',
    includes: [
      'Up to 5 pages (Home, About, Services, Gallery, Contact)',
      'Mobile-responsive',
      'WhatsApp integration and enquiry forms',
      'Google Business Profile setup',
      'On-page SEO',
      'Google Analytics + Search Console',
      'Content management so you can edit text yourself',
    ],
  },
  {
    number: '03',
    name: 'Corporate Site',
    price: 'From RM5,025',
    bestFor: 'Established companies, multiple services',
    timeline: '3–4 weeks',
    carePlan: 'Recommended',
    includes: [
      '10–15 pages with full site structure',
      'Everything in Business Site',
      'Service/product detail pages',
      'Team and credentials pages',
      'News or blog section',
      'Advanced SEO (schema, sitemap, structured data)',
      'Speed and performance optimisation',
      'PDPA cookie consent + privacy policy',
    ],
  },
  {
    number: '04',
    name: 'E-commerce Store',
    price: 'From RM4,250',
    bestFor: 'Selling products online',
    timeline: '3–8 weeks',
    carePlan: 'Required (database)',
    includes: [
      'Product catalogue with categories and search',
      'Shopping cart and checkout',
      'Malaysian payment gateway (FPX, cards, e-wallet)',
      'Order management dashboard',
      'Stock tracking',
      'Customer accounts and order history',
      'Shipping configuration',
      'WhatsApp order notifications',
      'Sales reporting',
    ],
  },
  {
    number: '05',
    name: 'Booking Site',
    price: 'From RM3,250',
    bestFor: 'Clinics, workshops, salons, services',
    timeline: '3–6 weeks',
    carePlan: 'Required (database)',
    includes: [
      'Online booking with live availability',
      'Staff or resource scheduling',
      'Automatic WhatsApp and email confirmations',
      'Appointment reminders',
      'Customer records and visit history',
      'Admin dashboard',
      'Calendar sync',
      'Optional deposit collection at booking',
    ],
  },
  {
    number: '06',
    name: 'Client Portal / Membership',
    price: 'From RM5,250',
    bestFor: 'Law firms, training, logistics',
    timeline: '4–10 weeks',
    carePlan: 'Required (database)',
    includes: [
      'Secure client login',
      'Per-client dashboard showing their own data',
      'Document upload and download',
      'Status tracking (matter, shipment, job, course progress)',
      'Role-based permissions for your staff',
      'Notifications on updates',
      'Admin control panel',
    ],
  },
  {
    number: '07',
    name: 'Custom Web Application',
    price: 'Custom quote',
    bestFor: 'Systems built around how you work',
    timeline: 'From 6 weeks',
    carePlan: 'Required',
    includes: [
      'Custom database',
      'Multi-user roles',
      'Multi-branch support',
      'Job/order/case tracking',
      'Inventory',
      'Quotation and invoicing with LHDN e-Invoice submission',
      'Integrations',
      'Reporting dashboards',
      'Barcode/QR',
      'Automated workflows',
      'Mobile companion app where needed',
    ],
  },
];

export const CUSTOM_SCOPE_NOTE =
  'Every custom project is scoped after a discovery session — written scope, fixed quote, staged payment tied to milestones.';

export const ADD_ON_CATEGORIES: PresenceAddOnCategory[] = [
  {
    heading: 'Content & Brand',
    items: [
      { name: 'Copywriting', price: 'From RM325' },
      { name: 'Logo design', price: 'From RM425' },
      { name: 'Full brand identity', price: 'From RM1,250' },
      { name: 'Professional photography', price: 'From RM425' },
      { name: 'Extra language', price: 'From RM425' },
    ],
  },
  {
    heading: 'Getting Found',
    items: [
      { name: 'On-page SEO/AEO setup', price: 'From RM425' },
      { name: 'Google Business Profile', price: 'From RM515' },
      { name: 'Schema markup', price: 'From RM250' },
      { name: 'Technical SEO audit', price: 'From RM825' },
      { name: 'Speed optimisation', price: 'From RM425' },
    ],
  },
  {
    heading: 'Tracking & Conversion',
    items: [
      { name: 'Google Analytics + Search Console', price: 'From RM425' },
      { name: 'Meta Pixel + conversion tracking', price: 'From RM285' },
      { name: 'WhatsApp chat button', price: 'From RM55' },
      { name: 'Live chat widget', price: 'From RM325' },
      { name: 'Newsletter signup', price: 'From RM285' },
    ],
  },
  {
    heading: 'Functionality',
    items: [
      { name: 'Payment gateway', price: 'From RM425' },
      { name: 'Booking module', price: 'From RM925' },
      { name: 'Blog setup + training', price: 'From RM425' },
      { name: 'Site migration', price: 'From RM825' },
      { name: 'Business email setup', price: 'From RM285' },
    ],
  },
  {
    heading: 'Compliance',
    items: [
      { name: 'PDPA cookie consent banner', price: 'From RM285' },
      { name: 'Privacy policy + terms', price: 'From RM285' },
      { name: 'LHDN e-Invoice integration', price: 'From RM4,625' },
    ],
  },
];

// One-line explainers shown under each add-on. Marketing copy, not from the
// pricing sheet — keyed by the add-on name in ADD_ON_CATEGORIES.
export const ADD_ON_HINTS: Record<string, string> = {
  Copywriting: 'We write every page so it sounds like you.',
  'Logo design': 'A clean, professional mark for your business.',
  'Full brand identity': 'Logo, colours, fonts and guidelines — the full look.',
  'Professional photography': 'Real photos of your team, space and work.',
  'Extra language': 'Your site in Bahasa Malaysia, Chinese, Tamil or more.',
  'On-page SEO/AEO setup': 'Titles, headings, keywords and answer-ready content, set up for Google and AI search.',
  'Google Business Profile': 'Show up on Google Maps with your hours and reviews.',
  'Schema markup': 'Helps Google show richer results for your pages.',
  'Technical SEO audit': 'A full check of what is holding your rankings back.',
  'Speed optimisation': 'Faster pages, so visitors stay instead of leaving.',
  'Google Analytics + Search Console': 'See who visits, from where, and what they searched.',
  'Meta Pixel + conversion tracking': 'Measure what your Facebook and Instagram ads bring in.',
  'WhatsApp chat button': 'One tap from your site into a WhatsApp chat.',
  'Live chat widget': 'Answer visitors in real time, right on the page.',
  'Newsletter signup': 'Collect emails and keep customers coming back.',
  'Payment gateway': 'Take FPX, card and e-wallet payments online.',
  'Booking module': 'Let customers book a slot without calling.',
  'Blog setup + training': 'Publish news and articles yourself.',
  'Site migration': 'Move your existing site and content over to the new one.',
  'Business email setup': 'Email addresses on your own domain.',
  'PDPA cookie consent banner': "Cookie consent banner for Malaysia's PDPA.",
  'Privacy policy + terms': 'The legal pages every business site needs.',
  'LHDN e-Invoice integration': 'Issue and submit e-Invoices to LHDN from your system.',
};

export const ADD_ON_BUNDLE_NOTE =
  'Most popular bundle — Business Site + copywriting + Google Business Profile + PDPA compliance. Everything needed to be found, trusted and compliant from day one.';

export const CARE_PLAN_GROUPS: PresenceCarePlanGroup[] = [
  {
    label: 'Standard Websites',
    subtitle: 'For landing pages, business sites, corporate sites.',
    tiers: [
      {
        name: 'Essential',
        price: 'RM350/mo',
        features: [
          'Hosting/SSL/domain management',
          'Daily backups',
          'Security patches',
          'Uptime monitoring',
          'Bug fixes',
          '1 hr/mo content edits',
        ],
      },
      {
        name: 'Growth',
        price: 'RM650/mo',
        features: [
          'Everything in Essential',
          '3 hrs/mo edits',
          '2 blog posts/mo written and published',
          'SEO monitoring and keyword tracking',
          'Google Business Profile management',
          'Monthly performance report',
        ],
      },
      {
        name: 'Partner',
        price: 'RM1,425/mo',
        features: [
          'Everything in Growth',
          '8 hrs/mo edits',
          '4 blog posts/mo',
          'WhatsApp priority support',
          '1 new page or landing page/quarter',
          'Quarterly strategy call',
          'AI search visibility (AEO/GEO)',
        ],
      },
    ],
    footnote: 'Additional hours beyond your plan: RM200/hour.',
  },
  {
    label: 'Sites With a Database',
    subtitle: 'For e-commerce, booking, portals, custom.',
    tiers: [
      {
        name: 'Essential',
        price: 'RM525/mo',
        features: [
          'Hosting/SSL/uptime',
          'Database hosting + daily backups',
          'Security and dependency updates',
          'Bug fixes',
          '2 hrs/mo content and data edits',
        ],
      },
      {
        name: 'Growth',
        price: 'RM825/mo',
        features: [
          'Everything in Essential',
          '5 hrs/mo edits',
          '2 blog posts/mo',
          'SEO + Google Business Profile',
          'Monthly usage and performance report',
        ],
      },
      {
        name: 'Partner',
        price: 'RM1,625/mo',
        features: [
          'Everything in Growth',
          '10 hrs/mo edits',
          '4 blog posts/mo',
          '1 small new feature/quarter',
          'WhatsApp priority support',
          'Quarterly strategy call',
        ],
      },
      {
        name: 'Custom',
        price: 'Quoted',
        features: [
          'Everything in Partner',
          'Agreed hours',
          'Ongoing feature roadmap',
          'Monthly strategy call',
          'Multi-branch/multi-user support',
          'Third-party integration maintenance',
          'Named response time (business hours)',
        ],
      },
    ],
    footnote: 'Additional hours beyond your plan: RM250/hour.',
  },
];

export const CARE_PLAN_DB_NOTE = {
  heading: "Why a care plan isn't optional on database projects.",
  body: "A static website that breaks is embarrassing. A booking system or client portal that breaks means lost appointments, lost orders, lost records. Every database project includes a care plan from launch — it's part of the quote, not an upsell.",
};

export interface PresenceAudience {
  type: string;
  line: string;
}

export const WHO_FOR: PresenceAudience[] = [
  { type: 'Clinic or practice', line: 'Booking-friendly, credible, easy to find on Google.' },
  { type: 'Law firm or professional service', line: 'Credential-forward, trustworthy on first look.' },
  { type: 'Workshop or trade business', line: 'Simple, mobile-first, shows what you do and where you are.' },
  { type: 'Training or consultancy', line: 'Clear service pages, easy contact, room to grow into a client portal later.' },
];

export const QUOTE_WEBSITE_TYPE_OPTIONS: QuoteWebsiteType[] = [
  'Landing Page',
  'Business Site',
  'Corporate Site',
  'E-commerce',
  'Booking',
  'Client Portal',
  'Custom',
  'Not sure yet',
];

export const QUOTE_HAS_WEBSITE_OPTIONS: QuoteHasWebsite[] = ['Yes', 'No', "It's outdated"];

export const QUOTE_TIMELINE_OPTIONS: QuoteTimeline[] = [
  'ASAP',
  'Within a month',
  'Within 3 months',
  'Flexible',
];

export const QUOTE_BUDGET_OPTIONS: QuoteBudget[] = [
  'Under RM3k',
  'RM3k–8k',
  'RM8k–15k',
  'RM15k+',
  'Not sure',
];

export const QUOTE_MEETING_OPTIONS: QuoteMeetingPreference[] = ['Online', 'Face to face'];

export const CLOSING_TERMS = [
  'Care plans are billed monthly. Minimum 6 months, then month-to-month.',
  'Website projects: 50% to start, 50% on delivery.',
  'Custom applications: staged payments tied to delivery milestones.',
];

// Hero showcase screenshot lives in public/images/presence/. While imageSrc is
// null the hero renders a labelled placeholder.
export const PRESENCE_HERO_SHOWCASE: {
  client: string;
  url: string;
  imageSrc: string | null;
} = {
  client: 'Ayurveda Wellness Centre',
  url: 'www.ayurvedicwellnesscenter.com.my',
  imageSrc: '/images/presence/showcase.webp',
};
