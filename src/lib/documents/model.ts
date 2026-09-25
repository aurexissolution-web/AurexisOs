// src/lib/documents/model.ts
// Types and pure maths for proposals, invoices and receipts. No imports, so
// node:test can load it. Formats match the existing Aurexis templates.

export type DocKind = 'proposal' | 'invoice' | 'receipt';
export type ProductKey = 'presence' | 'flow' | 'core' | 'connect' | 'audit';

export const PRODUCTS: { key: ProductKey; label: string; code: string }[] = [
  { key: 'presence', label: 'Presence', code: 'PRES' },
  { key: 'flow', label: 'Flow', code: 'FLOW' },
  { key: 'core', label: 'Core', code: 'CORE' },
  { key: 'connect', label: 'Connect', code: 'CONN' },
  { key: 'audit', label: 'AI Readiness Audit', code: 'AUDT' },
];

export interface LineItem {
  description: string;
  /** Small second line under the description, e.g. "DUE NOW". */
  note: string;
  price: number;
  qty: number;
  dueNow: boolean;
}

export interface ReceiptLine extends LineItem {
  paid: boolean;
}

export interface BillTo {
  name: string;
  /** One address line per row. */
  address: string;
  phone: string;
}

export interface BankDetails {
  bank: string;
  accountName: string;
  accountNo: string;
}

export interface InvoiceData {
  number: string;
  /** YYYY-MM-DD */
  date: string;
  dueDate: string | null;
  billTo: BillTo;
  items: LineItem[];
  /** Tax rate as a fraction: 0, 0.06, 0.08. */
  taxRate: number;
  bank: BankDetails;
  /** One bullet per row. */
  schedule: string;
  signature: boolean;
}

export interface ReceiptData {
  number: string;
  date: string;
  invoiceNumber: string;
  billTo: BillTo;
  items: ReceiptLine[];
  taxRate: number;
  /** "BANK TRANSFER", "CASH", "DUITNOW"... */
  method: string;
  reference: string;
  /** Plain text; **double asterisks** make bold. */
  remarks: string;
  signature: boolean;
}

// ── Money and dates ──────────────────────────────────────────────────────────

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function formatRMDoc(n: number): string {
  const v = r2(n);
  const whole = Number.isInteger(v);
  return `RM ${v.toLocaleString('en-MY', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const parts = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return { y, m, day };
};

/** 2026-07-21 -> 21.07.2026 */
export function formatDocDate(d: string): string {
  const { y, m, day } = parts(d);
  return `${String(day).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
}

/** 2026-07-15 -> 15 JULY 2026 */
export function formatLongDate(d: string): string {
  const { y, m, day } = parts(d);
  return `${day} ${MONTHS[m - 1]} ${y}`;
}

/** 2026-08-10 -> AUGUST 2026 */
export function formatMonthYear(d: string): string {
  const { y, m } = parts(d);
  return `${MONTHS[m - 1]} ${y}`;
}

export function addDays(d: string, n: number): string {
  const { y, m, day } = parts(d);
  const t = new Date(Date.UTC(y, m - 1, day + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

// ── Totals ───────────────────────────────────────────────────────────────────

export function totals(items: LineItem[], taxRate: number) {
  const subtotal = r2(items.reduce((s, i) => s + i.price * i.qty, 0));
  const tax = r2(subtotal * taxRate);
  const total = r2(subtotal + tax);
  const flagged = items.filter((i) => i.dueNow);
  const dueBase = flagged.length ? flagged.reduce((s, i) => s + i.price * i.qty, 0) : subtotal;
  return { subtotal, tax, total, due: r2(dueBase * (1 + taxRate)) };
}

export function lineTotal(i: { price: number; qty: number }): number {
  return r2(i.price * i.qty);
}

export function amountPaid(items: ReceiptLine[], taxRate: number): number {
  return r2(items.filter((i) => i.paid).reduce((s, i) => s + i.price * i.qty, 0) * (1 + taxRate));
}

/** Split a total by percentages; the last part absorbs rounding so the sum is exact. */
export function splitPayments(total: number, percents: number[]): number[] {
  const out: number[] = [];
  let running = 0;
  percents.forEach((p, i) => {
    if (i === percents.length - 1) out.push(r2(total - running));
    else {
      const part = r2((total * p) / 100);
      out.push(part);
      running = r2(running + part);
    }
  });
  return out;
}

// ── Numbering ────────────────────────────────────────────────────────────────

/** Highest number seen for a prefix (and a seed) plus one. */
export function nextSequence(prefix: string, existing: string[], seed: number): number {
  let max = seed;
  for (const n of existing) {
    if (!n.startsWith(prefix)) continue;
    const m = /^(\d+)$/.exec(n.slice(prefix.length));
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

const pad = (n: number, width = 3) => String(n).padStart(width, '0');

export const invoiceNumber = (seq: number) => `AS-${pad(seq)}`;
export const receiptNumber = (seq: number) => `REC-${pad(seq)}`;

/** REC-010 for AS-010; a second receipt for the same invoice becomes REC-010-2. */
export function receiptNumberFor(invoiceNo: string, existingReceipts: string[]): string {
  const digits = /(\d+)\s*$/.exec(invoiceNo)?.[1] ?? '000';
  const base = `REC-${digits}`;
  if (!existingReceipts.includes(base)) return base;
  let n = 2;
  while (existingReceipts.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

const SUFFIXES = new Set(['SDN', 'BHD', 'BERHAD', 'ENTERPRISE', 'ENTERPRISES', 'PLT', 'LLP', 'LTD', 'CO', 'INC', 'AND', '&']);

/** "The Vanguards Services Sdn. Bhd." -> TVS. Short all-caps names are kept whole. */
export function suggestClientCode(name: string): string {
  const words = name
    .replace(/[.,]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !SUFFIXES.has(w.toUpperCase()));
  if (!words.length) return 'CLI';
  if (words.length === 1) return words[0].toUpperCase().slice(0, 6);
  if (words[0] === words[0].toUpperCase() && words[0].length >= 4 && /^[A-Z]+$/.test(words[0])) {
    return words[0].slice(0, 6);
  }
  return words.map((w) => w[0].toUpperCase()).join('').slice(0, 5);
}

export function proposalRef(product: ProductKey, clientCode: string, year: number, seq: number): string {
  const code = PRODUCTS.find((p) => p.key === product)?.code ?? 'GEN';
  return `AUR-${code}-${clientCode.toUpperCase()}-${year}-${pad(seq)}`;
}
