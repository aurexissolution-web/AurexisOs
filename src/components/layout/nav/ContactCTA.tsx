"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassSurface } from "./nav-glass";

export type ContactCTAVariant = "solid" | "outline" | "text" | "compact";

interface ContactCTAProps {
  variant?: ContactCTAVariant;
  className?: string;
  onNavigate?: () => void;
  label?: string;
}

const BASE =
  "group relative inline-flex items-center justify-center gap-1.5 rounded-full whitespace-nowrap font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030408]";

export function ContactCTA({
  variant = "solid",
  className,
  onNavigate,
  label = "Contact",
}: ContactCTAProps) {
  const isGlass = variant === "solid";

  return (
    <Link
      href="/contact"
      onClick={onNavigate}
      style={isGlass ? glassSurface() : undefined}
      className={cn(
        BASE,
        variant === "solid" && "overflow-hidden px-6 py-2.5 text-[14px] text-white",
        variant === "outline" &&
          "border border-[#00F0FF]/40 px-4 py-1.5 text-[13.5px] text-[#00F0FF] hover:border-[#00F0FF]/80 hover:bg-[#00F0FF]/[0.08]",
        variant === "text" &&
          "px-1 py-2 text-[13px] text-white/70 hover:text-white",
        variant === "compact" &&
          "h-10 w-full bg-white px-5 text-[14px] font-semibold text-black hover:bg-white/90",
        className,
      )}
    >
      {isGlass && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 translate-x-full opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100"
            style={{
              background: "linear-gradient(to left, rgba(0,240,255,0.22), transparent)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-1/2 h-1/2 w-[3px] -translate-y-1/2 translate-x-full rounded-l-md opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
            style={{ background: "#00F0FF", boxShadow: "0 0 12px rgba(0,240,255,0.85)" }}
          />
        </>
      )}
      <span className="relative z-10">{label}</span>
      {variant === "text" && (
        <ArrowUpRight
          aria-hidden
          className="relative z-10 h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      )}
    </Link>
  );
}

export default ContactCTA;
