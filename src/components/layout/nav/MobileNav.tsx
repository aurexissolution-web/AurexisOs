"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactCTA } from "./ContactCTA";
import { NAV_LINKS } from "@/data/navigation";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isActive: (href: string) => boolean;
  /** Preview frames are bounded, so the overlay must not escape to the viewport. */
  containerMode?: boolean;
  /** Ties the close button back to the variant's own toggle. */
  labelledBy?: string;
  skin?: "glass" | "void";
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function MobileNav({
  open,
  onOpenChange,
  isActive,
  containerMode = false,
  skin = "void",
}: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const reduce = useSafeReducedMotion();
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
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
      restoreRef.current?.focus?.();
    };
  }, [open, onOpenChange]);

  // Never freeze the whole lab page while previewing inside a frame.
  useEffect(() => {
    if (!open || containerMode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previous;
      lenis?.start();
    };
  }, [open, containerMode, lenis]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-nav"
          ref={panelRef}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          data-lenis-prevent
          initial={{ opacity: 0, y: reduce ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -8 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "z-[60] flex flex-col overflow-y-auto px-6 pb-8 pt-6",
            containerMode ? "absolute inset-0" : "fixed inset-0",
          )}
          style={{
            background: skin === "glass" ? "rgba(3,4,8,0.92)" : "#02040A",
            backdropFilter: skin === "glass" ? "blur(24px) saturate(160%)" : undefined,
            WebkitBackdropFilter: skin === "glass" ? "blur(24px) saturate(160%)" : undefined,
          }}
        >
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#00F0FF]/60 outline-none"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <motion.ul
            className="mt-6 flex list-none flex-col"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: reduce ? 0 : 0.05 } },
            }}
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: reduce ? 0 : 10 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="border-b border-white/[0.06] last:border-none"
                >
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex min-h-[56px] items-baseline gap-4 py-3 transition-colors",
                      active ? "text-white" : "text-white/70 hover:text-white",
                    )}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#00F0FF]/70">
                      {link.stage}
                    </span>
                    <span className="text-[22px] font-medium tracking-tight">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>

          <div className="mt-auto pt-8">
            <ContactCTA variant="compact" onNavigate={() => onOpenChange(false)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileNav;
