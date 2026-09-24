"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchDashboardOverview, formatCurrency, type DashboardOverview } from "@/lib/portal/dashboard-data";
import { SectionHeader } from "@/components/portal/dashboard/SectionHeader";
import { LiveTimestamp } from "@/components/portal/dashboard/LiveTimestamp";
import { DashboardHero } from "@/components/portal/dashboard/DashboardHero";
import { PnLChart } from "@/components/portal/dashboard/PnLChart";
import { IncomeMixDonut } from "@/components/portal/dashboard/IncomeMixDonut";
import { ExpenseBreakdown } from "@/components/portal/dashboard/ExpenseBreakdown";
import { ProjectFunnel } from "@/components/portal/dashboard/ProjectFunnel";
import { RecentInvoices } from "@/components/portal/dashboard/RecentInvoices";
import { ContentPulse } from "@/components/portal/dashboard/ContentPulse";
import { InboundMessages } from "@/components/portal/dashboard/InboundMessages";
import { TodaysAgenda } from "@/components/portal/dashboard/TodaysAgenda";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const overview = await fetchDashboardOverview();
        if (!cancelled) setData(overview);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Unable to load dashboard data. Check your Supabase connection.");
        }
      }
    }

    load();

    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!data) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-12 max-w-[1280px]">
      {/* Masthead */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="flex flex-col gap-3 border-b border-white/[0.06] pb-6"
      >
        <div className="flex items-baseline justify-between gap-6">
          <h1
            className="leading-none tracking-tight"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "clamp(40px, 5vw, 56px)",
              color: "white",
              margin: 0,
            }}
          >
            Command{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(110deg, #A0FFFF 10%, #00F0FF 50%, #0080FF 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 0 18px rgba(0,240,255,0.25))",
              }}
            >
              center.
            </span>
          </h1>
          <LiveTimestamp asOf={data.asOf} />
        </div>
        <div className="flex items-center justify-between gap-6">
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 16,
              color: "rgba(255,255,255,0.55)",
              margin: 0,
            }}
          >
            Revenue, projects, content, and inbound — at a glance.
          </p>
          <YTDStrip data={data} />
        </div>
      </motion.header>

      {/* 00 — Today */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut, delay: 0.03 }}
      >
        <SectionHeader index="00" label="Agenda" accent="cyan" />
        <TodaysAgenda />
      </motion.section>

      {/* 01 — Hero band */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut, delay: 0.05 }}
      >
        <SectionHeader index="01" label="Pulse" accent="cyan" />
        <DashboardHero data={data} />
      </motion.section>

      {/* 02 — P&L */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut, delay: 0.12 }}
      >
        <SectionHeader index="02" label="Profit & Loss" accent="amber" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <PnLChart data={data.pnl12mo} />
          <IncomeMixDonut data={data.incomeMix} />
          <ExpenseBreakdown data={data.expensesByCategory} />
          <ProjectFunnel data={data.projects} />
        </div>
      </motion.section>

      {/* 03 — Activity */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut, delay: 0.18 }}
      >
        <SectionHeader index="03" label="Activity" accent="violet" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <RecentInvoices data={data.recentInvoices} />
          <ContentPulse data={data.content} />
          <InboundMessages data={data.inbound} />
        </div>
      </motion.section>

      {/* Footer rule */}
      <div
        className="flex items-center justify-between border-t border-white/[0.06] pt-5 pb-2"
        style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)" }}
      >
        <span>AurexisOS · v1.0 · Admin Portal</span>
        <span>End of dispatch ·</span>
      </div>
    </div>
  );
}

function YTDStrip({ data }: { data: DashboardOverview }) {
  const items: Array<{ label: string; value: string; tone?: "good" | "bad" | "neutral" }> = [
    { label: "YTD Revenue", value: formatCurrency(data.ytd.revenue) },
    { label: "YTD Expenses", value: formatCurrency(data.ytd.expenses) },
    {
      label: "YTD Profit",
      value: formatCurrency(data.ytd.profit),
      tone: data.ytd.profit >= 0 ? "good" : "bad",
    },
    {
      label: "Margin",
      value: data.ytd.marginPct !== null ? `${data.ytd.marginPct.toFixed(0)}%` : "—",
      tone: data.ytd.marginPct !== null && data.ytd.marginPct >= 0 ? "good" : "neutral",
    },
  ];

  return (
    <div className="hidden lg:flex items-baseline gap-7">
      {items.map((it, i) => {
        const color =
          it.tone === "good"
            ? "#10B981"
            : it.tone === "bad"
              ? "#F87171"
              : "rgba(255,255,255,0.85)";
        return (
          <div
            key={it.label}
            className={
              "flex items-baseline gap-2 whitespace-nowrap " +
              (i > 0 ? "border-l border-white/[0.06] pl-7" : "")
            }
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              {it.label}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12.5,
                color,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {it.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 max-w-[1280px]">
      <div className="border-b border-white/[0.06] pb-6">
        <div className="h-12 w-72 rounded bg-white/[0.04] animate-pulse" />
        <div className="mt-3 h-4 w-96 rounded bg-white/[0.02] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 h-[260px] rounded-[14px] border border-white/[0.04] bg-white/[0.01] animate-pulse" />
        <div className="lg:col-span-5 grid grid-cols-1 gap-5">
          <div className="h-[120px] rounded-[14px] border border-white/[0.04] bg-white/[0.01] animate-pulse" />
          <div className="h-[120px] rounded-[14px] border border-white/[0.04] bg-white/[0.01] animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 h-[320px] rounded-[14px] border border-white/[0.04] bg-white/[0.01] animate-pulse" />
        <div className="lg:col-span-4 h-[320px] rounded-[14px] border border-white/[0.04] bg-white/[0.01] animate-pulse" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
            margin: 0,
          }}
        >
          Dashboard offline.
        </p>
        <p
          className="mt-3"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(248,113,113,0.85)",
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
