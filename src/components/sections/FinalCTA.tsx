"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  CheckCheck,
  Mic,
  Paperclip,
  Phone,
  Video,
} from "lucide-react";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_AUREXIS_WHATSAPP || "60164071129";

const WHATSAPP_PREFILL =
  "Hi Aurexis — I'd like to scope a project. Found you via the homepage.";

const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_PREFILL
)}`;

const TYPE_SPEED_MS = 28;

type Msg = {
  speaker: "client" | "aurexis";
  text: string;
  time: string;
};

const MESSAGES: Msg[] = [
  {
    speaker: "client",
    text: "Hey — looking at AI agents for our invoice processing",
    time: "12:14",
  },
  {
    speaker: "aurexis",
    text: "Got it. Volume per week?",
    time: "12:14",
  },
  {
    speaker: "client",
    text: "~400 invoices, 3 systems (QuickBooks, Sheets, email)",
    time: "12:14",
  },
  {
    speaker: "aurexis",
    text: "Doable. ~6 weeks, RM 35–50k. Want to scope on a quick call?",
    time: "12:15",
  },
];

const STEPS = [
  "Message us on WhatsApp",
  "We reply within 24h, often faster",
  "We scope it together — over chat",
  "Optional 30-min call if you want",
];

function Typewriter({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) {
  const [shown, setShown] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setShown(0);
  }, [text]);

  useEffect(() => {
    if (shown >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    const t = setTimeout(() => setShown((s) => s + 1), TYPE_SPEED_MS);
    return () => clearTimeout(t);
  }, [shown, text, onComplete]);

  return (
    <>
      {text.slice(0, shown)}
      {shown < text.length && (
        <span
          aria-hidden
          className="inline-block w-[2px] h-[1em] bg-[var(--color-electric-cyan)] align-[-0.15em] ml-0.5 animate-pulse"
        />
      )}
    </>
  );
}

function Avatar({
  speaker,
  size = 28,
}: {
  speaker: "client" | "aurexis";
  size?: number;
}) {
  const isAurexis = speaker === "aurexis";
  return (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full flex items-center justify-center font-mono font-semibold tracking-wider border ${
        size > 30 ? "text-[11px]" : "text-[9px]"
      } ${
        isAurexis
          ? "bg-[var(--color-electric-cyan)]/20 border-[var(--color-electric-cyan)]/45 text-[var(--color-electric-cyan)] shadow-[0_0_10px_rgba(0,240,255,0.28)]"
          : "bg-white/[0.08] border-white/[0.15] text-white/70"
      }`}
    >
      {isAurexis ? "AS" : "C"}
    </div>
  );
}

function ChatBubble({
  msg,
  idx,
  useTypewriter,
  onTypewriterComplete,
}: {
  msg: Msg;
  idx: number;
  useTypewriter: boolean;
  onTypewriterComplete?: () => void;
}) {
  const isAurexis = msg.speaker === "aurexis";
  const baseDelay = 0.6 + idx * 0.15;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.4,
        ease: [0.2, 0.8, 0.2, 1],
        delay: baseDelay,
      }}
      className={`flex items-end gap-2 ${
        isAurexis ? "self-end flex-row-reverse" : "self-start"
      } max-w-[88%]`}
    >
      <Avatar speaker={msg.speaker} />
      <div
        className={`flex flex-col min-w-0 ${
          isAurexis ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-3 py-2 rounded-[1.15rem] border break-words [hyphens:none] [overflow-wrap:anywhere] text-[13px] leading-[1.4] ${
            isAurexis
              ? "rounded-br-md bg-[var(--color-electric-cyan)]/14 border-[var(--color-electric-cyan)]/30 text-white shadow-[0_2px_14px_rgba(0,240,255,0.10)]"
              : "rounded-bl-md bg-white/[0.06] border-white/[0.10] text-white/85"
          }`}
        >
          {useTypewriter ? (
            <Typewriter text={msg.text} onComplete={onTypewriterComplete} />
          ) : (
            msg.text
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[10px] font-mono tracking-wider text-white/35 tabular-nums">
            {msg.time}
          </span>
          {isAurexis && (
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: baseDelay + 0.4, duration: 0.3 }}
              className="flex items-center gap-1 text-[10px] font-mono tracking-wider text-[var(--color-electric-cyan)]/85"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Read</span>
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingBubble({
  visible,
  reduceMotion,
}: {
  visible: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-end gap-2 self-end flex-row-reverse max-w-[88%]"
      aria-hidden
    >
      <Avatar speaker="aurexis" />
      <div className="px-3.5 py-3 rounded-[1.25rem] rounded-br-md border bg-[var(--color-electric-cyan)]/14 border-[var(--color-electric-cyan)]/30 inline-flex items-center gap-1.5">
        {[0, 0.18, 0.36].map((delay, i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-electric-cyan)]"
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -3, 0], opacity: [0.45, 1, 0.45] }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay,
                  }
            }
          />
        ))}
      </div>
    </motion.div>
  );
}

function ChatHeader() {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-white/[0.06]">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar speaker="aurexis" size={36} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-white leading-tight">
            <span className="truncate">Aurexis</span>
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[var(--color-electric-cyan)] shrink-0"
            >
              <Check
                className="w-2 h-2 text-black"
                strokeWidth={3.5}
              />
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-white/55 mt-0.5">
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-electric-cyan)] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.7)] shrink-0"
            />
            <span className="truncate">Online · Replies in ~2h</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-white/25 shrink-0">
        <Video className="w-4 h-4" aria-hidden />
        <Phone className="w-4 h-4" aria-hidden />
      </div>
    </div>
  );
}

function ChatInputBar() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 border-t border-white/[0.06] bg-white/[0.015]">
      <Paperclip
        className="w-4 h-4 text-white/30 shrink-0"
        aria-hidden
      />
      <div className="flex-1 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/35">
        Type a message…
      </div>
      <Mic className="w-4 h-4 text-white/30 shrink-0" aria-hidden />
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-[var(--color-electric-cyan)] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-default"
      >
        <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function StepsList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="mt-7 max-w-md"
    >
      <span className="block text-[10px] font-mono uppercase tracking-[0.28em] text-white/40 mb-3">
        What happens next
      </span>
      <ol className="space-y-2.5">
        {STEPS.map((step, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.7 + i * 0.06 }}
            className="flex gap-3 items-baseline"
          >
            <span className="font-mono text-[11px] tracking-[0.22em] text-[var(--color-electric-cyan)]/70 tabular-nums shrink-0 w-6">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[14px] leading-[1.55] text-white/65">
              {step}
            </span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}

export function FinalCTA() {
  const reduceMotion = useSafeReducedMotion();
  const [lastTyped, setLastTyped] = useState(reduceMotion);
  const lastIdx = MESSAGES.length - 1;

  return (
    <section className="relative pt-8 pb-10 px-6 bg-[var(--color-background)] overflow-hidden">
      <SectionDivider />
      <div className="mx-auto max-w-7xl">
        {/* ── Masthead ─────────────────────────────────────── */}
        <motion.div
          className="flex flex-wrap items-baseline justify-between gap-3"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="flex items-center gap-2.5 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.28em] text-white/65">
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-electric-cyan)] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.7)]"
            />
            Nº 014 · Let&apos;s Start
          </span>
          <span className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.28em] text-white/40 tabular-nums">
            Aurexis / 28.04.2026 ·{" "}
            <span className="text-[var(--color-electric-cyan)]/85">
              Live Thread
            </span>
          </span>
        </motion.div>

        <motion.div
          aria-hidden
          className="h-px w-full bg-[var(--color-electric-cyan)]/30 origin-left mt-3"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        />

        {/* ── Asymmetric body (headline now lives inside left column) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-stretch mt-8 lg:mt-10">
          {/* Left column — headline + body */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col"
          >
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.025em] leading-[1.02] text-white text-balance mb-7 lg:mb-9"
            >
              Stop paying humans to do{" "}
              <em
                className="font-serif italic text-[var(--color-electric-cyan)] font-normal"
                style={{
                  filter: "drop-shadow(0 0 22px rgba(0,240,255,0.34))",
                }}
              >
                machine-level
              </em>{" "}
              work.
            </h2>

            <div className="flex gap-3 mb-7 max-w-md">
              <span
                aria-hidden
                className="font-serif italic text-[var(--color-electric-cyan)]/75 text-2xl leading-[0.9] shrink-0 select-none"
              >
                ¶
              </span>
              <p className="text-[16px] md:text-[17px] leading-[1.6] text-white/65 text-balance">
                Send us a message on WhatsApp. We reply within 24 hours,
                often faster.
              </p>
            </div>

            {/* Stacked button + secondary link (fixes the inline-flex sticking bug) */}
            <div className="flex flex-col items-start gap-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] md:text-[15px] font-bold text-black transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
                style={{
                  background:
                    "linear-gradient(135deg, #00F0FF 0%, rgba(0,240,255,0.78) 100%)",
                  boxShadow: "0 0 36px rgba(0,240,255,0.32)",
                }}
              >
                Message us on WhatsApp
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <Link
                href="/contact#brief"
                className="group inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white transition-colors"
              >
                Or book a 30-min discovery call
                <span
                  aria-hidden
                  className="text-[var(--color-electric-cyan)] transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>

            <StepsList />
          </motion.div>

          {/* Right column — phone-frame chat */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-12 -right-12 w-80 h-80 rounded-full bg-[var(--color-electric-cyan)]/12 blur-3xl -z-10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-12 w-60 h-60 rounded-full bg-[var(--color-electric-cyan)]/8 blur-3xl -z-10"
            />

            <div className="h-full flex flex-col rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-white/[0.015] backdrop-blur-2xl border border-white/[0.10] overflow-hidden min-h-[440px] lg:min-h-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_2px_rgba(255,255,255,0.06)]">
              <ChatHeader />

              <div className="flex-1 flex flex-col justify-end gap-2.5 px-3 py-3 overflow-hidden">
                {/* Day separator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 0.55 }}
                  className="flex items-center gap-3 mb-2"
                  aria-hidden
                >
                  <span className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">
                    Today · 12:14
                  </span>
                  <span className="flex-1 h-px bg-white/[0.06]" />
                </motion.div>

                {/* Bubbles */}
                {MESSAGES.map((msg, i) => (
                  <ChatBubble
                    key={i}
                    msg={msg}
                    idx={i}
                    useTypewriter={!reduceMotion && i === lastIdx}
                    onTypewriterComplete={() => setLastTyped(true)}
                  />
                ))}

                {/* Persistent typing indicator */}
                <TypingBubble
                  visible={lastTyped}
                  reduceMotion={reduceMotion}
                />
              </div>

              <ChatInputBar />
            </div>
          </motion.div>
        </div>

        {/* Bottom rule */}
        <motion.div
          aria-hidden
          className="h-px w-full bg-[var(--color-electric-cyan)]/30 origin-right mt-8 lg:mt-10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
        />

        {/* Footnote */}
        <motion.div
          className="flex flex-wrap items-baseline justify-between gap-3 pt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono uppercase tracking-[0.22em] text-white/45">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-electric-cyan)] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.7)]"
              />
              Online
            </span>
            <span aria-hidden className="text-white/20">
              ·
            </span>
            <span>Avg reply 2.4h</span>
            <span aria-hidden className="text-white/20">
              ·
            </span>
            <span>NDA + SLA included</span>
          </span>
          <span
            aria-hidden
            className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/30"
          >
            ■ End · Nº 014
          </span>
        </motion.div>
      </div>
    </section>
  );
}
