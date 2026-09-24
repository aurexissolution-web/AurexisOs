"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { listEventsBetween } from "@/lib/portal/planner-admin";
import {
  PLANNER_EVENT_TYPE_META,
  type PlannerEvent,
} from "@/types/portal";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

export function TodaysAgenda() {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const today = toISO(new Date());
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 6);
    listEventsBetween(today, toISO(weekEnd))
      .then((list) => {
        if (!cancelled) {
          setEvents(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const todayISO = toISO(new Date());
  const todays = useMemo(
    () =>
      events
        .filter((e) => e.event_date === todayISO && e.status !== "cancelled")
        .sort((a, b) => (a.event_time ?? "00:00").localeCompare(b.event_time ?? "00:00")),
    [events, todayISO],
  );

  const weekCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const e of events) {
      if (e.status === "cancelled") continue;
      acc[e.type] = (acc[e.type] ?? 0) + 1;
    }
    return acc;
  }, [events]);

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 lg:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center rounded-md"
            style={{
              width: 28,
              height: 28,
              background: "rgba(0,240,255,0.08)",
              border: "1px solid rgba(0,240,255,0.25)",
            }}
          >
            <CalendarDays className="w-3.5 h-3.5" style={{ color: "#00F0FF" }} />
          </span>
          <h2
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 24,
              color: "white",
              margin: 0,
            }}
          >
            Today.
          </h2>
        </div>
        <Link
          href="/portal/admin/planner"
          className="inline-flex items-center gap-1 text-white/45 hover:text-white"
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Open planner
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Today list */}
        <div>
          {loading ? (
            <div className="h-[120px] rounded-lg border border-white/[0.04] bg-white/[0.01] animate-pulse" />
          ) : todays.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/[0.08] py-8 text-center">
              <p
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 17,
                  color: "rgba(255,255,255,0.40)",
                  margin: 0,
                }}
              >
                Nothing scheduled today.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {todays.map((e) => {
                const meta = PLANNER_EVENT_TYPE_META[e.type];
                const isDone = e.status === "done";
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2.5"
                    style={{ opacity: isDone ? 0.45 : 1 }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: meta.color,
                        boxShadow: `0 0 8px ${meta.color}80`,
                      }}
                    />
                    {e.event_time && (
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 10.5,
                          color: "rgba(255,255,255,0.55)",
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: "0.05em",
                          width: 48,
                        }}
                      >
                        {e.event_time.slice(0, 5)}
                      </span>
                    )}
                    <span
                      className="flex-1 truncate"
                      style={{
                        fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                        fontSize: 13,
                        color: "white",
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {e.title}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: meta.color,
                      }}
                    >
                      {meta.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* This week summary */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-4">
          <p
            className="mb-3"
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.40)",
            }}
          >
            This week
          </p>
          {Object.keys(weekCounts).length === 0 ? (
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 15,
                color: "rgba(255,255,255,0.40)",
                margin: 0,
              }}
            >
              No events queued.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {Object.entries(weekCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const meta = PLANNER_EVENT_TYPE_META[type as keyof typeof PLANNER_EVENT_TYPE_META];
                  return (
                    <li key={type} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: meta.color,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 10.5,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.65)",
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 13,
                          color: "white",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {count}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
