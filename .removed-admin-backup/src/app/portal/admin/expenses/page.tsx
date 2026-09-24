"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { TrendingDown, Plus, X, Save, Server, Megaphone, Briefcase, Scale, Shield, Trash2, Edit2 } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ExpenseCategory } from "@/types/portal";
import { supabase } from "@/lib/supabase/client";

type IconComp = React.ComponentType<LucideProps>;

interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  is_recurring: boolean;
}

const categoryConfig: Record<ExpenseCategory, { label: string; icon: IconComp; color: string }> = {
  tech_infrastructure: { label: "Tech Infrastructure", icon: Server, color: "#00F0FF" },
  operational: { label: "Operational", icon: Briefcase, color: "#F59E0B" },
  marketing: { label: "Marketing", icon: Megaphone, color: "#8B5CF6" },
  legal: { label: "Legal", icon: Scale, color: "#EF4444" },
  admin: { label: "Admin", icon: Shield, color: "#64748B" },
};

const inputClass =
  "w-full bg-[#02040A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00F0FF] transition-colors placeholder:text-[#64748B]";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function ExpensesPage() {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: "tech_infrastructure" as ExpenseCategory, vendor: "", amount: "", description: "", date: "", is_recurring: true });

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from("expense_entries")
      .select("id, category, vendor, amount, currency, description, date, is_recurring")
      .order("date", { ascending: false });
    if (data) setItems(data as ExpenseItem[]);
  }, []);

  useEffect(() => {
     
    loadItems();
  }, [loadItems]);

  const totalBurn = items.filter((i) => i.is_recurring).reduce((s, i) => s + Number(i.amount), 0);

  const grouped = Object.entries(categoryConfig).map(([key, cfg]) => {
    const catItems = items.filter((i) => i.category === key);
    const total = catItems.reduce((s, i) => s + Number(i.amount), 0);
    return { key: key as ExpenseCategory, ...cfg, items: catItems, total };
  }).filter((g) => g.items.length > 0);

  async function handleAdd() {
    if (editingId) {
      await supabase.from("expense_entries").update({
        category: form.category,
        vendor: form.vendor,
        amount: parseFloat(form.amount) || 0,
        description: form.description,
        date: form.date || new Date().toISOString().slice(0, 10),
        is_recurring: form.is_recurring,
      }).eq("id", editingId);
    } else {
      await supabase.from("expense_entries").insert({
        category: form.category,
        vendor: form.vendor,
        amount: parseFloat(form.amount) || 0,
        description: form.description,
        date: form.date || new Date().toISOString().slice(0, 10),
        is_recurring: form.is_recurring,
      });
    }
    closeForm();
    loadItems();
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this expense entry?")) {
      await supabase.from("expense_entries").delete().eq("id", id);
      loadItems();
    }
  }

  function openEdit(item: ExpenseItem) {
    setForm({
      category: item.category,
      vendor: item.vendor,
      amount: item.amount.toString(),
      description: item.description,
      date: item.date,
      is_recurring: item.is_recurring,
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ category: "tech_infrastructure", vendor: "", amount: "", description: "", date: "", is_recurring: true });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Expense Tracker</h1>
          <p className="text-sm text-[#94A3B8]">Log and categorize all operational expenses and burn rate.</p>
        </div>
        <NeonButton onClick={() => setShowForm(true)} className="!px-5 !py-2.5 !text-sm">
          <Plus className="w-4 h-4 mr-2" /> Log Expense
        </NeonButton>
      </motion.div>

      {/* Burn rate summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-[#EF4444]" />
            <p className="text-xs text-[#94A3B8]">Monthly Burn Rate (Recurring)</p>
          </div>
          <p className="text-3xl font-bold text-[#EF4444]">{fmt(totalBurn)}</p>
          <p className="text-xs text-[#64748B] mt-1">{fmt(totalBurn * 12)} annualized</p>
        </GlassCard>
      </motion.div>

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeForm}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
              <GlassCard className="!border-[#00F0FF]/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">{editingId ? "Edit Expense" : "Log Expense"}</h2>
                  <button onClick={closeForm} className="text-[#94A3B8] hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Category</label>
                      <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                        {Object.entries(categoryConfig).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Vendor</label>
                      <input className={inputClass} placeholder="E.g. Vercel" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Amount (USD)</label>
                      <input type="number" className={inputClass} placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Date</label>
                      <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Description</label>
                    <input className={inputClass} placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} className="w-4 h-4 rounded border-white/10 bg-[#02040A]" />
                    <span className="text-sm text-[#94A3B8]">Recurring monthly expense</span>
                  </label>
                  <NeonButton onClick={handleAdd} className="w-full !py-3 !text-sm">
                    <Save className="w-4 h-4 mr-2" /> Save Expense
                  </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped expenses */}
      {grouped.map((group, gi) => {
        const Icon = group.icon;
        return (
          <motion.div key={group.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + gi * 0.05 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: group.color }} />
                  <h3 className="text-sm font-semibold text-white">{group.label}</h3>
                </div>
                <span className="text-sm font-bold" style={{ color: group.color }}>{fmt(group.total)}</span>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-white">{item.vendor}</p>
                      <p className="text-[10px] text-[#64748B]">{item.description} • {item.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.is_recurring && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#94A3B8]">Monthly</span>}
                      <span className="text-sm font-semibold text-[#EF4444]">-{fmt(item.amount)}</span>
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-[#94A3B8] hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
