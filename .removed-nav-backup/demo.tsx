'use client';
import React from "react";

const GradientStartButton = () => {
  return (
    <a
      href="/contact"
      className="group relative inline-flex items-center justify-center px-6 py-2.5 rounded-full overflow-hidden transition-all duration-300"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%), rgba(12, 14, 22, 0.42)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.18), 0 8px 28px rgba(0,0,0,0.40)",
      }}
    >
      {/* Cyan glow sweeping in from the right on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-0 translate-x-full transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-x-0"
        style={{
          background: "linear-gradient(to left, rgba(0,240,255,0.22), transparent)",
        }}
      />

      {/* Bright cyan accent rail on the right edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 rounded-l-md opacity-0 translate-x-full transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0"
        style={{
          background: "#00F0FF",
          boxShadow: "0 0 12px rgba(0,240,255,0.85)",
        }}
      />

      <span className="relative z-10 text-white font-medium text-[14px]">
        Contact
      </span>
    </a>
  );
};
export default GradientStartButton;
