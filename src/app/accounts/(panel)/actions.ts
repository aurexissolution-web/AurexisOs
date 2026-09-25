'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/server';
import { clean, dateOrNull, isId, money } from '@/lib/admin/validate';
import { requireAccounts } from '@/lib/accounts/access';
import { loadIncome, REFERRAL_COLS } from '@/lib/accounts/data';
import { REFERRAL_CATEGORY, groupPayments, incomeBalance, referralState, rewardAmount, r2, type Referral } from '@/lib/accounts/model';

type Fail = { ok: false; error: string };
type Ok = { ok: true };
const done = (): Ok => {
  revalidatePath('/accounts', 'layout');
  return { ok: true };
};
const fail = (error: string): Fail => ({ ok: false, error });

// ── Income and payments ──────────────────────────────────────────────────────

export interface IncomeInput {
  date: string;
  clientId: string | null;
  clientName: string;
  project: string;
  description: string;
  amount: number;
  receivedNow: boolean;
  paidOn: string;
  method: string;
  reference: string;
  notes: string;
}

export async function addIncome(i: IncomeInput): Promise<Ok | Fail> {
  const user = await requireAccounts();
  const amount = money(i.amount);
  const date = dateOrNull(i.date);
  const clientName = clean(i.clientName, 160);
  if (!amount || amount <= 0) return fail('Enter an amount above zero.');
  if (!date) return fail('Pick the date.');
  if (!clientName) return fail('Who is this income from?');
  if (i.clientId !== null && !isId(i.clientId)) return fail('Invalid client.');

  const { data: row, error } = await supabaseAdmin
    .from('account_income')
    .insert({
      income_date: date, client_id: i.clientId, client_name: clientName, project: clean(i.project, 200),
      description: clean(i.description, 400), amount, notes: clean(i.notes, 2000), created_by: user.id,
    })
    .select('id')
    .single();
  if (error) return fail('Could not save the income.');

  if (i.receivedNow) {
    const { error: pe } = await supabaseAdmin.from('account_payments').insert({
      income_id: row.id, amount, paid_on: dateOrNull(i.paidOn) ?? date, method: clean(i.method, 60), reference: clean(i.reference, 120),
    });
    if (pe) return fail('Saved the income, but could not record the payment. Record it from the Income page.');
  }
  return done();
}

export async function deleteIncome(id: string): Promise<Ok | Fail> {
  await requireAccounts();
  if (!isId(id)) return fail('Invalid entry.');
  const { data } = await supabaseAdmin.from('account_income').select('document_id').eq('id', id).maybeSingle();
  if (!data) return fail('Not found.');
  if (data.document_id) return fail('This comes from an invoice. Void the invoice in Documents to remove it.');
  const { error } = await supabaseAdmin.from('account_income').delete().eq('id', id);
  return error ? fail('Could not delete.') : done();
}

export async function recordPayment(i: { incomeId: string; amount: number; paidOn: string; method: string; reference: string }): Promise<Ok | Fail> {
  await requireAccounts();
  if (!isId(i.incomeId)) return fail('Invalid entry.');
  const amount = money(i.amount);
  const paidOn = dateOrNull(i.paidOn);
  if (!amount || amount <= 0) return fail('Enter an amount above zero.');
  if (!paidOn) return fail('Pick the payment date.');

  const [{ data: income }, { data: pays }] = await Promise.all([
    supabaseAdmin.from('account_income').select('id,amount').eq('id', i.incomeId).maybeSingle(),
    supabaseAdmin.from('account_payments').select('amount').eq('income_id', i.incomeId),
  ]);
  if (!income) return fail('Not found.');
  const { balance } = incomeBalance({ amount: Number(income.amount) }, (pays ?? []).map((p) => ({ amount: Number(p.amount) })));
  if (amount > balance + 0.004) return fail(`Only RM ${balance.toFixed(2)} is still owed on this entry.`);

  const { error } = await supabaseAdmin.from('account_payments').insert({
    income_id: i.incomeId, amount, paid_on: paidOn, method: clean(i.method, 60), reference: clean(i.reference, 120),
  });
  return error ? fail('Could not record the payment.') : done();
}

export async function deletePayment(id: string): Promise<Ok | Fail> {
  await requireAccounts();
  if (!isId(id)) return fail('Invalid payment.');
  const { data } = await supabaseAdmin.from('account_payments').select('receipt_id').eq('id', id).maybeSingle();
  if (!data) return fail('Not found.');
  if (data.receipt_id) return fail('This payment comes from a receipt. Void the receipt in Documents to remove it.');
  const { error } = await supabaseAdmin.from('account_payments').delete().eq('id', id);
  return error ? fail('Could not delete.') : done();
}

// ── Expenses ─────────────────────────────────────────────────────────────────

export interface ExpenseInput {
  id?: string;
  date: string;
  category: string;
  vendor: string;
  amount: number;
  notes: string;
}

export async function saveExpense(i: ExpenseInput): Promise<Ok | Fail> {
  const user = await requireAccounts();
  if (i.id !== undefined && !isId(i.id)) return fail('Invalid expense.');
  const amount = money(i.amount);
  const date = dateOrNull(i.date);
  const category = clean(i.category, 80);
  if (!amount || amount <= 0) return fail('Enter an amount above zero.');
  if (!date) return fail('Pick the date.');
  if (!category) return fail('Pick a category.');

  const row = { expense_date: date, category, vendor: clean(i.vendor, 160), amount, notes: clean(i.notes, 2000), updated_at: new Date().toISOString() };
  if (i.id) {
    const { data: ref } = await supabaseAdmin.from('referrals').select('id').eq('expense_id', i.id).maybeSingle();
    if (ref) return fail('This is a referral payout. Change it from the Referrals page.');
    const { error } = await supabaseAdmin.from('account_expenses').update(row).eq('id', i.id);
    return error ? fail('Could not save.') : done();
  }
  const { error } = await supabaseAdmin.from('account_expenses').insert({ ...row, created_by: user.id });
  return error ? fail('Could not save.') : done();
}

export async function deleteExpense(id: string): Promise<Ok | Fail> {
  await requireAccounts();
  if (!isId(id)) return fail('Invalid expense.');
  const { data: ref } = await supabaseAdmin.from('referrals').select('id').eq('expense_id', id).maybeSingle();
  if (ref) return fail('This is a referral payout. Undo it from the Referrals page.');
  const { error } = await supabaseAdmin.from('account_expenses').delete().eq('id', id);
  return error ? fail('Could not delete.') : done();
}

// ── Referrers and referrals ──────────────────────────────────────────────────

export async function saveReferrer(i: { id?: string; name: string; phone: string; bankName: string; bankAccount: string; notes: string }): Promise<Ok | Fail> {
  await requireAccounts();
  if (i.id !== undefined && !isId(i.id)) return fail('Invalid referrer.');
  const name = clean(i.name, 160);
  if (!name) return fail('Add the referrer’s name.');
  const row = { name, phone: clean(i.phone, 40), bank_name: clean(i.bankName, 80), bank_account: clean(i.bankAccount, 60), notes: clean(i.notes, 2000) };
  const { error } = i.id ? await supabaseAdmin.from('referrers').update(row).eq('id', i.id) : await supabaseAdmin.from('referrers').insert(row);
  return error ? fail('Could not save.') : done();
}

export async function deleteReferrer(id: string): Promise<Ok | Fail> {
  await requireAccounts();
  if (!isId(id)) return fail('Invalid referrer.');
  const { error } = await supabaseAdmin.from('referrers').delete().eq('id', id);
  if (error) return fail(error.code === '23503' ? 'This referrer has referrals. Delete those first.' : 'Could not delete.');
  return done();
}

export interface ReferralInput {
  id?: string;
  referrerId: string;
  clientId: string | null;
  clientName: string;
  project: string;
  incomeId: string | null;
  baseAmount: number;
  rewardKind: 'percent' | 'fixed';
  rewardValue: number;
  payWhen: 'full' | 'first_payment';
  notes: string;
}

export async function saveReferral(i: ReferralInput): Promise<Ok | Fail> {
  await requireAccounts();
  if (!isId(i.referrerId)) return fail('Pick the referrer.');
  if (i.id !== undefined && !isId(i.id)) return fail('Invalid referral.');
  if (i.clientId !== null && !isId(i.clientId)) return fail('Invalid client.');
  if (i.incomeId !== null && !isId(i.incomeId)) return fail('Invalid income link.');
  if (i.rewardKind !== 'percent' && i.rewardKind !== 'fixed') return fail('Pick percent or fixed.');
  if (i.payWhen !== 'full' && i.payWhen !== 'first_payment') return fail('Pick when it becomes payable.');
  const base = money(i.baseAmount);
  const value = money(i.rewardValue);
  if (base === null || value === null) return fail('Enter valid amounts.');
  if (i.rewardKind === 'percent' && value > 100) return fail('A percentage cannot be above 100.');
  const clientName = clean(i.clientName, 160);
  if (!clientName) return fail('Which client did they refer?');

  const row = {
    referrer_id: i.referrerId, client_id: i.clientId, client_name: clientName, project: clean(i.project, 200),
    income_id: i.incomeId, base_amount: base, reward_kind: i.rewardKind, reward_value: value,
    reward_amount: rewardAmount(i.rewardKind, value, base), pay_when: i.payWhen, notes: clean(i.notes, 2000),
    updated_at: new Date().toISOString(),
  };
  if (i.id) {
    const { data } = await supabaseAdmin.from('referrals').select('paid_on').eq('id', i.id).maybeSingle();
    if (data?.paid_on) return fail('This reward is already paid. Undo the payout to edit it.');
    const { error } = await supabaseAdmin.from('referrals').update(row).eq('id', i.id);
    return error ? fail('Could not save.') : done();
  }
  const { error } = await supabaseAdmin.from('referrals').insert(row);
  return error ? fail('Could not save.') : done();
}

export async function deleteReferral(id: string): Promise<Ok | Fail> {
  await requireAccounts();
  if (!isId(id)) return fail('Invalid referral.');
  const { data } = await supabaseAdmin.from('referrals').select('paid_on').eq('id', id).maybeSingle();
  if (data?.paid_on) return fail('This reward is already paid. Undo the payout first.');
  const { error } = await supabaseAdmin.from('referrals').delete().eq('id', id);
  return error ? fail('Could not delete.') : done();
}

/** Pays a reward: marks it paid and writes the matching expense so profit stays right. */
export async function payReferral(i: { id: string; paidOn: string; method: string; reference: string }): Promise<Ok | Fail> {
  const user = await requireAccounts();
  if (!isId(i.id)) return fail('Invalid referral.');
  const paidOn = dateOrNull(i.paidOn);
  if (!paidOn) return fail('Pick the payment date.');

  const { data: ref } = await supabaseAdmin.from('referrals').select(REFERRAL_COLS).eq('id', i.id).maybeSingle();
  if (!ref) return fail('Not found.');
  const referral = { ...(ref as unknown as Referral), reward_amount: Number(ref.reward_amount) };
  if (referral.paid_on) return fail('Already paid.');
  if (referral.reward_amount <= 0) return fail('The reward is RM 0. Edit the referral first.');

  let linked = null;
  if (referral.income_id) {
    const { incomes, payments } = await loadIncome();
    const inc = incomes.find((x) => x.id === referral.income_id);
    if (inc) linked = incomeBalance(inc, groupPayments(payments).get(inc.id) ?? []);
  }
  if (referralState(referral, linked) === 'waiting') return fail('Not payable yet. The client has not paid enough.');

  const { data: claimed } = await supabaseAdmin
    .from('referrals')
    .update({ paid_on: paidOn, pay_method: clean(i.method, 60), pay_reference: clean(i.reference, 120), updated_at: new Date().toISOString() })
    .eq('id', i.id)
    .is('paid_on', null)
    .select('id, referrer_id')
    .maybeSingle();
  if (!claimed) return fail('Already paid.');

  const { data: who } = await supabaseAdmin.from('referrers').select('name').eq('id', claimed.referrer_id).maybeSingle();
  const { data: exp, error } = await supabaseAdmin
    .from('account_expenses')
    .insert({
      expense_date: paidOn, category: REFERRAL_CATEGORY, vendor: who?.name ?? '', amount: r2(referral.reward_amount),
      notes: `Referral reward for ${referral.client_name}${referral.project ? ` (${referral.project})` : ''}`, created_by: user.id,
    })
    .select('id')
    .single();
  if (error) {
    await supabaseAdmin.from('referrals').update({ paid_on: null, pay_method: '', pay_reference: '' }).eq('id', i.id);
    return fail('Could not record the payout.');
  }
  await supabaseAdmin.from('referrals').update({ expense_id: exp.id }).eq('id', i.id);
  return done();
}

export async function undoReferralPayout(id: string): Promise<Ok | Fail> {
  await requireAccounts();
  if (!isId(id)) return fail('Invalid referral.');
  const { data } = await supabaseAdmin.from('referrals').select('expense_id,paid_on').eq('id', id).maybeSingle();
  if (!data?.paid_on) return fail('This reward is not paid.');
  if (data.expense_id) await supabaseAdmin.from('account_expenses').delete().eq('id', data.expense_id);
  const { error } = await supabaseAdmin.from('referrals').update({ paid_on: null, pay_method: '', pay_reference: '', expense_id: null }).eq('id', id);
  return error ? fail('Could not undo.') : done();
}
