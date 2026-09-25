'use client';

import { CalendarDays, MapPin, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  KIND_BY_KEY,
  MONTH_NAMES,
  WEEKDAY_SHORT,
  addDays,
  dateKeyOf,
  formatClock,
  minutesOf,
  parseKey,
  weekdayIndex,
  type CalEvent,
} from '@/lib/admin/calendar';
import { EmptyState } from '../ui';

export function AgendaView({
  from,
  days,
  events,
  today,
  onOpen,
}: {
  from: string;
  days: number;
  events: CalEvent[];
  today: string;
  onOpen: (id: string) => void;
}) {
  const keys = Array.from({ length: days }, (_, i) => addDays(from, i));
  const grouped = keys
    .map((key) => ({
      key,
      list: events
        .filter((e) => dateKeyOf(e.starts_at) === key)
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    }))
    .filter((g) => g.list.length);

  if (!grouped.length)
    return (
      <EmptyState
        icon={<CalendarDays className="h-5 w-5" />}
        title="Nothing scheduled"
        body="No events in this stretch. Click Create, or press C, to add a meeting."
      />
    );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto" data-lenis-prevent>
      {grouped.map(({ key, list }) => {
        const { d, m } = parseKey(key);
        const isToday = key === today;
        return (
          <section key={key} className="flex gap-4 border-b border-white/[0.12] px-4 py-3.5 sm:px-6">
            <div className="w-14 shrink-0 text-center">
              <p className={cn('font-mono text-[10px] uppercase tracking-[0.16em]', isToday ? 'text-[#5EE3DA]' : 'text-white/40')}>
                {WEEKDAY_SHORT[weekdayIndex(key)]}
              </p>
              <p className={cn('text-[22px] font-semibold leading-tight', isToday ? 'text-[#5EE3DA]' : 'text-white')}>{d}</p>
              <p className="text-[10.5px] text-white/35">{MONTH_NAMES[m].slice(0, 3)}</p>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {list.map((ev) => {
                const kind = KIND_BY_KEY[ev.kind];
                return (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(ev.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border-l-[3px] px-3 py-2.5 text-left outline-none transition-colors hover:brightness-125 focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/50',
                        ev.status !== 'scheduled' && 'opacity-50',
                      )}
                      style={{ background: `${kind.color}18`, borderLeftColor: kind.color }}
                    >
                      <span className="w-[74px] shrink-0 font-mono text-[11px] text-white/60">
                        {formatClock(minutesOf(ev.starts_at))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate text-[13.5px] font-semibold text-white', ev.status === 'cancelled' && 'line-through')}>
                          {ev.title}
                        </span>
                        {(ev.attendee || ev.location || ev.meeting_url) && (
                          <span className="mt-0.5 flex items-center gap-2 truncate text-[11.5px] text-white/50">
                            {ev.attendee && <span className="truncate">{ev.attendee}</span>}
                            {ev.meeting_url ? (
                              <Video className="h-3 w-3 shrink-0" />
                            ) : (
                              ev.location && <MapPin className="h-3 w-3 shrink-0" />
                            )}
                            {ev.location && <span className="truncate">{ev.location}</span>}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
