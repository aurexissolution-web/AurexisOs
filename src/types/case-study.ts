// src/types/case-study.ts
// Type for entries shown on /work and /work/[slug]. Rows come from the
// case_studies table, written by the admin panel's Work Files page.

export interface CaseStudyMetric {
  value: string;
  label: string;
}

export interface CaseStudy {
  slug: string;
  clientName: string;
  industry: string;
  outcomeHeadline: string;
  problem: string;
  whatWasBuilt: string;
  result: string;
  screenshotUrl?: string;
  summary?: string;
  location?: string;
  metrics?: CaseStudyMetric[];
  services?: string[];
  techTags?: string[];
  timeline?: string;
  liveUrl?: string | null;
  gallery?: string[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
}
