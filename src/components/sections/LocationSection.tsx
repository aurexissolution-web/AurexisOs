"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface KLNow {
  hh: string;
  mm: string;
  ss: string;
  weekdayShort: string;
  isOpen: boolean;
  statusLabel: string;
}

function computeKLNow(): KLNow {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = formatter.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hh = get("hour");
  const mm = get("minute");
  const ss = get("second");
  const weekdayShort = get("weekday");
  const isOpen = weekdayShort !== "Sun";
  const statusLabel = isOpen ? "Open · today" : "Closed · opens Mon";
  return { hh, mm, ss, weekdayShort, isOpen, statusLabel };
}

function useKLNow(): KLNow | null {
  const [now, setNow] = useState<KLNow | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const tick = () => setNow(computeKLNow());

    const start = () => {
      tick();
      if (interval) clearInterval(interval);
      interval = setInterval(tick, 1000);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return now;
}

function StatusDot({ open, size = 2 }: { open: boolean; size?: number }) {
  const reduceMotion = useSafeReducedMotion();
  const color = open ? "var(--color-electric-cyan)" : "rgba(255,180,80,0.85)";
  const sizeClass = size === 2 ? "h-2 w-2" : "h-1.5 w-1.5";

  return (
    <span
      className={`relative inline-flex items-center justify-center ${sizeClass}`}
      aria-hidden
    >
      {open && !reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color, transformOrigin: "center" }}
          animate={{ scale: [1, 3, 3], opacity: [0.55, 0, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className={`relative ${sizeClass} rounded-full`}
        style={{
          backgroundColor: color,
          boxShadow: open ? `0 0 8px ${color}` : "none",
        }}
      />
    </span>
  );
}

const PLACEHOLDER = "--";

interface City {
  name: string;
  role: string;
  coords: string;
}

const CITIES: City[] = [
  { name: "Sungai Petani", role: "Headquarters", coords: "5.65°N · 100.49°E" },
  { name: "Kuala Lumpur", role: "Working presence", coords: "3.14°N · 101.69°E" },
];

function PostcardStamp({ now }: { now: KLNow | null }) {
  return (
    <div
      className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-white/[0.10] bg-black/55 px-3.5 py-2.5 md:bottom-5 md:left-5 md:px-4 md:py-3"
      style={{ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
    >
      <span
        aria-hidden
        className="font-serif text-[18px] leading-none text-[var(--color-electric-cyan)]"
        style={{ fontStyle: "italic" }}
      >
        ◆
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[14px] leading-none tabular-nums text-white md:text-[15px]">
          {now ? `${now.hh}:${now.mm}` : `${PLACEHOLDER}:${PLACEHOLDER}`}
          <span className="ml-1 text-white/45">MYT</span>
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot open={now ? now.isOpen : true} size={1.5} />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/80">
            {now ? now.statusLabel : "Loading"}
          </span>
        </span>
      </div>
    </div>
  );
}

function CityPinStrip() {
  return (
    <div className="mt-3 border-t border-b border-white/[0.06] py-2.5">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 md:gap-x-9">
        {CITIES.map((city) => (
          <li key={city.name} className="group flex items-center gap-2.5">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-electric-cyan)]"
              style={{ boxShadow: "0 0 6px var(--color-electric-cyan)" }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/85 md:text-[11px]">
              {city.name}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/35 md:text-[10px]">
              · {city.role}
            </span>
            <span className="hidden font-mono text-[9px] tracking-[0.2em] text-[var(--color-electric-cyan)]/50 lg:inline">
              {city.coords}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditorialPostcard() {
  const now = useKLNow();

  return (
    <div className="relative w-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--color-deep-void)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] md:aspect-[16/9] lg:aspect-[2/1]">
        <Image
          src="/images/klcc-dusk.jpg"
          alt="Kuala Lumpur skyline at blue hour, with the Petronas Towers illuminated against a dusk sky"
          fill
          priority
          className="object-cover object-center"
          style={{ filter: "saturate(0.42) contrast(1.06) brightness(0.92)" }}
          sizes="(max-width: 1024px) 100vw, 58vw"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,30,60,0.20) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-color opacity-50"
          style={{ backgroundColor: "rgba(0,150,200,1)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow:
              "inset 0 0 120px 20px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute top-3 right-3 font-mono text-[8.5px] uppercase tracking-[0.32em] text-white/45 md:top-4 md:right-4 md:text-[9.5px]"
        >
          KLCC · Blue Hour
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.32em] text-white/35 md:top-4 md:left-4 md:text-[9.5px]"
        >
          <span>N</span>
          <span>↑</span>
          <span className="ml-2 text-white/25">3.16°N · 101.71°E</span>
        </div>

        <PostcardStamp now={now} />
      </div>

      <CityPinStrip />
    </div>
  );
}

export function LocationSection() {
  const reduceMotion = useSafeReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.7, ease: easeOut, delay },
        };

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-background)] py-20 md:py-24 lg:py-16">
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
        <motion.div {...fadeUp()} className="mb-4 flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-[var(--color-electric-cyan)]/60" />
          <span className="font-mono text-[11px] uppercase tracking-[0.42em] text-[var(--color-electric-cyan)]/80">
            Where We Work
          </span>
        </motion.div>

        <motion.div {...fadeUp(0.05)} className="mb-6 flex items-baseline gap-5 lg:mb-7">
          <span className="font-mono text-[10px] uppercase tracking-[0.42em] text-white/40">
            N° 04 · MY · UTC+08
          </span>
        </motion.div>

        <div className="mb-7 flex flex-col items-baseline gap-x-5 gap-y-1 lg:mb-8 lg:flex-row lg:gap-x-6">
          <motion.h2
            {...fadeUp(0.1)}
            className="font-serif text-4xl leading-[1.0] tracking-[-0.015em] text-white md:text-5xl lg:text-[52px] xl:text-[64px]"
            style={{ fontStyle: "normal" }}
          >
            Built in Malaysia.
          </motion.h2>
          <motion.p
            {...fadeUp(0.14)}
            className="font-serif text-2xl leading-[1.0] tracking-[-0.01em] text-white/50 md:text-3xl lg:text-[28px] xl:text-[34px]"
            style={{ fontStyle: "italic" }}
          >
            Open right now.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div {...fadeUp(0.18)} className="relative lg:col-span-7">
            <EditorialPostcard />
          </motion.div>

          <div className="lg:col-span-5">
            <motion.p
              {...fadeUp(0.22)}
              className="mb-5 max-w-md text-[15px] leading-[1.65] text-white/80 md:text-base"
            >
              Headquartered in Sungai Petani, Kedah. Working presence in Kuala
              Lumpur. We work remotely with clients across Malaysia, with
              on-site visits in the Klang Valley when a project calls for it.
            </motion.p>

            <motion.p
              {...fadeUp(0.28)}
              className="mb-8 max-w-md text-[14px] leading-[1.65] text-white/55 md:text-[15px]"
            >
              Our local context isn&apos;t a footnote — it&apos;s why we win.
              We build for how Malaysian pricing and tax display actually
              work. We know what RM 50,000 means to a small business owner
              deciding whether to spend it. That fluency is{" "}
              <span className="text-white/85" style={{ fontStyle: "italic" }}>
                non-transferable
              </span>
              .
            </motion.p>

            <motion.dl
              {...fadeUp(0.34)}
              className="space-y-0 border-t border-white/[0.06]"
            >
              {[
                { label: "Deep work", value: "09:00 — 13:00 MYT" },
                { label: "Calls", value: "After 14:00 MYT" },
                { label: "Cadence", value: "Mon — Sat · ship daily" },
                { label: "Off-hours", value: "Sundays · always" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 border-b border-white/[0.04] py-3"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--color-electric-cyan)]/65">
                    {row.label}
                  </dt>
                  <dd className="text-right text-[13px] text-white/85 md:text-[14px]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </section>
  );
}
