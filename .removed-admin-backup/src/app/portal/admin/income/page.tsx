"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { DollarSign, Plus, X, Save, RefreshCw, Zap, Trash2, Edit2 } from "lucide-react";
import type { IncomeType } from "@/types/portal";
import { supabase } from "@/lib/supabase/client";

interface IncomeItem {
  id: string;
  type: IncomeType;
  description: string;
  amount: number;
  currency: string;
  date: string;
  recurring_months: number | null;
}

const inputClass =
  "w-full bg-[#02040A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00F0FF] transition-colors placeholder:text-[#64748B]";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function IncomePage() {
  const [items, setItems] = useState<IncomeItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "one_time" as IncomeType, description: "", client_name: "", amount: "", date: "", recurring_months: "" });

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from("income_entries")
      .select("id, type, description, amount, currency, date, recurring_months")
      .order("date", { ascending: false });
    if (data) setItems(data as IncomeItem[]);
  }, []);

  useEffect(() => {
     
    loadItems();
  }, [loadItems]);

  const oneTimeTotal = items.filter((i) => i.type === "one_time").reduce((s, i) => s + Number(i.amount), 0);
  const mrrTotal = items.filter((i) => i.type === "recurring").reduce((s, i) => s + Number(i.amount), 0);

  async function handleAdd() {
    if (editingId) {
      await supabase.from("income_entries").update({
        type: form.type,
        description: form.description,
        amount: parseFloat(form.amount) || 0,
        date: form.date || new Date().toISOString().slice(0, 10),
        recurring_months: form.type === "recurring" ? (parseInt(form.recurring_months) || null) : null,
      }).eq("id", editingId);
    } else {
      await supabase.from("income_entries").insert({
        type: form.type,
        description: form.description,
        amount: parseFloat(form.amount) || 0,
        date: form.date || new Date().toISOString().slice(0, 10),
        recurring_months: form.type === "recurring" ? (parseInt(form.recurring_months) || null) : null,
      });
    }
    closeForm();
    loadItems();
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this income entry?")) {
      await supabase.from("income_entries").delete().eq("id", id);
      loadItems();
    }
  }

  function openEdit(item: IncomeItem) {
    setForm({
      type: item.type,
      description: item.description,
      client_name: "", // Not returned by API currently, but keeping schema
      amount: item.amount.toString(),
      date: item.date,
      recurring_months: item.recurring_months ? item.recurring_months.toString() : "",
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ type: "one_time", description: "", client_name: "", amount: "", date: "", recurring_months: "" });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Income Engine</h1>
          <p className="text-sm text-[#94A3B8]">Track one-time project revenue and monthly recurring revenue.</p>
        </div>
        <NeonButton onClick={() => setShowForm(true)} className="!px-5 !py-2.5 !text-sm">
          <Plus className="w-4 h-4 mr-2" /> Log Income
        </NeonButton>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard className="!p-5">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#10B981]" />
              <p className="text-xs text-[#94A3B8]">One-Time Revenue</p>
            </div>
            <p className="text-2xl font-bold text-[#10B981]">{fmt(oneTimeTotal)}</p>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="!p-5">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-[#00F0FF]" />
              <p className="text-xs text-[#94A3B8]">Monthly Recurring (MRR)</p>
            </div>
            <p className="text-2xl font-bold text-[#00F0FF]">{fmt(mrrTotal)}</p>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard className="!p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-[#F59E0B]" />
              <p className="text-xs text-[#94A3B8]">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-white">{fmt(oneTimeTotal + mrrTotal)}</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeForm}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
              <GlassCard className="!border-[#00F0FF]/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">{editingId ? "Edit Income" : "Log Income"}</h2>
                  <button onClick={closeForm} className="text-[#94A3B8] hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Type</label>
                    <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as IncomeType })}>
                      <option value="one_time">One-Time</option>
                      <option value="recurring">Recurring (MRR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Description</label>
                    <input className={inputClass} placeholder="E.g. Full website build" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Client</label>
                      <input className={inputClass} placeholder="Client name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Amount (USD)</label>
                      <input type="number" className={inputClass} placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Date</label>
                      <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                    {form.type === "recurring" && (
                      <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Recurring Months</label>
                        <input type="number" className={inputClass} placeholder="12" value={form.recurring_months} onChange={(e) => setForm({ ...form, recurring_months: e.target.value })} />
                      </div>
                    )}
                  </div>
                  <NeonButton onClick={handleAdd} className="w-full !py-3 !text-sm">
                    <Save className="w-4 h-4 mr-2" /> Save Income Entry
                  </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Income list */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.03 }}>
            <GlassCard className="!p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.type === "recurring" ? "bg-[#00F0FF]/10" : "bg-[#10B981]/10"}`}>
                {item.type === "recurring" ? <RefreshCw className="w-4 h-4 text-[#00F0FF]" /> : <Zap className="w-4 h-4 text-[#10B981]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#64748B]">{item.date}</span>
                  {item.recurring_months && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF]">{item.recurring_months}mo</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-lg font-bold text-[#10B981]">+{fmt(item.amount)}</span>
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-[#94A3B8] hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
