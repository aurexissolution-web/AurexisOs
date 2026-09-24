// src/data/portfolio-config.ts
import type { PortfolioCategory } from '@/types/portal';

export const DISPATCH_NUMBER = '06';
export const VOLUME = 'I';
export const ISSUE_NAME = 'The Work Issue';

export const CATEGORY_ACCENT: Record<PortfolioCategory, string> = {
  'ai-automation': '#A78BFA',
  'web-engineering': '#00F0FF',
  'mobile-ecosystem': '#10B981',
  ecosystem: '#F59E0B',
  'data-engineering': '#0047FF',
};

export const CATEGORY_LABEL: Record<PortfolioCategory, string> = {
  'ai-automation': 'AI Automation',
  'web-engineering': 'Web Engineering',
  'mobile-ecosystem': 'Mobile Ecosystem',
  ecosystem: 'Ecosystem',
  'data-engineering': 'Data Engineering',
};

export function todayDispatchDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
