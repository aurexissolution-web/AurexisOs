"use client";

import { PLANNER_EVENT_TYPE_META, type PlannerEvent } from "@/types/portal";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface Props {
  event: PlannerEvent;
  onClick?: () => void;
  compact?: boolean;
}

export function EventChip({ event, onClick, compact }: Props) {
  const meta = PLANNER_EVENT_TYPE_META[event.type];
  const isDone = event.status === "done";
  const isCancelled = event.status === "cancelled";
  const faded = isDone || isCancelled;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full flex items-center gap-1.5 rounded-md text-left transition-all hover:brightness-125"
      style={{
        padding: compact ? "2px 6px" : "4px 8px",
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        opacity: faded ? 0.45 : 1,
      }}
      title={event.title}
    >
      <span
        aria-hidden
        className="shrink-0 rounded-full"
        style={{
          width: 6,
          height: 6,
          background: meta.color,
          boxShadow: `0 0 6px ${meta.color}80`,
        }}
      />
      {event.event_time && !compact && (
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.04em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {event.event_time.slice(0, 5)}
        </span>
      )}
      <span
        className="truncate"
        style={{
          fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
          fontSize: compact ? 10.5 : 12,
          color: "rgba(255,255,255,0.92)",
          textDecoration: isDone ? "line-through" : "none",
          flex: 1,
          minWidth: 0,
        }}
      >
        {event.title}
      </span>
      {event.priority === "high" && !faded && (
        <span
          aria-hidden
          style={{
            fontFamily: MONO,
            fontSize: 9,
            color: "#F87171",
          }}
        >
          !
        </span>
      )}
    </button>
  );
}
