"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { useMotionValue, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { isActiveHref } from "@/lib/navigation/active";

export interface UseNavStateOptions {
  /** Scroll a bounded element instead of the page — used by the nav lab previews. */
  target?: RefObject<HTMLElement | null>;
  /** Pin `scrolled` to a fixed value, for comparing end states side by side. */
  forceScrolled?: boolean;
  enterAt?: number;
  exitAt?: number;
}

export interface NavState {
  scrolled: boolean;
  progress: MotionValue<number>;
  velocity: MotionValue<number>;
  direction: "up" | "down";
  pathname: string;
  isActive: (href: string) => boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function useNavState(options: UseNavStateOptions = {}): NavState {
  const { target, forceScrolled, enterAt = 60, exitAt = 40 } = options;

  const pathname = usePathname();
  const progress = useMotionValue(0);
  const velocity = useMotionValue(0);
  const [scrolled, setScrolled] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("down");
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);

  // Asymmetric thresholds so a nav parked near the boundary can't strobe.
  const applyScroll = useCallback(
    (y: number, max: number, v: number) => {
      progress.set(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
      velocity.set(v);
      setScrolled((wasScrolled) => (wasScrolled ? y > exitAt : y > enterAt));
      if (Math.abs(y - lastY.current) > 2) {
        setDirection(y > lastY.current ? "down" : "up");
        lastY.current = y;
      }
    },
    [progress, velocity, enterAt, exitAt],
  );

  const lenis = useLenis((instance) => {
    if (target?.current) return;
    applyScroll(instance.scroll, instance.limit, instance.velocity);
  });

  useEffect(() => {
    const el = target?.current;
    if (!el) return;
    const onScroll = () =>
      applyScroll(el.scrollTop, el.scrollHeight - el.clientHeight, 0);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [target, applyScroll]);

  // Founder-card routes render without Lenis, so keep a native fallback.
  useEffect(() => {
    if (target?.current || lenis) return;
    const onScroll = () =>
      applyScroll(
        window.scrollY,
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [target, lenis, applyScroll]);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  const isActive = useCallback(
    (href: string) => isActiveHref(pathname, href),
    [pathname],
  );

  return {
    scrolled: forceScrolled ?? scrolled,
    progress,
    velocity,
    direction,
    pathname,
    isActive,
    mobileOpen,
    setMobileOpen,
  };
}
