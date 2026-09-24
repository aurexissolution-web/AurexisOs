"use client";

import { cn } from "@/lib/utils";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

export type CustomerTabKey = "overview" | "projects" | "invoices" | "documents" | "receipts";

interface CustomerTabsProps {
  active: CustomerTabKey;
  onChange: (tab: CustomerTabKey) => void;
  counts: Partial<Record<CustomerTabKey, number>>;
}

const TABS: { key: CustomerTabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "projects", label: "Projects" },
  { key: "invoices", label: "Invoices" },
  { key: "documents", label: "Documents" },
  { key: "receipts", label: "Receipts" },
];

export function CustomerTabs({ active, onChange, counts }: CustomerTabsProps) {
  return (
    <nav className="flex items-center gap-1 border-b border-white/[0.06] -mt-1">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const count = counts[tab.key];
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative px-4 py-3 transition-colors",
              isActive ? "text-white" : "text-white/40 hover:text-white/70",
            )}
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
            }}
          >
            {tab.label}
            {typeof count === "number" && (
              <span
                className="ml-2"
                style={{
                  fontSize: 10,
                  color: isActive ? "rgba(0,240,255,0.85)" : "rgba(255,255,255,0.30)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 0,
                }}
              >
                {count}
              </span>
            )}
            {isActive && (
              <span
                aria-hidden
                className="absolute bottom-0 left-3 right-3 h-px"
                style={{ background: "linear-gradient(to right, transparent, #00F0FF, transparent)" }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
