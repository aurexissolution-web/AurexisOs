import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatRMDoc,
  formatDocDate,
  formatLongDate,
  formatMonthYear,
  totals,
  amountPaid,
  nextSequence,
  invoiceNumber,
  receiptNumberFor,
  suggestClientCode,
  proposalRef,
  splitPayments,
  addDays,
} from '../src/lib/documents/model.ts';

test('money prints the way the templates do: "RM 275", thousands commas, cents only when needed', () => {
  assert.equal(formatRMDoc(275), 'RM 275');
  assert.equal(formatRMDoc(1850), 'RM 1,850');
  assert.equal(formatRMDoc(1234.5), 'RM 1,234.50');
  assert.equal(formatRMDoc(0), 'RM 0');
  assert.equal(formatRMDoc(1234.567), 'RM 1,234.57');
});

test('dates: invoices use DD.MM.YYYY, proposals use "15 JULY 2026" and "JULY 2026"', () => {
  assert.equal(formatDocDate('2026-07-21'), '21.07.2026');
  assert.equal(formatLongDate('2026-07-15'), '15 JULY 2026');
  assert.equal(formatMonthYear('2026-08-10'), 'AUGUST 2026');
  assert.equal(addDays('2026-07-15', 14), '2026-07-29');
  assert.equal(addDays('2026-12-25', 10), '2027-01-04');
});

const items = [
  { description: 'Initial Deposit (50%)', note: 'DUE NOW', price: 275, qty: 1, dueNow: true },
  { description: 'Final Payment (50%)', note: '', price: 275, qty: 1, dueNow: false },
];

test('totals match the MEDSS invoice: subtotal 550, total 550, total DUE 275 (the deposit)', () => {
  const t = totals(items, 0);
  assert.equal(t.subtotal, 550);
  assert.equal(t.tax, 0);
  assert.equal(t.total, 550);
  assert.equal(t.due, 275);
});

test('when no line is marked due now, the whole total is due', () => {
  const t = totals(items.map((i) => ({ ...i, dueNow: false })), 0);
  assert.equal(t.due, 550);
});

test('quantity multiplies, and tax at a rate is added to the total and to the amount due', () => {
  const t = totals([{ description: 'Extra pages', note: '', price: 250, qty: 3, dueNow: false }], 0.08);
  assert.equal(t.subtotal, 750);
  assert.equal(t.tax, 60);
  assert.equal(t.total, 810);
  assert.equal(t.due, 810);
  const partial = totals([{ ...items[0], qty: 1 }, items[1]], 0.06);
  assert.equal(partial.due, 291.5); // 275 plus its 6% tax
});

test('amount paid on a receipt is the sum of the lines marked paid', () => {
  assert.equal(amountPaid([{ ...items[0], paid: true }, { ...items[1], paid: false }], 0), 275);
  assert.equal(amountPaid([{ ...items[0], paid: true }, { ...items[1], paid: true }], 0), 550);
  assert.equal(amountPaid([{ ...items[0], paid: false }], 0), 0);
});

test('next sequence continues after the highest stored number and ignores other prefixes', () => {
  assert.equal(nextSequence('AS-', ['AS-010', 'AS-011', 'REC-020', 'AS-abc'], 0), 12);
  assert.equal(nextSequence('AS-', [], 11), 12);
  assert.equal(nextSequence('AS-', ['AS-003'], 11), 12);
  assert.equal(invoiceNumber(12), 'AS-012');
  assert.equal(invoiceNumber(1234), 'AS-1234');
});

test('a receipt takes its invoice digits; later receipts for the same invoice get a suffix', () => {
  assert.equal(receiptNumberFor('AS-010', []), 'REC-010');
  assert.equal(receiptNumberFor('AS-010', ['REC-010']), 'REC-010-2');
  assert.equal(receiptNumberFor('AS-010', ['REC-010', 'REC-010-2']), 'REC-010-3');
  assert.equal(receiptNumberFor('AS-011', ['REC-010']), 'REC-011');
});

test('client codes come from initials, skipping company suffixes', () => {
  assert.equal(suggestClientCode('The Vanguards Services Sdn. Bhd.'), 'TVS');
  assert.equal(suggestClientCode('Heavy Auto Forklift Services'), 'HAFS');
  assert.equal(suggestClientCode('MEDSS Training & Consultancy Sdn Bhd'), 'MEDSS');
  assert.equal(suggestClientCode('  '), 'CLI');
});

test('proposal reference follows AUR-PRODUCT-CLIENT-YEAR-SEQ', () => {
  assert.equal(proposalRef('presence', 'TVS', 2026, 1), 'AUR-PRES-TVS-2026-001');
  assert.equal(proposalRef('flow', 'HAFS', 2026, 12), 'AUR-FLOW-HAFS-2026-012');
  assert.equal(proposalRef('audit', 'X', 2027, 5), 'AUR-AUDT-X-2027-005');
});

test('a payment schedule splits a total by percent and lands exactly on the total', () => {
  assert.deepEqual(splitPayments(1850, [50, 50]), [925, 925]);
  assert.deepEqual(splitPayments(2000, [50, 50]), [1000, 1000]);
  const three = splitPayments(1000, [30, 30, 40]);
  assert.equal(three.reduce((a, b) => a + b, 0), 1000);
  const odd = splitPayments(100.01, [33, 33, 34]);
  assert.equal(Math.round(odd.reduce((a, b) => a + b, 0) * 100), 10001);
});

import { checkInvoice, checkReceipt } from '../src/lib/documents/validate.ts';

const okInvoice = () => ({
  number: 'AS-011', date: '2026-09-25', billTo: { name: 'Acme', address: 'a\nb', phone: '' },
  items: [{ description: 'Business Site', note: '', price: 3250, qty: 1, dueNow: false }], taxRate: 0,
});

test('invoice validation accepts a good form and rejects bad ones', () => {
  assert.equal(checkInvoice(okInvoice()).ok, true);
  assert.equal(checkInvoice({ ...okInvoice(), number: '' }).ok, false);
  assert.equal(checkInvoice({ ...okInvoice(), date: '25/09/2026' }).ok, false);
  assert.equal(checkInvoice({ ...okInvoice(), items: [] }).ok, false);
  assert.equal(checkInvoice({ ...okInvoice(), taxRate: 5 }).ok, false);
  const neg = okInvoice();
  neg.items[0].price = -1;
  assert.equal(checkInvoice(neg).ok, false);
  assert.equal(checkInvoice(null).ok, false);
});

test('receipt validation needs at least one paid line', () => {
  const base = { ...okInvoice(), number: 'REC-011' };
  assert.equal(checkReceipt(base).ok, false);
  base.items[0].paid = true;
  const r = checkReceipt(base);
  assert.equal(r.ok, true);
  assert.equal(r.data.items[0].paid, true);
});

import { parseBody, defaultSections } from '../src/lib/documents/proposal.ts';

test('proposal syntax turns lines into blocks', () => {
  const b = parseBody('Hello there\nsecond line\n\n## Head\n- one\n- two\n1. Title | body text\n> quote\n| A | B\n| 1 | 2\n~ tiny\n@invest Site | RM1,850\n@sign');
  assert.deepEqual(b.map((x) => x.t), ['para', 'sub', 'bullets', 'num', 'callout', 'table', 'note', 'invest', 'sign']);
  assert.equal(b[0].text, 'Hello there second line');
  assert.deepEqual(b[2].items, ['one', 'two']);
  assert.equal(b[3].title, 'Title');
  assert.equal(b[3].text, 'body text');
  assert.deepEqual(b[5].rows, [['A', 'B'], ['1', '2']]);
  assert.equal(b[7].amount, 'RM1,850');
});

test('default proposal carries the client name and an exact payment split', () => {
  const s = defaultSections('Acme Sdn Bhd', 'presence', 1851);
  const inv = s.find((x) => x.title === 'Project Investment').body;
  assert.match(inv, /@invest Acme Sdn Bhd — Presence \| RM1,851/);
  assert.match(inv, /RM925\.50/);
  assert.match(inv, /RM925\.50/);
  assert.ok(s.some((x) => x.body.includes('Acme Sdn Bhd')));
});

import { summarize, daysBetween } from '../src/lib/documents/stats.ts';

test('overview: outstanding is invoice total minus its receipts; void is ignored', () => {
  const row = (o) => ({ id: 'x', kind: 'invoice', number: 'N', title: 'T', status: 'issued', total_myr: 0, doc_date: '2026-09-10', source_id: null, ...o });
  const rows = [
    row({ id: 'i1', number: 'AS-011', total_myr: 550 }),
    row({ id: 'i2', number: 'AS-012', total_myr: 1000, doc_date: '2026-08-01' }),
    row({ id: 'i3', number: 'AS-013', total_myr: 300, status: 'void' }),
    row({ id: 'r1', kind: 'receipt', number: 'REC-011', total_myr: 275, source_id: 'i1' }),
    row({ id: 'r2', kind: 'receipt', number: 'REC-012', total_myr: 1000, source_id: 'i2', doc_date: '2026-08-05' }),
    row({ id: 'p1', kind: 'proposal', number: 'AUR-1', total_myr: 1850 }),
  ];
  const s = summarize(rows, '2026-09-25');
  assert.equal(s.invoicedMonth, 550);
  assert.equal(s.collectedMonth, 275);
  assert.equal(s.outstanding, 275);
  assert.deepEqual(s.unpaid.map((u) => u.number), ['AS-011']);
  assert.equal(s.proposalsMonth, 1);
  assert.equal(s.proposalValue, 1850);
  assert.equal(daysBetween('2026-09-10', '2026-09-25'), 15);
  assert.equal(daysBetween('2026-09-30', '2026-09-25'), 0);
});
