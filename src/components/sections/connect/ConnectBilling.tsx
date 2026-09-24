// src/components/sections/connect/ConnectBilling.tsx
import type { ReactNode } from 'react';
import { LayoutDashboard, MessageCircle, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import {
  BILLING_INTRO,
  THREE_BILLS,
  META_RATES,
  META_RATE_CALLOUT,
  BILLING_CHANGE_ALERT,
  REAL_MONTH_ITEMS,
  REAL_MONTH_TOTAL,
  REAL_MONTH_FOOTNOTE,
  BILLING_COMPLIANCE_NOTE,
  CONNECT_ACCENT,
  CONNECT_ACCENT_RGB,
  CONNECT_DEEP_RGB,
} from '@/data/connect-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { ConnectSectionLabel } from './ConnectSectionLabel';

const accent = (a: number) => `rgba(${CONNECT_ACCENT_RGB},${a})`;

const GLASS =
  'border border-white/[0.14] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl';
const SHEEN = 'linear-gradient(140deg, rgba(255,255,255,0.07), transparent 38%)';

const BILL_ICONS: Record<string, ReactNode> = {
  Meta: <MessageCircle aria-hidden className="h-5 w-5" />,
  Platform: <LayoutDashboard aria-hidden className="h-5 w-5" />,
  Aurexis: <Sparkles aria-hidden className="h-5 w-5" />,
};

const subHeading = 'font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/45';

export function ConnectBilling() {
  return (
    <section
      id="billing-change"
      className="relative overflow-hidden bg-[#08050F] px-6 py-12 md:py-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(40% 40% at 12% 0%, ${accent(0.16)}, transparent 72%)`,
            `radial-gradient(35% 40% at 95% 45%, rgba(${CONNECT_DEEP_RGB},0.3), transparent 72%)`,
            `radial-gradient(50% 35% at 40% 100%, rgba(${CONNECT_DEEP_RGB},0.3), transparent 72%)`,
          ].join(', '),
          filter: 'blur(12px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={CONNECT_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <ConnectSectionLabel>Understanding the Three Bills</ConnectSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Three bills.{' '}
              <span className="font-serif italic font-normal" style={{ color: CONNECT_ACCENT }}>
                No surprises.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/60 lg:pb-2">{BILLING_INTRO}</p>
        </div>

        {/* The three bills */}
        <ol className="mt-9 grid gap-3 md:grid-cols-3">
          {THREE_BILLS.map((bill, i) => (
            <li
              key={bill.name}
              className={`rounded-3xl p-5 ${GLASS}`}
              style={{
                backgroundImage: SHEEN,
                borderColor: bill.name === 'Aurexis' ? accent(0.4) : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl border"
                  style={{
                    borderColor: accent(0.35),
                    background: accent(0.1),
                    color: CONNECT_ACCENT,
                  }}
                >
                  {BILL_ICONS[bill.name]}
                </span>
                <span className="font-mono text-[11px] tracking-[0.2em] text-white/30">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-[19px] font-bold tracking-[-0.015em] text-white">
                {bill.name}
              </h3>
              <p
                className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em]"
                style={{ color: CONNECT_ACCENT }}
              >
                {bill.chargedBy}
              </p>
              <p className="mt-3 text-[13.5px] leading-[1.6] text-white/60">{bill.description}</p>
            </li>
          ))}
        </ol>

        {/* Rates + a real month */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className={`rounded-3xl p-5 md:p-6 ${GLASS}`} style={{ backgroundImage: SHEEN }}>
            <p className={subHeading}>Meta message rates (Malaysia)</p>
            <ul className="mt-3 divide-y divide-white/[0.07]">
              {META_RATES.map((rate) => (
                <li key={rate.name} className="flex items-start justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-white">{rate.name}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-white/50">
                      {rate.description}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-right ${
                      rate.rate.startsWith('RM')
                        ? 'font-serif text-[17px] italic'
                        : 'max-w-[120px] text-[11.5px] text-white/45'
                    }`}
                    style={rate.rate.startsWith('RM') ? { color: CONNECT_ACCENT } : undefined}
                  >
                    {rate.rate}
                  </span>
                </li>
              ))}
            </ul>
            <p
              className="mt-3 rounded-2xl border px-4 py-3 text-[13px] leading-[1.6] text-white/70"
              style={{ borderColor: accent(0.25), background: accent(0.06) }}
            >
              {META_RATE_CALLOUT}
            </p>
          </div>

          <div
            className="relative flex flex-col rounded-3xl border p-5 md:p-6"
            style={{
              borderColor: accent(0.35),
              background: `radial-gradient(80% 60% at 100% 0%, ${accent(0.14)}, transparent 70%), #0D0918`,
            }}
          >
            <p className={subHeading}>What a real month looks like</p>
            <ul className="mt-3 flex-1">
              {REAL_MONTH_ITEMS.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-4 border-b border-dashed border-white/[0.1] py-3"
                >
                  <span className="text-[13.5px] text-white/70">{item.label}</span>
                  <span className="whitespace-nowrap font-mono text-[13px] text-white/85">
                    {item.amount}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-end justify-between gap-4 pt-3">
              <span className="text-[14px] font-semibold text-white">{REAL_MONTH_TOTAL.label}</span>
              <span
                className="font-serif text-[30px] italic leading-none"
                style={{ color: CONNECT_ACCENT }}
              >
                {REAL_MONTH_TOTAL.amount}
              </span>
            </div>
            <p className="mt-4 text-[11.5px] leading-[1.55] text-white/40">{REAL_MONTH_FOOTNOTE}</p>
          </div>
        </div>

        {/* 1 October change */}
        <div
          className="mt-4 overflow-hidden rounded-3xl border"
          style={{
            borderColor: accent(0.45),
            background: `linear-gradient(100deg, ${accent(0.12)}, ${accent(0.03)} 60%), #0A0714`,
          }}
        >
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-3.5 md:px-6">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{ background: accent(0.18), color: CONNECT_ACCENT }}
            >
              <TriangleAlert aria-hidden className="h-4 w-4" />
            </span>
            <p
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: CONNECT_ACCENT }}
            >
              {BILLING_CHANGE_ALERT.heading}
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-3 px-5 pt-4 md:grid-cols-2 md:px-6">
            {BILLING_CHANGE_ALERT.points
              .filter((point) => !point.startsWith('Action required'))
              .map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-white/70"
                >
                  <span
                    aria-hidden
                    className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: CONNECT_ACCENT }}
                  />
                  <span>{point}</span>
                </li>
              ))}
          </ul>
          {BILLING_CHANGE_ALERT.points
            .filter((point) => point.startsWith('Action required'))
            .map((point) => (
              <p
                key={point}
                className="mx-5 mb-5 mt-4 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13.5px] font-medium leading-[1.6] text-white md:mx-6"
                style={{ borderColor: accent(0.45), background: accent(0.12) }}
              >
                <TriangleAlert
                  aria-hidden
                  className="mt-[3px] h-4 w-4 shrink-0"
                  style={{ color: CONNECT_ACCENT }}
                />
                {point}
              </p>
            ))}
        </div>

        <p className="mt-4 flex items-start gap-3 text-[13px] leading-[1.65] text-white/50">
          <ShieldCheck
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: CONNECT_ACCENT }}
          />
          {BILLING_COMPLIANCE_NOTE}
        </p>
      </div>
    </section>
  );
}
