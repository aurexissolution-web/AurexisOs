import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCsv, mapClientRows } from '../src/lib/admin/csv.ts';
import { invoiceState, summarizeBilling, renewalState, formatRM } from '../src/lib/admin/billing.ts';

test('csv: quotes, commas, escaped quotes, blank lines and CRLF', () => {
  const rows = parseCsv('﻿Name,Notes\r\n"Lim, Jason","Said ""call me"""\r\n\r\nAisyah,plain\r\n');
  assert.deepEqual(rows, [['Name', 'Notes'], ['Lim, Jason', 'Said "call me"'], ['Aisyah', 'plain']]);
});

test('csv: newline inside a quoted cell stays in the cell; semicolon and tab files work', () => {
  assert.deepEqual(parseCsv('a,b\n"x\ny",z'), [['a', 'b'], ['x\ny', 'z']]);
  assert.deepEqual(parseCsv('name;email\nAli;ali@x.my'), [['name', 'email'], ['Ali', 'ali@x.my']]);
  assert.deepEqual(parseCsv('name\temail\nAli\tali@x.my'), [['name', 'email'], ['Ali', 'ali@x.my']]);
});

test('mapping: header aliases, status words, tags and trimming', () => {
  const rows = parseCsv(
    'Business Name,Email Address,Mobile,Stage,Tags,Industry\n' +
      ' Kedai Aman ,Aman@Kedai.my,012-345 6789,customer,"vip; referral",Retail\n' +
      'Farah,not-an-email,,prospect,,\n',
  );
  const { items, missing } = mapClientRows(rows);
  assert.deepEqual(missing, []);
  assert.equal(items.length, 2);
  assert.deepEqual(items[0].data, {
    name: 'Kedai Aman', company: '', email: 'aman@kedai.my', phone: '012-345 6789',
    status: 'active', tags: ['vip', 'referral'], industry: 'Retail', notes: '',
  });
  assert.equal(items[0].problem, null);
  assert.equal(items[1].data.status, 'lead');
  assert.match(items[1].problem, /email/i);
});

test('mapping: a row with no name is a problem; a file with no name column is rejected', () => {
  const ok = mapClientRows(parseCsv('name,email\n,a@b.my\nX,x@y.my'));
  assert.match(ok.items[0].problem, /name/i);
  assert.equal(ok.items[1].problem, null);
  const bad = mapClientRows(parseCsv('foo,bar\n1,2'));
  assert.ok(bad.missing.includes('name'));
});

test('money formats as ringgit', () => {
  assert.equal(formatRM(3250), 'RM3,250');
  assert.equal(formatRM(1234.5), 'RM1,234.50');
  assert.equal(formatRM(0), 'RM0');
});

const today = '2026-09-25';
test('invoice state: draft, void, paid, due, overdue', () => {
  assert.equal(invoiceState({ status: 'paid', due_on: '2026-09-01' }, today), 'paid');
  assert.equal(invoiceState({ status: 'void', due_on: null }, today), 'void');
  assert.equal(invoiceState({ status: 'draft', due_on: null }, today), 'draft');
  assert.equal(invoiceState({ status: 'sent', due_on: '2026-09-24' }, today), 'overdue');
  assert.equal(invoiceState({ status: 'sent', due_on: '2026-09-25' }, today), 'due');
  assert.equal(invoiceState({ status: 'sent', due_on: '2026-10-10' }, today), 'sent');
  assert.equal(invoiceState({ status: 'sent', due_on: null }, today), 'sent');
});

test('billing summary counts only sent/paid money and monthly care revenue from live plans', () => {
  const s = summarizeBilling(
    [
      { status: 'paid', amount_myr: 1000, due_on: null },
      { status: 'sent', amount_myr: 500, due_on: '2026-09-01' },
      { status: 'sent', amount_myr: 300, due_on: '2026-10-30' },
      { status: 'draft', amount_myr: 9999, due_on: null },
      { status: 'void', amount_myr: 9999, due_on: null },
    ],
    [
      { status: 'live', care_price_myr: 650 },
      { status: 'live', care_price_myr: 0 },
      { status: 'cancelled', care_price_myr: 1425 },
      { status: 'quoted', care_price_myr: 525 },
    ],
    today,
  );
  assert.deepEqual(s, { billed: 1800, paid: 1000, outstanding: 800, overdue: 500, mrr: 650 });
});

test('renewals: overdue, soon (30 days), later, none', () => {
  assert.equal(renewalState(null, today), 'none');
  assert.equal(renewalState('2026-09-20', today), 'overdue');
  assert.equal(renewalState('2026-10-20', today), 'soon');
  assert.equal(renewalState('2026-12-01', today), 'later');
});
