"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { listEventsBetween } from "@/lib/portal/planner-admin";
import type { PlannerEvent } from "@/types/portal";
import { ViewSwitcher, type PlannerView } from "@/components/portal/planner/ViewSwitcher";
import { MonthGrid } from "@/components/portal/planner/MonthGrid";
import { WeekAgenda } from "@/components/portal/planner/WeekAgenda";
import { EventModal } from "@/components/portal/planner/EventModal";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const easeOut = [0.16, 1, 0.3, 1] as const;

export default function PlannerPage() {
  const [view, setView] = useState<PlannerView>("month");
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date());
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalDate, setModalDate] = useState<string | undefined>();
  const [modalEvent, setModalEvent] = useState<PlannerEvent | null>(null);

  const range = useMemo(() => {
    if (view === "month") {
      const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
      const offset = (first.getDay() + 6) % 7;
      const start = new Date(first);
      start.setDate(1 - offset);
      const end = new Date(start);
      end.setDate(start.getDate() + 41);
      return { start: toISO(start), end: toISO(end) };
    } else {
      const end = new Date(weekStart);
      end.setDate(weekStart.getDate() + 6);
      return { start: toISO(weekStart), end: toISO(end) };
    }
  }, [view, monthCursor, weekStart]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listEventsBetween(range.start, range.end);
      setEvents(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate(dateISO?: string) {
    setModalMode("create");
    setModalDate(dateISO);
    setModalEvent(null);
    setModalOpen(true);
  }

  function openEdit(ev: PlannerEvent) {
    setModalMode("edit");
    setModalEvent(ev);
    setModalDate(undefined);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6 max-w-[1280px]">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="border-b border-white/[0.06] pb-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1
              className="leading-none tracking-tight"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "clamp(40px, 5vw, 56px)",
                color: "white",
                margin: 0,
              }}
            >
              Planner.
            </h1>
            <p
              className="mt-3"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 16,
                color: "rgba(255,255,255,0.55)",
                margin: 0,
              }}
            >
              Your week in one place — blog deadlines, meetings, follow-ups.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewSwitcher value={view} onChange={setView} />
            <button
              type="button"
              onClick={() => openCreate()}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#00F0FF] px-3.5 py-2 text-[12px] font-semibold text-black hover:brightness-110"
            >
              <Plus className="w-3.5 h-3.5" />
              New event
            </button>
          </div>
        </div>
      </motion.header>

      {error && (
        <p
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 11,
            color: "#F87171",
          }}
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="h-[520px] rounded-2xl border border-white/[0.04] bg-white/[0.01] animate-pulse" />
      ) : view === "month" ? (
        <MonthGrid
          cursor={monthCursor}
          onCursorChange={setMonthCursor}
          events={events}
          onSelectDay={openCreate}
          onSelectEvent={openEdit}
        />
      ) : (
        <WeekAgenda
          weekStart={weekStart}
          onWeekStartChange={setWeekStart}
          events={events}
          onSelectDay={openCreate}
          onSelectEvent={openEdit}
        />
      )}

      <EventModal
        open={modalOpen}
        mode={modalMode}
        initialDate={modalDate}
        event={modalEvent}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const offset = (out.getDay() + 6) % 7;
  out.setDate(out.getDate() - offset);
  out.setHours(0, 0, 0, 0);
  return out;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
