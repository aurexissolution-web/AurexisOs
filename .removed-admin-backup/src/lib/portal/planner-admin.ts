"use client";

import { supabase } from "@/lib/supabase/client";
import type {
  PlannerEvent,
  PlannerEventType,
  PlannerEventStatus,
  PlannerEventPriority,
  PlannerLinkedEntityType,
} from "@/types/portal";

export interface PlannerEventInput {
  title: string;
  event_date: string;
  event_time?: string | null;
  duration_minutes?: number | null;
  type: PlannerEventType;
  notes?: string;
  status?: PlannerEventStatus;
  priority?: PlannerEventPriority;
  linked_entity_type?: PlannerLinkedEntityType | null;
  linked_entity_id?: string | null;
}

export async function listEventsBetween(
  startISO: string,
  endISO: string,
): Promise<PlannerEvent[]> {
  const { data, error } = await supabase
    .from("planner_events")
    .select("*")
    .gte("event_date", startISO)
    .lte("event_date", endISO)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []) as PlannerEvent[];
}

export async function createEvent(input: PlannerEventInput): Promise<PlannerEvent> {
  const payload = {
    title: input.title,
    event_date: input.event_date,
    event_time: input.event_time ?? null,
    duration_minutes: input.duration_minutes ?? null,
    type: input.type,
    notes: input.notes ?? "",
    status: input.status ?? "pending",
    priority: input.priority ?? "med",
    linked_entity_type: input.linked_entity_type ?? null,
    linked_entity_id: input.linked_entity_id ?? null,
  };
  const { data, error } = await supabase
    .from("planner_events")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as PlannerEvent;
}

export async function updateEvent(
  id: string,
  input: Partial<PlannerEventInput>,
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.event_date !== undefined) update.event_date = input.event_date;
  if (input.event_time !== undefined) update.event_time = input.event_time;
  if (input.duration_minutes !== undefined) update.duration_minutes = input.duration_minutes;
  if (input.type !== undefined) update.type = input.type;
  if (input.notes !== undefined) update.notes = input.notes;
  if (input.status !== undefined) update.status = input.status;
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.linked_entity_type !== undefined) update.linked_entity_type = input.linked_entity_type;
  if (input.linked_entity_id !== undefined) update.linked_entity_id = input.linked_entity_id;

  const { error } = await supabase
    .from("planner_events")
    .update(update)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("planner_events").delete().eq("id", id);
  if (error) throw error;
}

export async function setEventStatus(
  id: string,
  status: PlannerEventStatus,
): Promise<void> {
  const { error } = await supabase
    .from("planner_events")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

// ── Linked-entity picker data ──────────────────────────────────
export interface LinkedEntityOption {
  type: PlannerLinkedEntityType;
  id: string;
  label: string;
  sub?: string;
}

export async function fetchLinkedEntityOptions(): Promise<LinkedEntityOption[]> {
  const [customersRes, projectsRes, blogRes, msgRes, invRes] = await Promise.all([
    supabase.from("customer_records").select("id, company_name").order("created_at", { ascending: false }).limit(100),
    supabase.from("projects").select("id, name").order("created_at", { ascending: false }).limit(100),
    supabase.from("blog_posts").select("id, title, published").order("created_at", { ascending: false }).limit(100),
    supabase.from("contact_messages").select("id, name, intent").order("created_at", { ascending: false }).limit(50),
    supabase.from("invoices").select("id, invoice_number, status").order("created_at", { ascending: false }).limit(100),
  ]);

  const out: LinkedEntityOption[] = [];
  for (const c of customersRes.data ?? []) {
    out.push({ type: "customer", id: c.id as string, label: c.company_name as string, sub: "customer" });
  }
  for (const p of projectsRes.data ?? []) {
    out.push({ type: "project", id: p.id as string, label: p.name as string, sub: "project" });
  }
  for (const b of blogRes.data ?? []) {
    out.push({
      type: "blog_post",
      id: b.id as string,
      label: b.title as string,
      sub: (b.published as boolean) ? "blog · published" : "blog · draft",
    });
  }
  for (const m of msgRes.data ?? []) {
    out.push({ type: "contact_message", id: m.id as string, label: m.name as string, sub: `message · ${m.intent}` });
  }
  for (const i of invRes.data ?? []) {
    out.push({ type: "invoice", id: i.id as string, label: i.invoice_number as string, sub: `invoice · ${i.status}` });
  }
  return out;
}
