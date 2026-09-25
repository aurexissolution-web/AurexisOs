'use server';

// Services a client bought and the invoices raised for them. This is tracking
// (what was billed, is it paid), not accounting.
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { clean, dateOrNull, isId, money } from '@/lib/admin/validate';
import {
  SERVICE_STATUSES,
  SOLUTIONS,
  formatRM,
  type ClientInvoice,
  type ClientService,
  type InvoiceStatus,
  type ServiceStatus,
  type Solution,
} from '@/lib/admin/billing';

const SERVICE_COLS = 'id,client_id,solution,name,price_myr,status,start_date,care_plan,care_price_myr,renewal_date,notes';
const INVOICE_COLS = 'id,client_id,service_id,number,description,amount_myr,status,issued_on,due_on,paid_on';
type Fail = { ok: false; error: string };

const num = <T extends { price_myr?: unknown; care_price_myr?: unknown; amount_myr?: unknown }>(r: T) => ({
  ...r,
  ...(r.price_myr !== undefined && { price_myr: Number(r.price_myr) }),
  ...(r.care_price_myr !== undefined && { care_price_myr: Number(r.care_price_myr) }),
  ...(r.amount_myr !== undefined && { amount_myr: Number(r.amount_myr) }),
});

export interface ServiceInput {
  id?: string;
  solution: Solution;
  name: string;
  price: number;
  status: ServiceStatus;
  startDate: string;
  carePlan: string;
  carePrice: number;
  renewalDate: string;
  notes: string;
}

export async function saveService(clientId: string, i: ServiceInput): Promise<{ ok: true; service: ClientService } | Fail> {
  const admin = await requireAdmin();
  if (!isId(clientId)) return { ok: false, error: 'Invalid client.' };
  if (i.id !== undefined && !isId(i.id)) return { ok: false, error: 'Invalid service.' };
  if (!SOLUTIONS.some((s) => s.key === i.solution)) return { ok: false, error: 'Pick a solution.' };
  if (!SERVICE_STATUSES.some((s) => s.key === i.status)) return { ok: false, error: 'Pick a status.' };
  const name = clean(i.name, 160);
  if (!name) return { ok: false, error: 'Add the package name, e.g. Business Site.' };
  const price = money(i.price);
  const carePrice = money(i.carePrice);
  if (price === null || carePrice === null) return { ok: false, error: 'Enter a valid price.' };

  const row = {
    solution: i.solution, name, price_myr: price, status: i.status,
    start_date: dateOrNull(i.startDate), care_plan: clean(i.carePlan, 120), care_price_myr: carePrice,
    renewal_date: dateOrNull(i.renewalDate), notes: clean(i.notes, 2000), updated_at: new Date().toISOString(),
  };
  const res = i.id
    ? await supabaseAdmin.from('client_services').update(row).eq('id', i.id).eq('client_id', clientId).select(SERVICE_COLS).single()
    : await supabaseAdmin.from('client_services').insert({ ...row, client_id: clientId }).select(SERVICE_COLS).single();
  if (res.error || !res.data) return { ok: false, error: res.error?.message ?? 'Could not save.' };
  if (!i.id) {
    await supabaseAdmin.from('client_activity').insert({
      client_id: clientId, kind: 'service', title: `Service added: ${name} (${formatRM(price)})`, actor_id: admin.id,
    });
  }
  // A live service means the client is active.
  if (i.status === 'live') {
    await supabaseAdmin.from('clients').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', clientId).in('status', ['lead', 'past', 'lost']);
  }
  revalidatePath('/admin/clients');
  return { ok: true, service: num(res.data) as ClientService };
}

export async function deleteService(clientId: string, id: string): Promise<{ ok: true } | Fail> {
  await requireAdmin();
  if (!isId(clientId) || !isId(id)) return { ok: false, error: 'Invalid service.' };
  const { error } = await supabaseAdmin.from('client_services').delete().eq('id', id).eq('client_id', clientId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/clients');
  return { ok: true };
}

export interface InvoiceInput {
  id?: string;
  serviceId: string | null;
  number: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
  issuedOn: string;
  dueOn: string;
  paidOn: string;
}

export async function saveInvoice(clientId: string, i: InvoiceInput): Promise<{ ok: true; invoice: ClientInvoice } | Fail> {
  const admin = await requireAdmin();
  if (!isId(clientId)) return { ok: false, error: 'Invalid client.' };
  if (i.id !== undefined && !isId(i.id)) return { ok: false, error: 'Invalid invoice.' };
  if (!['draft', 'sent', 'paid', 'void'].includes(i.status)) return { ok: false, error: 'Pick a status.' };
  const amount = money(i.amount);
  if (amount === null || amount <= 0) return { ok: false, error: 'Enter the invoice amount.' };
  const issued = dateOrNull(i.issuedOn);
  if (!issued) return { ok: false, error: 'Pick the issue date.' };
  const due = dateOrNull(i.dueOn);
  if (due && due < issued) return { ok: false, error: 'The due date is before the issue date.' };
  let paid = dateOrNull(i.paidOn);
  if (i.status === 'paid' && !paid) paid = new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
  if (i.status !== 'paid') paid = null;
  const serviceId = i.serviceId && isId(i.serviceId) ? i.serviceId : null;

  const row = {
    service_id: serviceId, number: clean(i.number, 60), description: clean(i.description, 300),
    amount_myr: amount, status: i.status, issued_on: issued, due_on: due, paid_on: paid, updated_at: new Date().toISOString(),
  };
  const res = i.id
    ? await supabaseAdmin.from('client_invoices').update(row).eq('id', i.id).eq('client_id', clientId).select(INVOICE_COLS).single()
    : await supabaseAdmin.from('client_invoices').insert({ ...row, client_id: clientId }).select(INVOICE_COLS).single();
  if (res.error || !res.data) return { ok: false, error: res.error?.message ?? 'Could not save.' };
  if (!i.id && i.status !== 'draft') {
    await supabaseAdmin.from('client_activity').insert({
      client_id: clientId, kind: 'invoice', title: `Invoice ${row.number || ''} ${i.status === 'paid' ? 'paid' : 'sent'}: ${formatRM(amount)}`.replace('  ', ' '), actor_id: admin.id,
    });
  }
  revalidatePath('/admin/clients');
  return { ok: true, invoice: num(res.data) as ClientInvoice };
}

export async function markInvoicePaid(clientId: string, id: string): Promise<{ ok: true; invoice: ClientInvoice } | Fail> {
  const admin = await requireAdmin();
  if (!isId(clientId) || !isId(id)) return { ok: false, error: 'Invalid invoice.' };
  const today = new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from('client_invoices')
    .update({ status: 'paid', paid_on: today, updated_at: new Date().toISOString() })
    .eq('id', id).eq('client_id', clientId)
    .select(INVOICE_COLS).single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not update.' };
  await supabaseAdmin.from('client_activity').insert({
    client_id: clientId, kind: 'invoice', title: `Payment received: ${formatRM(Number(data.amount_myr))}${data.number ? ` (invoice ${data.number})` : ''}`, actor_id: admin.id,
  });
  revalidatePath('/admin/clients');
  return { ok: true, invoice: num(data) as ClientInvoice };
}

export async function deleteInvoice(clientId: string, id: string): Promise<{ ok: true } | Fail> {
  await requireAdmin();
  if (!isId(clientId) || !isId(id)) return { ok: false, error: 'Invalid invoice.' };
  const { error } = await supabaseAdmin.from('client_invoices').delete().eq('id', id).eq('client_id', clientId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/clients');
  return { ok: true };
}
