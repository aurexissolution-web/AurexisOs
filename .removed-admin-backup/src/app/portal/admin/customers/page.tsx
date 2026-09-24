"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { listCustomers, type CustomerListItem } from "@/lib/portal/customer-data";
import { CustomerListRow } from "@/components/portal/customers/CustomerListRow";
import type { CustomerStatus } from "@/types/portal";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const easeOut = [0.16, 1, 0.3, 1] as const;
const FILTERS: { key: CustomerStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "dormant", label: "Dormant" },
  { key: "archived", label: "Archived" },
];

export default function CustomersListPage() {
  const [customers, setCustomers] = useState<CustomerListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerStatus | "all">("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await listCustomers();
        if (!cancelled) setCustomers(data);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError(e instanceof Error ? e.message : "Failed to load customers");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!customers) return [];
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.company_name.toLowerCase().includes(q) ||
        c.contact_name.toLowerCase().includes(q) ||
        c.contact_email.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q)
      );
    });
  }, [customers, search, filter]);

  return (
    <div className="space-y-8 max-w-[1280px]">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="flex flex-col gap-4 border-b border-white/[0.06] pb-6"
      >
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
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
              Customers.
            </h1>
            <p
              className="mt-3"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 16,
                color: "rgba(255,255,255,0.55)",
                margin: 0,
              }}
            >
              One record per customer — projects, invoices, documents, receipts all nested inside.
            </p>
          </div>
          <Link
            href="/portal/admin/customers/new"
            className="rounded-md bg-[#00F0FF] px-5 py-2.5 text-[13px] font-semibold text-black hover:brightness-110"
            style={{ boxShadow: "0 0 24px rgba(0,240,255,0.25)" }}
          >
            + New Customer
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            placeholder="Search company, contact, industry…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
              fontSize: 13,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "9px 13px",
              color: "white",
              minWidth: 280,
              outline: "none",
            }}
          />
          <div className="flex items-center gap-1">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className="rounded-md px-3 py-1.5 transition-colors"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: isActive ? "white" : "rgba(255,255,255,0.40)",
                    background: isActive ? "rgba(0,240,255,0.10)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(0,240,255,0.30)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <span className="ml-auto" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
            {customers === null ? "Loading…" : `${filtered.length} of ${customers.length}`}
          </span>
        </div>
      </motion.header>

      {error && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "#F87171",
            padding: "12px 16px",
            border: "1px solid rgba(248,113,113,0.20)",
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}

      {customers === null ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        customers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.10] py-12 text-center">
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: "rgba(255,255,255,0.40)", margin: 0 }}>
              No customers match this filter
            </p>
          </div>
        )
      ) : (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          {filtered.map((c, i) => (
            <li key={c.id}>
              <CustomerListRow customer={c} index={i} />
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

function LoadingRows() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-[78px] rounded-md bg-white/[0.02] border border-white/[0.04] animate-pulse" />
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.10] py-20 text-center">
      <p
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 28,
          color: "rgba(255,255,255,0.55)",
          margin: 0,
        }}
      >
        No customers yet.
      </p>
      <p
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.30)",
          marginTop: 12,
        }}
      >
        Add your first customer to start tracking projects, invoices, and documents.
      </p>
      <Link
        href="/portal/admin/customers/new"
        className="mt-6 inline-block rounded-md bg-[#00F0FF] px-5 py-2.5 text-[13px] font-semibold text-black hover:brightness-110"
        style={{ boxShadow: "0 0 24px rgba(0,240,255,0.25)" }}
      >
        + Add First Customer
      </Link>
    </div>
  );
}
