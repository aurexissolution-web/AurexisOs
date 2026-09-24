"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  listMessages,
  markContacted,
  deleteMessage,
  waMeUrl,
} from "@/lib/portal/messages-admin";
import type { ContactIntent, ContactMessage } from "@/types/portal";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const easeOut = [0.16, 1, 0.3, 1] as const;

const INTENT_LABEL: Record<ContactIntent, string> = {
  "new-project": "New project",
  "ai-agent": "AI agent",
  "existing-client": "Existing client",
  "press-partnerships": "Press · Partnerships",
  careers: "Careers",
};

const INTENT_COLOR: Record<ContactIntent, string> = {
  "new-project": "#00F0FF",
  "ai-agent": "#A78BFA",
  "existing-client": "#10B981",
  "press-partnerships": "#F59E0B",
  careers: "#F472B6",
};

type FilterKey = "pending" | "contacted" | "all";

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("pending");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listMessages();
      setMessages(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const pending = messages.filter((m) => !m.contacted_at).length;
    const contacted = messages.filter((m) => !!m.contacted_at).length;
    return { pending, contacted, all: messages.length };
  }, [messages]);

  const filtered = useMemo(() => {
    if (filter === "pending") return messages.filter((m) => !m.contacted_at);
    if (filter === "contacted") return messages.filter((m) => !!m.contacted_at);
    return messages;
  }, [messages, filter]);

  async function handleMarkContacted(id: string, currentlyContacted: boolean) {
    try {
      await markContacted(id, !currentlyContacted);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete message from ${name}? This cannot be undone.`)) return;
    try {
      await deleteMessage(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-8 max-w-[1180px]">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="border-b border-white/[0.06] pb-6"
      >
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
          Inbox.
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
          Leads from the public brief form. WhatsApp them directly, then mark contacted.
        </p>
      </motion.header>

      {/* Filter tabs */}
      <nav className="flex items-center gap-1 border-b border-white/[0.06]">
        {(["pending", "contacted", "all"] as FilterKey[]).map((key) => {
          const isActive = filter === key;
          const label =
            key === "pending" ? "Pending" : key === "contacted" ? "Contacted" : "All";
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="relative px-4 py-3 transition-colors"
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                color: isActive ? "white" : "rgba(255,255,255,0.45)",
              }}
            >
              {label}
              <span
                className="ml-2"
                style={{
                  fontSize: 10,
                  color: isActive ? "rgba(0,240,255,0.85)" : "rgba(255,255,255,0.30)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 0,
                }}
              >
                {counts[key]}
              </span>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-3 right-3 h-px"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #00F0FF, transparent)",
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#F87171" }}>{error}</p>}

      {loading ? (
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-[180px] animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.01]"
            />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] py-14 text-center">
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              margin: 0,
            }}
          >
            {filter === "pending"
              ? "Inbox zero. Nice."
              : filter === "contacted"
                ? "Nothing marked contacted yet."
                : "No messages yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => (
            <MessageRow
              key={m.id}
              message={m}
              onMarkContacted={handleMarkContacted}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageRow({
  message: m,
  onMarkContacted,
  onDelete,
}: {
  message: ContactMessage;
  onMarkContacted: (id: string, currentlyContacted: boolean) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const intentColor = INTENT_COLOR[m.intent] ?? "#cbd5e1";
  const intentLabel = INTENT_LABEL[m.intent] ?? m.intent;
  const isContacted = !!m.contacted_at;

  const created = new Date(m.created_at);
  const timeAgo = formatRelative(created);
  const fullDate = created.toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const waLink = waMeUrl(
    m.phone,
    `Hi ${m.name.split(" ")[0]} — Sanjay from Aurexis. Got your message about ${intentLabel.toLowerCase()}, just following up.`,
  );

  return (
    <li
      className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5"
      style={{
        opacity: isContacted ? 0.65 : 1,
      }}
    >
      <div className="flex items-start gap-4 flex-wrap">
        {/* Intent pill */}
        <span
          className="inline-flex items-center gap-1.5 shrink-0"
          style={{
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            color: intentColor,
            background: `${intentColor}14`,
            border: `1px solid ${intentColor}44`,
            borderRadius: 999,
            padding: "4px 10px",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: intentColor,
              boxShadow: `0 0 6px ${intentColor}`,
            }}
          />
          {intentLabel}
        </span>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
            <span
              style={{
                fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: "white",
              }}
            >
              {m.name}
            </span>
            {m.company && (
              <span
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                — {m.company}
              </span>
            )}
            {m.stage && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                · {m.stage}
              </span>
            )}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <a
              href={`mailto:${m.email}`}
              className="hover:opacity-80"
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: "rgba(0,240,255,0.85)",
              }}
            >
              ✉ {m.email}
            </a>
            {m.phone && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.60)",
                }}
              >
                ☎ {m.phone}
              </span>
            )}
          </p>
        </div>

        {/* Timestamp */}
        <div
          className="text-right shrink-0"
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.40)",
          }}
        >
          <span title={fullDate}>{timeAgo}</span>
          {isContacted && (
            <span
              className="mt-0.5 block"
              style={{
                fontSize: 9,
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                color: "#10B981",
              }}
            >
              ✓ Contacted
            </span>
          )}
        </div>
      </div>

      {/* Message body — collapsed by default, click to expand */}
      <div className="mt-4 border-t border-white/[0.04] pt-4">
        <p
          className={expanded ? "" : "line-clamp-3"}
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 15,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.85)",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          &ldquo;{m.message}&rdquo;
        </p>
        {m.message.length > 240 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 hover:text-white"
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {expanded ? "Show less" : "Read full message →"}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.04] pt-4">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-1.5 text-[#10B981] hover:bg-[#10B981]/20"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            <span aria-hidden>📱</span> WhatsApp
          </a>
        )}
        <a
          href={`mailto:${m.email}?subject=Re: your message to Aurexis`}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.10] bg-white/[0.02] px-3 py-1.5 text-white/70 hover:bg-white/[0.05]"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span aria-hidden>✉</span> Email
        </a>
        <button
          type="button"
          onClick={() => onMarkContacted(m.id, isContacted)}
          className="rounded-md border px-3 py-1.5 transition-colors"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isContacted ? "rgba(255,255,255,0.55)" : "#00F0FF",
            borderColor: isContacted ? "rgba(255,255,255,0.10)" : "rgba(0,240,255,0.40)",
            background: isContacted ? "rgba(255,255,255,0.02)" : "rgba(0,240,255,0.06)",
          }}
        >
          {isContacted ? "↺ Mark pending" : "✓ Mark contacted"}
        </button>

        <button
          type="button"
          onClick={() => onDelete(m.id, m.name)}
          className="ml-auto text-red-400/70 hover:text-red-400"
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function formatRelative(d: Date): string {
  const now = Date.now();
  const diff = now - d.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "numeric",
    month: "short",
  });
}
