'use client';

// src/components/sections/solutions/SolutionTypesRow.tsx
// Scrollable row of glass cards; each opens a pop-up with the full details.
// Shared by the solutions pages — colour comes from the page's accent props.
import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

export interface SolutionTypeItem {
  number: string;
  name: string;
  price: string;
  bestFor: string;
  timeline: string;
  planLine: string;
  includes: string[];
  note?: string;
  mock: ReactNode;
  badge?: string;
  /** Scale of the mock inside the card thumbnail (default 0.72). */
  mockScale?: number;
}

const GLASS =
  'border shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_30px_80px_-30px_rgba(0,0,0,0.8)]';
const SHEEN = 'linear-gradient(140deg, rgba(255,255,255,0.08), transparent 38%)';

export function SolutionTypesRow({
  items,
  accentHex,
  accentRgb,
  ctaHref = '#get-a-quote',
}: {
  items: SolutionTypeItem[];
  accentHex: string;
  accentRgb: string;
  ctaHref?: string;
}) {
  const accent = (a: number) => `rgba(${accentRgb},${a})`;
  const dialogTitleId = useId();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIdx !== null && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (openIdx === null && dialog.open) {
      dialog.close();
    }
  }, [openIdx]);

  const onDialogClose = () => {
    document.documentElement.style.overflow = '';
    setOpenIdx(null);
  };

  // Clicks on the ::backdrop land on the <dialog> element itself.
  const onDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) setOpenIdx(null);
  };

  const scrollerRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, []);

  const scrollByCard = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * 316, behavior: 'smooth' });
  };

  const open = openIdx !== null ? items[openIdx] : null;
  // "Everything in Starter, plus:" reads better as a tag than as a ticked feature.
  const firstInclude = open?.includes[0] ?? '';
  const inherited = firstInclude.startsWith('Everything in')
    ? firstInclude.replace(/, plus:$/, '')
    : null;
  const openFeatures = open ? (inherited ? open.includes.slice(1) : open.includes) : [];

  return (
    <>
      <div
        className={`mb-5 flex items-center justify-end gap-2 ${atStart && atEnd ? 'invisible' : ''}`}
      >
        {[
          { dir: -1, label: 'Previous', Icon: ChevronLeft, disabled: atStart },
          { dir: 1, label: 'Next', Icon: ChevronRight, disabled: atEnd },
        ].map(({ dir, label, Icon, disabled }) => (
          <button
            key={label}
            type="button"
            onClick={() => scrollByCard(dir)}
            disabled={disabled}
            className="grid h-10 w-10 place-items-center rounded-full border text-white/80 transition-all hover:text-white focus-visible:outline-none focus-visible:ring-2 disabled:opacity-30"
            style={{
              borderColor: accent(0.35),
              background: accent(0.08),
              ['--tw-ring-color' as string]: accent(0.6),
            }}
          >
            <Icon aria-hidden className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>

      <ul
        ref={scrollerRef}
        onScroll={updateEdges}
        className="-mx-6 -mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ mock, badge, mockScale = 0.72, ...type }, i) => (
          <li
            key={type.number}
            className="min-w-[280px] flex-1 shrink-0 snap-start sm:min-w-[300px]"
          >
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setOpenIdx(i)}
              className={`group relative flex h-full w-full flex-col overflow-hidden rounded-3xl text-left transition-[transform,border-color] duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 ${GLASS}`}
              style={{
                borderColor: badge ? accent(0.45) : 'rgba(255,255,255,0.14)',
                backgroundColor: 'rgba(7,12,19,0.94)',
                backgroundImage: SHEEN,
                ['--tw-ring-color' as string]: accent(0.6),
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ boxShadow: `inset 0 0 0 1px ${accent(0.55)}` }}
              />

              <span
                aria-hidden
                className="relative flex h-[210px] items-center justify-center overflow-hidden border-b border-white/[0.08]"
              >
                <span
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                    maskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent)',
                  }}
                />
                <span className="relative block" style={{ transform: `scale(${mockScale})` }}>
                  <span className="block transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                    {mock}
                  </span>
                </span>
              </span>

              <span className="flex flex-1 flex-col p-5">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10.5px] tracking-[0.2em] text-white/35">
                    {type.number}
                  </span>
                  {badge && (
                    <span
                      className="rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]"
                      style={{ background: accent(0.16), color: accentHex }}
                    >
                      {badge}
                    </span>
                  )}
                </span>
                <span className="mt-2 block text-[20px] font-semibold leading-tight tracking-[-0.015em] text-white">
                  {type.name}
                </span>
                <span className="mt-1 block text-[13px] leading-[1.45] text-white/45">
                  {type.bestFor}
                </span>

                <span className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <span>
                    <span
                      className="block font-serif text-[24px] italic leading-none"
                      style={{ color: accentHex }}
                    >
                      {type.price}
                    </span>
                    <span className="mt-2 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">
                      {type.timeline}
                    </span>
                  </span>
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-300 group-hover:rotate-90 group-hover:bg-[var(--accent-fill)] group-hover:text-[#02040A]"
                    style={{
                      borderColor: accent(0.55),
                      background: accent(0.12),
                      color: accentHex,
                      ['--accent-fill' as string]: accentHex,
                    }}
                  >
                    <Plus aria-hidden className="h-5 w-5" />
                    <span className="sr-only">See details</span>
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={onDialogClose}
        onClick={onDialogClick}
        aria-labelledby={dialogTitleId}
        data-lenis-prevent
        className="m-auto max-h-none w-[min(980px,calc(100%-2rem))] max-w-none overflow-visible bg-transparent p-0 text-white backdrop:bg-[#02040A]/75 backdrop:backdrop-blur-md"
      >
        {open && (
          <div
            className={`relative grid max-h-[90vh] animate-presence-pop overflow-y-auto rounded-3xl md:grid-cols-[1.05fr_1fr] md:overflow-hidden ${GLASS} backdrop-blur-xl`}
            style={{
              borderColor: accent(0.35),
              backgroundColor: 'rgba(7,12,19,0.88)',
              backgroundImage: SHEEN,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(null)}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-[#02040A]/60 text-white/70 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2"
              style={{ ['--tw-ring-color' as string]: accent(0.6) }}
            >
              <X aria-hidden className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <div
              aria-hidden
              className="relative flex min-h-[280px] items-center justify-center overflow-hidden border-b border-white/[0.1] md:min-h-[460px] md:border-b-0 md:border-r"
            >
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                  maskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent)',
                }}
              />
              <div className="relative scale-[0.85] sm:scale-110">{open.mock}</div>
            </div>

            <div className="flex flex-col p-6 md:max-h-[90vh] md:overflow-y-auto md:p-8">
              <div className="flex items-center gap-3 pr-10">
                <span className="font-mono text-[11px] tracking-[0.2em] text-white/35">
                  {open.number}
                </span>
                {open.badge && (
                  <span
                    className="rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em]"
                    style={{ background: accent(0.16), color: accentHex }}
                  >
                    {open.badge}
                  </span>
                )}
              </div>

              <h3
                id={dialogTitleId}
                className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-white md:text-[32px]"
              >
                {open.name}
              </h3>
              <p className="mt-1 text-[14px] text-white/55">{open.bestFor}</p>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <p
                  className="font-serif text-[34px] italic leading-none"
                  style={{ color: accentHex }}
                >
                  {open.price}
                </p>
                <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
                  {open.timeline}
                </span>
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                {open.planLine}
              </p>

              <p className="mt-6 border-t border-white/[0.08] pt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                What&apos;s included
              </p>
              {inherited && (
                <p
                  className="mt-3 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
                  style={{ background: accent(0.12), color: accentHex }}
                >
                  <Plus aria-hidden className="h-3 w-3" strokeWidth={2.5} />
                  {inherited}
                </p>
              )}
              <ul
                className={`mt-3 grid gap-x-6 gap-y-2 ${
                  openFeatures.length > 8 ? 'sm:grid-cols-2' : ''
                }`}
              >
                {openFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-white/75"
                  >
                    <Check
                      aria-hidden
                      className="mt-[3px] h-3.5 w-3.5 shrink-0"
                      style={{ color: accentHex }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {open.note && (
                <p className="mt-4 text-[12.5px] leading-[1.6] text-white/45">{open.note}</p>
              )}

              <a
                href={ctaHref}
                onClick={() => setOpenIdx(null)}
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border px-6 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2"
                style={{
                  borderColor: accent(0.45),
                  background: accent(0.12),
                  ['--tw-ring-color' as string]: accent(0.6),
                }}
              >
                Get a quote
                <ArrowRight aria-hidden className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
