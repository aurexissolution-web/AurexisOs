// src/lib/admin/lead-sources.ts
// One description of every inbound form, so the Command Center can treat seven
// different tables as a single inbox. Safe to import on the client — no data.

export type LeadSourceKey =
  'presence' | 'flow' | 'core' | 'connect' | 'audit' | 'contact' | 'calculator';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'archived';

export const LEAD_STATUSES: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: '#5EE3DA' },
  { key: 'contacted', label: 'Contacted', color: '#8FA8F0' },
  { key: 'qualified', label: 'Qualified', color: '#B08FF0' },
  { key: 'won', label: 'Won', color: '#7FE8C4' },
  { key: 'lost', label: 'Lost', color: '#F08F8F' },
  { key: 'archived', label: 'Archived', color: '#6B7280' },
];

export interface LeadSource {
  key: LeadSourceKey;
  label: string;
  table: string;
  accent: string;
  /** Column holding the "what do they want" line shown in the list. */
  headlineColumn: string;
  /** Detail fields shown in the drawer, in order: [column, label]. */
  fields: [string, string][];
  hasPhone: boolean;
  hasName: boolean;
}

const QUOTE_TAIL: [string, string][] = [
  ['meeting_preference', 'Meeting'],
  ['meeting_address', 'Meeting address'],
  ['notes', 'Anything else'],
];

export const LEAD_SOURCES: LeadSource[] = [
  {
    key: 'presence',
    label: 'Presence',
    table: 'presence_quote_requests',
    accent: '#5EE3DA',
    headlineColumn: 'business_description',
    fields: [
      ['website_type', 'Website type'],
      ['business_description', 'Business'],
      ['has_website', 'Has a website today'],
      ['timeline', 'Timeline'],
      ['budget', 'Budget'],
      ...QUOTE_TAIL,
    ],
    hasPhone: true,
    hasName: true,
  },
  {
    key: 'flow',
    label: 'Flow',
    table: 'flow_quote_requests',
    accent: '#7FE8C4',
    headlineColumn: 'business_description',
    fields: [
      ['tier', 'Tier'],
      ['business_description', 'Business'],
      ['accounting_package', 'Accounting package'],
      ['admin_hours_per_week', 'Admin hours / week'],
      ['lhdn_status', 'LHDN e-Invoice status'],
      ['timeline', 'Timeline'],
      ['budget', 'Budget'],
      ...QUOTE_TAIL,
    ],
    hasPhone: true,
    hasName: true,
  },
  {
    key: 'core',
    label: 'Core',
    table: 'core_quote_requests',
    accent: '#8FA8F0',
    headlineColumn: 'business_description',
    fields: [
      ['tier', 'Tier'],
      ['business_description', 'Business'],
      ['saas_spend', 'Monthly software spend'],
      ['bottleneck', 'Biggest bottleneck'],
      ['data_migration', 'Data to migrate'],
      ['timeline', 'Timeline'],
      ['budget', 'Budget'],
      ...QUOTE_TAIL,
    ],
    hasPhone: true,
    hasName: true,
  },
  {
    key: 'connect',
    label: 'Connect',
    table: 'connect_quote_requests',
    accent: '#B08FF0',
    headlineColumn: 'business_description',
    fields: [
      ['tier', 'Tier'],
      ['business_description', 'Business'],
      ['has_meta_account', 'Meta Business account'],
      ['enquiries_per_month', 'Enquiries / month'],
      ['timeline', 'Timeline'],
      ['budget', 'Budget'],
      ...QUOTE_TAIL,
    ],
    hasPhone: true,
    hasName: true,
  },
  {
    key: 'audit',
    label: 'AI Audit',
    table: 'ai_readiness_audit_quote_requests',
    accent: '#F0C88F',
    headlineColumn: 'business_description',
    fields: [
      ['tier', 'Tier'],
      ['business_description', 'Business'],
      ['ai_stage', 'Where they are with AI'],
      ['biggest_question', 'Biggest question'],
      ['grant_interest', 'Grant screening'],
      ...QUOTE_TAIL,
    ],
    hasPhone: true,
    hasName: true,
  },
  {
    key: 'contact',
    label: 'Contact',
    table: 'contact_messages',
    accent: '#E8E8F0',
    headlineColumn: 'message',
    fields: [
      ['intent', 'Topic'],
      ['company', 'Company'],
      ['stage', 'Stage'],
      ['message', 'Message'],
    ],
    hasPhone: true,
    hasName: true,
  },
  {
    key: 'calculator',
    label: 'Calculator',
    table: 'calculator_leads',
    accent: '#F0A88F',
    headlineColumn: 'annual_waste',
    fields: [
      ['staff', 'Staff'],
      ['wage', 'Monthly wage (RM)'],
      ['hours', 'Admin hours / week'],
      ['annual_waste', 'Annual cost shown (RM)'],
    ],
    hasPhone: false,
    hasName: false,
  },
];

export const SOURCE_BY_KEY = Object.fromEntries(LEAD_SOURCES.map((s) => [s.key, s])) as Record<
  LeadSourceKey,
  LeadSource
>;

export function isLeadSourceKey(v: unknown): v is LeadSourceKey {
  return typeof v === 'string' && v in SOURCE_BY_KEY;
}

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === 'string' && LEAD_STATUSES.some((s) => s.key === v);
}

/** Normalised row the Command Center renders, whatever table it came from. */
export interface Lead {
  source: LeadSourceKey;
  id: string;
  name: string;
  email: string;
  phone: string | null;
  headline: string;
  status: LeadStatus;
  adminNotes: string;
  createdAt: string;
  contactedAt: string | null;
  clientId: string | null;
  raw: Record<string, unknown>;
}

/** wa.me link from whatever format the visitor typed. Malaysian 0-prefix → 60. */
export function whatsappLink(phone: string | null, text?: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `6${digits}`;
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
