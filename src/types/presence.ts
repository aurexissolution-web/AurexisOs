// src/types/presence.ts
// Types for the /solutions/presence page and its quote-request form.

export interface PresenceWebsiteType {
  number: string;
  name: string;
  price: string;
  bestFor: string;
  timeline: string;
  carePlan: string;
  includes: string[];
}

export interface PresenceAddOnItem {
  name: string;
  price: string;
}

export interface PresenceAddOnCategory {
  heading: string;
  items: PresenceAddOnItem[];
}

export interface PresenceCarePlanTier {
  name: string;
  price: string;
  features: string[];
}

export interface PresenceCarePlanGroup {
  label: string;
  subtitle: string;
  tiers: PresenceCarePlanTier[];
  footnote: string;
}

export type QuoteWebsiteType =
  | 'Landing Page'
  | 'Business Site'
  | 'Corporate Site'
  | 'E-commerce'
  | 'Booking'
  | 'Client Portal'
  | 'Custom'
  | 'Not sure yet';

export type QuoteHasWebsite = 'Yes' | 'No' | "It's outdated";

export type QuoteTimeline = 'ASAP' | 'Within a month' | 'Within 3 months' | 'Flexible';

export type QuoteBudget = 'Under RM3k' | 'RM3k–8k' | 'RM8k–15k' | 'RM15k+' | 'Not sure';

export type QuoteMeetingPreference = 'Online' | 'Face to face';

export interface PresenceQuoteRequest {
  websiteType: QuoteWebsiteType;
  businessDescription: string;
  hasWebsite: QuoteHasWebsite;
  timeline: QuoteTimeline;
  budget: QuoteBudget;
  meetingPreference: QuoteMeetingPreference;
  meetingAddress?: string;
  name: string;
  whatsapp: string;
  email: string;
  notes?: string;
}

export interface PresenceQuoteFieldErrors {
  websiteType?: string;
  businessDescription?: string;
  hasWebsite?: string;
  timeline?: string;
  budget?: string;
  meetingPreference?: string;
  meetingAddress?: string;
  name?: string;
  whatsapp?: string;
  email?: string;
}
