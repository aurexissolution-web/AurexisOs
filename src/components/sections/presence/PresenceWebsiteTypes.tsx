// src/components/sections/presence/PresenceWebsiteTypes.tsx
import {
  BarChart3,
  Check,
  FileText,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  ShoppingCart,
} from 'lucide-react';
import {
  WEBSITE_TYPES,
  INCLUDED_EVERYWHERE,
  CUSTOM_SCOPE_NOTE,
  PRESENCE_ACCENT,
  PRESENCE_ACCENT_RGB,
} from '@/data/presence-config';
import { Bar, Browser, Toast, iconSm } from '../solutions/MockKit';
import { CodeBackdrop } from '../solutions/CodeBackdrop';
import { GlowDivider } from '../solutions/SolutionGlow';
import { SolutionTypesRow } from '../solutions/SolutionTypesRow';
import type { SolutionTypeItem } from '../solutions/SolutionTypesRow';
import { PresenceSectionLabel } from './PresenceSectionLabel';

const accent = (a: number) => `rgba(${PRESENCE_ACCENT_RGB},${a})`;

/* ---------- mock primitives ---------- */

/* ---------- one mock per website type ---------- */

function LandingMock() {
  return (
    <div className="relative">
      <Browser url="yourcampaign.my" className="w-[230px]">
        <div className="p-3.5">
          <div className="space-y-1.5">
            <Bar w="78%" strong h="h-2" />
            <Bar w="56%" strong h="h-2" />
          </div>
          <div className="mt-2.5 space-y-1">
            <Bar w="90%" />
            <Bar w="70%" />
          </div>
          <div className="mt-3 flex gap-1.5">
            <span className="h-5 w-16 rounded-full" style={{ background: PRESENCE_ACCENT }} />
            <span className="h-5 w-12 rounded-full border border-white/20" />
          </div>
          <div
            className="mt-3 h-10 rounded-md"
            style={{ background: `linear-gradient(120deg, ${accent(0.35)}, rgba(0,70,90,0.4))` }}
          />
        </div>
      </Browser>
      <Toast icon={<MessageCircle className={iconSm} />} className="-bottom-3 -right-10">
        Chat on WhatsApp
      </Toast>
    </div>
  );
}

function BusinessMock() {
  return (
    <div className="relative">
      <Browser url="yourbusiness.com.my" className="w-[360px]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-3.5 py-2">
          <span className="h-3 w-3 rounded-full" style={{ background: PRESENCE_ACCENT }} />
          {['Home', 'About', 'Services', 'Gallery', 'Contact'].map((t, i) => (
            <span
              key={t}
              className="text-[8px] font-medium"
              style={{ color: i === 0 ? PRESENCE_ACCENT : 'rgba(255,255,255,0.45)' }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="p-3.5">
          <div
            className="relative flex h-24 flex-col justify-end rounded-lg p-3"
            style={{
              background: `radial-gradient(80% 90% at 80% 20%, ${accent(0.45)}, transparent 70%), linear-gradient(135deg, #0B2A33, #070B12)`,
            }}
          >
            <div className="space-y-1.5">
              <Bar w="60%" strong h="h-2" />
              <Bar w="40%" />
            </div>
            <span className="mt-2 h-4 w-14 rounded-full" style={{ background: PRESENCE_ACCENT }} />
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-md border border-white/[0.08] p-2">
                <span className="block h-3 w-3 rounded" style={{ background: accent(0.3) }} />
                <div className="mt-1.5 space-y-1">
                  <Bar w="80%" strong />
                  <Bar w="60%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Browser>
      <Toast icon={<MapPin className={iconSm} />} className="-left-4 bottom-4">
        <span>
          On Google Maps
          <span className="block text-[8.5px] font-normal text-white/45">
            Open now · Directions
          </span>
        </span>
      </Toast>
      <Toast icon={<Mail className={iconSm} />} className="-right-4 top-8">
        New enquiry
      </Toast>
    </div>
  );
}

function CorporateMock() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 translate-x-7 -translate-y-5 rounded-xl border border-white/[0.06] bg-[#070B12]/60"
        aria-hidden
      />
      <div
        className="absolute inset-0 translate-x-3.5 -translate-y-2.5 rounded-xl border border-white/[0.08] bg-[#070B12]/80"
        aria-hidden
      />
      <Browser url="yourgroup.com.my/team" className="relative w-[230px]">
        <div className="p-3.5">
          <Bar w="45%" strong h="h-2" />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[0.8, 0.55, 0.4, 0.3].map((o) => (
              <div key={o} className="flex flex-col items-center gap-1">
                <span
                  className="h-7 w-7 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${accent(o)}, rgba(0,80,100,${o}))`,
                  }}
                />
                <Bar w="80%" />
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-2.5">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-[7px] text-white/30">NEWS</span>
                <Bar w="70%" />
              </div>
            ))}
          </div>
        </div>
      </Browser>
      <span
        className="absolute -bottom-3 -left-6 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em]"
        style={{ borderColor: accent(0.4), background: '#081017', color: PRESENCE_ACCENT }}
      >
        15 pages
      </span>
    </div>
  );
}

function EcommerceMock() {
  return (
    <div className="relative">
      <Browser url="yourstore.my/shop" className="w-[240px]">
        <div className="flex items-center justify-between px-3.5 pt-3">
          <Bar w="40%" strong h="h-2" />
          <span className="relative text-white/60">
            <ShoppingCart className="h-3.5 w-3.5" />
            <span
              className="absolute -right-1.5 -top-1.5 grid h-3 w-3 place-items-center rounded-full text-[7px] font-bold text-[#02040A]"
              style={{ background: PRESENCE_ACCENT }}
            >
              2
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3.5">
          {['RM89', 'RM129', 'RM59', 'RM210'].map((p, i) => (
            <div key={p} className="rounded-md border border-white/[0.08] p-1.5">
              <div
                className="h-10 rounded"
                style={{
                  background: `linear-gradient(${120 + i * 40}deg, ${accent(0.35 - i * 0.05)}, rgba(0,60,80,0.4))`,
                }}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <Bar w="50%" />
                <span className="font-mono text-[7.5px]" style={{ color: PRESENCE_ACCENT }}>
                  {p}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Browser>
      <Toast icon={<Check className={iconSm} />} className="-bottom-4 -right-10">
        Paid via FPX
      </Toast>
    </div>
  );
}

function BookingMock() {
  const available = [9, 10, 12, 16, 17, 19];
  const selected = 17;
  return (
    <div className="relative">
      <div className="w-[230px] rounded-xl border border-white/10 bg-[#070B12] p-3.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/80">Pick a slot</span>
          <span className="font-mono text-[8px] text-white/35">SEPT</span>
        </div>
        <div className="mt-2.5 grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }, (_, i) => i + 1).map((d) => {
            const isSel = d === selected;
            const isAvail = available.includes(d);
            return (
              <span
                key={d}
                className="grid h-5 place-items-center rounded text-[7.5px] font-medium"
                style={{
                  background: isSel ? PRESENCE_ACCENT : isAvail ? accent(0.1) : 'transparent',
                  color: isSel ? '#02040A' : isAvail ? PRESENCE_ACCENT : 'rgba(255,255,255,0.2)',
                  border: isAvail && !isSel ? `1px solid ${accent(0.3)}` : '1px solid transparent',
                }}
              >
                {d}
              </span>
            );
          })}
        </div>
        <div className="mt-2.5 flex gap-1.5">
          {['10:00', '11:30', '3:00'].map((t, i) => (
            <span
              key={t}
              className="rounded-md px-1.5 py-1 font-mono text-[7.5px]"
              style={{
                background: i === 1 ? accent(0.2) : 'rgba(255,255,255,0.05)',
                color: i === 1 ? PRESENCE_ACCENT : 'rgba(255,255,255,0.5)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <Toast icon={<Check className={iconSm} />} className="-bottom-5 -right-12">
        <span>
          Booking confirmed
          <span className="block text-[8.5px] font-normal text-white/45">
            WhatsApp reminder sent
          </span>
        </span>
      </Toast>
    </div>
  );
}

function PortalMock() {
  return (
    <div className="relative">
      <Browser url="portal.yourfirm.my" className="w-[270px]">
        <div className="flex">
          <div className="w-12 space-y-2 border-r border-white/[0.06] p-2.5">
            <span className="block h-3 w-3 rounded-full" style={{ background: PRESENCE_ACCENT }} />
            <Bar w="100%" />
            <Bar w="80%" />
            <Bar w="90%" />
          </div>
          <div className="flex-1 p-3">
            <Bar w="55%" strong h="h-2" />
            <div
              className="mt-2.5 rounded-lg border p-2.5"
              style={{ borderColor: accent(0.25), background: accent(0.05) }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-semibold text-white/80">Case #1042</span>
                <span className="font-mono text-[7.5px]" style={{ color: PRESENCE_ACCENT }}>
                  64%
                </span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-white/10">
                <div className="h-1 w-[64%] rounded-full" style={{ background: PRESENCE_ACCENT }} />
              </div>
              <span className="mt-1.5 block text-[7.5px] text-white/40">Status: In review</span>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex flex-1 items-center gap-1 rounded-md border border-white/[0.08] p-1.5 text-white/45"
                >
                  <FileText className="h-3 w-3" />
                  <Bar w="60%" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Browser>
      <Toast icon={<Lock className={iconSm} />} className="-left-8 -top-3">
        Secure client login
      </Toast>
    </div>
  );
}

function CustomMock() {
  const bars = [40, 62, 48, 75, 58, 88, 70, 95];
  return (
    <div className="relative">
      <Browser url="ops.yourcompany.my" className="w-[290px]">
        <div className="p-3.5">
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Orders', '1,284'],
              ['Branches', '6'],
              ['Invoices', '312'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-white/[0.08] p-1.5">
                <span className="block font-mono text-[6.5px] uppercase tracking-wider text-white/35">
                  {k}
                </span>
                <span className="text-[11px] font-semibold text-white/85">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex h-16 items-end gap-1.5 rounded-md border border-white/[0.06] p-2">
            {bars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(to top, ${accent(0.25)}, ${accent(i === bars.length - 1 ? 0.95 : 0.6)})`,
                }}
              />
            ))}
          </div>
        </div>
      </Browser>
      <Toast icon={<BarChart3 className={iconSm} />} className="-right-10 top-8">
        Live reports
      </Toast>
      <Toast icon={<Check className={iconSm} />} className="-bottom-4 -left-8">
        e-Invoice submitted · LHDN
      </Toast>
    </div>
  );
}

/* ---------- section backdrop ---------- */

const CODE_COLUMNS: string[][] = [
  [
    "import { createBooking } from '@/lib/booking';",
    '',
    'export async function POST(req: Request) {',
    '  const { name, phone, slot } = await req.json();',
    '  const booking = await createBooking({ name, phone, slot });',
    '',
    '  // confirm on WhatsApp straight away',
    "  await sendWhatsApp(phone, 'booking-confirmed', {",
    '    date: booking.date,',
    '    time: booking.time,',
    '  });',
    '',
    '  return Response.json({ ok: true, id: booking.id });',
    '}',
    '',
    'export const metadata = {',
    "  title: 'Book a consultation',",
    "  description: 'Pick a slot that suits you.',",
    '};',
  ],
  [
    'export default function Home() {',
    '  return (',
    '    <main className="min-h-screen">',
    '      <Hero',
    '        title="Restore balance."',
    '        cta="Book a consultation"',
    '      />',
    '      <Services items={services} />',
    '      <Gallery images={photos} />',
    '      <Reviews source="google" />',
    '      <Contact whatsapp map hours />',
    '    </main>',
    '  );',
    '}',
    '',
    '// SEO: structured data for Google',
    'const schema = {',
    "  '@type': 'LocalBusiness',",
    "  address: 'Brickfields, Kuala Lumpur',",
    "  openingHours: 'Mo-Sa 09:00-18:00',",
    '};',
  ],
  [
    'const order = await db.order.create({',
    '  data: {',
    '    items: cart.items,',
    '    total: cart.total,',
    "    payment: 'fpx',",
    '  },',
    '});',
    '',
    '// LHDN e-Invoice',
    'const invoice = await submitEInvoice({',
    '  orderId: order.id,',
    '  buyer: customer.tin,',
    '  lines: order.items,',
    '});',
    '',
    'if (invoice.status === "valid") {',
    "  await notify(owner, 'invoice-submitted');",
    '}',
    '',
    'export const revalidate = 60;',
  ],
];

/* ---------- layout ---------- */

// Icon, preview and badge per type, keyed by WEBSITE_TYPES[].number.
const EXTRAS: Record<string, Pick<SolutionTypeItem, 'mock' | 'badge' | 'note' | 'mockScale'>> = {
  '01': { mock: <LandingMock /> },
  '02': {
    mock: <BusinessMock />,
    badge: 'Most popular',
    mockScale: 0.62,
  },
  '03': { mock: <CorporateMock /> },
  '04': { mock: <EcommerceMock /> },
  '05': { mock: <BookingMock /> },
  '06': { mock: <PortalMock /> },
  '07': {
    mock: <CustomMock />,
    badge: 'Bespoke',
    note: CUSTOM_SCOPE_NOTE,
  },
};

const ITEMS: SolutionTypeItem[] = WEBSITE_TYPES.map(({ carePlan, ...type }) => ({
  ...type,
  planLine: `Care plan: ${carePlan}`,
  ...EXTRAS[type.number],
}));

export function PresenceWebsiteTypes() {
  return (
    <section
      className="relative overflow-hidden bg-[#03070C] px-6 py-14 md:py-20"
      style={{ ['--mock-accent-rgb' as string]: PRESENCE_ACCENT_RGB }}
    >
      <CodeBackdrop columns={CODE_COLUMNS} rgb={PRESENCE_ACCENT_RGB} />
      <GlowDivider position="bottom" rgb={PRESENCE_ACCENT_RGB} />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <PresenceSectionLabel>What We Build</PresenceSectionLabel>
            <h2
              className="font-sans font-extrabold text-white"
              style={{
                fontSize: 'clamp(30px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              Seven ways to{' '}
              <span className="font-serif italic font-normal" style={{ color: PRESENCE_ACCENT }}>
                show up
              </span>{' '}
              online.
            </h2>
          </div>
          <p className="font-mono text-[10.5px] uppercase leading-[1.8] tracking-[0.06em] text-white/40 lg:pb-2">
            {INCLUDED_EVERYWHERE}
          </p>
        </div>

        <div className="mt-10">
          <SolutionTypesRow
            items={ITEMS}
            accentHex={PRESENCE_ACCENT}
            accentRgb={PRESENCE_ACCENT_RGB}
          />
        </div>
      </div>
    </section>
  );
}
