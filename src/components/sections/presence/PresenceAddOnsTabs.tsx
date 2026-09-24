'use client';

// src/components/sections/presence/PresenceAddOnsTabs.tsx
import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRightLeft,
  AtSign,
  Braces,
  CalendarCheck,
  Camera,
  ChartLine,
  Cookie,
  CreditCard,
  Gauge,
  Languages,
  MailPlus,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Palette,
  PenLine,
  PenTool,
  Puzzle,
  Receipt,
  ScanSearch,
  ScrollText,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  ADD_ON_CATEGORIES,
  ADD_ON_HINTS,
  PRESENCE_ACCENT,
  PRESENCE_ACCENT_RGB,
} from '@/data/presence-config';

const accent = (a: number) => `rgba(${PRESENCE_ACCENT_RGB},${a})`;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Content & Brand': Palette,
  'Getting Found': Search,
  'Tracking & Conversion': TrendingUp,
  Functionality: Puzzle,
  Compliance: ShieldCheck,
};

const ITEM_ICONS: Record<string, LucideIcon> = {
  Copywriting: PenLine,
  'Logo design': PenTool,
  'Full brand identity': Palette,
  'Professional photography': Camera,
  'Extra language': Languages,
  'On-page SEO setup': Search,
  'Google Business Profile': MapPin,
  'Schema markup': Braces,
  'Technical SEO audit': ScanSearch,
  'Speed optimisation': Gauge,
  'Google Analytics + Search Console': ChartLine,
  'Meta Pixel + conversion tracking': Target,
  'WhatsApp chat button': MessageCircle,
  'Live chat widget': MessagesSquare,
  'Newsletter signup': MailPlus,
  'Payment gateway': CreditCard,
  'Booking module': CalendarCheck,
  'Blog setup + training': Newspaper,
  'Site migration': ArrowRightLeft,
  'Business email setup': AtSign,
  'PDPA cookie consent banner': Cookie,
  'Privacy policy + terms': ScrollText,
  'LHDN e-Invoice integration': Receipt,
};

export function PresenceAddOnsTabs() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const category = ADD_ON_CATEGORIES[active];

  const focusTab = (i: number) => {
    const next = (i + ADD_ON_CATEGORIES.length) % ADD_ON_CATEGORIES.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      focusTab(i + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      focusTab(i - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusTab(ADD_ON_CATEGORIES.length - 1);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-6">
      <div
        role="tablist"
        aria-label="Add-on categories"
        aria-orientation="vertical"
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0"
      >
        {ADD_ON_CATEGORIES.map((c, i) => {
          const Icon = CATEGORY_ICONS[c.heading] ?? Puzzle;
          const selected = i === active;
          return (
            <button
              key={c.heading}
              ref={(el) => {
                tabsRef.current[i] = el;
              }}
              id={`${baseId}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="group flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 lg:w-full"
              style={{
                borderColor: selected ? accent(0.45) : 'rgba(255,255,255,0.08)',
                background: selected ? accent(0.08) : 'rgba(255,255,255,0.015)',
                ['--tw-ring-color' as string]: accent(0.6),
              }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors"
                style={{
                  background: selected ? accent(0.2) : 'rgba(255,255,255,0.05)',
                  color: selected ? PRESENCE_ACCENT : 'rgba(255,255,255,0.55)',
                }}
              >
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span
                  className={`block whitespace-nowrap text-[14px] font-semibold transition-colors ${
                    selected ? 'text-white' : 'text-white/65 group-hover:text-white/85'
                  }`}
                >
                  {c.heading}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                  {c.items.length} add-ons
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="relative self-start overflow-hidden rounded-3xl border border-white/[0.16] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl backdrop-saturate-150"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(140deg, rgba(255,255,255,0.08), transparent 38%), radial-gradient(60% 50% at 100% 0%, ${accent(0.08)}, transparent 70%)`,
          }}
        />
        <ul key={category.heading} className="relative divide-y divide-white/[0.06]">
          {category.items.map((item, i) => {
            const Icon = ITEM_ICONS[item.name] ?? Puzzle;
            return (
              <li
                key={item.name}
                className="group/row flex animate-[presenceFadeUp_0.45s_ease-out_both] items-start gap-4 px-5 py-3.5 md:items-center transition-colors hover:bg-white/[0.02] motion-reduce:animate-none md:px-6 md:py-3"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors group-hover/row:border-white/25"
                  style={{ borderColor: accent(0.22), background: accent(0.07) }}
                >
                  <Icon
                    aria-hidden
                    className="h-[18px] w-[18px]"
                    style={{ color: PRESENCE_ACCENT }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-white md:text-[16px]">
                    {item.name}
                  </span>
                  {ADD_ON_HINTS[item.name] && (
                    <span className="mt-0.5 block text-[13px] leading-[1.5] text-white/50">
                      {ADD_ON_HINTS[item.name]}
                    </span>
                  )}
                  <span
                    className="mt-1.5 block font-serif text-[18px] italic leading-tight md:hidden"
                    style={{ color: PRESENCE_ACCENT }}
                  >
                    {item.price}
                  </span>
                </span>
                <span
                  className="hidden shrink-0 text-right font-serif md:block text-[18px] italic leading-tight md:text-[21px]"
                  style={{ color: PRESENCE_ACCENT }}
                >
                  {item.price}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
