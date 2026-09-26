"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { SectionDivider } from "@/components/ui/section-divider";

const easeOut = [0.16, 1, 0.3, 1] as const;
const WA_GREEN = "#25D366";

const WHATSAPP_URL =
  "https://wa.me/60164071129?text=" +
  encodeURIComponent(
    "Hi Aurexis, I'd like to talk about an AI project for my SME."
  );
const CALENDLY_URL = "https://cal.com/aurexis-solution/discoverycall";

const GRAIN_DATA_URL = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.5.1-.1.2-.3.4-.5.1-.2.2-.3.3-.4.1-.2 0-.3-.1-.4-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
      <path d="M21 3.4C18.7 1.2 15.6 0 12.1 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.7 6L0 24l6.2-1.6c1.7.9 3.7 1.4 5.7 1.4h.1c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.4-8.6zM12.1 21.7h-.1c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.5 4.5-9.9 9.9-9.9 2.7 0 5.1 1 7 2.9s2.9 4.4 2.9 7c.1 5.5-4.4 9.9-9.8 9.9z" />
    </svg>
  );
}

export function AboutCTA() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-background)]">
      <SectionDivider />
      {/* KLCC photo backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/klcc-dusk.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          filter: "brightness(0.42) saturate(1.05) contrast(1.05)",
        }}
      />
      {/* Atmosphere gradient overlays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,4,10,0.55) 0%, rgba(2,4,10,0.05) 28%, rgba(2,4,10,0.7) 100%), radial-gradient(60% 50% at 50% 40%, rgba(0,72,140,0.22), transparent 70%), radial-gradient(40% 30% at 50% 100%, rgba(0,240,255,0.14), transparent 70%)",
        }}
      />
      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_DATA_URL }}
      />

      <div className="relative mx-auto max-w-4xl px-6 py-14 md:px-8 md:py-16">
        {/* ── Masthead ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-12 grid grid-cols-1 items-center gap-3 md:mb-14 md:grid-cols-[1fr_auto_1fr] md:gap-4"
        >
          <div
            aria-hidden
            className="hidden h-px w-full bg-gradient-to-r from-transparent to-white/[0.22] md:block"
          />
          <div className="text-center font-mono text-[10px] uppercase tracking-[0.30em] text-white/65 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] md:whitespace-nowrap">
            <span>Aurexis Solution</span>
            <span className="mx-2 align-[-2px] font-serif text-[16px] tracking-normal text-[var(--color-electric-cyan)]/85 normal-case">
              §
            </span>
            <span>Dispatch № 04 / May 2026</span>
            <span className="mx-2 align-[-2px] font-serif text-[16px] tracking-normal text-[var(--color-electric-cyan)]/85 normal-case">
              §
            </span>
            <span>Kedah, MY</span>
          </div>
          <div
            aria-hidden
            className="hidden h-px w-full bg-gradient-to-l from-transparent to-white/[0.22] md:block"
          />
        </motion.div>

        {/* ── Statement ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
          className="mb-12 text-center md:mb-14"
        >
          <h2
            className="mb-5 font-semibold text-white/95 md:mb-6"
            style={{
              fontSize: "clamp(34px, 5.4vw, 60px)",
              letterSpacing: "-0.025em",
              lineHeight: 1.04,
              textShadow: "0 2px 18px rgba(0,0,0,0.4)",
            }}
          >
            Want to build{" "}
            <span
              className="font-serif font-normal italic text-[var(--color-electric-cyan)]"
              style={{
                filter: "drop-shadow(0 0 24px rgba(0,240,255,0.45))",
              }}
            >
              something with us?
            </span>
          </h2>
          <p
            className="mx-auto mb-7 max-w-[480px] text-[14px] leading-[1.55] text-white/72 md:text-[15px]"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
          >
            WhatsApp us, or book a 15-minute discovery call. We reply within 24
            hours.
          </p>
          <div className="flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13.5px] font-semibold text-[#03200E] transition-transform duration-300 hover:-translate-y-0.5 md:px-6"
              style={{
                background: WA_GREEN,
                boxShadow:
                  "0 14px 36px rgba(37,211,102,0.32), 0 0 0 1px rgba(37,211,102,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <WhatsAppIcon className="h-[15px] w-[15px]" />
              Message on WhatsApp
              <ArrowUpRight
                className="h-[14px] w-[14px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </a>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-electric-cyan)]/45 bg-[var(--color-electric-cyan)]/[0.04] px-5 py-3 text-[13.5px] font-medium text-white/95 backdrop-blur-md transition-all duration-300 hover:border-[var(--color-electric-cyan)]/70 hover:bg-[var(--color-electric-cyan)]/[0.08] md:px-6"
            >
              <Calendar className="h-[15px] w-[15px]" strokeWidth={1.8} />
              Book a discovery call
              <ArrowUpRight
                className="h-[14px] w-[14px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </a>
          </div>
        </motion.div>

        {/* ── Colophon ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: easeOut }}
          className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4"
        >
          <div
            aria-hidden
            className="hidden h-px w-full bg-gradient-to-r from-transparent to-white/[0.22] md:block"
          />
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.30em] text-white/60 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            <span className="inline-flex items-center gap-1.5 text-emerald-300/95">
              <span
                aria-hidden
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.95)]"
              />
              Available · 2 slots open
            </span>
            <span aria-hidden className="tracking-normal text-white/20 normal-case">
              —
            </span>
            <span className="font-serif text-[14px] italic tracking-tight text-white/85 normal-case">
              Aurexis{" "}
              <span className="text-[var(--color-electric-cyan)]/90">
                Solution
              </span>
            </span>
          </div>
          <div
            aria-hidden
            className="hidden h-px w-full bg-gradient-to-l from-transparent to-white/[0.22] md:block"
          />
        </motion.div>
      </div>
    </section>
  );
}
