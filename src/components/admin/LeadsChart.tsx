'use client';

// src/components/admin/LeadsChart.tsx
// 30-day lead volume. One series (daily total) in the accent hue — the title
// names it, so no legend. Hover a day for the per-form breakdown.
import { useState } from 'react';
import { LEAD_SOURCES, type LeadSourceKey } from '@/lib/admin/lead-sources';

type Day = { date: string; total: number; bySource: Partial<Record<LeadSourceKey, number>> };


export function LeadsChart({ days, height: H = 200 }: { days: Day[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(4, ...days.map((d) => d.total));
  const niceMax = Math.ceil(max / 4) * 4;
  const ticks = [0, niceMax / 2, niceMax];
  const fmt = (iso: string, long = false) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(
      'en-MY',
      long
        ? { weekday: 'short', day: 'numeric', month: 'short' }
        : { day: 'numeric', month: 'short' },
    );
  const h = hover !== null ? days[hover] : null;

  return (
    <div className="relative">
      <div className="relative flex" style={{ height: H }}>
        {/* y ticks */}
        <div className="relative w-7 shrink-0">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-2 -translate-y-1/2 font-mono text-[10px] text-white/30"
              style={{ top: H - (t / niceMax) * H }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-white/[0.12]"
              style={{ top: H - (t / niceMax) * H }}
            />
          ))}
          <div
            className="absolute inset-0 flex items-end gap-[2px]"
            onMouseLeave={() => setHover(null)}
          >
            {days.map((d, i) => (
              <button
                key={d.date}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${fmt(d.date, true)}: ${d.total} lead${d.total === 1 ? '' : 's'}`}
                className="group relative flex h-full flex-1 items-end outline-none"
              >
                <span
                  className="block w-full rounded-t-[4px] transition-colors"
                  style={{
                    height: d.total ? Math.max(4, (d.total / niceMax) * H) : 2,
                    background: d.total
                      ? hover === i
                        ? '#8EF0E9'
                        : '#5EE3DA'
                      : 'rgba(255,255,255,0.12)',
                    opacity: hover !== null && hover !== i && d.total ? 0.45 : 1,
                  }}
                />
              </button>
            ))}
          </div>
          {h && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-48 rounded-xl border border-white/10 bg-[#0B0F17]/95 p-3 shadow-2xl backdrop-blur"
              style={{
                left: `${((hover! + 0.5) / days.length) * 100}%`,
                transform: hover! > days.length * 0.6 ? 'translateX(-105%)' : 'translateX(12px)',
              }}
            >
              <p className="text-[11px] text-white/45">{fmt(h.date, true)}</p>
              <p className="mt-0.5 text-[18px] font-bold text-white">
                {h.total}{' '}
                <span className="text-[12px] font-normal text-white/45">
                  lead{h.total === 1 ? '' : 's'}
                </span>
              </p>
              {h.total > 0 && (
                <ul className="mt-2 space-y-1 border-t border-white/[0.14] pt-2">
                  {LEAD_SOURCES.filter((s) => h.bySource[s.key]).map((s) => (
                    <li
                      key={s.key}
                      className="flex items-center justify-between text-[12px] text-white/70"
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: s.accent }}
                        />
                        {s.label}
                      </span>
                      <span className="font-mono text-white">{h.bySource[s.key]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-7 font-mono text-[10px] text-white/30">
        <span>{fmt(days[0].date)}</span>
        <span>{fmt(days[Math.floor(days.length / 2)].date)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
