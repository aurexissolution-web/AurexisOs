"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PLANNER_EVENT_TYPE_META,
  type PlannerEvent,
  type PlannerEventPriority,
  type PlannerEventType,
} from "@/types/portal";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  setEventStatus,
  type PlannerEventInput,
} from "@/lib/portal/planner-admin";
import { LinkedEntityPicker } from "./LinkedEntityPicker";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
  fontSize: 13,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "white",
  width: "100%",
  outline: "none",
};

const TYPES: PlannerEventType[] = ["blog", "task", "meeting", "invoice", "launch", "other"];
const PRIORITIES: PlannerEventPriority[] = ["low", "med", "high"];

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialDate?: string;
  event?: PlannerEvent | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EventModal({ open, mode, initialDate, event, onClose, onSaved }: Props) {
  const [form, setForm] = useState<PlannerEventInput>(() => makeBlank(initialDate));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && event) {
      setForm({
        title: event.title,
        event_date: event.event_date,
        event_time: event.event_time,
        duration_minutes: event.duration_minutes,
        type: event.type,
        notes: event.notes,
        status: event.status,
        priority: event.priority,
        linked_entity_type: event.linked_entity_type,
        linked_entity_id: event.linked_entity_id,
      });
    } else {
      setForm(makeBlank(initialDate));
    }
    setError(null);
  }, [open, mode, event, initialDate]);

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.event_date) {
      setError("Date is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (mode === "edit" && event) {
        await updateEvent(event.id, form);
      } else {
        await createEvent(form);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm("Delete this event?")) return;
    setSaving(true);
    try {
      await deleteEvent(event.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkDone() {
    if (!event) return;
    setSaving(true);
    try {
      await setEventStatus(event.id, event.status === "done" ? "pending" : "done");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-[560px] rounded-2xl border border-white/[0.10] bg-[#0A0A0C] p-6 max-h-[90vh] overflow-y-auto"
              data-lenis-prevent
            >
              <div className="mb-5 flex items-baseline justify-between">
                <h2
                  className="leading-none"
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 30,
                    color: "white",
                    margin: 0,
                  }}
                >
                  {mode === "edit" ? "Edit event." : "New event."}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white/40 hover:text-white"
                  style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em" }}
                >
                  ESC
                </button>
              </div>

              <div className="space-y-3">
                <Label>Title</Label>
                <input
                  autoFocus={mode === "create"}
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="What needs to happen?"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date</Label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={form.event_date}
                      onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Time (optional)</Label>
                    <input
                      type="time"
                      style={inputStyle}
                      value={form.event_time ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, event_time: e.target.value || null })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Type</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {TYPES.map((t) => {
                      const meta = PLANNER_EVENT_TYPE_META[t];
                      const active = form.type === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, type: t })}
                          className="rounded-md px-2.5 py-1.5 transition-all"
                          style={{
                            fontFamily: MONO,
                            fontSize: 10.5,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            background: active ? meta.bg : "rgba(255,255,255,0.02)",
                            border: `1px solid ${active ? meta.border : "rgba(255,255,255,0.08)"}`,
                            color: active ? meta.color : "rgba(255,255,255,0.45)",
                          }}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Priority</Label>
                  <div className="flex gap-1.5">
                    {PRIORITIES.map((p) => {
                      const active = form.priority === p;
                      const color =
                        p === "high" ? "#F87171" : p === "med" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.50)";
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, priority: p })}
                          className="rounded-md px-3 py-1.5 transition-all"
                          style={{
                            fontFamily: MONO,
                            fontSize: 10.5,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            background: active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${active ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)"}`,
                            color: active ? color : "rgba(255,255,255,0.40)",
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Link to record</Label>
                  <LinkedEntityPicker
                    type={form.linked_entity_type ?? null}
                    id={form.linked_entity_id ?? null}
                    onChange={(type, id) =>
                      setForm({ ...form, linked_entity_type: type, linked_entity_id: id })
                    }
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                    value={form.notes ?? ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Prep notes, links, context…"
                  />
                </div>
              </div>

              {error && (
                <p
                  className="mt-3"
                  style={{ fontFamily: MONO, fontSize: 11, color: "#F87171" }}
                >
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="rounded-md bg-[#00F0FF] px-4 py-2 text-[12px] font-semibold text-black hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create event"}
                </button>
                {mode === "edit" && event && (
                  <>
                    <button
                      type="button"
                      onClick={handleMarkDone}
                      disabled={saving}
                      className="rounded-md border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-2 text-[11px] font-medium text-[#10B981] hover:bg-[#10B981]/20"
                      style={{ fontFamily: MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}
                    >
                      ✓ {event.status === "done" ? "Re-open" : "Mark done"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="ml-auto rounded-md text-[11px] font-medium text-red-400/70 hover:text-red-400"
                      style={{ fontFamily: MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}
                    >
                      Delete
                    </button>
                  </>
                )}
                {mode === "create" && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-white/[0.08] px-4 py-2 text-[12px] font-medium text-white/60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-1.5"
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: "0.20em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.40)",
      }}
    >
      {children}
    </p>
  );
}

function makeBlank(initialDate?: string): PlannerEventInput {
  return {
    title: "",
    event_date: initialDate ?? new Date().toISOString().slice(0, 10),
    event_time: null,
    duration_minutes: null,
    type: "task",
    notes: "",
    status: "pending",
    priority: "med",
    linked_entity_type: null,
    linked_entity_id: null,
  };
}
