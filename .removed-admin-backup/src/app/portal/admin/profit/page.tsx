"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3, DollarSign, TrendingDown, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

interface MonthRow { month: string; income: number; expenses: number; profit: number }

export default function ProfitPage() {
  const [monthlyData, setMonthlyData] = useState<MonthRow[]>([]);

  useEffect(() => {
    async function load() {
      const [incRes, expRes] = await Promise.all([
        supabase.from("income_entries").select("amount, date"),
        supabase.from("expense_entries").select("amount, date"),
      ]);

      const incByMonth: Record<string, number> = {};
      (incRes.data ?? []).forEach((r) => {
        const m = r.date?.slice(0, 7);
        if (m) incByMonth[m] = (incByMonth[m] ?? 0) + Number(r.amount);
      });

      const expByMonth: Record<string, number> = {};
      (expRes.data ?? []).forEach((r) => {
        const m = r.date?.slice(0, 7);
        if (m) expByMonth[m] = (expByMonth[m] ?? 0) + Number(r.amount);
      });

      const allMonths = [...new Set([...Object.keys(incByMonth), ...Object.keys(expByMonth)])].sort();
      const rows: MonthRow[] = allMonths.map((m) => {
        const income = incByMonth[m] ?? 0;
        const expenses = expByMonth[m] ?? 0;
        const d = new Date(m + "-01");
        const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        return { month: label, income, expenses, profit: income - expenses };
      });

      setMonthlyData(rows);
    }
    load();
  }, []);

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : "0.0";
  const avgMonthlyProfit = monthlyData.length > 0 ? totalProfit / monthlyData.length : 0;
  const maxProfit = Math.max(...monthlyData.map((m) => m.profit), 1);
  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Net Profit & KPIs</h1>
        <p className="text-sm text-[#94A3B8]">Auto-calculated financial health: Income − Expenses = Net Profit.</p>
      </motion.div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard className="!p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-[#10B981]" />
              <p className="text-xs text-[#94A3B8]">Total Income</p>
            </div>
            <p className="text-xl font-bold text-[#10B981]">{fmt(totalIncome)}</p>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="!p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-[#EF4444]" />
              <p className="text-xs text-[#94A3B8]">Total Expenses</p>
            </div>
            <p className="text-xl font-bold text-[#EF4444]">{fmt(totalExpenses)}</p>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard className="!p-5 !border-[#00F0FF]/10">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-[#00F0FF]" />
              <p className="text-xs text-[#94A3B8]">Net Profit</p>
            </div>
            <p className="text-xl font-bold text-[#00F0FF]">{fmt(totalProfit)}</p>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="!p-5">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-[#F59E0B]" />
              <p className="text-xs text-[#94A3B8]">Profit Margin</p>
            </div>
            <p className="text-xl font-bold text-[#F59E0B]">{profitMargin}%</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Visual bar chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Monthly Profit Trend</h2>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Income</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Expenses</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00F0FF]" /> Profit</span>
            </div>
          </div>

          <div className="space-y-4">
            {monthlyData.map((m, i) => (
              <motion.div
                key={m.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#94A3B8] w-20">{m.month}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#10B981]">{fmt(m.income)}</span>
                    <span className="text-[#EF4444]">{fmt(m.expenses)}</span>
                    <span className="text-[#00F0FF] font-semibold">{fmt(m.profit)}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-3">
                  {/* Income bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.income / (maxProfit * 1.5)) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                    className="h-full rounded-full bg-[#10B981]/60"
                  />
                  {/* Expense bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.expenses / (maxProfit * 1.5)) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.35 + i * 0.05 }}
                    className="h-full rounded-full bg-[#EF4444]/60"
                  />
                  {/* Profit bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.profit / (maxProfit * 1.5)) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] to-[#0047FF]"
                    style={{ boxShadow: "0 0 8px rgba(0,240,255,0.3)" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Additional KPIs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Financial Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{fmt(avgMonthlyProfit)}</p>
              <p className="text-xs text-[#64748B] mt-1">Avg Monthly Profit</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{fmt(totalExpenses / monthlyData.length)}</p>
              <p className="text-xs text-[#64748B] mt-1">Avg Monthly Burn</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{(totalProfit / totalExpenses).toFixed(1)}x</p>
              <p className="text-xs text-[#64748B] mt-1">Revenue / Expense Ratio</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
