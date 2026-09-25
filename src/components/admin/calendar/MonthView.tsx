'use client';

import { cn } from '@/lib/utils';
import {
  KIND_BY_KEY,
  WEEKDAY_SHORT,
  dateKeyOf,
  formatClock,
  minutesOf,
  monthGrid,
  parseKey,
  type CalEvent,
} from '@/lib/admin/calendar';

const MAX_CHIPS = 3;

export function MonthView({
  year,
  month,
  byDay,
  today,
  onCreateDay,
  onOpen,
  onOpenDay,
  onDropOnDay,
}: {
  year: number;
  month: number;
  byDay: Map<string, CalEvent[]>;
  today: string;
  onCreateDay: (key: string) => void;
  onOpen: (id: string) => void;
  onOpenDay: (key: string) => void;
  onDropOnDay: (id: string, key: string) => void;
}) {
  const cells = monthGrid(year, month);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-7 border-b border-white/[0.12]">
        {WEEKDAY_SHORT.map((d) => (
          <p
            key={d}
            className="py-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/40"
          >
            {d}
          </p>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6" data-lenis-prevent>
        {cells.map((key) => {
          const { d, m } = parseKey(key);
          const inMonth = m === month;
          const list = byDay.get(key) ?? [];
          const isToday = key === today;
          return (
            <div
              key={key}
              onClick={(e) => e.target === e.currentTarget && onCreateDay(key)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData('text/plain');
                if (id) onDropOnDay(id, key);
              }}
              className={cn(
                'min-h-[72px] min-w-0 cursor-cell overflow-hidden border-b border-l border-white/[0.12] p-1 sm:min-h-[96px] sm:p-1.5',
                !inMonth && 'bg-black/25',
                isToday && 'bg-[#5EE3DA]/[0.04]',
              )}
            >
              <div className="pointer-events-none flex justify-center sm:justify-start">
                <span
                  className={cn(
                    'grid h-6 min-w-6 place-items-center rounded-full px-1 text-[12px] font-medium',
                    isToday
                      ? 'bg-[#5EE3DA] font-semibold text-[#02040A]'
                      : inMonth
                        ? 'text-white/80'
                        : 'text-white/30',
                  )}
                >
                  {d}
                </span>
              </div>

              {/* Desktop: chips */}
              <div className="mt-1 hidden space-y-0.5 sm:block">
                {list.slice(0, MAX_CHIPS).map((ev) => {
                  const kind = KIND_BY_KEY[ev.kind];
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', ev.id)}
                      onClick={() => onOpen(ev.id)}
                      className={cn(
                        'flex w-full items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 text-left text-[11px] text-white/90 outline-none hover:brightness-125 focus-visible:ring-1 focus-visible:ring-white/50',
                        ev.status !== 'scheduled' && 'opacity-50',
                      )}
                      style={{ background: `${kind.color}22` }}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: kind.color }} />
                      <span className="shrink-0 font-mono text-[10px] text-white/50">
                        {formatClock(minutesOf(ev.starts_at))}
                      </span>
                      <span className={cn('truncate', ev.status === 'cancelled' && 'line-through')}>
                        {ev.title}
                      </span>
                    </button>
                  );
                })}
                {list.length > MAX_CHIPS && (
                  <button
                    type="button"
                    onClick={() => onOpenDay(key)}
                    className="px-1.5 text-[11px] text-white/50 hover:text-white"
                  >
                    +{list.length - MAX_CHIPS} more
                  </button>
                )}
              </div>

              {/* Phone: dots */}
              {list.length > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenDay(key)}
                  aria-label={`${list.length} events`}
                  className="mt-1 flex w-full flex-wrap justify-center gap-0.5 sm:hidden"
                >
                  {list.slice(0, 4).map((ev) => (
                    <span
                      key={ev.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: KIND_BY_KEY[ev.kind].color }}
                    />
                  ))}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const keyOfEvent = (ev: CalEvent) => dateKeyOf(ev.starts_at);
