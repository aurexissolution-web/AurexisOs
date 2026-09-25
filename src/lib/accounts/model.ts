// Accounting maths for /accounts. Pure, no imports, so node:test can load it.
// Dates are YYYY-MM-DD (Malaysia calendar days); money is RM.

export interface Income {
  id: string;
  income_date: string;
  client_id: string | null;
  client_name: string;
  project: string;
  description: string;
  amount: number;
  document_id: string | null;
  notes: string;
}
export interface Payment {
  id: string;
  income_id: string;
  amount: number;
  paid_on: string;
  method: string;
  reference: string;
  receipt_id: string | null;
}
export interface Expense {
  id: string;
  expense_date: string;
  category: string;
  vendor: string;
  amount: number;
  notes: string;
}
export interface Referral {
  id: string;
  referrer_id: string;
  client_id: string | null;
  client_name: string;
  project: string;
  income_id: string | null;
  base_amount: number;
  reward_kind: 'percent' | 'fixed';
  reward_value: number;
  reward_amount: number;
  pay_when: 'full' | 'first_payment';
  paid_on: string | null;
  pay_method: string;
  pay_reference: string;
  expense_id: string | null;
  notes: string;
}

export const EXPENSE_CATEGORIES = [
  'Software & subscriptions',
  'Hosting & domains',
  'Advertising',
  'Freelancers & contractors',
  'Salary & allowances',
  'Referral fees',
  'Tax & compliance',
  'Office & equipment',
  'Travel & meals',
  'Bank & payment fees',
  'Phone & internet',
  'Training & courses',
  'Petrol & transport',
  'Food & drinks',
  'Shopping & groceries',
  'PayLater repayments',
  'Cash withdrawals',
  'Family & personal transfers',
  'Entertainment',
  'Other / small payments',
  'Other',
] as const;
export const REFERRAL_CATEGORY = 'Referral fees';

export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// ── Income and payments ──────────────────────────────────────────────────────

export type IncomeState = 'paid' | 'partial' | 'owed';

export function incomeBalance(income: Pick<Income, 'amount'>, payments: Pick<Payment, 'amount'>[]) {
  const paid = r2(payments.reduce((s, p) => s + Number(p.amount), 0));
  const balance = r2(Math.max(0, Number(income.amount) - paid));
  const state: IncomeState = balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'owed';
  return { paid, balance, state };
}

export function groupPayments(payments: Payment[]): Map<string, Payment[]> {
  const m = new Map<string, Payment[]>();
  for (const p of payments) {
    const list = m.get(p.income_id);
    if (list) list.push(p);
    else m.set(p.income_id, [p]);
  }
  return m;
}

// ── Referrals ────────────────────────────────────────────────────────────────

export function rewardAmount(kind: 'percent' | 'fixed', value: number, base: number): number {
  return r2(kind === 'percent' ? (base * value) / 100 : value);
}

export type ReferralState = 'paid' | 'payable' | 'waiting';

/** `linked` is the balance info of the income this referral depends on, if any. */
export function referralState(
  ref: Pick<Referral, 'paid_on' | 'pay_when' | 'income_id'>,
  linked: { paid: number; balance: number } | null,
): ReferralState {
  if (ref.paid_on) return 'paid';
  if (!ref.income_id || !linked) return 'payable';
  const met = ref.pay_when === 'first_payment' ? linked.paid > 0 : linked.balance <= 0;
  return met ? 'payable' : 'waiting';
}

// ── Dates ────────────────────────────────────────────────────────────────────

export const monthOf = (d: string) => d.slice(0, 7);

/** The last `n` month keys ending at today's month, oldest first. */
export function lastMonths(today: string, n: number): string[] {
  let y = Number(today.slice(0, 4));
  let m = Number(today.slice(5, 7));
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.unshift(`${y}-${String(m).padStart(2, '0')}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return out;
}

export function daysBetween(from: string, to: string): number {
  return Math.max(0, Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000));
}

// ── Overview ─────────────────────────────────────────────────────────────────

export interface OwedRow {
  income: Income;
  paid: number;
  balance: number;
  state: IncomeState;
  ageDays: number;
}

export function summarize(
  incomes: Income[],
  payments: Payment[],
  expenses: Expense[],
  referrals: Referral[],
  today: string,
) {
  const month = monthOf(today);
  const year = today.slice(0, 4);
  const byIncome = groupPayments(payments);

  const inRange = (d: string, prefix: string) => d.startsWith(prefix);
  const received = (prefix: string) => r2(payments.filter((p) => inRange(p.paid_on, prefix)).reduce((s, p) => s + Number(p.amount), 0));
  const spent = (prefix: string) => r2(expenses.filter((e) => inRange(e.expense_date, prefix)).reduce((s, e) => s + Number(e.amount), 0));

  const owed: OwedRow[] = incomes
    .map((income) => {
      const b = incomeBalance(income, byIncome.get(income.id) ?? []);
      return { income, ...b, ageDays: daysBetween(income.income_date, today) };
    })
    .filter((r) => r.balance > 0)
    .sort((a, b) => a.income.income_date.localeCompare(b.income.income_date));

  const incomeById = new Map(incomes.map((i) => [i.id, i]));
  let referrersOwed = 0;
  let referrersWaiting = 0;
  for (const ref of referrals) {
    const inc = ref.income_id ? incomeById.get(ref.income_id) : undefined;
    const linked = inc ? incomeBalance(inc, byIncome.get(inc.id) ?? []) : null;
    const st = referralState(ref, linked);
    if (st === 'payable') referrersOwed += Number(ref.reward_amount);
    else if (st === 'waiting') referrersWaiting += Number(ref.reward_amount);
  }

  const months = lastMonths(today, 6).map((key) => ({ key, income: received(key), expenses: spent(key) }));

  const catTotals = new Map<string, number>();
  for (const e of expenses) if (inRange(e.expense_date, year)) catTotals.set(e.category, r2((catTotals.get(e.category) ?? 0) + Number(e.amount)));
  const topCategories = [...catTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([category, total]) => ({ category, total }));

  return {
    month: { income: received(month), expenses: spent(month), profit: r2(received(month) - spent(month)) },
    year: { income: received(year), expenses: spent(year), profit: r2(received(year) - spent(year)) },
    allTime: {
      income: r2(payments.reduce((s, p) => s + Number(p.amount), 0)),
      expenses: r2(expenses.reduce((s, e) => s + Number(e.amount), 0)),
    },
    owed,
    owedTotal: r2(owed.reduce((s, o) => s + o.balance, 0)),
    referrersOwed: r2(referrersOwed),
    referrersWaiting: r2(referrersWaiting),
    months,
    topCategories,
  };
}

// ── Ledger (all-time / year / month views) ───────────────────────────────────

/** '' = all time, 'YYYY' = a year, 'YYYY-MM' = a month. */
export type Period = 'all' | 'year' | 'month';

export function periodKey(period: Period, today: string): string {
  return period === 'all' ? '' : period === 'year' ? today.slice(0, 4) : monthOf(today);
}

export interface ActivityEntry {
  id: string;
  date: string;
  title: string;
  kind: 'income' | 'expense';
  detail: string;
  amount: number;
}

/** Totals, breakdowns and recent activity for one period. Income counts on the day it was received. */
export function ledger(incomes: Income[], payments: Payment[], expenses: Expense[], prefix: string, activityLimit = 12) {
  const incomeById = new Map(incomes.map((i) => [i.id, i]));
  const pays = payments.filter((p) => p.paid_on.startsWith(prefix));
  const exps = expenses.filter((e) => e.expense_date.startsWith(prefix));
  const received = r2(pays.reduce((s, p) => s + Number(p.amount), 0));
  const spent = r2(exps.reduce((s, e) => s + Number(e.amount), 0));

  const clients = new Map<string, { total: number; count: number }>();
  for (const p of pays) {
    const name = incomeById.get(p.income_id)?.client_name || 'Unknown client';
    const c = clients.get(name) ?? { total: 0, count: 0 };
    clients.set(name, { total: r2(c.total + Number(p.amount)), count: c.count + 1 });
  }
  const categories = new Map<string, { total: number; count: number }>();
  for (const e of exps) {
    const c = categories.get(e.category) ?? { total: 0, count: 0 };
    categories.set(e.category, { total: r2(c.total + Number(e.amount)), count: c.count + 1 });
  }
  const sortDesc = (m: Map<string, { total: number; count: number }>) =>
    [...m.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total);

  const activity: ActivityEntry[] = [
    ...pays.map((p) => {
      const inc = incomeById.get(p.income_id);
      return { id: `p-${p.id}`, date: p.paid_on, title: inc?.client_name || 'Payment', kind: 'income' as const, detail: inc?.description || inc?.project || 'Payment received', amount: Number(p.amount) };
    }),
    ...exps.map((e) => ({ id: `e-${e.id}`, date: e.expense_date, title: e.vendor || e.category, kind: 'expense' as const, detail: e.category, amount: -Number(e.amount) })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, activityLimit);

  return {
    received,
    spent,
    net: r2(received - spent),
    paymentCount: pays.length,
    expenseCount: exps.length,
    byClient: sortDesc(clients),
    byCategory: sortDesc(categories),
    activity,
  };
}

/** Month keys from the first month with any money movement up to today's month (at most `max`). */
export function activeMonths(payments: Payment[], expenses: Expense[], today: string, max = 12): string[] {
  const dates = [...payments.map((p) => p.paid_on), ...expenses.map((e) => e.expense_date)].sort();
  if (!dates.length) return lastMonths(today, 6);
  const first = monthOf(dates[0]);
  const all = lastMonths(today, 120).filter((m) => m >= first);
  return all.slice(-max);
}

export function monthSeries(payments: Payment[], expenses: Expense[], months: string[]) {
  return months.map((key) => ({
    key,
    income: r2(payments.filter((p) => p.paid_on.startsWith(key)).reduce((s, p) => s + Number(p.amount), 0)),
    expenses: r2(expenses.filter((e) => e.expense_date.startsWith(key)).reduce((s, e) => s + Number(e.amount), 0)),
  }));
}

// ── Sync with Documents ──────────────────────────────────────────────────────

/** The bits of a Documents row the sync needs (flattened server-side). */
export interface DocLite {
  id: string;
  kind: 'proposal' | 'invoice' | 'receipt';
  number: string;
  title: string;
  status: string;
  total_myr: number;
  doc_date: string;
  client_id: string | null;
  source_id: string | null;
  /** Receipts: the invoice number typed on the receipt. */
  invoiceNumber: string;
  /** Invoices: description of the first line item. */
  project: string;
}

export interface SyncPlan {
  createIncomes: Omit<Income, 'id' | 'notes'>[];
  /** Payments to add, addressed by the invoice document (its income may not exist yet). */
  addPayments: { invoice_document_id: string; receipt_id: string; amount: number; paid_on: string; reference: string }[];
  removeIncomeIds: string[];
  removePaymentIds: string[];
}

/**
 * Works out what must change so income and payments mirror the invoices and
 * receipts in Documents. Idempotent: running it again on the result plans nothing.
 */
export function planSync(docs: DocLite[], incomes: Income[], payments: Payment[]): SyncPlan {
  const docById = new Map(docs.map((d) => [d.id, d]));
  const invoices = docs.filter((d) => d.kind === 'invoice');
  const incomeByDoc = new Map(incomes.filter((i) => i.document_id).map((i) => [i.document_id as string, i]));
  const paymentByReceipt = new Set(payments.filter((p) => p.receipt_id).map((p) => p.receipt_id as string));
  const paymentsByIncome = groupPayments(payments);

  const plan: SyncPlan = { createIncomes: [], addPayments: [], removeIncomeIds: [], removePaymentIds: [] };

  for (const inv of invoices) {
    if (inv.status === 'void' || Number(inv.total_myr) <= 0) continue;
    if (incomeByDoc.has(inv.id)) continue;
    plan.createIncomes.push({
      income_date: inv.doc_date,
      client_id: inv.client_id,
      client_name: inv.title,
      project: inv.project,
      description: `Invoice ${inv.number}`,
      amount: Number(inv.total_myr),
      document_id: inv.id,
    });
  }

  // An invoice voided in Documents drops its income, unless money was already received on it.
  for (const inc of incomes) {
    if (!inc.document_id) continue;
    const doc = docById.get(inc.document_id);
    if (doc?.status === 'void' && !(paymentsByIncome.get(inc.id)?.length)) plan.removeIncomeIds.push(inc.id);
  }

  const liveInvoiceIds = new Set(invoices.filter((d) => d.status !== 'void' && Number(d.total_myr) > 0).map((d) => d.id));
  for (const rec of docs.filter((d) => d.kind === 'receipt')) {
    if (rec.status === 'void') continue;
    if (paymentByReceipt.has(rec.id)) continue;
    const target = rec.source_id ?? invoices.find((i) => i.number === rec.invoiceNumber && rec.invoiceNumber)?.id ?? null;
    if (!target || !liveInvoiceIds.has(target)) continue;
    if (Number(rec.total_myr) <= 0) continue;
    plan.addPayments.push({
      invoice_document_id: target,
      receipt_id: rec.id,
      amount: Number(rec.total_myr),
      paid_on: rec.doc_date,
      reference: rec.number,
    });
  }

  // A receipt voided in Documents takes its payment back.
  for (const p of payments) {
    if (!p.receipt_id) continue;
    if (docById.get(p.receipt_id)?.status === 'void') plan.removePaymentIds.push(p.id);
  }
  return plan;
}

// ── CSV ──────────────────────────────────────────────────────────────────────

export function toCsv(rows: (string | number)[][]): string {
  const cell = (v: string | number) => {
    let s = String(v);
    // Spreadsheet formula injection: a leading = + - @ would run as a formula.
    if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(',')).join('\n');
}
