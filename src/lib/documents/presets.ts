// Starting prices from the current price list. Every price stays editable on
// the form; these only save typing.
import type { LineItem } from './model';

export const PRICE_PRESETS: { group: string; items: { label: string; price: number }[] }[] = [
  {
    group: 'Presence',
    items: [
      { label: 'Landing Page', price: 1525 },
      { label: 'Business Site', price: 3250 },
      { label: 'Corporate Site', price: 5025 },
      { label: 'E-commerce Store', price: 4250 },
      { label: 'Booking Site', price: 3250 },
      { label: 'Client Portal / Membership', price: 5250 },
    ],
  },
  {
    group: 'Flow',
    items: [
      { label: 'Flow Lite', price: 2250 },
      { label: 'Flow Core', price: 5250 },
      { label: 'Flow Max', price: 12085 },
    ],
  },
  {
    group: 'Core',
    items: [
      { label: 'Core Starter', price: 2525 },
      { label: 'Core Growth', price: 5255 },
    ],
  },
  {
    group: 'Connect',
    items: [
      { label: 'Connect Starter', price: 2250 },
      { label: 'Connect Growth', price: 4250 },
      { label: 'Connect Pro', price: 6250 },
    ],
  },
  {
    group: 'AI Readiness Audit',
    items: [
      { label: 'Audit Light', price: 1525 },
      { label: 'Audit Full', price: 3250 },
    ],
  },
];

export const DEFAULT_BANK = { bank: 'Maybank Berhad', accountName: 'Aurexis Solution', accountNo: '5521 8962 0197' };
export const DEFAULT_SCHEDULE =
  '50% deposit upon acceptance of this quotation to commence work.\n50% balance upon completion of the project.';

export const blankLine = (): LineItem => ({ description: '', note: '', price: 0, qty: 1, dueNow: false });

/** Deposit + balance lines for a project price (50/50, deposit flagged as due now). */
export function depositSplit(name: string, price: number): LineItem[] {
  const half = Math.round((price / 2) * 100) / 100;
  return [
    { description: `${name} - Initial Deposit (50%)`, note: 'DUE NOW', price: half, qty: 1, dueNow: true },
    { description: `${name} - Final Payment (50%)`, note: '', price: Math.round((price - half) * 100) / 100, qty: 1, dueNow: false },
  ];
}
