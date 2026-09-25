"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/data/navigation";
import { useNavState } from "@/lib/hooks/use-nav-state";
import { useShaderEligibility } from "@/lib/hooks/use-shader-eligibility";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { trackNavEvent } from "@/lib/navigation/analytics";
import { ContactCTA } from "@/components/layout/nav/ContactCTA";
import { NavLogo } from "@/components/layout/nav/NavLogo";
import { NavPreview } from "@/components/layout/nav/NavPreview";

// R3F must never land in the nav bundle — every page renders this component.
const CanvasRevealEffect = dynamic(
  () => import("@/components/ui/canvas-reveal-effect").then((m) => m.CanvasRevealEffect),
  { ssr: false },
);

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EASE = [0.16, 1, 0.3, 1] as const;

export function Navbar() {
  const { scrolled, isActive, pathname, mobileOpen, setMobileOpen } = useNavState();
  const reduce = useSafeReducedMotion();
  const shadersOk = useShaderEligibility();
  const lenis = useLenis();

  const [mounted, setMounted] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  function openMenu() {
    setMobileOpen(true);
    trackNavEvent("nav_menu_open", { current_page: pathname });
  }

  function closeMenu() {
    setMobileOpen(false);
    trackNavEvent("nav_menu_close", { current_page: pathname });
  }

  useEffect(() => {
    if (!mobileOpen) return;

    const panel = panelRef.current;
    const trigger = triggerRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [mobileOpen, setMobileOpen]);

  // Every stop() needs a matching start(), including on unmount and route change.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previous;
      lenis?.start();
    };
  }, [mobileOpen, lenis]);

  const overlay = (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          key="overture"
          ref={panelRef}
          id="primary-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
          className="fixed inset-0 z-[60] overflow-hidden"
          style={{ background: "#010204" }}
        >
          {shadersOk && !reduce && (
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60">
              <CanvasRevealEffect
                animationSpeed={3}
                colors={[[0, 240, 255]]}
                dotSize={2}
                showGradient
              />
            </div>
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(45% 55% at 75% 45%, rgba(0,240,255,0.10), transparent 70%), radial-gradient(35% 45% at 10% 90%, rgba(0,120,160,0.12), transparent 70%)",
            }}
          />

          <div className="relative flex h-full flex-col px-6 py-6 md:px-12">
            <div className="flex items-center justify-between">
              <NavLogo onNavigate={closeMenu} />
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full text-white/60 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#00F0FF]/60"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <nav
              aria-label="Primary"
              className="flex flex-1 items-center gap-16 overflow-y-auto py-8"
            >
              <motion.ul
                className="flex list-none flex-col gap-1"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: reduce ? 0 : 0.06,
                      delayChildren: reduce ? 0 : 0.1,
                    },
                  },
                }}
                onMouseLeave={() => setPreview(null)}
              >
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <motion.li
                      key={link.href}
                      variants={{
                        hidden: { opacity: 0, y: reduce ? 0 : 24 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.6, ease: EASE },
                        },
                      }}
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        onClick={closeMenu}
                        onMouseEnter={() => setPreview(link.href)}
                        onFocus={() => setPreview(link.href)}
                        className="group flex items-baseline gap-5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]/60"
                      >
                        <span
                          aria-hidden
                          className="text-[10px] uppercase tracking-[0.22em] text-[#00F0FF]/60 font-mono"
                        >
                          {link.stage}
                        </span>
                        <span
                          style={{ fontStyle: "italic" }}
                          className={cn(
                            "text-[clamp(2.75rem,8vw,5.5rem)] leading-[1.05] tracking-[-0.02em] transition-colors duration-300 font-serif",
                            active || preview === link.href
                              ? "text-white"
                              : "text-white/45 group-hover:text-white",
                          )}
                        >
                          {link.label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <div className="hidden flex-1 items-center justify-center md:flex">
                <div
                  className="relative aspect-[4/3] w-full max-w-[460px] overflow-hidden rounded-2xl border border-white/15 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),0_0_60px_-20px_rgba(0,240,255,0.25)]"
                  style={{ background: "#05070D" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={preview ?? "idle"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <NavPreview href={preview} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </nav>

            <div className="pt-4">
              <ContactCTA variant="solid" onNavigate={closeMenu} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
        style={{
          background: scrolled ? "rgba(3,4,8,0.72)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(160%)" : undefined,
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(160%)" : undefined,
        }}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between px-6 lg:px-8">
          <NavLogo />

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <ContactCTA variant="text" />
              <span aria-hidden className="h-3.5 w-px bg-white/15" />
            </div>
            <button
              ref={triggerRef}
              type="button"
              onClick={openMenu}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="primary-menu"
              className="group flex min-h-[44px] items-center gap-3 rounded-full px-3 text-[10.5px] uppercase tracking-[0.22em] text-white/70 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#00F0FF]/60 font-mono"
            >
              Menu
              <span aria-hidden className="flex flex-col gap-[5px]">
                <span className="block h-px w-5 bg-current transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="block h-px w-5 bg-current transition-transform duration-300 group-hover:-translate-x-0.5" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
