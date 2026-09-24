"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SOLUTIONS_ITEMS,
  SOLUTIONS_FOOTER_LINKS,
  SOLUTIONS_DISCOVERY_PANEL,
} from "@/data/navigation";
import { trackNavEvent } from "@/lib/navigation/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

export function SolutionsMenu({
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
  /** Whether this nav instance is the one currently visible (header vs. scrolled pill share state, but only one is on-screen at a time). The portaled panel must not render for the hidden instance. */
  visible?: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Position the portaled panel beneath the trigger, clamped to the viewport.
  // Rendered via a portal so it never sits inside the blurred nav pill — a
  // transform/opacity-animating descendant of a `backdrop-filter` ancestor can
  // cause the browser to drop the live blur on that ancestor.
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
      if (left < viewportPadding) {
        left = viewportPadding;
      } else if (left + panelWidth > window.innerWidth - viewportPadding) {
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
      if (!insideTrigger && !insidePanel) {
        onClose();
      }
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

  function handleTriggerClick() {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  }

  function handleOfferClick(title: string, position: number) {
    trackNavEvent("solutions_offer_click", {
      offer_name: title,
      offer_position: position,
      current_page: currentPage,
    });
    onClose();
  }

  function handleFooterLinkClick(
    analyticsId: "solutions_view_all_click" | "ecosystem_crosslink_click",
  ) {
    trackNavEvent(analyticsId, { current_page: currentPage });
    onClose();
  }

  function handleDiscoveryClick() {
    trackNavEvent("solutions_discovery_click", { current_page: currentPage });
    onClose();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleTriggerClick}
        className={cn(
          "flex min-h-[44px] items-center gap-1 whitespace-nowrap rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60",
          isOpen ? "text-white bg-white/[0.08]" : "text-[#9ca3af] hover:text-white",
          variant === "pill" && !isOpen && "hover:bg-white/[0.04]"
        )}
      >
        Solutions
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <style>{`
        .solx-row { position: relative; }
        .solx-row::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: rgba(0, 240, 255, 0.05);
          opacity: 0;
          transition: opacity 150ms ease;
        }
        .solx-row:hover::before,
        .solx-row:focus-visible::before {
          opacity: 1;
        }
        .solx-signal {
          position: absolute;
          left: 44px;
          bottom: 6px;
          height: 1px;
          width: 0;
          background: linear-gradient(90deg, var(--color-electric-cyan), transparent);
          transition: width 220ms ease-out;
        }
        .solx-row:hover .solx-signal,
        .solx-row:focus-visible .solx-signal {
          width: 40px;
        }
        @media (prefers-reduced-motion: reduce) {
          .solx-row::before, .solx-signal { transition: none; }
        }
      `}</style>

      {mounted && visible && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={panelId}
              ref={panelRef}
              role="region"
              aria-label="Solutions"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: EASE }}
              style={{
                position: "fixed",
                top: panelPos?.top ?? 0,
                left: panelPos?.left ?? 0,
                visibility: panelPos === null ? "hidden" : "visible",
              }}
              className="z-[60] w-[min(800px,92vw)]"
            >
            <div
              className="relative overflow-hidden rounded-[20px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%), rgba(8, 9, 14, 0.78)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(32px) saturate(180%)",
                WebkitBackdropFilter: "blur(32px) saturate(180%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.20), 0 24px 64px rgba(0,0,0,0.55)",
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-electric-cyan)]/50 to-transparent"
              />

              <div className="grid grid-cols-[1fr_280px]">
                {/* Solutions list — ~65% width */}
                <ul className="list-none p-3">
                  {SOLUTIONS_ITEMS.map((item, i) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => handleOfferClick(item.title, i + 1)}
                        className="solx-row group/row flex min-h-[72px] items-center gap-4 rounded-xl px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60"
                      >
                        <span className="solx-signal" aria-hidden />
                        <span className="w-7 shrink-0 font-mono text-[11px] tracking-[0.18em] text-white/35 transition-colors duration-200 group-hover/row:text-[var(--color-electric-cyan)]">
                          {item.stage}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold text-white/90 transition-colors duration-200 group-hover/row:text-white">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-[12.5px] leading-snug text-white/45">
                            {item.description}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-white/30 transition-all duration-200 group-hover/row:translate-x-[3px] group-hover/row:text-[var(--color-electric-cyan)]" />
                      </Link>
                    </li>
                  ))}

                  <li className="mt-1 border-t border-white/[0.06] pt-2">
                    {SOLUTIONS_FOOTER_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => handleFooterLinkClick(link.analyticsId)}
                        className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60"
                      >
                        {link.label}
                        <ArrowRight className="h-3.5 w-3.5 text-[var(--color-electric-cyan)]" />
                      </Link>
                    ))}
                  </li>
                </ul>

                {/* Discovery panel — ~35% width */}
                <div className="flex flex-col justify-between border-l border-white/[0.08] bg-white/[0.04] p-5" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                  <div>
                    <span className="block text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[var(--color-electric-cyan)]/80">
                      {SOLUTIONS_DISCOVERY_PANEL.eyebrow}
                    </span>
                    <p className="mt-3 text-[13.5px] leading-[1.55] text-white/65">
                      {SOLUTIONS_DISCOVERY_PANEL.body}
                    </p>
                  </div>
                  <div>
                    <Link
                      href={SOLUTIONS_DISCOVERY_PANEL.buttonHref}
                      onClick={handleDiscoveryClick}
                      className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[var(--color-electric-cyan)] px-4 text-[13px] font-semibold text-[#020408] transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      {SOLUTIONS_DISCOVERY_PANEL.buttonLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <p className="mt-2.5 text-[11px] leading-snug text-white/35">
                      {SOLUTIONS_DISCOVERY_PANEL.supportingText}
                    </p>
                  </div>
                </div>
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
