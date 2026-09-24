"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PlannerEvent } from "@/types/portal";
import { EventChip } from "./EventChip";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface Props {
  weekStart: Date;
  onWeekStartChange: (d: Date) => void;
  events: PlannerEvent[];
  onSelectDay: (iso: string) => void;
  onSelectEvent: (e: PlannerEvent) => void;
}

export function WeekAgenda({ weekStart, onWeekStartChange, events, onSelectDay, onSelectEvent }: Props) {
  const days = useMemo(() => {
    const out: { date: Date; iso: string; events: PlannerEvent[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const iso = toISO(d);
      out.push({ date: d, iso, events: events.filter((e) => e.event_date === iso) });
    }
    return out;
  }, [weekStart, events]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const weekLabel = `${weekStart.toLocaleDateString("en-MY", { month: "short", day: "numeric" })} — ${new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6).toLocaleDateString("en-MY", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 24,
            color: "white",
            margin: 0,
          }}
        >
          {weekLabel}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onWeekStartChange(addDays(weekStart, -7))}
            className="rounded-md border border-white/[0.08] p-1.5 text-white/50 hover:text-white hover:bg-white/[0.04]"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onWeekStartChange(startOfWeek(new Date()))}
            className="rounded-md border border-white/[0.08] px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/[0.04]"
            style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => onWeekStartChange(addDays(weekStart, 7))}
            className="rounded-md border border-white/[0.08] p-1.5 text-white/50 hover:text-white hover:bg-white/[0.04]"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ul className="divide-y divide-white/[0.04]">
        {days.map(({ date, iso, events: dayEvents }) => {
          const isToday = iso === todayISO;
          const isPast = iso < todayISO;
          const weekday = date.toLocaleDateString("en-MY", { weekday: "short" });
          const dayNum = date.getDate();
          return (
            <li key={iso} className="flex gap-5 p-5" style={{ opacity: isPast && !isToday ? 0.55 : 1 }}>
              <button
                type="button"
                onClick={() => onSelectDay(iso)}
                className="shrink-0 text-left group"
                style={{ width: 70 }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    color: isToday ? "#00F0FF" : "rgba(255,255,255,0.40)",
                  }}
                >
                  {weekday}
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 36,
                    lineHeight: 1,
                    color: isToday ? "#00F0FF" : "rgba(255,255,255,0.85)",
                    marginTop: 4,
                  }}
                >
                  {dayNum}
                </div>
              </button>

              <div className="flex-1 min-w-0 space-y-1.5">
                {dayEvents.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onSelectDay(iso)}
                    className="text-left rounded-md border border-dashed border-white/[0.06] px-3 py-2 hover:border-white/[0.12] w-full"
                    style={{
                      fontFamily: MONO,
                      fontSize: 10.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    Nothing scheduled · click to add
                  </button>
                ) : (
                  dayEvents.map((ev) => (
                    <div key={ev.id} onClick={() => onSelectEvent(ev)}>
                      <EventChip event={ev} />
                    </div>
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const offset = (out.getDay() + 6) % 7; // Monday-first
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
