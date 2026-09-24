"use client";

import { useEffect, useState } from "react";
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * SSR-safe stand-in for framer-motion's useReducedMotion(). That hook reads
 * window.matchMedia synchronously during the client's very first render —
 * the server has no such signal and always renders as if motion isn't
 * reduced, so anyone with the OS "reduce motion" setting on gets a
 * guaranteed hydration mismatch. This always returns false on the render
 * that has to match the server, then swaps to the real value in an effect
 * once hydration has already committed.
 */
export function useSafeReducedMotion(): boolean {
  const actual = useFramerReducedMotion();
  const [safe, setSafe] = useState(false);

  useEffect(() => {
    setSafe(actual ?? false);
  }, [actual]);

  return safe;
}
