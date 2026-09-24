// src/components/sections/connect/ConnectSetupTiers.tsx
import type { ReactNode } from 'react';
import {
  BarChart3,
  Bot,
  Check,
  Instagram,
  MessageCircle,
  Megaphone,
  QrCode,
  Send,
  Sheet,
  Star,
} from 'lucide-react';
import {
  SETUP_TIERS,
  SETUP_TIERS_NOTE,
  CONNECT_ACCENT,
  CONNECT_ACCENT_RGB,
} from '@/data/connect-config';
import { Bar, Browser, Toast, iconSm } from '../solutions/MockKit';
import { CodeBackdrop } from '../solutions/CodeBackdrop';
import { GlowDivider } from '../solutions/SolutionGlow';
import { SolutionTypesRow } from '../solutions/SolutionTypesRow';
import type { SolutionTypeItem } from '../solutions/SolutionTypesRow';
import { ConnectSectionLabel } from './ConnectSectionLabel';

const accent = (a: number) => `rgba(${CONNECT_ACCENT_RGB},${a})`;

function Bubble({ me, children }: { me?: boolean; children: ReactNode }) {
  return (
    <div
      className={`w-fit max-w-[85%] rounded-2xl px-2.5 py-1.5 text-[9px] ${
        me ? 'ml-auto rounded-br-md text-[#0B0716]' : 'rounded-bl-md bg-white/[0.08] text-white/80'
      }`}
      style={me ? { background: CONNECT_ACCENT } : undefined}
    >
      {children}
    </div>
  );
}

/* ---------- one mock per tier ---------- */

function StarterMock() {
  return (
    <div className="relative flex items-center gap-3">
      <div className="grid h-[104px] w-[104px] place-items-center rounded-2xl border border-white/10 bg-[#0D0A16]">
        <QrCode className="h-16 w-16" style={{ color: CONNECT_ACCENT }} strokeWidth={1.2} />
      </div>
      <div className="w-[150px] space-y-1.5 rounded-2xl border border-white/10 bg-[#0D0A16] p-2.5">
        <span className="flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-wider text-white/40">
          <MessageCircle className="h-2.5 w-2.5" /> Business number
        </span>
        <Bubble>Hi, are you open?</Bubble>
        <Bubble me>Hi! Yes, 9am–6pm today 👋</Bubble>
      </div>
      <Toast icon={<Check className={iconSm} />} className="-bottom-6 left-2">
        Meta-verified
      </Toast>
    </div>
  );
}

function GrowthMock() {
  return (
    <div className="relative">
      <div className="w-[240px] space-y-1.5 rounded-2xl border border-white/10 bg-[#0D0A16] p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
        <span className="flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-wider text-white/40">
          <Bot className="h-2.5 w-2.5" /> Qualifying bot
        </span>
        <Bubble me>What service do you need?</Bubble>
        <Bubble>Braces, for my son</Bubble>
        <Bubble me>When would you like to start?</Bubble>
      </div>
      <Toast icon={<Star className={iconSm} />} className="-right-8 -top-5">
        Lead score 8/10 · Hot
      </Toast>
      <Toast icon={<Sheet className={iconSm} />} className="-bottom-5 -left-6">
        Logged to Google Sheets
      </Toast>
    </div>
  );
}

function ProMock() {
  return (
    <div className="relative">
      <Browser url="connect · broadcasts" className="w-[260px]">
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-md border border-white/[0.08] p-2">
            <Megaphone className="h-3.5 w-3.5" style={{ color: CONNECT_ACCENT }} />
            <span className="text-[9px] text-white/75">Raya promo · 1,000 contacts</span>
            <span
              className="ml-auto rounded px-1.5 py-0.5 font-mono text-[7px] uppercase"
              style={{ background: accent(0.18), color: CONNECT_ACCENT }}
            >
              Opted-in
            </span>
          </div>
          <div className="mt-2 flex h-14 items-end gap-1 rounded-md border border-white/[0.06] p-2">
            {[30, 48, 40, 62, 55, 78, 92].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(to top, ${accent(0.25)}, ${accent(0.8)})`,
                }}
              />
            ))}
          </div>
          <span className="mt-1.5 flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-white/40" />
            <Bar w="90px" />
          </span>
        </div>
      </Browser>
      <Toast icon={<Bot className={iconSm} />} className="-bottom-5 -right-6">
        AI trained on your price list
      </Toast>
    </div>
  );
}

function CustomMock() {
  const channels = [
    { icon: <MessageCircle className="h-3.5 w-3.5" />, label: 'WhatsApp' },
    { icon: <Instagram className="h-3.5 w-3.5" />, label: 'Instagram' },
    { icon: <Send className="h-3.5 w-3.5" />, label: 'Telegram' },
  ];
  return (
    <div className="relative flex w-[260px] flex-col items-center">
      <div className="flex gap-2">
        {channels.map((c) => (
          <span
            key={c.label}
            className="flex w-[74px] flex-col items-center gap-1 rounded-xl border px-2 py-2"
            style={{ borderColor: accent(0.35), background: accent(0.07) }}
          >
            <span style={{ color: CONNECT_ACCENT }}>{c.icon}</span>
            <span className="text-[8.5px] font-medium text-white/75">{c.label}</span>
          </span>
        ))}
      </div>
      <span className="h-4 w-px" style={{ background: accent(0.5) }} />
      <span
        className="rounded-lg border px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em]"
        style={{ borderColor: accent(0.45), color: CONNECT_ACCENT, background: accent(0.1) }}
      >
        One inbox · every branch
      </span>
    </div>
  );
}

/* ---------- section backdrop ---------- */

const CODE_COLUMNS: string[][] = [
  [
    "import { onMessage } from '@/lib/whatsapp';",
    '',
    'onMessage(async (msg) => {',
    '  const lead = await leads.upsert(msg.from);',
    '',
    '  // after hours? the bot still answers',
    '  if (!isOpen(now())) {',
    "    return reply(msg, 'away', { opens: '9am' });",
    '  }',
    '',
    '  const intent = await classify(msg.text);',
    '  await route(lead, intent);',
    '});',
    '',
    "export const templates = ['greeting', 'reminder'];",
  ],
  [
    '// qualify before a human steps in',
    'const score = scoreLead({',
    '  service: answers.service,',
    '  timeline: answers.timeline,',
    '  budget: answers.budget,',
    '});',
    '',
    'if (score >= 7) {',
    "  await assign(lead, 'front-desk');",
    "  await notify(team, 'hot-lead', lead);",
    '}',
    '',
    "await sheets.append('Leads', lead);",
  ],
  [
    'const audience = contacts.filter(',
    '  (c) => c.optIn && !c.unsubscribed,',
    ');',
    '',
    '// marketing template, consented list only',
    'await broadcast({',
    "  template: 'raya-promo',",
    "  category: 'marketing',",
    '  to: audience,',
    '});',
    '',
    "onReply('STOP', (c) => contacts.optOut(c));",
  ],
];

/* ---------- layout ---------- */

const EXTRAS: Record<string, Pick<SolutionTypeItem, 'mock' | 'badge' | 'mockScale' | 'note'>> = {
  '01': { mock: <StarterMock />, mockScale: 0.95 },
  '02': { mock: <GrowthMock />, badge: 'Qualifies leads', mockScale: 0.9 },
  '03': { mock: <ProMock />, badge: 'AI assistant', mockScale: 0.92 },
  '04': { mock: <CustomMock />, badge: 'Multi-channel', mockScale: 1, note: SETUP_TIERS_NOTE },
};

const ITEMS: SolutionTypeItem[] = SETUP_TIERS.map(({ managementPlan, ...tier }) => ({
  ...tier,
  planLine: `Management plan: ${managementPlan}`,
  ...EXTRAS[tier.number],
}));

export function ConnectSetupTiers() {
  return (
    <section
      className="relative overflow-hidden bg-[#06040C] px-6 py-14 md:py-20"
      style={{ ['--mock-accent-rgb' as string]: CONNECT_ACCENT_RGB }}
    >
      <CodeBackdrop columns={CODE_COLUMNS} rgb={CONNECT_ACCENT_RGB} />
      <GlowDivider position="top" rgb={CONNECT_ACCENT_RGB} />
      <GlowDivider position="bottom" rgb={CONNECT_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <ConnectSectionLabel>What We Build</ConnectSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              WhatsApp that <br className="hidden sm:block" />
              <span className="font-serif italic font-normal" style={{ color: CONNECT_ACCENT }}>
                answers for you.
              </span>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/55 lg:pb-2">
            One-off setup. Move up a tier later as you&apos;re ready.
          </p>
        </div>

        <div className="mt-10">
          <SolutionTypesRow
            items={ITEMS}
            accentHex={CONNECT_ACCENT}
            accentRgb={CONNECT_ACCENT_RGB}
          />
        </div>
      </div>
    </section>
  );
}
