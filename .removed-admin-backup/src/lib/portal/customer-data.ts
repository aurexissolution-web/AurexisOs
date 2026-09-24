"use client";

import { supabase } from "@/lib/supabase/client";
import type {
  CustomerRecord,
  CustomerStatus,
  Project,
  Invoice,
  Document,
} from "@/types/portal";

export interface CustomerListItem extends CustomerRecord {
  project_count: number;
  invoice_total: number;
  invoice_count: number;
  last_engaged_at: string | null;
}

export interface CustomerDetailBundle {
  customer: CustomerRecord;
  projects: Project[];
  invoices: Invoice[];
  documents: Document[];
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function listCustomers(): Promise<CustomerListItem[]> {
  const { data: customers, error } = await supabase
    .from("customer_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!customers || customers.length === 0) return [];

  const ids = customers.map((c) => c.id);

  const [projectsRes, invoicesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("customer_record_id, created_at, target_launch_date")
      .in("customer_record_id", ids),
    supabase
      .from("invoices")
      .select("customer_record_id, amount, status")
      .in("customer_record_id", ids),
  ]);

  const projectsByCustomer = new Map<string, { count: number; latest: string | null }>();
  for (const row of projectsRes.data ?? []) {
    const cid = row.customer_record_id as string | null;
    if (!cid) continue;
    const curr = projectsByCustomer.get(cid) ?? { count: 0, latest: null };
    curr.count += 1;
    const candidate = row.target_launch_date ?? row.created_at;
    if (!curr.latest || (candidate && candidate > curr.latest)) {
      curr.latest = candidate as string;
    }
    projectsByCustomer.set(cid, curr);
  }

  const invoicesByCustomer = new Map<string, { total: number; count: number }>();
  for (const row of invoicesRes.data ?? []) {
    const cid = row.customer_record_id as string | null;
    if (!cid) continue;
    const curr = invoicesByCustomer.get(cid) ?? { total: 0, count: 0 };
    curr.count += 1;
    if (row.status === "paid") curr.total += Number(row.amount) || 0;
    invoicesByCustomer.set(cid, curr);
  }

  return customers.map((c) => ({
    ...(c as CustomerRecord),
    project_count: projectsByCustomer.get(c.id)?.count ?? 0,
    invoice_total: invoicesByCustomer.get(c.id)?.total ?? 0,
    invoice_count: invoicesByCustomer.get(c.id)?.count ?? 0,
    last_engaged_at: projectsByCustomer.get(c.id)?.latest ?? null,
  }));
}

export async function fetchCustomerBySlug(slug: string): Promise<CustomerDetailBundle | null> {
  const { data: customer, error } = await supabase
    .from("customer_records")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!customer) return null;

  const [projectsRes, invoicesRes, documentsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("customer_record_id", customer.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("*")
      .eq("customer_record_id", customer.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("customer_record_id", customer.id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    customer: customer as CustomerRecord,
    projects: (projectsRes.data ?? []) as Project[],
    invoices: (invoicesRes.data ?? []) as Invoice[],
    documents: (documentsRes.data ?? []) as Document[],
  };
}

export type CustomerInput = {
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
  notes?: string;
  github_url?: string | null;
  hosting_provider?: string | null;
  live_url?: string | null;
  first_engaged_at?: string | null;
  status?: CustomerStatus;
};

export async function createCustomer(input: CustomerInput): Promise<CustomerRecord> {
  const base = slugify(input.company_name);
  const slug = base || `customer-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("customer_records")
    .insert({
      slug,
      company_name: input.company_name,
      contact_name: input.contact_name ?? "",
      contact_email: input.contact_email ?? "",
      contact_phone: input.contact_phone ?? "",
      industry: input.industry ?? "",
      notes: input.notes ?? "",
      github_url: input.github_url || null,
      hosting_provider: input.hosting_provider || null,
      live_url: input.live_url || null,
      first_engaged_at: input.first_engaged_at || null,
      status: input.status ?? "active",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as CustomerRecord;
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<CustomerRecord> {
  const { data, error } = await supabase
    .from("customer_records")
    .update({
      company_name: input.company_name,
      contact_name: input.contact_name ?? "",
      contact_email: input.contact_email ?? "",
      contact_phone: input.contact_phone ?? "",
      industry: input.industry ?? "",
      notes: input.notes ?? "",
      github_url: input.github_url || null,
      hosting_provider: input.hosting_provider || null,
      live_url: input.live_url || null,
      first_engaged_at: input.first_engaged_at || null,
      status: input.status ?? "active",
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as CustomerRecord;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from("customer_records").delete().eq("id", id);
  if (error) throw error;
}

// ── Nested artifact creates ────────────────────────────────────

export interface NewProjectInput {
  customer_record_id: string;
  name: string;
  description?: string;
  phase?: "audit" | "blueprint" | "sprint" | "launch";
  phase_progress?: number;
  services?: string[];
  start_date?: string;
  target_launch_date?: string | null;
}

export async function createProjectForCustomer(input: NewProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      customer_record_id: input.customer_record_id,
      name: input.name,
      description: input.description ?? "",
      phase: input.phase ?? "audit",
      phase_progress: input.phase_progress ?? 0,
      services: input.services ?? [],
      start_date: input.start_date ?? new Date().toISOString().slice(0, 10),
      target_launch_date: input.target_launch_date || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Project;
}

export interface NewInvoiceInput {
  customer_record_id: string;
  invoice_number: string;
  amount: number;
  currency?: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  description?: string;
  due_date: string;
  payment_method?: string;
  invoice_file_url?: string | null;
}

export async function createInvoiceForCustomer(input: NewInvoiceInput): Promise<Invoice> {
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      customer_record_id: input.customer_record_id,
      invoice_number: input.invoice_number,
      amount: input.amount,
      currency: input.currency ?? "MYR",
      status: input.status ?? "draft",
      description: input.description ?? "",
      due_date: input.due_date,
      payment_method: input.payment_method ?? "",
      invoice_file_url: input.invoice_file_url || null,
    })
    .select("*")
    .single();

  if (error) throw error;

  // Auto-create a follow-up event in the planner 14 days out.
  // Silent-fail — don't break invoice creation if the planner insert errors.
  try {
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + 14);
    await supabase.from("planner_events").insert({
      title: `Follow up on ${input.invoice_number}`,
      event_date: followUp.toISOString().slice(0, 10),
      type: "invoice",
      priority: "med",
      notes: `Auto-created from invoice ${input.invoice_number} · ${input.currency ?? "MYR"} ${input.amount}`,
      linked_entity_type: "invoice",
      linked_entity_id: (data as Invoice).id,
    });
  } catch (err) {
    console.error("[planner] invoice auto-create failed:", err);
  }

  return data as Invoice;
}

export interface NewDocumentInput {
  customer_record_id: string;
  name: string;
  type?: "nda" | "service_agreement" | "proposal" | "other";
  file_url: string;
  status?: "pending" | "signed" | "expired";
}

export async function createDocumentForCustomer(input: NewDocumentInput): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      customer_record_id: input.customer_record_id,
      name: input.name,
      type: input.type ?? "other",
      file_url: input.file_url,
      status: input.status ?? "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Document;
}

import { deleteCustomerFile } from "./storage";

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteInvoice(id: string): Promise<void> {
  // Clean up attached invoice + receipt files before deleting the row
  const { data: row } = await supabase
    .from("invoices")
    .select("invoice_file_url, receipt_url")
    .eq("id", id)
    .maybeSingle();
  if (row?.invoice_file_url) await deleteCustomerFile(row.invoice_file_url as string);
  if (row?.receipt_url) await deleteCustomerFile(row.receipt_url as string);

  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteDocument(id: string): Promise<void> {
  const { data: row } = await supabase
    .from("documents")
    .select("file_url")
    .eq("id", id)
    .maybeSingle();
  if (row?.file_url) await deleteCustomerFile(row.file_url as string);

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

export async function markInvoicePaid(id: string, receiptUrl?: string): Promise<void> {
  const update: Record<string, unknown> = {
    status: "paid",
    paid_at: new Date().toISOString(),
  };
  if (receiptUrl) update.receipt_url = receiptUrl;
  const { error } = await supabase.from("invoices").update(update).eq("id", id);
  if (error) throw error;
}

export async function attachReceipt(id: string, receiptUrl: string): Promise<void> {
  // Replace existing receipt file if any
  const { data: row } = await supabase
    .from("invoices")
    .select("receipt_url, status, paid_at")
    .eq("id", id)
    .maybeSingle();
  if (row?.receipt_url && row.receipt_url !== receiptUrl) {
    await deleteCustomerFile(row.receipt_url as string);
  }
  const update: Record<string, unknown> = { receipt_url: receiptUrl };
  // If the invoice isn't marked paid yet, mark it now
  if (row?.status !== "paid") {
    update.status = "paid";
    update.paid_at = new Date().toISOString();
  }
  const { error } = await supabase.from("invoices").update(update).eq("id", id);
  if (error) throw error;
}
