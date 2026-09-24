// src/components/sections/audit/AuditTiers.tsx
import { FileText, ListOrdered, MapPinned, Users } from 'lucide-react';
import { AUDIT_TIERS, TIERS_INTRO, AUDIT_ACCENT, AUDIT_ACCENT_RGB } from '@/data/audit-config';
import { Bar, Browser, Toast, iconSm } from '../solutions/MockKit';
import { CodeBackdrop } from '../solutions/CodeBackdrop';
import { GlowDivider } from '../solutions/SolutionGlow';
import { SolutionTypesRow } from '../solutions/SolutionTypesRow';
import type { SolutionTypeItem } from '../solutions/SolutionTypesRow';
import { AuditSectionLabel } from './AuditSectionLabel';

const accent = (a: number) => `rgba(${AUDIT_ACCENT_RGB},${a})`;

/* ---------- one mock per tier ---------- */

function LightMock() {
  return (
    <div className="relative">
      <Browser url="audit · summary" className="w-[250px]">
        <div className="space-y-1.5 p-3">
          {[90, 64, 40].map((w, i) => (
            <div
              key={w}
              className="flex items-center gap-2 rounded-md border border-white/[0.07] px-2.5 py-1.5"
            >
              <span
                className="grid h-4 w-4 place-items-center rounded font-serif text-[9px] italic"
                style={{ background: accent(0.18), color: AUDIT_ACCENT }}
              >
                {i + 1}
              </span>
              <Bar w="80px" />
              <span className="ml-auto h-1 w-12 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${w}%`, background: AUDIT_ACCENT }}
                />
              </span>
            </div>
          ))}
        </div>
      </Browser>
      <Toast icon={<ListOrdered className={iconSm} />} className="-bottom-5 -right-4">
        Ranked in 1 week · no calls
      </Toast>
    </div>
  );
}

function FullMock() {
  return (
    <div className="relative">
      <div className="w-[250px] rounded-2xl border border-white/10 bg-[#110D06] p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
        <span className="flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-wider text-white/40">
          <FileText className="h-2.5 w-2.5" /> Roadmap · prioritised
        </span>
        <ol className="mt-2.5 space-y-2 border-l pl-3" style={{ borderColor: accent(0.35) }}>
          {['Now', '3 months', '6 months'].map((p) => (
            <li key={p} className="relative">
              <span
                className="absolute -left-[17px] top-0.5 h-2 w-2 rounded-full"
                style={{ background: AUDIT_ACCENT }}
              />
              <span className="block font-mono text-[7px] uppercase tracking-wider text-white/40">
                {p}
              </span>
              <Bar w="75%" strong />
            </li>
          ))}
        </ol>
      </div>
      <Toast icon={<Users className={iconSm} />} className="-right-10 -top-4">
        Discovery call + workshop
      </Toast>
      <Toast icon={<MapPinned className={iconSm} />} className="-bottom-5 -left-6">
        Grant screening included
      </Toast>
    </div>
  );
}

/* ---------- section backdrop ---------- */

const CODE_COLUMNS: string[][] = [
  [
    '// map what you actually do today',
    'const workflows = await interview.map({',
    '  roles: team.roles,',
    '  tools: currentSoftware,',
    '});',
    '',
    'for (const task of workflows.tasks) {',
    '  task.hoursPerWeek = estimate(task);',
    '  task.aiFit = scoreFit(task);',
    '}',
    '',
    "export const deliverable = 'roadmap';",
  ],
  [
    'const ranked = workflows.tasks',
    '  .filter((t) => t.aiFit > 0.5)',
    '  .sort((a, b) => b.impact - a.impact);',
    '',
    '// honest answer, even if it is "not yet"',
    "if (ranked.length === 0) return 'not yet';",
    '',
    'const grant = await screen({',
    "  schemes: ['HRD Corp', 'MSME Digital'],",
    '  company,',
    '});',
  ],
  [
    'const roadmap = buildRoadmap(ranked, {',
    "  phases: ['now', '3m', '6m'],",
    '  budget: company.budget,',
    '});',
    '',
    'roadmap.recommend([',
    "  'Core', 'Flow', 'Connect', 'nothing yet',",
    ']);',
    '',
    'await deliver(roadmap, { walkthrough: 30 });',
  ],
];

/* ---------- layout ---------- */

const EXTRAS: Record<string, Pick<SolutionTypeItem, 'mock' | 'badge' | 'mockScale'>> = {
  '01': { mock: <LightMock />, badge: 'Async', mockScale: 1 },
  '02': { mock: <FullMock />, badge: 'Grant screening', mockScale: 0.95 },
};

const ITEMS: SolutionTypeItem[] = AUDIT_TIERS.map(({ delivery, ...tier }) => ({
  ...tier,
  planLine: `Delivery: ${delivery}`,
  ...EXTRAS[tier.number],
}));

export function AuditTiers() {
  return (
    <section
      className="relative overflow-hidden bg-[#080604] px-6 py-14 md:py-20"
      style={{ ['--mock-accent-rgb' as string]: AUDIT_ACCENT_RGB }}
    >
      <CodeBackdrop columns={CODE_COLUMNS} rgb={AUDIT_ACCENT_RGB} />
      <GlowDivider position="top" rgb={AUDIT_ACCENT_RGB} />
      <GlowDivider position="bottom" rgb={AUDIT_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <AuditSectionLabel>What We Build</AuditSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Two ways to{' '}
              <span className="font-serif italic font-normal" style={{ color: AUDIT_ACCENT }}>
                find out.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/55 lg:pb-2">{TIERS_INTRO}</p>
        </div>

        <div className="mt-10">
          <SolutionTypesRow
            items={ITEMS}
            accentHex={AUDIT_ACCENT}
            accentRgb={AUDIT_ACCENT_RGB}
            ctaHref="#get-started"
          />
        </div>
      </div>
    </section>
  );
}
