// src/data/case-studies.ts
// Case studies shown on /work and /work/[slug]. This is the seam a future
// admin panel writes to — always read through getCaseStudies() /
// getCaseStudyBySlug(), never import CASE_STUDIES directly into a component.
import type { CaseStudy } from '@/types/case-study';

const CASE_STUDIES: CaseStudy[] = [];

export function getCaseStudies(): CaseStudy[] {
  return CASE_STUDIES;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((item) => item.slug === slug);
}
