import assert from 'node:assert/strict';
import test from 'node:test';
import {
  incomeBalance, rewardAmount, referralState, lastMonths, summarize, planSync, toCsv,
} from '../src/lib/accounts/model.ts';

const inc = (o) => ({ id: 'i1', income_date: '2026-09-10', client_id: null, client_name: 'X', project: 'P', description: '', amount: 550, document_id: null, notes: '', ...o });
const pay = (o) => ({ id: 'p1', income_id: 'i1', amount: 275, paid_on: '2026-09-12', method: '', reference: '', receipt_id: null, ...o });

test('income balance: owed, partial and paid', () => {
  assert.equal(incomeBalance(inc({}), []).state, 'owed');
  const half = incomeBalance(inc({}), [pay({})]);
  assert.deepEqual([half.state, half.paid, half.balance], ['partial', 275, 275]);
  assert.equal(incomeBalance(inc({}), [pay({}), pay({ id: 'p2' })]).state, 'paid');
  assert.equal(incomeBalance(inc({}), [pay({ amount: 600 })]).balance, 0);
});

test('referral reward maths and when it becomes payable', () => {
  assert.equal(rewardAmount('percent', 10, 1850), 185);
  assert.equal(rewardAmount('percent', 7.5, 1234), 92.55);
  assert.equal(rewardAmount('fixed', 200, 9999), 200);
  const full = { paid_on: null, pay_when: 'full', income_id: 'i1' };
  assert.equal(referralState(full, { paid: 275, balance: 275 }), 'waiting');
  assert.equal(referralState(full, { paid: 550, balance: 0 }), 'payable');
  assert.equal(referralState({ ...full, pay_when: 'first_payment' }, { paid: 275, balance: 275 }), 'payable');
  assert.equal(referralState({ ...full, income_id: null }, null), 'payable');
  assert.equal(referralState({ ...full, paid_on: '2026-09-20' }, { paid: 0, balance: 550 }), 'paid');
});

test('last months crosses the year boundary', () => {
  assert.deepEqual(lastMonths('2026-02-15', 4), ['2025-11', '2025-12', '2026-01', '2026-02']);
});

test('overview: cash basis, owed, referrer liability, categories', () => {
  const incomes = [inc({}), inc({ id: 'i2', income_date: '2026-08-01', amount: 1000 })];
  const payments = [pay({}), pay({ id: 'p2', income_id: 'i2', amount: 1000, paid_on: '2026-08-05' })];
  const expenses = [
    { id: 'e1', expense_date: '2026-09-02', category: 'Hosting & domains', vendor: '', amount: 100, notes: '' },
    { id: 'e2', expense_date: '2026-08-02', category: 'Advertising', vendor: '', amount: 300, notes: '' },
  ];
  const referrals = [{ id: 'r1', referrer_id: 'a', client_id: null, client_name: '', project: '', income_id: 'i2', base_amount: 1000, reward_kind: 'percent', reward_value: 10, reward_amount: 100, pay_when: 'full', paid_on: null, pay_method: '', pay_reference: '', expense_id: null, notes: '' },
    { id: 'r2', referrer_id: 'a', client_id: null, client_name: '', project: '', income_id: 'i1', base_amount: 550, reward_kind: 'fixed', reward_value: 50, reward_amount: 50, pay_when: 'full', paid_on: null, pay_method: '', pay_reference: '', expense_id: null, notes: '' }];
  const s = summarize(incomes, payments, expenses, referrals, '2026-09-25');
  assert.deepEqual(s.month, { income: 275, expenses: 100, profit: 175 });
  assert.equal(s.year.income, 1275);
  assert.equal(s.owedTotal, 275);
  assert.equal(s.owed[0].income.id, 'i1');
  assert.equal(s.referrersOwed, 100);
  assert.equal(s.referrersWaiting, 50);
  assert.equal(s.months.at(-1).key, '2026-09');
  assert.equal(s.topCategories[0].category, 'Advertising');
});

const doc = (o) => ({ id: 'd1', kind: 'invoice', number: 'AS-011', title: 'MEDSS', status: 'issued', total_myr: 550, doc_date: '2026-09-10', client_id: null, source_id: null, invoiceNumber: '', project: 'Company Profile', ...o });

test('sync: an invoice becomes income and its receipt becomes a payment', () => {
  const docs = [doc({}), doc({ id: 'r1', kind: 'receipt', number: 'REC-011', total_myr: 275, doc_date: '2026-09-12', source_id: 'd1', project: '' })];
  const plan = planSync(docs, [], []);
  assert.equal(plan.createIncomes.length, 1);
  assert.equal(plan.createIncomes[0].amount, 550);
  assert.equal(plan.createIncomes[0].description, 'Invoice AS-011');
  assert.equal(plan.addPayments.length, 1);
  assert.deepEqual([plan.addPayments[0].invoice_document_id, plan.addPayments[0].amount], ['d1', 275]);
});

test('sync: a receipt with no source is matched by invoice number', () => {
  const docs = [doc({}), doc({ id: 'r1', kind: 'receipt', number: 'REC-011', total_myr: 275, invoiceNumber: 'AS-011', project: '' })];
  assert.equal(planSync(docs, [], []).addPayments[0].invoice_document_id, 'd1');
});

test('sync is idempotent and handles voids', () => {
  const docs = [doc({}), doc({ id: 'r1', kind: 'receipt', number: 'REC-011', total_myr: 275, source_id: 'd1', project: '' })];
  const incomes = [inc({ id: 'i1', document_id: 'd1', amount: 550 })];
  const payments = [pay({ receipt_id: 'r1' })];
  const again = planSync(docs, incomes, payments);
  assert.deepEqual([again.createIncomes.length, again.addPayments.length, again.removeIncomeIds.length, again.removePaymentIds.length], [0, 0, 0, 0]);
  // invoice voided with a payment on it: income stays
  assert.equal(planSync([doc({ status: 'void' })], incomes, payments).removeIncomeIds.length, 0);
  // invoice voided, nothing received: income goes
  assert.deepEqual(planSync([doc({ status: 'void' })], incomes, []).removeIncomeIds, ['i1']);
  // receipt voided: payment goes
  assert.deepEqual(planSync([doc({}), doc({ id: 'r1', kind: 'receipt', status: 'void', source_id: 'd1' })], incomes, payments).removePaymentIds, ['p1']);
});

test('sync: editing an invoice or receipt in Documents updates its income and payment', () => {
  const incomes = [inc({ id: 'i1', document_id: 'd1', amount: 550, client_name: 'MEDSS', income_date: '2026-09-10', description: 'Invoice AS-011', project: 'Company Profile' })];
  const payments = [pay({ id: 'p1', income_id: 'i1', receipt_id: 'r1', amount: 275, paid_on: '2026-09-12', reference: 'REC-011' })];
  const rec = (o) => doc({ id: 'r1', kind: 'receipt', number: 'REC-011', total_myr: 275, doc_date: '2026-09-12', source_id: 'd1', project: '', ...o });
  const same = planSync([doc({}), rec({})], incomes, payments);
  assert.deepEqual([same.updateIncomes.length, same.updatePayments.length], [0, 0]);

  const edited = planSync([doc({ total_myr: 700, title: 'MEDSS Training', doc_date: '2026-09-11', number: 'AS-011A' }), rec({ total_myr: 300, doc_date: '2026-09-15' })], incomes, payments);
  assert.deepEqual(edited.updateIncomes, [{ id: 'i1', patch: { income_date: '2026-09-11', client_id: null, client_name: 'MEDSS Training', project: 'Company Profile', description: 'Invoice AS-011A', amount: 700 } }]);
  assert.deepEqual(edited.updatePayments, [{ id: 'p1', patch: { amount: 300, paid_on: '2026-09-15', reference: 'REC-011' } }]);
  assert.equal(planSync([doc({ total_myr: 700 }), rec({})], edited.updateIncomes.length ? [{ ...incomes[0], amount: 700 }] : incomes, payments).updateIncomes.length, 0);
});

test('csv escapes commas and quotes and defuses formulas', () => {
  assert.equal(toCsv([['a,b', 'say "hi"', 5]]), '"a,b","say ""hi""",5');
  assert.equal(toCsv([['=SUM(A1)', '-5']]), "'=SUM(A1),-5");
});

import { buildStatement, periodPrefix } from '../src/lib/accounts/report.ts';

test('statement covers only the chosen period and nets profit', () => {
  const incomes = [inc({ description: 'Invoice AS-011' })];
  const payments = [pay({ paid_on: '2026-09-12', amount: 275 }), pay({ id: 'p2', paid_on: '2026-08-30', amount: 100 })];
  const expenses = [
    { id: 'e1', expense_date: '2026-09-02', category: 'Advertising', vendor: 'Meta', amount: 50, notes: '' },
    { id: 'e2', expense_date: '2026-09-20', category: 'Advertising', vendor: 'Meta', amount: 25.5, notes: '' },
    { id: 'e3', expense_date: '2026-07-01', category: 'Other', vendor: '', amount: 9, notes: '' },
  ];
  assert.equal(periodPrefix(2026, 9), '2026-09');
  assert.equal(periodPrefix(2026, null), '2026');
  assert.equal(periodPrefix(null, null), '');
  const s = buildStatement(incomes, payments, expenses, '2026-09');
  assert.equal(s.totalIncome, 275);
  assert.equal(s.totalExpenses, 75.5);
  assert.equal(s.profit, 199.5);
  assert.deepEqual(s.categories, [{ category: 'Advertising', total: 75.5, count: 2 }]);
  assert.equal(s.received[0].what, 'Invoice AS-011');
  assert.equal(buildStatement(incomes, payments, expenses, '2026').totalIncome, 375);
});

import { ledger, periodKey, activeMonths, monthSeries } from '../src/lib/accounts/model.ts';

test('ledger gives all-time, year and month views with breakdowns and activity', () => {
  const incomes = [
    { id: 'a', income_date: '2025-12-01', client_id: null, client_name: 'Ayurvedic', project: '', description: 'AS-002', amount: 5000, document_id: null, notes: '' },
    { id: 'b', income_date: '2026-09-01', client_id: null, client_name: 'HT', project: '', description: 'AS-011', amount: 1000, document_id: null, notes: '' },
  ];
  const payments = [
    { id: 'p1', income_id: 'a', amount: 3000, paid_on: '2025-12-10', method: '', reference: '', receipt_id: null },
    { id: 'p2', income_id: 'a', amount: 2000, paid_on: '2026-09-02', method: '', reference: '', receipt_id: null },
    { id: 'p3', income_id: 'b', amount: 1000, paid_on: '2026-09-20', method: '', reference: '', receipt_id: null },
  ];
  const expenses = [
    { id: 'e1', expense_date: '2025-12-05', category: 'Hosting & domains', vendor: 'Hostinger', amount: 100, notes: '' },
    { id: 'e2', expense_date: '2026-09-03', category: 'Software & subscriptions', vendor: 'Claude', amount: 400, notes: '' },
  ];
  const all = ledger(incomes, payments, expenses, periodKey('all', '2026-09-25'));
  assert.equal(all.received, 6000);
  assert.equal(all.spent, 500);
  assert.equal(all.net, 5500);
  assert.deepEqual(all.byClient.map((c) => [c.name, c.total]), [['Ayurvedic', 5000], ['HT', 1000]]);
  assert.equal(all.activity[0].title, 'HT');
  assert.equal(all.activity.find((a) => a.kind === 'expense').amount, -400);
  const month = ledger(incomes, payments, expenses, periodKey('month', '2026-09-25'));
  assert.equal(month.received, 3000);
  assert.equal(periodKey('year', '2026-09-25'), '2026');
  const months = activeMonths(payments, expenses, '2026-09-25');
  assert.equal(months[0], '2025-12');
  assert.equal(months.at(-1), '2026-09');
  assert.equal(monthSeries(payments, expenses, months)[0].income, 3000);
});
