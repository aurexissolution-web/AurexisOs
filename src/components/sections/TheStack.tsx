"use client";

import { type SVGProps } from "react";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Tool {
  number: string;
  name: string;
  role: string;
  description: string;
}

const TOOLS: Tool[] = [
  {
    number: "01",
    name: "Anthropic Claude",
    role: "Intelligence",
    description: "Powers the AI pricing tracker in the Keluarga Ledger dashboard.",
  },
  {
    number: "02",
    name: "Astro · Next.js",
    role: "Frontend",
    description: "Websites that score Lighthouse 90+.",
  },
  {
    number: "04",
    name: "Cloudflare",
    role: "Edge",
    description: "Edge hosting, security, CDN.",
  },
  {
    number: "05",
    name: "Supabase · PostgreSQL",
    role: "Data",
    description: "Databases that scale.",
  },
  {
    number: "06",
    name: "Vercel",
    role: "Deploy",
    description: "Deployments.",
  },
  {
    number: "07",
    name: "WhatsApp Business API",
    role: "Channel",
    description: "Where Malaysian business actually happens.",
  },
  {
    number: "08",
    name: "Resend",
    role: "Email",
    description: "Delivers the calculator breakdown straight to your inbox.",
  },
];

function IconClaude(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1.6 L13.1 10.9 L22.4 12 L13.1 13.1 L12 22.4 L10.9 13.1 L1.6 12 L10.9 10.9 Z" />
      <path
        d="M12 5.5 L12.6 10.4 L17.5 12 L12.6 13.6 L12 18.5 L11.4 13.6 L6.5 12 L11.4 10.4 Z"
        opacity="0.55"
      />
    </svg>
  );
}

function IconNext(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 7 V17 M8 7 L16 17 M16 7 V14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconReact(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.3" />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.3"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.3"
        transform="rotate(120 12 12)"
      />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
    </svg>
  );
}

function IconCloudflare(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 13.5 c0.4-1.4-0.7-2.7-2.2-2.5 a4 4 0 0 0-7.6-0.4 A3.4 3.4 0 0 0 4 14 a3.4 3.4 0 0 0 3.4 3.4 h11 a2.6 2.6 0 0 0 0.6-5.1 c0.1-0.5-0.3-0.9-0.7-0.8 -0.5 0.1-0.7 0.6-0.6 1 0.1 0.5 0.6 0.9 0.5 1.5 z" />
    </svg>
  );
}

function IconSupabase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13 1.5 L13 11 H21.5 a0.5 0.5 0 0 1 0.4 0.8 L11 22.5 a0.5 0.5 0 0 1-0.9-0.3 V13 H1.6 a0.5 0.5 0 0 1-0.4-0.8 L11 1.2 a0.5 0.5 0 0 1 0.9 0.3 z" />
    </svg>
  );
}

function IconVercel(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3.5 L22.5 21 H1.5 Z" />
    </svg>
  );
}

function IconWhatsApp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3.6 20.4 L4.9 16.4 A8.5 8.5 0 1 1 8.4 19.7 z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.6 c0.6-0.5 1.2-0.4 1.5 0.2 l0.5 1.1 c0.2 0.4 0.1 0.8-0.2 1.1 -0.4 0.4-0.4 0.5-0.2 0.9 0.6 1 1.4 1.7 2.4 2.2 0.4 0.2 0.5 0.2 0.9-0.2 0.3-0.3 0.7-0.4 1.1-0.2 l1.1 0.5 c0.6 0.3 0.7 0.9 0.2 1.5 -0.6 0.7-1.5 1-2.4 0.7 -2.4-0.7-4.5-2.8-5.2-5.2 -0.3-0.9 0-1.8 0.7-2.4 z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconResend(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M4 7.5 L12 13 L20 7.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  "01": IconClaude,
  "02": IconNext,
  "03": IconReact,
  "04": IconCloudflare,
  "05": IconSupabase,
  "06": IconVercel,
  "07": IconWhatsApp,
  "08": IconResend,
};

function AurexisMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="108 125 155 105" fill="currentColor" {...props}>
      <path d="M165.55 204.87 L146.77 204.87 L160.27 176.77 L174.27 204.87 L180.58 217.53 C183.64 223.24 191.29 227.13 198.95 227.13 L210.36 227.13 L199.22 204.87 L189.82 186.06 L171.50 149.42 L160.26 126.95 L110.17 227.13 L143.29 227.13 C155.54 227.13 165.55 217.11 165.55 204.87 Z" />
      <path d="M211.08 188.17 L230.56 188.17 C235.15 188.17 238.91 191.93 238.91 196.52 C238.91 201.11 235.15 204.87 230.56 204.87 L209.32 204.87 L220.46 227.13 L230.56 227.13 C247.39 227.13 261.17 213.50 261.17 196.52 C261.17 179.69 247.39 165.91 230.56 165.91 L211.08 165.91 C206.49 165.91 202.73 162.16 202.73 157.56 C202.73 152.97 206.49 149.21 211.08 149.21 L230.56 149.21 C242.80 149.21 252.82 139.19 252.82 126.95 L211.08 126.95 C196.95 126.95 185.16 136.51 181.60 149.42 L199.92 186.06 C203.38 187.41 207.13 188.17 211.08 188.17 Z" />
    </svg>
  );
}

const TOOL_GRADIENT = `
  radial-gradient(ellipse 80% 62% at 22% 112%, rgba(0,240,255,0.75), transparent 68%),
  radial-gradient(ellipse 70% 58% at 58% 118%, rgba(120,90,255,0.62), transparent 72%),
  radial-gradient(ellipse 75% 62% at 95% 112%, rgba(0,90,255,0.75), transparent 72%)
`;

const SIGNATURE_GRADIENT = `
  radial-gradient(ellipse 85% 65% at 50% 115%, rgba(0,240,255,0.92), transparent 66%),
  radial-gradient(ellipse 65% 55% at 22% 112%, rgba(0,90,255,0.72), transparent 72%),
  radial-gradient(ellipse 65% 55% at 80% 112%, rgba(120,90,255,0.68), transparent 72%)
`;

interface ToolCardProps {
  tool: Tool;
  index: number;
  reduce: boolean;
}

function ToolCard({ tool, index, reduce }: ToolCardProps) {
  const Icon = ICONS[tool.number];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: reduce ? 0 : 0.1 + index * 0.06,
        ease: easeOut,
      }}
      whileHover={reduce ? undefined : { y: -4 }}
      className="group relative aspect-[5/4] overflow-hidden rounded-2xl border border-white/[0.16] bg-black transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-electric-cyan)]/40 hover:shadow-[0_25px_55px_-20px_rgba(0,240,255,0.45)] md:aspect-[4/3]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: TOOL_GRADIENT }}
      />

      <div className="relative z-10 flex h-full flex-col p-5 md:p-6">
        <span
          aria-hidden
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] backdrop-blur-sm md:h-11 md:w-11"
        >
          <Icon className="h-[18px] w-[18px] text-white/90 md:h-[19px] md:w-[19px]" />
        </span>

        <div className="mt-5 md:mt-6">
          <h3 className="font-serif italic leading-[1.1] tracking-[-0.015em] text-white text-[20px] md:text-[22px] lg:text-[24px]">
            {tool.name}
          </h3>
          <p className="mt-2 max-w-[30ch] text-[11.5px] leading-[1.55] text-white/70 md:text-[12px]">
            {tool.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SignatureCard({ index, reduce }: { index: number; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: reduce ? 0 : 0.1 + index * 0.06,
        ease: easeOut,
      }}
      whileHover={reduce ? undefined : { y: -4 }}
      className="group relative aspect-[5/4] overflow-hidden rounded-2xl border border-[var(--color-electric-cyan)]/35 bg-black transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-electric-cyan)]/60 hover:shadow-[0_25px_55px_-20px_rgba(0,240,255,0.55)] md:aspect-[4/3]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: SIGNATURE_GRADIENT }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-5 text-center md:p-6">
        <AurexisMark
          aria-hidden
          className="h-9 w-auto text-white md:h-10"
        />

        <div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.42em] text-white/55 md:text-[10px]">
            Signed
          </div>
          <div className="mt-1.5 font-serif text-[17px] italic leading-[1.2] tracking-[-0.01em] text-white md:text-[19px]">
            All in-house.{" "}
            <span className="text-[var(--color-electric-cyan)]">
              0 resellers.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-px w-5 bg-[var(--color-electric-cyan)]/50"
          />
          <span className="font-mono text-[8.5px] uppercase tracking-[0.42em] text-white/55 md:text-[9px]">
            Aurexis · MY · 2026
          </span>
          <span
            aria-hidden
            className="h-px w-5 bg-[var(--color-electric-cyan)]/50"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function TheStack() {
  const reduceMotion = useSafeReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.7, ease: easeOut, delay },
        };

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-background)] py-14 md:py-16 lg:py-12">
      <SectionDivider />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[5%] h-[420px] w-[420px] rounded-full opacity-40 blur-[200px]"
        style={{ backgroundColor: "rgba(0,71,255,0.04)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[8%] h-[360px] w-[360px] rounded-full opacity-30 blur-[200px]"
        style={{ backgroundColor: "rgba(0,240,255,0.03)" }}
      />

      <div className="container relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        <motion.div {...fadeUp()} className="mb-3 flex items-center gap-3">
          <span
            aria-hidden
            className="h-px w-10 bg-[var(--color-electric-cyan)]/60"
          />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.42em] text-[var(--color-electric-cyan)]/80 md:text-[11px]">
            The Stack
          </span>
        </motion.div>

        <motion.div
          {...fadeUp(0.05)}
          className="mb-5 flex items-baseline gap-5 lg:mb-6"
        >
          <span className="font-mono text-[9.5px] uppercase tracking-[0.42em] text-white/40 md:text-[10px]">
            N° 06 · TRUSTED INSTRUMENTS · MY
          </span>
        </motion.div>

        <motion.h2
          {...fadeUp(0.1)}
          className="mb-4 font-serif text-[30px] leading-[1.05] tracking-[-0.015em] text-white md:text-[38px] lg:mb-5 lg:text-[42px] xl:text-[46px]"
          style={{ fontStyle: "normal" }}
        >
          Tools we use, not tools we resell.
        </motion.h2>

        <motion.p
          {...fadeUp(0.16)}
          className="mb-8 max-w-2xl text-[13.5px] leading-[1.6] text-white/65 md:text-[14.5px] lg:mb-10"
        >
          We&apos;re not a reseller. We don&apos;t get kickbacks. These are the
          tools we use because they work — and because they&apos;re the right
          fit for Malaysian SMEs at our project sizes.
        </motion.p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {TOOLS.map((tool, i) => (
            <ToolCard
              key={tool.number}
              tool={tool}
              index={i}
              reduce={reduceMotion === true}
            />
          ))}
          <SignatureCard
            index={TOOLS.length}
            reduce={reduceMotion === true}
          />
        </div>
      </div>
    </section>
  );
}
