"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Project, ProjectPhase } from "@/types/portal";
import { createProjectForCustomer, deleteProject } from "@/lib/portal/customer-data";
import { PROJECT_PHASES } from "@/types/portal";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
  fontSize: 13,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 6,
  padding: "8px 10px",
  color: "white",
  outline: "none",
  width: "100%",
};

const PHASE_COLORS: Record<ProjectPhase, string> = {
  audit: "#00F0FF",
  blueprint: "#A78BFA",
  sprint: "#F59E0B",
  launch: "#10B981",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

interface CustomerProjectsTabProps {
  customerId: string;
  projects: Project[];
}

export function CustomerProjectsTab({ customerId, projects }: CustomerProjectsTabProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    phase: "audit" as ProjectPhase,
    start_date: new Date().toISOString().slice(0, 10),
    target_launch_date: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createProjectForCustomer({
        customer_record_id: customerId,
        name: form.name,
        description: form.description,
        phase: form.phase,
        start_date: form.start_date,
        target_launch_date: form.target_launch_date || null,
      });
      setForm({ name: "", description: "", phase: "audit", start_date: new Date().toISOString().slice(0, 10), target_launch_date: "" });
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add project");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete project "${name}"?`)) return;
    try {
      await deleteProject(id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            margin: 0,
          }}
        >
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-[#00F0FF] px-4 py-2 text-[12px] font-semibold text-black hover:brightness-110"
            style={{ boxShadow: "0 0 18px rgba(0,240,255,0.20)" }}
          >
            + Add Project
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
        >
          <input
            placeholder="Project name (e.g. Patient Portal v2)"
            style={inputStyle}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
          <textarea
            placeholder="Short description (optional)"
            style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              style={inputStyle}
              value={form.phase}
              onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value as ProjectPhase }))}
            >
              {PROJECT_PHASES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              style={inputStyle}
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            />
            <input
              type="date"
              placeholder="Target launch"
              style={inputStyle}
              value={form.target_launch_date}
              onChange={(e) => setForm((f) => ({ ...f, target_launch_date: e.target.value }))}
            />
          </div>
          {error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#F87171" }}>{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#00F0FF] px-4 py-2 text-[12px] font-semibold text-black disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              className="rounded-md border border-white/[0.08] px-4 py-2 text-[12px] font-medium text-white/60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !adding ? (
        <Empty />
      ) : (
        <ul className="divide-y divide-white/[0.04]">
          {projects.map((p) => {
            const color = PHASE_COLORS[p.phase] ?? "#00F0FF";
            return (
              <li key={p.id} className="group flex items-center gap-4 py-4">
                <div className="flex flex-col items-center gap-1 w-20 shrink-0">
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: color,
                      boxShadow: `0 0 6px ${color}55`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: "0.20em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {p.phase}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate"
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 18,
                      color: "white",
                      margin: 0,
                    }}
                  >
                    {p.name}
                  </p>
                  {p.description && (
                    <p
                      className="truncate"
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: "rgba(255,255,255,0.40)",
                        margin: 0,
                        marginTop: 2,
                      }}
                    >
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-end gap-1 w-32 shrink-0">
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    {formatDate(p.target_launch_date)}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.30)",
                    }}
                  >
                    target launch
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="opacity-0 group-hover:opacity-100 text-red-400/70 hover:text-red-400 text-[11px] transition-opacity"
                  style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.10] py-10 text-center">
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: "rgba(255,255,255,0.40)", margin: 0 }}>
        No projects logged yet
      </p>
    </div>
  );
}
