// src/lib/admin/billing.ts
// Services, invoices and money maths for the client page. No imports.

export type ServiceStatus = 'quoted' | 'in_progress' | 'live' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void';
export type Solution = 'presence' | 'flow' | 'core' | 'connect' | 'audit' | 'other';

export const SOLUTIONS: { key: Solution; label: string; color: string }[] = [
  { key: 'presence', label: 'Presence', color: '#5EE3DA' },
  { key: 'flow', label: 'Flow', color: '#7FE8C4' },
  { key: 'core', label: 'Core', color: '#8FA8F0' },
  { key: 'connect', label: 'Connect', color: '#B08FF0' },
  { key: 'audit', label: 'AI Audit', color: '#F0C88F' },
  { key: 'other', label: 'Other', color: '#9CA3AF' },
];
export const SOLUTION_BY_KEY = Object.fromEntries(SOLUTIONS.map((s) => [s.key, s])) as Record<Solution, (typeof SOLUTIONS)[number]>;

export const SERVICE_STATUSES: { key: ServiceStatus; label: string; color: string }[] = [
  { key: 'quoted', label: 'Quoted', color: '#8FA8F0' },
  { key: 'in_progress', label: 'In progress', color: '#F0C88F' },
  { key: 'live', label: 'Live', color: '#7FE8C4' },
  { key: 'cancelled', label: 'Cancelled', color: '#9CA3AF' },
];

export interface ClientService {
  id: string;
  client_id: string;
  solution: Solution;
  name: string;
  price_myr: number;
  status: ServiceStatus;
  start_date: string | null;
  care_plan: string;
  care_price_myr: number;
  renewal_date: string | null;
  notes: string;
}

export interface ClientInvoice {
  id: string;
  client_id: string;
  service_id: string | null;
  number: string;
  description: string;
  amount_myr: number;
  status: InvoiceStatus;
  issued_on: string;
  due_on: string | null;
  paid_on: string | null;
}

export function formatRM(n: number): string {
  const whole = Number.isInteger(n);
  return `RM${n.toLocaleString('en-MY', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

export type InvoiceView = 'draft' | 'void' | 'paid' | 'overdue' | 'due' | 'sent';

/** `today` and dates are "YYYY-MM-DD" (Malaysia calendar days). */
export function invoiceState(inv: { status: InvoiceStatus; due_on: string | null }, today: string): InvoiceView {
  if (inv.status === 'paid') return 'paid';
  if (inv.status === 'void') return 'void';
  if (inv.status === 'draft') return 'draft';
  if (!inv.due_on) return 'sent';
  return inv.due_on < today ? 'overdue' : inv.due_on === today ? 'due' : 'sent';
}

export function summarizeBilling(
  invoices: { status: InvoiceStatus; amount_myr: number; due_on: string | null }[],
  services: { status: ServiceStatus; care_price_myr: number }[],
  today: string,
) {
  let billed = 0, paid = 0, outstanding = 0, overdue = 0;
  for (const i of invoices) {
    if (i.status === 'draft' || i.status === 'void') continue;
    billed += Number(i.amount_myr);
    if (i.status === 'paid') paid += Number(i.amount_myr);
    else {
      outstanding += Number(i.amount_myr);
      if (invoiceState(i, today) === 'overdue') overdue += Number(i.amount_myr);
    }
  }
  const mrr = services.filter((s) => s.status === 'live').reduce((sum, s) => sum + Number(s.care_price_myr), 0);
  return { billed, paid, outstanding, overdue, mrr };
}

const dayNumber = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
};

export type RenewalState = 'none' | 'overdue' | 'soon' | 'later';
export function renewalState(date: string | null, today: string, soonDays = 30): RenewalState {
  if (!date) return 'none';
  const diff = dayNumber(date) - dayNumber(today);
  return diff < 0 ? 'overdue' : diff <= soonDays ? 'soon' : 'later';
}
