// src/types/audit.ts
// Types for the /solutions/ai-readiness-audit page and its quote-request form.

export interface AuditTierCard {
  number: string;
  name: string;
  price: string;
  bestFor: string;
  timeline: string;
  delivery: string;
  includes: string[];
}

export interface AuditGrant {
  name: string;
  description: string;
}

export type AuditTier = 'Audit Light' | 'Audit Full' | 'Not sure yet';

export type AuditStage =
  | "Haven't tried anything"
  | 'Team uses ChatGPT informally'
  | "We've bought one AI tool"
  | "We've built something"
  | 'Not sure';

export type AuditBiggestQuestion =
  | 'Where AI could save time'
  | 'Where AI could increase revenue'
  | "Whether we're ready for a custom build"
  | 'Whether a grant applies to us'
  | 'Other';

export type AuditGrantInterest = 'Yes' | 'No' | 'Not sure';

export type AuditMeetingPreference = 'Online' | 'Face to face';

export interface AuditQuoteRequest {
  tier: AuditTier;
  businessDescription: string;
  aiStage: AuditStage;
  biggestQuestion: AuditBiggestQuestion;
  grantInterest: AuditGrantInterest;
  meetingPreference: AuditMeetingPreference;
  meetingAddress?: string;
  name: string;
  whatsapp: string;
  email: string;
  notes?: string;
}

export interface AuditQuoteFieldErrors {
  tier?: string;
  businessDescription?: string;
  aiStage?: string;
  biggestQuestion?: string;
  grantInterest?: string;
  meetingPreference?: string;
  meetingAddress?: string;
  name?: string;
  whatsapp?: string;
  email?: string;
}
