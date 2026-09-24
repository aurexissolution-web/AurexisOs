"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PlannerEvent } from "@/types/portal";
import { EventChip } from "./EventChip";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  cursor: Date;
  onCursorChange: (d: Date) => void;
  events: PlannerEvent[];
  onSelectDay: (iso: string) => void;
  onSelectEvent: (e: PlannerEvent) => void;
}

export function MonthGrid({ cursor, onCursorChange, events, onSelectDay, onSelectEvent }: Props) {
  const { cells, monthLabel } = useMemo(() => buildMonth(cursor), [cursor]);

  const byDay = useMemo(() => {
    const m = new Map<string, PlannerEvent[]>();
    for (const e of events) {
      const arr = m.get(e.event_date) ?? [];
      arr.push(e);
      m.set(e.event_date, arr);
    }
    return m;
  }, [events]);

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 26,
            color: "white",
            margin: 0,
          }}
        >
          {monthLabel}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCursorChange(addMonths(cursor, -1))}
            className="rounded-md border border-white/[0.08] p-1.5 text-white/50 hover:text-white hover:bg-white/[0.04]"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onCursorChange(new Date())}
            className="rounded-md border border-white/[0.08] px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/[0.04]"
            style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onCursorChange(addMonths(cursor, 1))}
            className="rounded-md border border-white/[0.08] p-1.5 text-white/50 hover:text-white hover:bg-white/[0.04]"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="px-2 py-2"
            style={{
              fontFamily: MONO,
              fontSize: 9.5,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const dayEvents = byDay.get(cell.iso) ?? [];
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - visible.length;
          const isToday = cell.iso === todayISO;
          const isOtherMonth = !cell.inMonth;
          return (
            <div
              key={cell.iso}
              className="group relative border-b border-r border-white/[0.04] p-1.5 cursor-pointer transition-colors hover:bg-white/[0.025]"
              style={{
                minHeight: 110,
                borderRight: (i + 1) % 7 === 0 ? "none" : undefined,
              }}
              onClick={() => onSelectDay(cell.iso)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={isToday ? "rounded-full" : ""}
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: isOtherMonth
                      ? "rgba(255,255,255,0.18)"
                      : isToday
                        ? "#00F0FF"
                        : "rgba(255,255,255,0.70)",
                    fontVariantNumeric: "tabular-nums",
                    padding: isToday ? "1px 7px" : 0,
                    background: isToday ? "rgba(0,240,255,0.10)" : undefined,
                    border: isToday ? "1px solid rgba(0,240,255,0.35)" : undefined,
                    fontWeight: isToday ? 600 : 400,
                  }}
                >
                  {cell.day}
                </span>
              </div>
              <div className="space-y-1">
                {visible.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(ev);
                    }}
                  >
                    <EventChip event={ev} compact />
                  </div>
                ))}
                {overflow > 0 && (
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: 9.5,
                      color: "rgba(255,255,255,0.40)",
                      letterSpacing: "0.10em",
                      paddingLeft: 2,
                    }}
                  >
                    +{overflow} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

function buildMonth(cursor: Date): { cells: { iso: string; day: number; inMonth: boolean }[]; monthLabel: string } {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  // Monday-first grid: offset = (weekday - 1 + 7) % 7
  const offset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - offset);
  const cells: { iso: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push({
      iso: toISO(d),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    });
  }
  const monthLabel = cursor.toLocaleDateString("en-MY", { month: "long", year: "numeric" });
  return { cells, monthLabel };
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
