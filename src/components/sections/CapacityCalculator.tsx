"use client";

import { useMemo, useState } from "react";
import NumberFlow, { useCanAnimate } from "@number-flow/react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import {
  CALCULATOR_BOUNDS,
  CALCULATOR_DEFAULTS,
  CALCULATOR_PRESETS,
  FULL_WEEK_HOURS,
  HOURS_PER_MONTH,
  WEEKS_PER_YEAR,
  WORKING_DAYS_PER_YEAR,
  computeCapacityCost,
  formatMYR,
} from "@/lib/calculator";
import { SectionDivider } from "@/components/ui/section-divider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_AUREXIS_WHATSAPP || "60164071129";

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

type Inputs = { people: number; salary: number; hours: number };

function sameInputs(a: Inputs, b: Inputs) {
  return a.people === b.people && a.salary === b.salary && a.hours === b.hours;
}

/** Glow intensity follows the figure — a cheap answer barely lights, a costly one burns. */
function glowFor(annual: number) {
  const t = clamp(annual / 250_000, 0, 1); // saturates around RM250k
  return { wide: 0.24 + t * 0.35, tight: 0.16 + t * 0.24 };
}

interface DialProps {
  label: string;
  help: string;
  unit?: string;
  prefix?: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
}

function Dial({ label, help, unit, prefix, value, onChange, min, max, step }: DialProps) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div
      className="rounded-[14px] px-5 py-5 lg:py-2.5"
      style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
        {label}
      </span>

      <div className="mt-3 flex items-center justify-between gap-3 lg:mt-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step, min, max))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/70"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5">
          {prefix && <span className="font-mono text-[12px] text-white/40">{prefix}</span>}
          <span className="truncate text-[30px] font-semibold tabular-nums text-white lg:text-[26px]">
            {value.toLocaleString("en-MY")}
          </span>
          {unit && <span className="font-mono text-[11px] text-white/40">{unit}</span>}
        </div>

        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(clamp(value + step, min, max))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/70"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="relative mt-4 h-1 w-full rounded-full bg-white/10 lg:mt-3">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-electric-cyan)] transition-[width] duration-150"
          style={{ width: `${fill}%` }}
        />
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 top-1/2 h-11 w-full -translate-y-1/2 cursor-pointer opacity-0"
        />
      </div>

      <p className="mt-3 text-[12px] leading-[1.5] text-white/40 lg:mt-2 lg:text-[11.5px] lg:leading-[1.35]">
        {help}
      </p>
    </div>
  );
}

function LedgerLine({
  label,
  value,
  muted,
  caps,
}: {
  label: string;
  value: string;
  muted?: boolean;
  caps?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span
        className={
          caps ? "uppercase tracking-[0.08em] text-white/40" : muted ? "text-white/40" : "text-white/70"
        }
      >
        {label}
      </span>
      <span aria-hidden className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-white/15" />
      <span
        className={`shrink-0 whitespace-nowrap tabular-nums ${muted ? "text-white/55" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function CapacityCalculator() {
  const [people, setPeople] = useState<number>(CALCULATOR_DEFAULTS.people);
  const [salary, setSalary] = useState<number>(CALCULATOR_DEFAULTS.salary);
  const [hours, setHours] = useState<number>(CALCULATOR_DEFAULTS.hours);

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const canAnimate = useCanAnimate();
  const c = useMemo(
    () => computeCapacityCost(people, salary, hours),
    [people, salary, hours],
  );

  const annual = Math.round(c.annualCost);
  const glow = glowFor(annual);
  const personDays = Math.round(c.perPersonDaysLost);

  const whatsappHref = useMemo(() => {
    const msg =
      `Hi Aurexis - I used your calculator. Admin work is costing us about ` +
      `RM${formatMYR(c.annualCost)} a year (${people} people, ${hours} hrs each per week). ` +
      `Can you help us fix this?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [c.annualCost, people, hours]);

  function applyPreset(p: (typeof CALCULATOR_PRESETS)[number]) {
    setPeople(p.people);
    setSalary(p.salary);
    setHours(p.hours);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);
    setSending(true);
    try {
      const res = await fetch("/api/calculator-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, staff: people, wage: salary, hours }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setEmailError(data.error || "Something went wrong. Try WhatsApp instead.");
    } catch {
      setEmailError("Something went wrong. Try WhatsApp instead.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="relative bg-[var(--color-background)] px-6 py-14 lg:px-16 lg:py-20">
      <SectionDivider />
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-2">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            The Capacity Calculator
          </span>
          <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white text-balance md:text-4xl lg:mt-1 lg:text-4xl">
            How much is admin work{" "}
            <em
              className="font-serif font-normal italic text-[var(--color-electric-cyan)]"
              style={{ filter: "drop-shadow(0 0 18px rgba(0,240,255,0.32))" }}
            >
              costing you
            </em>
            ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.6] text-white/55 md:text-base lg:mt-1">
            Three numbers. One uncomfortable answer.
          </p>
        </div>

        {/* Presets */}
        <div>
          <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
            Starting points — adjust after
          </span>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {CALCULATOR_PRESETS.map((p) => {
              const on = sameInputs({ people, salary, hours }, p);
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  aria-pressed={on}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/70 ${
                    on
                      ? "border-[var(--color-electric-cyan)]/60 bg-[var(--color-electric-cyan)]/[0.10] text-white"
                      : "border-white/14 text-white/55 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dials */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:mt-1">
          <Dial
            label="People involved"
            help="Anyone who touches admin — including you."
            unit="people"
            value={people}
            onChange={setPeople}
            {...CALCULATOR_BOUNDS.people}
          />
          <Dial
            label="Avg monthly salary"
            help="Rough monthly average. Include yourself at what you'd pay someone to do your job."
            prefix="RM"
            value={salary}
            onChange={setSalary}
            {...CALCULATOR_BOUNDS.salary}
          />
          <Dial
            label="Admin hrs / person / wk"
            help="Quotes, invoices, chasing payments, updating records, answering the same questions."
            unit="hrs"
            value={hours}
            onChange={setHours}
            {...CALCULATOR_BOUNDS.hours}
          />
        </div>

        {/* Result */}
        <div
          className="mt-6 rounded-[16px] px-7 py-8 lg:mt-4 lg:px-10 lg:py-3"
          style={{
            background: "#131313",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: `0 0 50px rgba(94,227,218,${glow.tight}), 0 0 160px rgba(94,227,218,${glow.wide}), inset 0 1px 0 rgba(94,227,218,0.28)`,
          }}
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            {/* Left: the figure + year strip */}
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                What admin costs you each year
              </span>
              <p
                className="mt-2 flex flex-wrap items-baseline gap-x-2.5 text-[var(--color-electric-cyan)] lg:mt-1"
                style={{
                  textShadow: `0 0 ${30 + glow.tight * 110}px rgba(0,240,255,${glow.tight})`,
                  // NumberFlow's internal digit spans use `mix-blend-mode:
                  // plus-lighter`. `isolation: isolate` is the CSS-spec
                  // mechanism for containing a blend-mode to its own
                  // subtree — without it, those spans can blend with
                  // whatever else has been painted nearby (e.g. the ledger's
                  // text), which is what produced ghost fragments during
                  // the count-up animation.
                  isolation: "isolate",
                  position: "relative",
                }}
              >
                <span className="font-serif text-[28px] italic leading-none md:text-[32px] lg:text-[22px]">
                  RM
                </span>
                <span className="text-[clamp(3rem,7vw,5rem)] font-extrabold leading-[0.9] tracking-[-0.035em] tabular-nums lg:text-[46px]">
                  <NumberFlow
                    value={annual}
                    locales="en-MY"
                    animated={canAnimate}
                    transformTiming={{ duration: 400, easing: "ease-out" }}
                    spinTiming={{ duration: 400, easing: "ease-out" }}
                  />
                </span>
              </p>
              <p className="mt-2 font-mono text-[12px] text-white/55 lg:mt-1">
                ≈ RM {formatMYR(c.monthlyCost)} / month · {formatMYR(c.daysPerYear)} days lost across
                the team
              </p>

              <div className="mt-8 lg:mt-2">
                <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                  <span>Each person&rsquo;s working year</span>
                  <span className="text-[var(--color-electric-cyan)]">
                    {personDays} / {WORKING_DAYS_PER_YEAR} days
                  </span>
                </div>
                <div
                  aria-hidden
                  className="mt-3 flex flex-wrap gap-[3px] lg:mt-1 lg:gap-[2px]"
                  role="img"
                  aria-label={`${personDays} of ${WORKING_DAYS_PER_YEAR} working days a year lost to admin, per person`}
                >
                  {Array.from({ length: WORKING_DAYS_PER_YEAR }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2.5 w-2.5 rounded-[2px] transition-colors duration-300 lg:h-[7px] lg:w-[7px]"
                      style={{
                        background:
                          i < personDays ? "var(--color-electric-cyan)" : "rgba(255,255,255,0.14)",
                        boxShadow: i < personDays ? "0 0 6px rgba(0,240,255,0.5)" : undefined,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-3 font-mono text-[11px] text-white/30 lg:mt-1.5">
                  One block = one working day, out of a {WORKING_DAYS_PER_YEAR}-day year.
                </p>
              </div>
            </div>

            {/* Right: the ledger */}
            <div className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                The arithmetic
              </span>
              <div className="mt-4 flex flex-col gap-2.5 font-mono text-[13px] lg:mt-2 lg:gap-1.5">
                <LedgerLine
                  label={`${people} ${people === 1 ? "person" : "people"} × ${hours} hrs × ${WEEKS_PER_YEAR} wks`}
                  value={`${formatMYR(c.annualHours)} hrs`}
                />
                <LedgerLine
                  label={`RM ${formatMYR(salary)} ÷ ${HOURS_PER_MONTH} hrs`}
                  value={`RM ${c.hourlyRate.toFixed(2)} /hr`}
                />
                <LedgerLine
                  label={`${formatMYR(c.annualHours)} hrs × RM ${c.hourlyRate.toFixed(2)}`}
                  value={`RM ${formatMYR(c.annualCost)}`}
                  muted
                />
              </div>
              <p className="mt-5 font-mono text-[11px] text-white/30 lg:mt-1">
                Based on a {FULL_WEEK_HOURS}-hour week and {HOURS_PER_MONTH} working hours a month.
              </p>

              <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 font-mono text-[11.5px] lg:mt-2 lg:gap-1 lg:pt-2">
                <LedgerLine
                  label="What admin costs you"
                  value={`RM ${formatMYR(c.annualCost)}`}
                  muted
                  caps
                />
                <LedgerLine label="What a system costs" value="From RM 2,250" muted caps />
              </div>

              <p className="mt-5 text-[15px] leading-[1.6] text-white/70 lg:mt-2 lg:text-[13px] lg:leading-[1.4]">
                That&rsquo;s what a system pays back.
              </p>
            </div>
          </div>
        </div>

        {/* Primary action + secondary, side by side on desktop */}
        <div className="mt-7 flex flex-col gap-6 lg:mt-1 lg:flex-row lg:items-end lg:gap-8">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-electric-cyan)]/40 bg-[var(--color-electric-cyan)]/[0.04] px-7 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-[var(--color-electric-cyan)]/70 hover:bg-[var(--color-electric-cyan)]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Talk to us about fixing this
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>

          <div className="h-px w-full bg-white/[0.10] lg:h-8 lg:w-px" aria-hidden />

          {sent ? (
            <p className="text-[13.5px] text-white/60">Sent — check your inbox for the breakdown.</p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="min-w-0 flex-1">
              <label htmlFor="cap-email" className="block text-[13px] text-white/45">
                Or email me the breakdown <span className="text-white/25">(optional)</span>
              </label>
              <div className="mt-2.5 flex max-w-md flex-wrap gap-2.5">
                <input
                  id="cap-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourcompany.com"
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "cap-email-error" : undefined}
                  className="min-w-0 flex-1 rounded-full border border-white/[0.12] bg-white/[0.02] px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 outline-none focus-visible:border-white/30"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-full border border-white/[0.14] bg-white/[0.03] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/[0.07] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  {sending ? "Sending…" : "Send it"}
                </button>
              </div>
              {emailError && (
                <p id="cap-email-error" className="mt-2 text-[12.5px] text-white/60">
                  {emailError}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default CapacityCalculator;
