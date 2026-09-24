// src/types/connect.ts
// Types for the /solutions/connect page and its quote-request form.

export interface ConnectSetupTier {
  number: string;
  name: string;
  price: string;
  bestFor: string;
  timeline: string;
  managementPlan: string;
  includes: string[];
}

export interface ConnectManagementTier {
  name: string;
  price: string;
  features: string[];
}

export interface ConnectChoiceRow {
  need: string;
  plan: string;
}

export interface ConnectBillRow {
  name: string;
  chargedBy: string;
  description: string;
}

export interface ConnectRateRow {
  name: string;
  description: string;
  rate: string;
}

export interface ConnectMonthLineItem {
  label: string;
  amount: string;
}

export interface ConnectAddOnItem {
  name: string;
  description: string;
  price: string;
}

export type ConnectTier = 'Starter' | 'Growth' | 'Pro' | 'Custom' | 'Not sure yet';

export type ConnectHasMetaAccount = 'Yes' | 'No' | 'Not sure';

export type ConnectEnquiryVolume = 'Under 50' | '50–200' | '200–1,000' | 'Over 1,000' | 'Not sure';

export type ConnectTimeline =
  | 'Before 1 October (Meta deadline)'
  | 'Within a month'
  | 'Within 3 months'
  | 'Flexible';

export type ConnectBudget = 'Under RM3k' | 'RM3k–8k' | 'RM8k+' | 'Not sure';

export type ConnectMeetingPreference = 'Online' | 'Face to face';

export interface ConnectQuoteRequest {
  tier: ConnectTier;
  businessDescription: string;
  hasMetaAccount: ConnectHasMetaAccount;
  enquiriesPerMonth: ConnectEnquiryVolume;
  timeline: ConnectTimeline;
  budget: ConnectBudget;
  meetingPreference: ConnectMeetingPreference;
  meetingAddress?: string;
  name: string;
  whatsapp: string;
  email: string;
  notes?: string;
}

export interface ConnectQuoteFieldErrors {
  tier?: string;
  businessDescription?: string;
  hasMetaAccount?: string;
  enquiriesPerMonth?: string;
  timeline?: string;
  budget?: string;
  meetingPreference?: string;
  meetingAddress?: string;
  name?: string;
  whatsapp?: string;
  email?: string;
}
