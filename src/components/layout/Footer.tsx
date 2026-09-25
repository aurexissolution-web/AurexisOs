"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Send, Check } from "lucide-react";
import { NAV_LINKS } from "@/data/navigation";
import { SectionDivider } from "@/components/ui/section-divider";

function LinkedinGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.849.07 3.26.149 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TiktokGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

// Labels come from NAV_LINKS so the footer can never contradict the navbar.
const QUICK_LINKS = [
  { label: "Home", href: "/" },
  ...NAV_LINKS.map(({ label, href }) => ({ label, href })),
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/aurexissolution/",
    icon: LinkedinGlyph,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/aurexissolution",
    icon: InstagramGlyph,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/18aSc2n1dW/",
    icon: FacebookGlyph,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@aurexissolution",
    icon: TiktokGlyph,
  },
];

const COMPLIANCE = [
  "LHDN-Ready",
  "PDPA-Compliant",
  "SST-Registered",
  "Built in Malaysia",
];

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-mono font-medium uppercase tracking-[0.24em] text-white/45 mb-4">
      {children}
    </div>
  );
}

function Hairline() {
  return (
    <div
      aria-hidden
      className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
    />
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-[13px] text-[var(--color-electric-cyan)]">
        <Check className="w-4 h-4" />
        <span>You&apos;re subscribed. Talk soon.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.includes("@")) return;
        setSent(true);
      }}
      className="mt-3 flex items-center gap-2 max-w-sm"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="flex-1 min-w-0 h-10 px-4 rounded-full bg-white/[0.05] border border-white/[0.10] text-[13px] text-white placeholder:text-white/30 focus:border-[var(--color-electric-cyan)]/35 focus:outline-none transition-colors"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-electric-cyan)]/15 border border-[var(--color-electric-cyan)]/35 text-[var(--color-electric-cyan)] hover:bg-[var(--color-electric-cyan)]/25 hover:border-[var(--color-electric-cyan)]/50 transition-colors"
      >
        <Send className="w-3.5 h-3.5" strokeWidth={2.25} />
      </button>
    </form>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--color-background)] overflow-hidden">
      {/* Ambient cyan halos behind the glass surface */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-56 rounded-full bg-[var(--color-electric-cyan)]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-[360px] h-48 rounded-full bg-[var(--color-electric-cyan)]/6 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-12 left-0 w-[280px] h-40 rounded-full bg-[var(--color-electric-cyan)]/4 blur-3xl"
      />

      {/* ── Full-bleed glass surface ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-gradient-to-b from-white/[0.045] to-white/[0.015] backdrop-blur-2xl"
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top rim-light highlight (premium glass detail) */}
        <SectionDivider />

        <div className="relative mx-auto max-w-7xl px-6 py-7 lg:py-9">
          {/* ── 4-column dense grid: brand+newsletter | links | contact | social ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.3fr_1fr] gap-8 lg:gap-10">
            {/* Col 1: Brand + Tagline + Newsletter */}
            <div className="lg:max-w-sm">
              <Link
                href="/"
                className="inline-block group"
                aria-label="Aurexis Solution — home"
              >
                <h2 className="text-xl md:text-2xl font-extrabold tracking-[-0.02em] leading-tight text-white transition-colors group-hover:text-white/90">
                  Aurexis{" "}
                  <span className="text-white/55 group-hover:text-white/65 transition-colors">
                    Solution
                  </span>
                </h2>
              </Link>
              <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.26em] text-white/40">
                AI · Web · Apps · Growth — Built in Malaysia
              </p>

              <div className="mt-5">
                <ColumnHeader>Stay in the loop</ColumnHeader>
                <p className="text-[12px] leading-[1.55] text-white/55 max-w-[30ch] -mt-1.5">
                  Monthly notes on what we&apos;re shipping. No spam.
                </p>
                <NewsletterForm />
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <ColumnHeader>Quick Links</ColumnHeader>
              <ul className="flex flex-col gap-1.5 text-[13px]">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/65 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div>
              <ColumnHeader>Contact</ColumnHeader>
              <ul className="flex flex-col gap-1.5 text-[13px] text-white/65">
                <li>Sungai Petani, Kedah</li>
                <li>Kuala Lumpur, Malaysia</li>
                <li className="pt-1">
                  <a
                    href="https://wa.me/60164071129"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    +60 16 407 1129
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:admin@aurexissolution.com"
                    className="hover:text-white transition-colors break-all"
                  >
                    admin@aurexissolution.com
                  </a>
                </li>
                <li className="pt-1.5">
                  <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-electric-cyan)]/85">
                    <span
                      aria-hidden
                      className="w-1.5 h-1.5 rounded-full bg-[var(--color-electric-cyan)] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.7)]"
                    />
                    Available for new projects
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 4: Social */}
            <div>
              <ColumnHeader>Social</ColumnHeader>
              <ul className="flex flex-col gap-1.5">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 text-[13px] text-white/65 hover:text-white transition-colors"
                    >
                      <Icon className="w-4 h-4 text-white/45 group-hover:text-[var(--color-electric-cyan)] transition-colors" />
                      <span>{label}</span>
                      <ArrowUpRight
                        className="w-3 h-3 text-white/30 group-hover:text-[var(--color-electric-cyan)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="my-6 lg:my-7">
            <Hairline />
          </div>

          {/* ── Compliance row ────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
            {COMPLIANCE.map((label, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, x: -4 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-2 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.22em] text-white/55"
              >
                <span
                  aria-hidden
                  className="text-[var(--color-electric-cyan)]/80 text-[13px] leading-none -translate-y-px"
                >
                  +
                </span>
                {label}
              </motion.span>
            ))}
          </div>

          <div className="my-5 lg:my-6">
            <Hairline />
          </div>

          {/* ── Bottom legal row ──────────────────────────── */}
          <div className="flex items-baseline">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">
              © {year} Aurexis Solution · All rights reserved
            </span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
