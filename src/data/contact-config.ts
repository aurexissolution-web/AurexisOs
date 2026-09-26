// src/data/contact-config.ts
import type { Founder, Studio, ContactIntent, FAQ } from '@/types/portal';

export const STUDIO_TIMEZONE = 'Asia/Kuala_Lumpur';
export const STUDIO_HOURS = 'Mon–Fri · 10–18 MYT';
export const REPLY_WINDOW_LABEL = '~24h';
export const STRATEGY_SESSION_LEN_MIN = 45;

const WA_DIGITS = process.env.NEXT_PUBLIC_AUREXIS_WHATSAPP || '60164071129';

export const CHANNELS = {
  email: 'admin@aurexissolution.com',
  phone: '+60164071129',
  phoneDigits: WA_DIGITS,
  whatsappUrl: `https://wa.me/${WA_DIGITS}`,
  bookingUrl: '/contact#brief',
} as const;

export const FOUNDERS: ReadonlyArray<Founder> = [
  {
    initials: 'SG',
    name: 'Sanjay Gunabalan',
    role: 'Founder & CEO · Engineering',
    blurb: 'Full-stack engineer. Leads architecture, AI integrations, and post-launch ops. Takes new-project intros.',
    brings: 'stack audits, scoping, "what to build vs. delete" calls.',
    accent: 'cyan',
    available: true,
    imageSrc: '/images/cto.jpg',
  },
  {
    initials: 'NR',
    name: 'Nemila Raj Selvaraj',
    role: 'Co-founder · COO · Operations',
    blurb: 'Operations and client success. Owns delivery cadence and the part that turns "we shipped it" into "the client stayed."',
    brings: 'delivery cadence, account health, ops + client success.',
    accent: 'violet',
    available: true,
    imageSrc: '/images/coo.jpg',
  },
];

export const STUDIOS: ReadonlyArray<Studio> = [
  {
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    role: 'Headquarters',
    address: 'Kuala Lumpur, MY',
    addressNote: 'Exact location on appointment',
    accent: 'cyan',
    skyline: 'kl',
    imageSrc: '/images/kl-studio.avif',
  },
  {
    city: 'Sungai Petani',
    country: 'Kedah',
    role: 'Build floor',
    address: 'Sungai Petani, Kedah',
    addressNote: 'Exact location on appointment',
    accent: 'violet',
    skyline: 'sp',
    imageSrc: '/images/sp-studio.jpg',
  },
];

export const CONTACT_INTENTS: ReadonlyArray<{ id: ContactIntent; label: string }> = [
  { id: 'new-project', label: 'New project' },
  { id: 'ai-agent', label: 'AI & agent work' },
  { id: 'existing-client', label: 'Existing client' },
  { id: 'press-partnerships', label: 'Press & partnerships' },
  { id: 'careers', label: 'Careers' },
];

export const COMPANY_STAGES: ReadonlyArray<string> = [
  'Nothing yet — just an idea',
  'A website that needs work',
  'An existing system to improve',
  'Not sure yet',
];

export const FAQ_ITEMS: ReadonlyArray<FAQ> = [
  {
    q: 'Is the 45-minute call really free?',
    a: 'Yes. No card, no "trial" pricing, no obligation. We treat the call as our cost of qualifying the engagement — you walk out with a written summary either way.',
  },
  {
    q: "What if I'm just exploring?",
    a: "Then exploring is what the session is for. About a third of the calls we run end with us telling someone they don't need to hire anyone yet.",
  },
  {
    q: 'Do you sign mutual NDAs?',
    a: 'Yes — from the first message if you ask. We use our standard mutual NDA; happy to redline yours if you have one.',
  },
  {
    q: 'How fast do you actually reply?',
    a: "Within a working day, every time. WhatsApp on +60 16-407 1129 if it's urgent.",
  },
  {
    q: "Who's on the other end?",
    a: "One of the three of us — the same person who'd be on the project. We don't do SDRs.",
  },
];

export const HERO_COPY = {
  eyebrow: 'Contact · Studio open today',
  titleLines: ['Two founders.', 'Two studios.'],
  titleClose: { plain: 'One', italic: 'call', stroke: 'away' },
  lede: 'A real engineer reads every message and replies within a working day. Briefs, RFPs, "is this even possible" questions — bring all of it. We work with founders building products that need to actually ship.',
};
