// src/components/sections/flow/FlowManagementPlans.tsx
import { ArrowRight, Check, Plus } from 'lucide-react';
import {
  MANAGEMENT_TIERS,
  MANAGEMENT_CHOICE_ROWS,
  FLOW_ACCENT,
  FLOW_ACCENT_RGB,
  FLOW_DEEP_RGB,
} from '@/data/flow-config';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { FlowSectionLabel } from './FlowSectionLabel';

const accent = (a: number) => `rgba(${FLOW_ACCENT_RGB},${a})`;

const GLASS =
  'border border-white/[0.14] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl';
const SHEEN = 'linear-gradient(140deg, rgba(255,255,255,0.07), transparent 38%)';

// "RM600–900/mo" -> ["RM600–900", "/mo"]
function splitPrice(price: string): [string, string] {
  const i = price.indexOf('/');
  return i === -1 ? [price, ''] : [price.slice(0, i), price.slice(i)];
}

export function FlowManagementPlans() {
  const levels = MANAGEMENT_TIERS.length;

  return (
    <section className="relative overflow-hidden px-6 py-12 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(40% 45% at 85% 20%, ${accent(0.1)}, transparent 70%), radial-gradient(40% 50% at 5% 90%, rgba(${FLOW_DEEP_RGB},0.18), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={FLOW_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <FlowSectionLabel>Management Plans</FlowSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Keep it running,{' '}
              <span className="font-serif italic font-normal" style={{ color: FLOW_ACCENT }}>
                keep it improving.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/55 lg:pb-1.5">
            Monthly. An automation left unmaintained breaks the first time a connected app changes
            something. These plans keep it running and keep improving it.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
          {MANAGEMENT_TIERS.map((tier, idx) => {
            const level = idx + 1;
            const [amount, unit] = splitPrice(tier.price);
            const [first, ...rest] = tier.features;
            const inherits = first.startsWith('Everything in');
            const features = inherits ? rest : tier.features;
            const top = level === levels;
            return (
              <article
                key={tier.name}
                className={`relative flex flex-col overflow-hidden rounded-3xl p-5 ${GLASS}`}
                style={{
                  backgroundImage: `${SHEEN}, radial-gradient(90% 60% at 100% 0%, ${accent(0.04 + level * 0.035)}, transparent 70%)`,
                  borderColor: top ? accent(0.4) : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[16px] font-semibold text-white">{tier.name}</h3>
                  <span className="flex gap-1" aria-label={`Level ${level} of ${levels}`}>
                    {Array.from({ length: levels }, (_, i) => (
                      <span
                        key={i}
                        className="h-1.5 w-4 rounded-full"
                        style={{
                          background: i < level ? FLOW_ACCENT : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    ))}
                  </span>
                </div>

                <p className="mt-3 flex items-baseline gap-1">
                  <span
                    className="font-serif text-[32px] italic leading-none"
                    style={{ color: FLOW_ACCENT }}
                  >
                    {amount}
                  </span>
                  {unit && <span className="font-mono text-[11px] text-white/45">{unit}</span>}
                </p>

                <div className="mt-4 border-t border-white/[0.08] pt-4">
                  {inherits && (
                    <p
                      className="mb-3 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                      style={{ background: accent(0.12), color: FLOW_ACCENT }}
                    >
                      <Plus aria-hidden className="h-3 w-3" strokeWidth={2.5} />
                      {first.replace(/, plus:$/, '')}
                    </p>
                  )}
                  <ul className="flex flex-col gap-2">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[12.5px] leading-[1.45] text-white/70"
                      >
                        <Check
                          aria-hidden
                          className="mt-[2px] h-3.5 w-3.5 shrink-0"
                          style={{ color: accent(0.85) }}
                          strokeWidth={2.5}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="mt-5 overflow-hidden rounded-3xl border"
          style={{
            borderColor: accent(0.3),
            background: `linear-gradient(100deg, ${accent(0.08)}, ${accent(0.02)} 60%)`,
          }}
        >
          <p className="border-b border-white/[0.08] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 md:px-6">
            Which plan fits you?
          </p>
          <ul className="divide-y divide-white/[0.06]">
            {MANAGEMENT_CHOICE_ROWS.map((row) => (
              <li
                key={row.plan}
                className="flex flex-col gap-1.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-6"
              >
                <span className="text-[14px] text-white/75">{row.need}</span>
                <span
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]"
                  style={{ color: FLOW_ACCENT }}
                >
                  <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                  {row.plan}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
