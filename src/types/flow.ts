// src/types/flow.ts
// Types for the /solutions/flow page and its quote-request form.

export interface FlowSetupTier {
  number: string;
  name: string;
  price: string;
  bestFor: string;
  timeline: string;
  managementPlan: string;
  includes: string[];
}

export interface FlowManagementTier {
  name: string;
  price: string;
  features: string[];
}

export interface FlowChoiceRow {
  need: string;
  plan: string;
}

export interface FlowAddOnItem {
  name: string;
  description: string;
  price: string;
}

export type FlowTier = 'Lite' | 'Core' | 'Max' | 'Not sure yet';

export type FlowAccountingPackage =
  | 'Bukku'
  | 'AutoCount'
  | 'SQL'
  | 'QuickBooks'
  | 'Xero'
  | 'Spreadsheet only'
  | 'None'
  | 'Other';

export type FlowAdminHours = 'Under 5' | '5–15' | '15–30' | 'Over 30' | 'Not sure';

export type FlowLhdnStatus =
  | 'Already compliant'
  | 'Working on it'
  | "Haven't started"
  | 'Not sure if it applies to me';

export type FlowTimeline = 'ASAP' | 'Within a month' | 'Within 3 months' | 'Flexible';

export type FlowBudget = 'Under RM5k' | 'RM5k–12k' | 'RM12k+' | 'Not sure';

export type FlowMeetingPreference = 'Online' | 'Face to face';

export interface FlowQuoteRequest {
  tier: FlowTier;
  businessDescription: string;
  accountingPackage: FlowAccountingPackage;
  adminHoursPerWeek: FlowAdminHours;
  lhdnStatus: FlowLhdnStatus;
  timeline: FlowTimeline;
  budget: FlowBudget;
  meetingPreference: FlowMeetingPreference;
  meetingAddress?: string;
  name: string;
  whatsapp: string;
  email: string;
  notes?: string;
}

export interface FlowQuoteFieldErrors {
  tier?: string;
  businessDescription?: string;
  accountingPackage?: string;
  adminHoursPerWeek?: string;
  lhdnStatus?: string;
  timeline?: string;
  budget?: string;
  meetingPreference?: string;
  meetingAddress?: string;
  name?: string;
  whatsapp?: string;
  email?: string;
}
