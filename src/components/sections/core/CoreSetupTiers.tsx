// src/components/sections/core/CoreSetupTiers.tsx
import { Boxes, Briefcase, Building2, Check, MapPin, Users } from 'lucide-react';
import {
  SETUP_TIERS,
  SETUP_TIERS_NOTE,
  HOW_WE_WORK,
  CORE_ACCENT,
  CORE_ACCENT_RGB,
} from '@/data/core-config';
import { Bar, Browser, Toast, iconSm } from '../solutions/MockKit';
import { CodeBackdrop } from '../solutions/CodeBackdrop';
import { GlowDivider } from '../solutions/SolutionGlow';
import { SolutionTypesRow } from '../solutions/SolutionTypesRow';
import type { SolutionTypeItem } from '../solutions/SolutionTypesRow';
import { CoreSectionLabel } from './CoreSectionLabel';

const accent = (a: number) => `rgba(${CORE_ACCENT_RGB},${a})`;

/* ---------- one mock per tier ---------- */

function StarterMock() {
  return (
    <div className="relative">
      <Browser url="ops · jobs" className="w-[250px]">
        <div className="space-y-1.5 p-3">
          {[
            ['J-318', 60],
            ['J-321', 25],
            ['J-322', 100],
          ].map(([id, pct]) => (
            <div
              key={id as string}
              className="flex items-center gap-2 rounded-md border border-white/[0.07] px-2.5 py-1.5"
            >
              <Briefcase className="h-3 w-3 text-white/40" />
              <span className="font-mono text-[8px] text-white/55">{id}</span>
              <Bar w="60px" />
              <span className="ml-auto h-1 w-10 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, background: CORE_ACCENT }}
                />
              </span>
            </div>
          ))}
        </div>
      </Browser>
      <Toast icon={<Check className={iconSm} />} className="-bottom-4 -right-6">
        Imported from your spreadsheet
      </Toast>
    </div>
  );
}

function GrowthMock() {
  const modules = [
    { icon: <Briefcase className="h-3.5 w-3.5" />, label: 'Jobs' },
    { icon: <Boxes className="h-3.5 w-3.5" />, label: 'Inventory' },
    { icon: <Users className="h-3.5 w-3.5" />, label: 'Clients' },
  ];
  return (
    <div className="relative">
      <div className="relative flex w-[260px] flex-col items-center rounded-2xl border border-white/10 bg-[#080A16] p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex gap-2">
          {modules.map((m) => (
            <span
              key={m.label}
              className="flex w-[70px] flex-col items-center gap-1 rounded-xl border px-2 py-2"
              style={{ borderColor: accent(0.35), background: accent(0.07) }}
            >
              <span style={{ color: CORE_ACCENT }}>{m.icon}</span>
              <span className="text-[8.5px] font-medium text-white/75">{m.label}</span>
            </span>
          ))}
        </div>
        <span className="h-4 w-px" style={{ background: accent(0.5) }} />
        <span
          className="rounded-lg border px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em]"
          style={{ borderColor: accent(0.45), color: CORE_ACCENT, background: accent(0.1) }}
        >
          One dataset
        </span>
      </div>
      <Toast icon={<Check className={iconSm} />} className="-right-10 -top-4">
        e-Invoice · MyInvois
      </Toast>
    </div>
  );
}

function EnterpriseMock() {
  return (
    <div className="relative">
      <Browser url="ops · branches" className="w-[270px]">
        <div className="grid grid-cols-3 gap-1.5 p-3">
          {['KL', 'Penang', 'JB'].map((b, i) => (
            <div key={b} className="rounded-md border border-white/[0.08] p-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" style={{ color: CORE_ACCENT }} />
                <span className="text-[8.5px] font-semibold text-white/80">{b}</span>
              </span>
              <span className="mt-1.5 block font-serif text-[15px] italic leading-none text-white/85">
                {[42, 27, 19][i]}
              </span>
              <span className="font-mono text-[6.5px] uppercase tracking-wider text-white/35">
                open jobs
              </span>
            </div>
          ))}
        </div>
        <div
          className="mx-3 mb-3 flex items-center gap-2 rounded-md border px-2.5 py-2"
          style={{ borderColor: accent(0.3) }}
        >
          <Building2 className="h-3.5 w-3.5" style={{ color: CORE_ACCENT }} />
          <span className="text-[8.5px] text-white/70">Stock transfer KL → Penang</span>
          <span className="ml-auto font-mono text-[7.5px]" style={{ color: CORE_ACCENT }}>
            APPROVED
          </span>
        </div>
      </Browser>
      <Toast icon={<Users className={iconSm} />} className="-bottom-4 -right-8">
        Role-based access per branch
      </Toast>
    </div>
  );
}

/* ---------- section backdrop ---------- */

const CODE_COLUMNS: string[][] = [
  [
    "import { db } from '@/lib/db';",
    '',
    'export async function createJob(input: JobInput) {',
    '  const job = await db.job.create({',
    '    data: {',
    '      client: input.clientId,',
    '      site: input.address,',
    "      status: 'quoted',",
    '    },',
    '  });',
    '',
    '  // reserve the parts it needs',
    '  await inventory.reserve(job.id, input.parts);',
    '  return job;',
    '}',
    '',
    "export const roles = ['owner', 'supervisor', 'technician'];",
  ],
  [
    'const lowStock = await db.item.findMany({',
    '  where: { qty: { lt: item.reorderAt } },',
    '});',
    '',
    'for (const item of lowStock) {',
    "  await notify(purchasing, 'reorder', item);",
    '}',
    '',
    '// one dataset, every branch',
    'const summary = await db.job.groupBy({',
    "  by: ['branchId', 'status'],",
    '  _count: true,',
    '});',
    '',
    'export const revalidate = 60;',
  ],
  [
    "if (user.role !== 'owner') {",
    '  query.where.branchId = user.branchId;',
    '}',
    '',
    'await accounting.sync(invoice, {',
    "  target: 'autocount',",
    '});',
    '',
    '// LHDN e-Invoice',
    'await myinvois.submit(invoice);',
    '',
    'export async function monthlyReport(branch) {',
    '  return db.report.build({ branch, month });',
    '}',
  ],
];

/* ---------- layout ---------- */

const EXTRAS: Record<string, Pick<SolutionTypeItem, 'mock' | 'badge' | 'mockScale'>> = {
  '01': { mock: <StarterMock />, mockScale: 0.95 },
  '02': { mock: <GrowthMock />, badge: 'Includes e-Invoice', mockScale: 0.95 },
  '03': { mock: <EnterpriseMock />, badge: 'Multi-branch', mockScale: 0.92 },
};

const ITEMS: SolutionTypeItem[] = SETUP_TIERS.map(({ carePlan, ...tier }) => ({
  ...tier,
  planLine: `Care plan: ${carePlan}`,
  note: SETUP_TIERS_NOTE,
  ...EXTRAS[tier.number],
}));

export function CoreSetupTiers() {
  return (
    <section
      className="relative overflow-hidden bg-[#04050D] px-6 py-14 md:py-20"
      style={{ ['--mock-accent-rgb' as string]: CORE_ACCENT_RGB }}
    >
      <CodeBackdrop columns={CODE_COLUMNS} rgb={CORE_ACCENT_RGB} />
      <GlowDivider position="bottom" rgb={CORE_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <CoreSectionLabel>What We Build</CoreSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Built once,{' '}
              <span className="font-serif italic font-normal" style={{ color: CORE_ACCENT }}>
                around your business.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/55 lg:pb-2">
            One-off setup, quoted after a discovery session. The right tier depends on how many
            parts of your business need to be connected.
          </p>
        </div>

        <div className="mt-10">
          <SolutionTypesRow items={ITEMS} accentHex={CORE_ACCENT} accentRgb={CORE_ACCENT_RGB} />
        </div>

        <ol className="mt-4 grid gap-3 rounded-3xl border border-white/[0.1] bg-[#080A16]/90 p-5 sm:grid-cols-2 md:grid-cols-5 md:gap-4 md:p-6">
          {HOW_WE_WORK.map((step, i) => (
            <li key={step.number} className="flex gap-3 md:flex-col md:gap-0">
              <div className="flex items-center gap-2 md:w-full">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[10.5px]"
                  style={{ borderColor: accent(0.5), background: accent(0.1), color: CORE_ACCENT }}
                >
                  {step.number}
                </span>
                {i < HOW_WE_WORK.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden h-px flex-1 md:block"
                    style={{ background: `linear-gradient(90deg, ${accent(0.5)}, ${accent(0.1)})` }}
                  />
                )}
              </div>
              <div className="md:mt-3">
                <p className="text-[13.5px] font-semibold text-white">{step.title}</p>
                <p className="mt-0.5 text-[12px] leading-[1.5] text-white/50">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
