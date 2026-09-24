// src/data/insights-config.ts
// Static, non-post content for /insights and /insights/[slug].

export const INSIGHTS_ACCENT = '#5EE3DA';
export const INSIGHTS_ACCENT_RGB = '94,227,218';

export function formatInsightDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
