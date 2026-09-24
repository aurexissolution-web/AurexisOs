"use client";

import { useEffect, useState } from "react";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};

const SLOW_TYPES = new Set(["slow-2g", "2g", "3g"]);
const SHADER_MIN_WIDTH = 768;

function evaluate(): boolean {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < SHADER_MIN_WIDTH) return false;

  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && SLOW_TYPES.has(conn.effectiveType)) return false;

  return true;
}

export function useShaderEligibility(): boolean {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    setEligible(evaluate());

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setEligible(evaluate());

    motionQuery.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);

    return () => {
      motionQuery.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  return eligible;
}
