// Statement for one period (a year, or a month of a year). Type-only imports, so node:test can load it.
import type { Expense, Income, Payment } from './model';

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** A null year means all time. */
export function periodPrefix(year: number | null, month: number | null): string {
  if (year === null) return '';
  return month ? `${year}-${String(month).padStart(2, '0')}` : String(year);
}

export function buildStatement(incomes: Income[], payments: Payment[], expenses: Expense[], prefix: string) {
  const incomeById = new Map(incomes.map((i) => [i.id, i]));
  const received = payments
    .filter((p) => p.paid_on.startsWith(prefix))
    .map((p) => {
      const inc = incomeById.get(p.income_id);
      return { date: p.paid_on, client: inc?.client_name ?? '', what: inc?.description || inc?.project || '', method: p.method, reference: p.reference, amount: Number(p.amount) };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const spent = expenses
    .filter((e) => e.expense_date.startsWith(prefix))
    .map((e) => ({ date: e.expense_date, category: e.category, vendor: e.vendor, notes: e.notes, amount: Number(e.amount) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byCategory = new Map<string, { total: number; count: number }>();
  for (const e of spent) {
    const c = byCategory.get(e.category) ?? { total: 0, count: 0 };
    byCategory.set(e.category, { total: r2(c.total + e.amount), count: c.count + 1 });
  }

  const totalIncome = r2(received.reduce((s, x) => s + x.amount, 0));
  const totalExpenses = r2(spent.reduce((s, x) => s + x.amount, 0));
  return {
    received,
    spent,
    categories: [...byCategory.entries()].sort((a, b) => b[1].total - a[1].total).map(([category, c]) => ({ category, ...c })),
    totalIncome,
    totalExpenses,
    profit: r2(totalIncome - totalExpenses),
  };
}
