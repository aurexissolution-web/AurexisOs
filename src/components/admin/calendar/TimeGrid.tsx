'use client';

// Week / day view: an hour grid where you click or drag empty space to create,
// drag an event to move it (across days too), and drag its bottom edge to resize.
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  KIND_BY_KEY,
  WEEKDAY_SHORT,
  dateKeyOf,
  defaultEnd,
  formatClock,
  fromMyt,
  layoutDay,
  minutesOf,
  parseKey,
  snap,
  weekdayIndex,
  type CalEvent,
} from '@/lib/admin/calendar';

const HOUR_H = 52;
const MIN_PX = HOUR_H / 60;
const GUTTER = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type Drag =
  | { kind: 'move' | 'resize'; id: string; x0: number; y0: number; s0: number; e0: number; moved: boolean }
  | null;

export function TimeGrid({
  days,
  events,
  nowMs,
  today,
  onCreate,
  onOpen,
  onMove,
}: {
  days: string[];
  events: CalEvent[];
  nowMs: number;
  today: string;
  onCreate: (startsAt: string, endsAt: string) => void;
  onOpen: (id: string) => void;
  onMove: (id: string, startsAt: string, endsAt: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<{ key: string; a: number; b: number } | null>(null);
  const [ghost, setGhost] = useState<{ id: string; s: number; e: number } | null>(null);
  const drag = useRef<Drag>(null);
  const ghostRef = useRef<{ id: string; s: number; e: number } | null>(null);

  // Open near the current time (or 8 am on other days) so events are in view.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const nowMin = days.includes(today) ? minutesOf(new Date(nowMs).toISOString()) : 8 * 60;
    el.scrollTop = Math.max(0, (nowMin - 90) * MIN_PX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days.join(',')]);

  const columns = useMemo(
    () =>
      days.map((key) => {
        const dayStart = new Date(fromMyt(key, 0)).getTime();
        const dayEnd = dayStart + 24 * 60 * 60_000;
        const items = events
          .map((ev) => {
            const s = new Date(ev.starts_at).getTime();
            const e = new Date(ev.ends_at).getTime();
            if (s >= dayEnd || e <= dayStart) return null;
            return {
              ev,
              id: ev.id,
              s: (Math.max(s, dayStart) - dayStart) / 60_000,
              e: (Math.min(e, dayEnd) - dayStart) / 60_000,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        return { key, items: layoutDay(items) };
      }),
    [days, events],
  );

  const yToMin = (clientY: number, el: HTMLElement) =>
    Math.min(24 * 60, Math.max(0, (clientY - el.getBoundingClientRect().top) / MIN_PX));

  // ── Create by click / drag on empty space ────────────────────────────────
  function startCreate(e: React.PointerEvent<HTMLDivElement>, key: string) {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    const col = e.currentTarget;
    const a = snap(yToMin(e.clientY, col));
    let b = a;
    setSel({ key, a, b });
    const move = (ev: PointerEvent) => {
      b = snap(yToMin(ev.clientY, col));
      setSel({ key, a, b });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setSel(null);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const start = Math.min(lo, 24 * 60 - 15);
      const end = hi - lo >= 15 ? hi : Math.min(defaultEnd('meeting', start), 24 * 60);
      onCreate(fromMyt(key, start), fromMyt(key, end));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  // ── Move / resize an event ───────────────────────────────────────────────
  function startDrag(e: React.PointerEvent, ev: CalEvent, kind: 'move' | 'resize') {
    if (e.button !== 0) return;
    e.stopPropagation();
    const s0 = new Date(ev.starts_at).getTime();
    const e0 = new Date(ev.ends_at).getTime();
    drag.current = { kind, id: ev.id, x0: e.clientX, y0: e.clientY, s0, e0, moved: false };
    const colW = body.current ? (body.current.clientWidth - GUTTER) / days.length : 1;

    const move = (p: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = p.clientX - d.x0;
      const dy = p.clientY - d.y0;
      if (!d.moved && Math.hypot(dx, dy) < 4) return;
      d.moved = true;
      const dMin = snap(dy / MIN_PX);
      let next: { id: string; s: number; e: number };
      if (d.kind === 'move') {
        const dDays = days.length > 1 ? Math.round(dx / colW) : 0;
        const shift = dDays * 24 * 60 + dMin;
        next = { id: d.id, s: d.s0 + shift * 60_000, e: d.e0 + shift * 60_000 };
      } else {
        next = { id: d.id, s: d.s0, e: Math.max(d.s0 + 15 * 60_000, d.e0 + dMin * 60_000) };
      }
      ghostRef.current = next;
      setGhost(next);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const d = drag.current;
      const g = ghostRef.current;
      drag.current = null;
      ghostRef.current = null;
      setGhost(null);
      if (!d) return;
      if (!d.moved) onOpen(d.id);
      else if (g) onMove(d.id, new Date(g.s).toISOString(), new Date(g.e).toISOString());
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  const nowMin = minutesOf(new Date(nowMs).toISOString());

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Day headers */}
      <div className="flex border-b border-white/[0.12] pr-[11px]" style={{ paddingLeft: GUTTER }}>
        {days.map((key) => {
          const { d } = parseKey(key);
          const isToday = key === today;
          return (
            <div key={key} className="min-w-0 flex-1 py-2.5 text-center">
              <p
                className={cn(
                  'font-mono text-[10px] uppercase tracking-[0.16em]',
                  isToday ? 'text-[#5EE3DA]' : 'text-white/40',
                )}
              >
                {WEEKDAY_SHORT[weekdayIndex(key)]}
              </p>
              <span
                className={cn(
                  'mt-1 inline-grid h-8 w-8 place-items-center rounded-full text-[15px] font-semibold',
                  isToday ? 'bg-[#5EE3DA] text-[#02040A]' : 'text-white/85',
                )}
              >
                {d}
              </span>
            </div>
          );
        })}
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto" data-lenis-prevent>
        <div ref={body} className="relative flex" style={{ height: 24 * HOUR_H }}>
          {/* Hour labels */}
          <div className="relative shrink-0" style={{ width: GUTTER }}>
            {HOURS.slice(1).map((h) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 font-mono text-[10px] text-white/35"
                style={{ top: h * HOUR_H }}
              >
                {formatClock(h * 60)}
              </span>
            ))}
          </div>

          {columns.map((col) => (
            <div
              key={col.key}
              onPointerDown={(e) => startCreate(e, col.key)}
              className={cn(
                'relative min-w-0 flex-1 cursor-cell border-l border-white/[0.12] touch-pan-y',
                col.key === today && 'bg-[#5EE3DA]/[0.025]',
              )}
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_H - 1}px, rgba(255,255,255,0.13) ${HOUR_H - 1}px, rgba(255,255,255,0.13) ${HOUR_H}px)`,
              }}
            >
              {sel && sel.key === col.key && (
                <div
                  className="pointer-events-none absolute inset-x-1 rounded-lg border border-[#5EE3DA]/60 bg-[#5EE3DA]/20"
                  style={{
                    top: Math.min(sel.a, sel.b) * MIN_PX,
                    height: Math.max(15, Math.abs(sel.b - sel.a)) * MIN_PX,
                  }}
                />
              )}

              {col.items.map((it) => {
                const ev = it.ev;
                const g = ghost?.id === ev.id ? ghost : null;
                let s = it.s;
                let e = it.e;
                let left = (it.col / it.cols) * 100;
                let width = 100 / it.cols;
                if (g) {
                  const dayStart = new Date(fromMyt(col.key, 0)).getTime();
                  // The dragged event is drawn only in the column it now lands in.
                  if (dateKeyOf(new Date(g.s).toISOString()) !== col.key) return null;
                  s = (g.s - dayStart) / 60_000;
                  e = Math.min(24 * 60, (g.e - dayStart) / 60_000);
                  left = 0;
                  width = 100;
                }
                const kind = KIND_BY_KEY[ev.kind];
                const h = Math.max(18, (e - s) * MIN_PX - 2);
                return (
                  <div
                    key={ev.id}
                    onPointerDown={(p) => startDrag(p, ev, 'move')}
                    className={cn(
                      'group absolute cursor-grab select-none overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left shadow-[0_2px_10px_rgba(0,0,0,0.35)] active:cursor-grabbing',
                      ev.status !== 'scheduled' && 'opacity-50',
                      g && 'z-20 ring-1 ring-white/40',
                    )}
                    style={{
                      top: s * MIN_PX + 1,
                      height: h,
                      left: `calc(${left}% + 2px)`,
                      width: `calc(${width}% - 4px)`,
                      background: `${kind.color}26`,
                      borderLeftColor: kind.color,
                    }}
                  >
                    <p
                      className={cn(
                        'truncate text-[12px] font-semibold leading-tight text-white',
                        ev.status === 'cancelled' && 'line-through',
                      )}
                    >
                      {ev.title}
                    </p>
                    {h >= 34 && (
                      <p className="mt-0.5 truncate text-[10.5px] text-white/60">
                        {formatClock(Math.round(s))} – {formatClock(Math.round(e))}
                        {ev.location && ` · ${ev.location}`}
                      </p>
                    )}
                    <span
                      onPointerDown={(p) => startDrag(p, ev, 'resize')}
                      className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                      aria-hidden
                    />
                  </div>
                );
              })}

              {col.key === today && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                  style={{ top: nowMin * MIN_PX }}
                >
                  <span className="-ml-1 h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-px flex-1 bg-red-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
