// src/types/insights.ts
// Type for rows in the insights_posts table, read by /insights and /insights/[slug].

export type InsightPostStatus = 'draft' | 'published';

export interface InsightPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  published_at: string;
  status: InsightPostStatus;
  created_at: string;
}
