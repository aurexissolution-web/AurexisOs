// src/components/sections/flow/FlowSetupTiers.tsx
import { ArrowRight, BellRing, Check, FileSignature, FileText, Receipt, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { SETUP_TIERS, FLOW_ACCENT, FLOW_ACCENT_RGB } from '@/data/flow-config';
import { Bar, Browser, Toast, iconSm } from '../solutions/MockKit';
import { CodeBackdrop } from '../solutions/CodeBackdrop';
import { GlowDivider } from '../solutions/SolutionGlow';
import { SolutionTypesRow } from '../solutions/SolutionTypesRow';
import type { SolutionTypeItem } from '../solutions/SolutionTypesRow';
import { FlowSectionLabel } from './FlowSectionLabel';

const accent = (a: number) => `rgba(${FLOW_ACCENT_RGB},${a})`;

/* ---------- one mock per tier ---------- */

function FlowNode({ icon, label, dim }: { icon: ReactNode; label: string; dim?: boolean }) {
  return (
    <div
      className="flex w-[74px] flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5"
      style={{
        borderColor: dim ? 'rgba(255,255,255,0.1)' : accent(0.4),
        background: dim ? 'rgba(255,255,255,0.03)' : accent(0.08),
      }}
    >
      <span
        className="grid h-7 w-7 place-items-center rounded-lg"
        style={{
          background: dim ? 'rgba(255,255,255,0.06)' : accent(0.18),
          color: dim ? 'rgba(255,255,255,0.45)' : FLOW_ACCENT,
        }}
      >
        {icon}
      </span>
      <span className="text-[8.5px] font-medium text-white/75">{label}</span>
    </div>
  );
}

function LiteMock() {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#070B0A] p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
        <FlowNode icon={<FileText className="h-3.5 w-3.5" />} label="Quote" />
        <ArrowRight className="h-3.5 w-3.5" style={{ color: accent(0.7) }} />
        <FlowNode icon={<Receipt className="h-3.5 w-3.5" />} label="Invoice" />
        <ArrowRight className="h-3.5 w-3.5 text-white/25" />
        <FlowNode icon={<BellRing className="h-3.5 w-3.5" />} label="Reminder" dim />
      </div>
      <Toast icon={<Check className={iconSm} />} className="-bottom-5 -right-6">
        One flow, running on its own
      </Toast>
    </div>
  );
}

function CoreMock() {
  return (
    <div className="relative">
      <Browser url="flow · invoices" className="w-[260px]">
        <div className="space-y-1.5 p-3">
          {[
            ['INV-2041', 'Paid', true],
            ['INV-2042', 'Reminder sent', false],
            ['INV-2043', 'Sent', false],
          ].map(([no, status, paid]) => (
            <div
              key={no as string}
              className="flex items-center justify-between rounded-md border border-white/[0.07] px-2.5 py-1.5"
            >
              <span className="font-mono text-[8px] text-white/55">{no}</span>
              <Bar w="70px" />
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[7px] uppercase"
                style={
                  paid
                    ? { background: accent(0.18), color: FLOW_ACCENT }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }
                }
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </Browser>
      <Toast icon={<Check className={iconSm} />} className="-right-10 -top-3">
        e-Invoice valid · LHDN
      </Toast>
      <Toast icon={<BellRing className={iconSm} />} className="-bottom-4 -left-8">
        Reminder sent on WhatsApp
      </Toast>
    </div>
  );
}

function MaxMock() {
  return (
    <div className="relative">
      <Browser url="flow · approvals" className="w-[270px]">
        <div className="grid grid-cols-3 gap-1.5 p-3">
          {[
            { label: 'Sales', icon: <FileText className="h-3 w-3" /> },
            { label: 'Finance', icon: <Receipt className="h-3 w-3" /> },
            { label: 'HR', icon: <Users className="h-3 w-3" /> },
          ].map((d) => (
            <div key={d.label} className="rounded-md border border-white/[0.08] p-2">
              <span
                className="grid h-5 w-5 place-items-center rounded"
                style={{ background: accent(0.16), color: FLOW_ACCENT }}
              >
                {d.icon}
              </span>
              <span className="mt-1.5 block text-[8px] font-semibold text-white/75">{d.label}</span>
              <span className="mt-1 block">
                <Bar w="80%" />
              </span>
            </div>
          ))}
        </div>
        <div
          className="mx-3 mb-3 flex items-center gap-2 rounded-md border px-2.5 py-2"
          style={{ borderColor: accent(0.3) }}
        >
          <FileSignature className="h-3.5 w-3.5" style={{ color: FLOW_ACCENT }} />
          <span className="text-[8.5px] text-white/70">Leave request → Manager → HR</span>
          <span className="ml-auto font-mono text-[7.5px]" style={{ color: FLOW_ACCENT }}>
            APPROVED
          </span>
        </div>
      </Browser>
      <Toast icon={<Users className={iconSm} />} className="-bottom-4 -right-8">
        3 departments connected
      </Toast>
    </div>
  );
}

/* ---------- section backdrop ---------- */

const CODE_COLUMNS: string[][] = [
  [
    "import { onEvent } from '@/lib/flow';",
    '',
    "onEvent('quote.accepted', async (quote) => {",
    '  const invoice = await createInvoice({',
    '    client: quote.client,',
    '    lines: quote.lines,',
    '    dueInDays: 14,',
    '  });',
    '',
    '  // push straight into the books',
    "  await accounting.sync('invoice', invoice);",
    '});',
    '',
    "onEvent('invoice.overdue', async (inv) => {",
    "  await sendWhatsApp(inv.client.phone, 'reminder', {",
    '    amount: inv.total,',
    '  });',
    '});',
  ],
  [
    '// LHDN e-Invoice via MyInvois',
    'const result = await myinvois.submit({',
    '  invoice: invoice.id,',
    '  supplierTin: company.tin,',
    '  buyerTin: client.tin,',
    '});',
    '',
    "if (result.status === 'rejected') {",
    '  await fixAndResubmit(result.errors);',
    '}',
    '',
    "await notify(finance, 'e-invoice-validated', {",
    '  uuid: result.uuid,',
    '});',
    '',
    'export const schedule = "0 9 * * 1-5";',
  ],
  [
    "onEvent('leave.requested', async (req) => {",
    '  const manager = await getManager(req.staffId);',
    '  await requestApproval(manager, req);',
    '});',
    '',
    "onEvent('leave.approved', async (req) => {",
    '  await hr.updateBalance(req.staffId, req.days);',
    "  await notify(req.staff, 'leave-approved');",
    '});',
    '',
    '// monthly statements, every 1st',
    'for (const client of await clients.withBalance()) {',
    '  await sendStatement(client);',
    '}',
  ],
];

/* ---------- layout ---------- */

const EXTRAS: Record<string, Pick<SolutionTypeItem, 'mock' | 'badge' | 'mockScale'>> = {
  '01': { mock: <LiteMock />, mockScale: 1 },
  '02': { mock: <CoreMock />, badge: 'Includes e-Invoice', mockScale: 0.95 },
  '03': { mock: <MaxMock />, mockScale: 0.95 },
};

const ITEMS: SolutionTypeItem[] = SETUP_TIERS.map(({ managementPlan, ...tier }) => ({
  ...tier,
  planLine: `Management plan: ${managementPlan}`,
  ...EXTRAS[tier.number],
}));

export function FlowSetupTiers() {
  return (
    <section
      className="relative overflow-hidden bg-[#030907] px-6 py-14 md:py-20"
      style={{ ['--mock-accent-rgb' as string]: FLOW_ACCENT_RGB }}
    >
      <CodeBackdrop columns={CODE_COLUMNS} rgb={FLOW_ACCENT_RGB} />
      <GlowDivider position="top" rgb={FLOW_ACCENT_RGB} />
      <GlowDivider position="bottom" rgb={FLOW_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <FlowSectionLabel>What We Build</FlowSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Three ways to put admin{' '}
              <span className="font-serif italic font-normal" style={{ color: FLOW_ACCENT }}>
                on autopilot.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/55 lg:pb-2">
            One-off setup. The right tier depends on how many admin processes you want automated on
            day one.
          </p>
        </div>

        <div className="mt-10">
          <SolutionTypesRow items={ITEMS} accentHex={FLOW_ACCENT} accentRgb={FLOW_ACCENT_RGB} />
        </div>
      </div>
    </section>
  );
}
