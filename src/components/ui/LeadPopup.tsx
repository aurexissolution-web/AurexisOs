"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Check, Loader2, Mail, User, X } from "lucide-react";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";

const KEY = "aurexis-lead-popup";
const SNOOZE_DAYS = 14;
const DELAY_MS = 1200;
const HIDDEN_PREFIXES = ["/admin", "/documents", "/accounts", "/sanjay", "/vasshanraj", "/login", "/portal", "/unsubscribe", "/chatbot-ui-kit"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Saved = { done?: boolean; until?: number };
const read = (): Saved => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Saved;
  } catch {
    return {};
  }
};
const write = (v: Saved) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* private mode: the pop-up simply shows again next visit */
  }
};

const SERIES = [
  { day: "Today", title: "Welcome, and one question for you" },
  { day: "Day 3", title: "Where your week actually goes" },
  { day: "Day 7", title: "What an AI Readiness Audit tells you" },
  { day: "Day 14", title: "Want to talk it through?" },
];

function Field({
  icon: Icon,
  inputRef,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof User; inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <label className="group relative block">
      <Icon aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#00F0FF]" strokeWidth={1.75} />
      <input
        ref={inputRef}
        {...props}
        className="h-[52px] w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] pl-12 pr-4 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-all placeholder:text-white/30 hover:border-white/[0.16] focus:border-[#00F0FF]/55 focus:bg-[#00F0FF]/[0.04] focus:shadow-[0_0_0_4px_rgba(0,240,255,0.10),inset_0_1px_0_rgba(255,255,255,0.05)]"
      />
    </label>
  );
}

export function LeadPopup() {
  const pathname = usePathname();
  const reduce = useSafeReducedMotion();
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const firstField = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hidden) return;
    const saved = read();
    if (saved.done || (saved.until && saved.until > Date.now())) return;
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [hidden]);

  useEffect(() => {
    if (open) firstField.current?.focus();
  }, [open]);

  // The success view is shorter than the form; bring anything a phone keyboard scrolled back to the top.
  useEffect(() => {
    if (state !== "sent" || !dialog.current) return;
    const reset = () => dialog.current?.querySelectorAll<HTMLElement>("*").forEach((el) => el.scrollTop && (el.scrollTop = 0));
    dialog.current.scrollTop = 0;
    reset();
    const t = window.setTimeout(reset, 350);
    return () => window.clearTimeout(t);
  }, [state]);

  const close = () => {
    setOpen(false);
    if (state !== "sent") write({ until: Date.now() + SNOOZE_DAYS * 86_400_000 });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && dialog.current) {
        const items = dialog.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input:not([tabindex='-1'])");
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, state]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setState("sending");
    try {
      const website = new FormData(e.currentTarget).get("website");
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, business, website, source: "popup" }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Something went wrong. Please try again.");
        setState("idle");
        return;
      }
      write({ done: true });
      setState("sent");
    } catch {
      setError("Could not reach us. Check your connection and try again.");
      setState("idle");
    }
  }

  if (hidden) return null;

  const rise = reduce ? {} : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.16 } } };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lead-popup"
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[#02040A]/70 p-0 backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          transition={{ duration: 0.25 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-popup-title"
            data-lenis-prevent
            {...rise}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] p-px sm:max-w-[860px] sm:rounded-[28px]"
            style={{ background: "linear-gradient(140deg, rgba(0,240,255,0.55), rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.04) 60%, rgba(143,168,240,0.45))" }}
          >
            <div className="relative grid overflow-hidden rounded-t-[27px] bg-[#070A12] sm:rounded-[27px] md:grid-cols-[1fr_1.1fr]">
              <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#00F0FF]/[0.13] blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-[#8FA8F0]/[0.10] blur-3xl" />

              <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]/50">
                <X className="h-4 w-4" />
              </button>

              {/* What they will get: the actual email series */}
              <aside className="relative hidden border-r border-white/[0.06] p-9 md:block" style={{ background: "radial-gradient(120% 90% at 0% 0%, rgba(0,240,255,0.08), transparent 60%)" }}>
                <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#00F0FF]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.9)]" />
                  What lands in your inbox
                </p>
                <ol className="relative mt-8 space-y-6">
                  <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-gradient-to-b from-[#00F0FF]/60 via-white/15 to-transparent" />
                  {SERIES.map((e, i) => (
                    <motion.li
                      key={e.day}
                      className="relative pl-7"
                      initial={reduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                    >
                      <span aria-hidden className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border ${i === 0 ? "border-[#00F0FF] bg-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.8)]" : "border-white/25 bg-[#070A12]"}`} />
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{e.day}</p>
                      <p className="mt-1 text-[14.5px] leading-snug text-white/85">{e.title}</p>
                    </motion.li>
                  ))}
                </ol>
                <p className="mt-10 border-t border-white/[0.06] pt-5 text-[12.5px] leading-relaxed text-white/40">
                  Four short emails over two weeks, written by the team, not a bot. Unsubscribe with one click.
                </p>
              </aside>

              <div className="relative flex flex-col justify-center p-7 sm:p-9 md:min-h-[540px]">
                <AnimatePresence mode="wait" initial={false}>
                  {state === "sent" ? (
                    <motion.div key="sent" className="flex min-h-[380px] flex-col items-center justify-center text-center" initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                      <motion.span
                        className="grid h-16 w-16 place-items-center rounded-full bg-[#00F0FF]/12 text-[#00F0FF] ring-1 ring-[#00F0FF]/40 shadow-[0_0_40px_rgba(0,240,255,0.35)]"
                        initial={reduce ? false : { scale: 0.4, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 16 }}
                      >
                        <Check className="h-8 w-8" strokeWidth={2.4} />
                      </motion.span>
                      <h2 id="lead-popup-title" className="mt-6 text-[30px] font-extrabold tracking-[-0.03em] text-white">
                        You&apos;re <span className="font-serif font-normal italic text-[#00F0FF]">in.</span>
                      </h2>
                      <p className="mt-3 max-w-xs text-[14.5px] leading-relaxed text-white/60">The welcome email is on its way. If it isn&apos;t there in a minute, check spam.</p>
                      <a href="https://cal.com/aurexis-solution/discoverycall" target="_blank" rel="noopener noreferrer" className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[#00F0FF] px-6 py-3 text-[14px] font-semibold text-[#02040A] shadow-[0_8px_30px_-6px_rgba(0,240,255,0.7)] transition-transform hover:-translate-y-0.5">
                        Book a free discovery call <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </a>
                      <button type="button" onClick={close} className="mt-3 h-10 text-[13px] text-white/45 hover:text-white/80">Back to the site</button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={submit} noValidate className="relative" exit={reduce ? undefined : { opacity: 0, y: -8 }}>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#00F0FF] md:hidden">Free from Aurexis</p>
                      <h2 id="lead-popup-title" className="mt-3 pr-10 text-[28px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-[32px] md:mt-0">
                        Find out where your business is{" "}
                        <span className="font-serif font-normal italic tracking-[-0.02em] text-[#00F0FF]">losing hours.</span>
                      </h2>
                      <p className="mt-4 text-[14.5px] leading-relaxed text-white/55">
                        Practical ideas for automating the work that eats your week. Straight to your inbox, no spam.
                      </p>
                      <div className="mt-7 space-y-3">
                        <Field icon={User} inputRef={firstField} name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" maxLength={120} aria-label="Your name" />
                        <Field icon={Mail} name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" autoComplete="email" maxLength={160} required aria-label="Email address" />
                        <Field icon={Building2} name="business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name (optional)" autoComplete="organization" maxLength={160} aria-label="Business name" />
                        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                      </div>
                      <AnimatePresence>
                        {error && (
                          <motion.p role="alert" className="mt-3 text-[13px] text-red-300" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <button
                        type="submit"
                        disabled={state === "sending"}
                        className="group relative mt-6 flex h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#00F0FF] text-[15px] font-semibold text-[#02040A] shadow-[0_10px_40px_-8px_rgba(0,240,255,0.75)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_48px_-8px_rgba(0,240,255,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:translate-y-0 disabled:opacity-70"
                      >
                        <span aria-hidden className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-[300%]" />
                        {state === "sending" ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                        ) : (
                          <>Send me the tips <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                        )}
                      </button>
                      <button type="button" onClick={close} className="mt-2 h-10 w-full text-[13px] text-white/40 transition-colors hover:text-white/75">
                        No thanks
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
