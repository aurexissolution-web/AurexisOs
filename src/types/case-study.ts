// src/types/case-study.ts
// Type for entries shown on /work and /work/[slug].

export interface CaseStudy {
  slug: string;
  clientName: string;
  industry: string;
  outcomeHeadline: string;
  problem: string;
  whatWasBuilt: string;
  result: string;
  screenshotUrl?: string;
}
