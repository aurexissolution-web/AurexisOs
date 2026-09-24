"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CustomerRecord, CustomerStatus } from "@/types/portal";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type CustomerInput,
} from "@/lib/portal/customer-data";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
  fontSize: 14,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "11px 13px",
  color: "white",
  width: "100%",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 9.5,
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.50)",
  margin: 0,
  marginBottom: 6,
  display: "block",
};

const STATUSES: CustomerStatus[] = ["active", "dormant", "archived"];

interface CustomerFormProps {
  initial?: CustomerRecord;
  mode: "create" | "edit";
}

export function CustomerForm({ initial, mode }: CustomerFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: initial?.company_name ?? "",
    contact_name: initial?.contact_name ?? "",
    contact_email: initial?.contact_email ?? "",
    contact_phone: initial?.contact_phone ?? "",
    industry: initial?.industry ?? "",
    notes: initial?.notes ?? "",
    github_url: initial?.github_url ?? "",
    hosting_provider: initial?.hosting_provider ?? "",
    live_url: initial?.live_url ?? "",
    first_engaged_at: initial?.first_engaged_at ?? "",
    status: initial?.status ?? "active",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim()) {
      setError("Company name is required");
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload: CustomerInput = {
      ...form,
      status: form.status as CustomerStatus,
    };

    try {
      if (mode === "create") {
        const created = await createCustomer(payload);
        router.push(`/portal/admin/customers/${created.slug}`);
        router.refresh();
      } else if (initial) {
        await updateCustomer(initial.id, payload);
        router.push(`/portal/admin/customers/${initial.slug}`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Save failed");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Delete ${initial.company_name}? This cannot be undone. Nested projects/invoices/documents will be unlinked but not deleted.`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteCustomer(initial.id);
      router.push("/portal/admin/customers");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <FormSection title="Identity">
        <Field label="Company Name *">
          <input
            style={inputStyle}
            value={form.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            required
            placeholder="Klinik Aziz Dental"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Industry">
            <input
              style={inputStyle}
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
              placeholder="Dental, SaaS, E-commerce…"
            />
          </Field>
          <Field label="Status">
            <select
              style={inputStyle}
              value={form.status}
              onChange={(e) => update("status", e.target.value as CustomerStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Primary Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contact Name">
            <input
              style={inputStyle}
              value={form.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
              placeholder="Dr. Aziz"
            />
          </Field>
          <Field label="Contact Email">
            <input
              type="email"
              style={inputStyle}
              value={form.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
              placeholder="aziz@clinic.com"
            />
          </Field>
        </div>
        <Field label="Contact Phone">
          <input
            type="tel"
            style={inputStyle}
            value={form.contact_phone}
            onChange={(e) => update("contact_phone", e.target.value)}
            placeholder="+60 12-345 6789"
          />
        </Field>
      </FormSection>

      <FormSection title="Tech Stack & URLs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Live URL">
            <input
              type="url"
              style={inputStyle}
              value={form.live_url}
              onChange={(e) => update("live_url", e.target.value)}
              placeholder="https://aziz-clinic.com"
            />
          </Field>
          <Field label="Hosting Provider">
            <input
              style={inputStyle}
              value={form.hosting_provider}
              onChange={(e) => update("hosting_provider", e.target.value)}
              placeholder="Vercel, Supabase, AWS…"
            />
          </Field>
        </div>
        <Field label="GitHub URL">
          <input
            type="url"
            style={inputStyle}
            value={form.github_url}
            onChange={(e) => update("github_url", e.target.value)}
            placeholder="https://github.com/aurexis/aziz-clinic"
          />
        </Field>
      </FormSection>

      <FormSection title="Engagement">
        <Field label="First Engaged">
          <input
            type="date"
            style={inputStyle}
            value={form.first_engaged_at}
            onChange={(e) => update("first_engaged_at", e.target.value)}
          />
        </Field>
        <Field label="Notes">
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif" }}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Anything worth remembering — preferences, key dates, gotchas…"
          />
        </Field>
      </FormSection>

      {error && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#F87171",
            padding: "10px 14px",
            border: "1px solid rgba(248,113,113,0.20)",
            borderRadius: 8,
            background: "rgba(248,113,113,0.06)",
          }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[#00F0FF] px-5 py-2.5 text-[13px] font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
          style={{ boxShadow: "0 0 24px rgba(0,240,255,0.25)" }}
        >
          {submitting ? "Saving…" : mode === "create" ? "Create customer" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-white/60 hover:bg-white/[0.04]"
        >
          Cancel
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto rounded-md border border-red-500/20 px-5 py-2.5 text-[13px] font-medium text-red-300 hover:bg-red-500/[0.08] disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete customer"}
          </button>
        )}
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
      <legend
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 18,
          color: "white",
          padding: "0 8px",
        }}
      >
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
