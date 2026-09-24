"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TECH_ECOSYSTEM_ITEMS,
  TECH_ECOSYSTEM_OVERVIEW,
} from "@/data/navigation";
import { trackNavEvent } from "@/lib/navigation/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;
const DEFAULT_ACTIVE = "02";

function EcosystemVisual({ activeStage }: { activeStage: string }) {
  const active = TECH_ECOSYSTEM_ITEMS.find((item) => item.stage === activeStage) ?? TECH_ECOSYSTEM_ITEMS[1];
  const points: Record<string, { x: number; y: number }> = {
    "01": { x: 88, y: 70 },
    "02": { x: 176, y: 50 },
    "03": { x: 148, y: 132 },
    "04": { x: 68, y: 144 },
    "05": { x: 122, y: 204 },
    "06": { x: 214, y: 172 },
  };
  const lines = [
    ["01", "02"],
    ["02", "03"],
    ["03", "04"],
    ["04", "05"],
    ["05", "06"],
    ["03", "05"],
    ["02", "06"],
  ];

  return (
    <div className="relative h-full min-h-[244px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#020408]/85 p-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_45%_36%,rgba(0,240,255,0.11),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_60%)]"
      />
      <svg className="relative z-10 h-[210px] w-full" viewBox="0 0 280 240" aria-hidden>
        {lines.map(([from, to]) => {
          const a = points[from];
          const b = points[to];
          const on = from === activeStage || to === activeStage;
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={on ? "rgba(0,240,255,0.68)" : "rgba(255,255,255,0.12)"}
              strokeWidth={on ? 1.6 : 1}
              initial={false}
              animate={{ opacity: on ? 1 : 0.42 }}
              transition={{ duration: 0.18 }}
            />
          );
        })}
        {TECH_ECOSYSTEM_ITEMS.map((item) => {
          const p = points[item.stage];
          const on = item.stage === activeStage;
          return (
            <g key={item.stage}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={on ? 13 : 9}
                fill={on ? "rgba(0,240,255,0.18)" : "rgba(255,255,255,0.06)"}
                stroke={on ? "rgba(0,240,255,0.82)" : "rgba(255,255,255,0.18)"}
                strokeWidth={1.2}
                initial={false}
                animate={{ r: on ? 13 : 9 }}
                transition={{ duration: 0.18 }}
              />
              <text
                x={p.x}
                y={p.y + 3}
                textAnchor="middle"
                className={on ? "fill-white" : "fill-white/45"}
                style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}
              >
                {item.stage}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="relative z-10 border-t border-white/[0.08] pt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-electric-cyan)]/70">
          {active.title.replace("™", "")}
        </p>
        <p className="mt-2 text-[13px] leading-snug text-white/66">{active.microcopy}</p>
      </div>
    </div>
  );
}

export function TechEcosystemMenu({
  variant,
  isOpen,
  onOpen,
  onClose,
  currentPage,
  visible = true,
}: {
  variant: "header" | "pill";
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  currentPage: string;
  visible?: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const panelId = useId();
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const [activeStage, setActiveStage] = useState(DEFAULT_ACTIVE);
  const isActivePage = currentPage === "/tech-ecosystem" || currentPage.startsWith("/tech-ecosystem/");

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    function reposition() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const triggerRect = trigger.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      const viewportPadding = 16;
      let left = triggerRect.left + triggerRect.width / 2 - panelWidth / 2;
      if (left < viewportPadding) left = viewportPadding;
      else if (left + panelWidth > window.innerWidth - viewportPadding) {
        left = window.innerWidth - viewportPadding - panelWidth;
      }
      setPanelPos({ top: triggerRect.bottom + 12, left });
    }

    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = wrapperRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) onClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    }
    function handleScroll() {
      onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setPanelPos(null);
  }, [isOpen]);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(onClose, 180);
  }

  function handleOpenIntent() {
    clearCloseTimer();
    onOpen();
  }

  function handleTriggerClick() {
    if (isOpen) onClose();
    else onOpen();
  }

  function handleCapabilityClick(title: string, stage: string) {
    trackNavEvent("ecosystem_capability_click", {
      capability_name: title,
      capability_stage: stage,
      current_page: currentPage,
    });
    onClose();
  }

  function handleOverviewClick() {
    trackNavEvent("ecosystem_overview_click", { current_page: currentPage });
    onClose();
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={handleOpenIntent}
      onMouseLeave={scheduleClose}
      onFocusCapture={clearCloseTimer}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleTriggerClick}
        className={cn(
          "flex min-h-[44px] items-center gap-1 whitespace-nowrap rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60",
          isOpen || isActivePage
            ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "text-[#9ca3af] hover:text-white",
          variant === "pill" && !isOpen && "hover:bg-white/[0.04]"
        )}
      >
        Tech Ecosystem
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <style>{`
        .eco-cap-row { position: relative; }
        .eco-cap-row::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(90deg, rgba(0,240,255,0.075), rgba(255,255,255,0.025));
          opacity: 0;
          transition: opacity 180ms ease;
        }
        .eco-cap-row:hover::before,
        .eco-cap-row:focus-visible::before {
          opacity: 1;
        }
        .eco-cap-row:hover .eco-cap-arrow,
        .eco-cap-row:focus-visible .eco-cap-arrow {
          transform: translateX(3px);
          color: var(--color-electric-cyan);
        }
        @media (prefers-reduced-motion: reduce) {
          .eco-cap-row::before, .eco-cap-arrow { transition: none; }
        }
      `}</style>

      {mounted && visible && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={panelId}
              ref={panelRef}
              role="region"
              aria-label="Tech Ecosystem"
              onMouseEnter={handleOpenIntent}
              onMouseLeave={scheduleClose}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8, filter: "blur(2px)" }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE }}
              style={{
                position: "fixed",
                top: panelPos?.top ?? 0,
                left: panelPos?.left ?? 0,
                visibility: panelPos === null ? "hidden" : "visible",
              }}
              className="z-[80] w-[min(880px,92vw)]"
            >
              <div
                className="relative overflow-hidden rounded-[22px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,240,255,0.03) 100%), rgba(2, 4, 8, 0.94)",
                  border: "1px solid rgba(184, 231, 244, 0.16)",
                  backdropFilter: "blur(34px) saturate(165%)",
                  WebkitBackdropFilter: "blur(34px) saturate(165%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(0,0,0,0.22), 0 26px 70px rgba(0,0,0,0.56), 0 0 42px rgba(0,240,255,0.08)",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-electric-cyan)]/55 to-transparent"
                />
                <div className="grid grid-cols-[1fr_270px] gap-0">
                  <div className="p-5">
                    <div className="mb-4 flex items-end justify-between gap-5">
                      <div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-electric-cyan)]/75">
                          {TECH_ECOSYSTEM_OVERVIEW.eyebrow}
                        </span>
                        <p className="mt-2 max-w-md text-[13.5px] leading-[1.55] text-white/62">
                          {TECH_ECOSYSTEM_OVERVIEW.body}
                        </p>
                      </div>
                    </div>
                    <ul className="grid list-none grid-cols-2 gap-2.5">
                      {TECH_ECOSYSTEM_ITEMS.map((item) => {
                        const active = item.stage === activeStage;
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onMouseEnter={() => setActiveStage(item.stage)}
                              onFocus={() => setActiveStage(item.stage)}
                              onClick={() => handleCapabilityClick(item.title, item.stage)}
                              className={cn(
                                "eco-cap-row group flex min-h-[96px] gap-3 rounded-[14px] border px-3.5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60",
                                active
                                  ? "border-[var(--color-electric-cyan)]/35 bg-[var(--color-electric-cyan)]/[0.09]"
                                  : "border-white/[0.08] bg-white/[0.05]"
                              )}
                            >
                              <span className={cn(
                                "relative z-10 w-8 shrink-0 font-mono text-[11px] tracking-[0.18em]",
                                active ? "text-[var(--color-electric-cyan)]" : "text-white/35"
                              )}>
                                {item.stage}
                              </span>
                              <span className="relative z-10 min-w-0 flex-1">
                                <span className="flex items-center justify-between gap-3">
                                  <span className="text-[14.5px] font-semibold text-white">{item.title}</span>
                                  <ArrowRight className="eco-cap-arrow h-3.5 w-3.5 shrink-0 text-white/28 transition-all duration-200" />
                                </span>
                                <span className="mt-1.5 block text-[12.5px] leading-snug text-white/48">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="flex flex-col justify-between border-l border-white/[0.08] bg-[#020408]/80 p-5">
                    <EcosystemVisual activeStage={activeStage} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/[0.08] bg-black/18 px-5 py-4">
                  <p className="max-w-[520px] text-[12.5px] leading-snug text-white/42">
                    {TECH_ECOSYSTEM_OVERVIEW.footerText}
                  </p>
                  <Link
                    href={TECH_ECOSYSTEM_OVERVIEW.buttonHref}
                    onClick={handleOverviewClick}
                    className="group inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-electric-cyan)]/30 bg-[var(--color-electric-cyan)]/[0.09] px-4 text-[13px] font-semibold text-white transition hover:bg-[var(--color-electric-cyan)]/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60"
                  >
                    {TECH_ECOSYSTEM_OVERVIEW.buttonLabel}
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--color-electric-cyan)] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
