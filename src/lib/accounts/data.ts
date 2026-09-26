// Server-only loading for /accounts, plus the sync that keeps income and
// payments in step with the invoices and receipts in Documents.
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { planSync, type DocLite, type Expense, type Income, type Payment, type Referral } from './model';

/**
 * Next.js reuses identical GET fetches within one render, which would hand the
 * page the rows it read BEFORE the sync wrote to them. A fresh abort signal on
 * each query opts out of that reuse.
 */
const fresh = () => AbortSignal.timeout(20_000);

/** Postgres numeric columns arrive as strings; turn the named ones into numbers. */
function num<T extends object>(row: T, keys: (keyof T)[]): T {
  const out = { ...row } as Record<keyof T, unknown>;
  for (const k of keys) out[k] = Number(row[k]);
  return out as T;
}

/** The API returns at most 1,000 rows per request, so read in pages until a short one. */
async function readAll<T>(page: (from: number, to: number) => PromiseLike<{ data: unknown[] | null }>): Promise<T[]> {
  const size = 1000;
  const out: T[] = [];
  for (let from = 0; ; from += size) {
    const { data } = await page(from, from + size - 1);
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < size) return out;
  }
}

export const INCOME_COLS = 'id,income_date,client_id,client_name,project,description,amount,document_id,notes';
export const PAYMENT_COLS = 'id,income_id,amount,paid_on,method,reference,receipt_id';
export const EXPENSE_COLS = 'id,expense_date,category,vendor,amount,notes';
export const REFERRAL_COLS =
  'id,referrer_id,client_id,client_name,project,income_id,base_amount,reward_kind,reward_value,reward_amount,pay_when,paid_on,pay_method,pay_reference,expense_id,notes';

export async function loadIncome(): Promise<{ incomes: Income[]; payments: Payment[] }> {
  const [i, p] = await Promise.all([
    readAll<Income>((from, to) => supabaseAdmin.from('account_income').select(INCOME_COLS).order('income_date', { ascending: false }).order('id').range(from, to).abortSignal(fresh())),
    readAll<Payment>((from, to) => supabaseAdmin.from('account_payments').select(PAYMENT_COLS).order('paid_on', { ascending: false }).order('id').range(from, to).abortSignal(fresh())),
  ]);
  return {
    incomes: i.map((r) => num(r, ['amount'])),
    payments: p.map((r) => num(r, ['amount'])),
  };
}

export async function loadExpenses(): Promise<Expense[]> {
  const rows = await readAll<Expense>((from, to) =>
    supabaseAdmin.from('account_expenses').select(EXPENSE_COLS).order('expense_date', { ascending: false }).order('id').range(from, to).abortSignal(fresh()),
  );
  return rows.map((r) => num(r, ['amount']));
}

export async function loadReferrals(): Promise<{ referrals: Referral[]; referrers: { id: string; name: string; phone: string; bank_name: string; bank_account: string; notes: string }[] }> {
  const [r, p] = await Promise.all([
    supabaseAdmin.from('referrals').select(REFERRAL_COLS).order('created_at', { ascending: false }).limit(5000).abortSignal(fresh()),
    supabaseAdmin.from('referrers').select('id,name,phone,bank_name,bank_account,notes').order('name').limit(2000).abortSignal(fresh()),
  ]);
  return {
    referrals: ((r.data ?? []) as Referral[]).map((x) => num(x, ['base_amount', 'reward_value', 'reward_amount'])),
    referrers: p.data ?? [],
  };
}

export async function loadClients(): Promise<{ id: string; name: string }[]> {
  const { data } = await supabaseAdmin.from('clients').select('id,name').order('name').limit(5000).abortSignal(fresh());
  return (data ?? []) as { id: string; name: string }[];
}

/**
 * Inserts rows, tolerating ones that already exist (two pages loading at once
 * can plan the same row). The unique indexes are partial, so ON CONFLICT cannot
 * be used; a duplicate (23505) just means someone else already wrote it.
 */
async function insertSkippingDuplicates(table: 'account_income' | 'account_payments', rows: object[]): Promise<void> {
  const batch = await supabaseAdmin.from(table).insert(rows);
  if (!batch.error) return;
  if (batch.error.code !== '23505') {
    console.error(`[accounts] ${table} sync failed:`, batch.error.message);
    return;
  }
  for (const row of rows) {
    const one = await supabaseAdmin.from(table).insert(row);
    if (one.error && one.error.code !== '23505') console.error(`[accounts] ${table} sync failed:`, one.error.message);
  }
}

/**
 * Makes income and payments mirror Documents. Safe to call on every page load:
 * it only writes what is missing (see planSync). Returns quietly if the
 * Documents table is not there yet.
 */
export async function syncFromDocuments(): Promise<void> {
  const docsRes = await supabaseAdmin
    .from('documents')
    .select('id,kind,number,title,status,total_myr,doc_date,client_id,source_id,data')
    .in('kind', ['invoice', 'receipt'])
    .limit(10000)
    .abortSignal(fresh());
  if (docsRes.error) return;

  const docs: DocLite[] = (docsRes.data ?? []).map((d) => {
    const data = (d.data ?? {}) as { invoiceNumber?: unknown; items?: { description?: unknown }[] };
    return {
      id: d.id as string,
      kind: d.kind as DocLite['kind'],
      number: d.number as string,
      title: (d.title as string) ?? '',
      status: d.status as string,
      total_myr: Number(d.total_myr),
      doc_date: d.doc_date as string,
      client_id: (d.client_id as string | null) ?? null,
      source_id: (d.source_id as string | null) ?? null,
      invoiceNumber: typeof data.invoiceNumber === 'string' ? data.invoiceNumber : '',
      project: typeof data.items?.[0]?.description === 'string' ? (data.items[0].description as string).slice(0, 200) : '',
    };
  });

  const { incomes, payments } = await loadIncome();
  const plan = planSync(docs, incomes, payments);
  if (
    !plan.createIncomes.length && !plan.addPayments.length && !plan.removeIncomeIds.length && !plan.removePaymentIds.length &&
    !plan.updateIncomes.length && !plan.updatePayments.length
  ) return;

  for (const u of plan.updateIncomes) {
    const { error } = await supabaseAdmin.from('account_income').update(u.patch).eq('id', u.id);
    if (error) console.error('[accounts] income update failed:', error.message);
  }
  for (const u of plan.updatePayments) {
    const { error } = await supabaseAdmin.from('account_payments').update(u.patch).eq('id', u.id);
    if (error) console.error('[accounts] payment update failed:', error.message);
  }

  if (plan.removePaymentIds.length) await supabaseAdmin.from('account_payments').delete().in('id', plan.removePaymentIds);
  if (plan.removeIncomeIds.length) await supabaseAdmin.from('account_income').delete().in('id', plan.removeIncomeIds);
  if (plan.createIncomes.length) {
    await insertSkippingDuplicates('account_income', plan.createIncomes);
  }
  if (plan.addPayments.length) {
    const { data: rows } = await supabaseAdmin
      .from('account_income')
      .select('id,document_id')
      .in('document_id', plan.addPayments.map((p) => p.invoice_document_id))
      .abortSignal(fresh());
    const incomeByDoc = new Map((rows ?? []).map((r) => [r.document_id as string, r.id as string]));
    const inserts = plan.addPayments
      .map((p) => ({
        income_id: incomeByDoc.get(p.invoice_document_id),
        receipt_id: p.receipt_id,
        amount: p.amount,
        paid_on: p.paid_on,
        method: '',
        reference: p.reference,
      }))
      .filter((p) => p.income_id);
    if (inserts.length) await insertSkippingDuplicates('account_payments', inserts);
  }
}
