'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MONTH_NAMES, WEEKDAY_SHORT, monthGrid, parseKey } from '@/lib/admin/calendar';

export function MiniMonth({
  year,
  month,
  cursor,
  today,
  busy,
  onPick,
  onShift,
}: {
  year: number;
  month: number;
  cursor: string;
  today: string;
  busy: Set<string>;
  onPick: (key: string) => void;
  onShift: (delta: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-white">
          {MONTH_NAMES[month]} {year}
        </p>
        <div className="flex">
          <button type="button" onClick={() => onShift(-1)} aria-label="Previous month" className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-white/[0.06] hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onShift(1)} aria-label="Next month" className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-white/[0.06] hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center">
        {WEEKDAY_SHORT.map((d) => (
          <span key={d} className="pb-1 font-mono text-[9px] uppercase text-white/30">
            {d[0]}
          </span>
        ))}
        {monthGrid(year, month).map((key) => {
          const { d, m } = parseKey(key);
          const isToday = key === today;
          const isCursor = key === cursor;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
              className={cn(
                'relative mx-auto grid h-7 w-7 place-items-center rounded-full text-[11.5px] outline-none transition-colors focus-visible:ring-1 focus-visible:ring-[#5EE3DA]',
                isToday
                  ? 'bg-[#5EE3DA] font-semibold text-[#02040A]'
                  : isCursor
                    ? 'bg-white/[0.12] text-white'
                    : m === month
                      ? 'text-white/75 hover:bg-white/[0.06]'
                      : 'text-white/25 hover:bg-white/[0.04]',
              )}
            >
              {d}
              {busy.has(key) && !isToday && (
                <span className="absolute bottom-0.5 h-[3px] w-[3px] rounded-full bg-[#5EE3DA]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
