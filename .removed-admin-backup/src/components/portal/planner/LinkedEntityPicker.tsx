"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchLinkedEntityOptions,
  type LinkedEntityOption,
} from "@/lib/portal/planner-admin";
import type { PlannerLinkedEntityType } from "@/types/portal";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface Props {
  type: PlannerLinkedEntityType | null;
  id: string | null;
  onChange: (type: PlannerLinkedEntityType | null, id: string | null) => void;
}

export function LinkedEntityPicker({ type, id, onChange }: Props) {
  const [options, setOptions] = useState<LinkedEntityOption[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLinkedEntityOptions()
      .then((opts) => {
        if (!cancelled) setOptions(opts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => (type && id ? options.find((o) => o.type === type && o.id === id) ?? null : null),
    [options, type, id],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 20);
    return options
      .filter((o) => o.label.toLowerCase().includes(q) || o.sub?.toLowerCase().includes(q))
      .slice(0, 20);
  }, [options, query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left rounded-md border border-white/[0.10] bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04]"
          style={{
            fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
            fontSize: 12.5,
            color: selected ? "white" : "rgba(255,255,255,0.40)",
          }}
        >
          {selected ? (
            <>
              <span>{selected.label}</span>
              {selected.sub && (
                <span
                  className="ml-2"
                  style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.35)" }}
                >
                  · {selected.sub}
                </span>
              )}
            </>
          ) : (
            <span>Link to a customer / project / blog post / message / invoice (optional)</span>
          )}
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="rounded-md border border-white/[0.08] px-2.5 py-2 text-[11px] text-white/40 hover:text-white/70"
            style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full rounded-lg border border-white/[0.10] bg-[#0A0A0C] shadow-2xl"
          style={{ maxHeight: 320, overflowY: "auto" }}
        >
          <div className="sticky top-0 border-b border-white/[0.06] bg-[#0A0A0C] p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-white/[0.10] bg-white/[0.02] px-3 py-1.5 outline-none"
              style={{
                fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                fontSize: 12,
                color: "white",
              }}
            />
          </div>
          {filtered.length === 0 ? (
            <p
              className="p-4 text-center"
              style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.35)" }}
            >
              No matches.
            </p>
          ) : (
            <ul className="py-1">
              {filtered.map((o) => (
                <li key={`${o.type}:${o.id}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.type, o.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-white/[0.04]"
                  >
                    <span
                      className="truncate"
                      style={{
                        fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                        fontSize: 12.5,
                        color: "white",
                      }}
                    >
                      {o.label}
                    </span>
                    {o.sub && (
                      <span
                        className="shrink-0"
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          letterSpacing: "0.10em",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {o.sub}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
