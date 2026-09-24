// src/types/core.ts
// Types for the /solutions/core page and its quote-request form.

export interface CoreWorkStep {
  number: string;
  title: string;
  description: string;
}

export interface CoreSetupTier {
  number: string;
  name: string;
  price: string;
  bestFor: string;
  timeline: string;
  carePlan: string;
  includes: string[];
}

export interface CoreCareTier {
  name: string;
  price: string;
  features: string[];
}

export interface CoreChoiceRow {
  project: string;
  plan: string;
}

export interface CoreAddOnItem {
  name: string;
  description: string;
  price: string;
}

export type CoreTier = 'Starter' | 'Growth' | 'Enterprise' | 'Not sure yet';

export type CoreSaasSpend =
  | 'Under RM1,000'
  | 'RM1,000–5,000'
  | 'RM5,000–15,000'
  | 'Over RM15,000'
  | 'Not sure';

export type CoreBottleneck =
  | 'Job tracking'
  | 'Inventory'
  | 'Client records'
  | 'Reporting'
  | 'Multi-branch coordination'
  | 'Other';

export type CoreDataMigration = 'Yes, spreadsheets' | 'Yes, another system' | 'Yes, both' | 'No, starting fresh';

export type CoreTimeline = 'Within 3 months' | '3–6 months' | 'Flexible';

export type CoreBudget = 'Under RM25k' | 'RM25k–60k' | 'RM60k+' | 'Not sure';

export type CoreMeetingPreference = 'Online' | 'Face to face';

export interface CoreQuoteRequest {
  tier: CoreTier;
  businessDescription: string;
  saasSpend: CoreSaasSpend;
  bottleneck: CoreBottleneck;
  dataMigration: CoreDataMigration;
  timeline: CoreTimeline;
  budget: CoreBudget;
  meetingPreference: CoreMeetingPreference;
  meetingAddress?: string;
  name: string;
  whatsapp: string;
  email: string;
  notes?: string;
}

export interface CoreQuoteFieldErrors {
  tier?: string;
  businessDescription?: string;
  saasSpend?: string;
  bottleneck?: string;
  dataMigration?: string;
  timeline?: string;
  budget?: string;
  meetingPreference?: string;
  meetingAddress?: string;
  name?: string;
  whatsapp?: string;
  email?: string;
}
