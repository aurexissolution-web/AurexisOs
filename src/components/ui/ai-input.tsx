"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { Linkify } from "./linkify";

const SPEED_FACTOR = 1;

interface ContextShape {
  showForm: boolean;
  triggerOpen: () => void;
  triggerClose: () => void;
}

const FormContext = React.createContext({} as ContextShape);
const useFormContext = () => React.useContext(FormContext);

const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 520;
const DOCK_WIDTH = 168;
const DOCK_HEIGHT = 48;

// Empty-state suggestion chips. Clicking one submits it as the user's first message.
const SUGGESTIONS = [
  "What services do you build?",
  "How do you price projects?",
  "Book a 45-min strategy call",
] as const;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

const MESSAGES_STORAGE_KEY = "aurexis_chat_messages";
const SESSION_ID_KEY = "aurexis_chat_session_id";

function getSessionId(): string {
  try {
    let id = globalThis.localStorage?.getItem(SESSION_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      globalThis.localStorage?.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = globalThis.localStorage?.getItem(MESSAGES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    globalThis.localStorage?.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
  } catch { /* noop */ }
}

export function MorphPanel({ initialOpen = false }: { initialOpen?: boolean } = {}) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const [showForm, setShowForm] = React.useState(initialOpen);

  const triggerClose = React.useCallback(() => {
    setShowForm(false);
    textareaRef.current?.blur();
  }, []);

  const triggerOpen = React.useCallback(() => {
    setShowForm(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  }, []);

  React.useEffect(() => {
    function handleExternalOpen() {
      triggerOpen();
    }
    window.addEventListener("aurexis:open-chat", handleExternalOpen);
    return () => window.removeEventListener("aurexis:open-chat", handleExternalOpen);
  }, [triggerOpen]);

  React.useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        showForm
      ) {
        triggerClose();
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler);
    return () => document.removeEventListener("mousedown", clickOutsideHandler);
  }, [showForm, triggerClose]);

  const ctx = React.useMemo(
    () => ({ showForm, triggerOpen, triggerClose }),
    [showForm, triggerOpen, triggerClose]
  );

  return (
    <div className="relative">
      <motion.div
        ref={wrapperRef}
        data-panel
        layout
        className="relative flex flex-col overflow-hidden"
        initial={false}
        animate={{
          width: showForm ? PANEL_WIDTH : DOCK_WIDTH,
          height: showForm ? PANEL_HEIGHT : DOCK_HEIGHT,
          borderRadius: showForm ? 22 : 999,
        }}
        transition={{
          type: "spring",
          stiffness: 400 / SPEED_FACTOR,
          damping: 35,
          mass: 0.8,
          delay: showForm ? 0 : 0.05,
        }}
        style={{
          maxWidth: "92vw",
          maxHeight: "78vh",
          background: showForm
            ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04))"
            : "transparent",
          border: showForm ? "1px solid rgba(255,255,255,0.10)" : "none",
          backdropFilter: showForm ? "blur(40px) saturate(180%)" : "none",
          WebkitBackdropFilter: showForm ? "blur(40px) saturate(180%)" : "none",
          boxShadow: showForm
            ? "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(0,240,255,0.06), 0 28px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,240,255,0.10)"
            : "none",
        }}
      >
        {/* Top rim-light hairline — only visible in panel state */}
        {showForm && (
          <span
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: 0,
              left: "12%",
              right: "12%",
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(0,240,255,0.55), transparent)",
              zIndex: 3,
            }}
          />
        )}

        {/* Bottom ambient cyan glow — only visible in panel state */}
        {showForm && (
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,240,255,0.08), transparent 60%)",
              zIndex: 1,
            }}
          />
        )}

        <FormContext.Provider value={ctx}>
          <AnimatePresence mode="wait" initial={false}>
            {showForm ? (
              <ChatPanel key="panel" ref={textareaRef} />
            ) : (
              <DockButton key="dock" />
            )}
          </AnimatePresence>
        </FormContext.Provider>
      </motion.div>
    </div>
  );
}

function DockButton() {
  const { triggerOpen } = useFormContext();
  return (
    <motion.button
      type="button"
      onClick={triggerOpen}
      className="group relative flex h-full w-full items-center justify-center outline-none"
      style={{
        gap: 12,
        padding: "0 20px",
        background: "rgba(2,4,10,0.72)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 999,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.55), 0 0 24px rgba(0,240,255,0.12)",
      }}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{
        scale: 1.03,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 32px rgba(0,0,0,0.6), 0 0 36px rgba(0,240,255,0.28)",
      }}
      whileTap={{ scale: 0.98 }}
      aria-label="Open Aurexis AI chat"
    >
      {/* Small 3D orb with halo — the visual character */}
      <span
        aria-hidden
        className="relative inline-flex items-center justify-center"
        style={{
          width: 22,
          height: 22,
          flexShrink: 0,
        }}
      >
        {/* Outer soft halo */}
        <span
          className="absolute rounded-full motion-safe:animate-[contactRosterPulse_3s_ease-in-out_infinite]"
          style={{
            inset: -6,
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,240,255,0.55), transparent 65%)",
            filter: "blur(6px)",
          }}
        />
        {/* The orb itself — 3D sphere with cyan + violet gradient */}
        <span
          className="relative rounded-full"
          style={{
            width: 20,
            height: 20,
            background: [
              // Bright top specular catchlight
              "radial-gradient(ellipse 35% 25% at 50% 20%, rgba(255,255,255,0.85), transparent 70%)",
              // Inner glow
              "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,240,255,0.50), transparent 65%)",
              // Body gradient — cyan top-left, violet bottom-right, deep navy core
              "linear-gradient(135deg, rgba(0,240,255,0.75) 0%, rgba(167,139,250,0.65) 50%, rgba(10,30,80,0.95) 100%)",
            ].join(", "),
            boxShadow: [
              "inset 0 -2px 4px rgba(0,0,0,0.40)",
              "inset 0 1px 2px rgba(255,255,255,0.35)",
              "0 0 8px rgba(0,240,255,0.45)",
            ].join(", "),
          }}
        />
      </span>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.005em",
          color: "#f5f5f7",
          whiteSpace: "nowrap",
        }}
      >
        Ask Aurexis
      </span>
    </motion.button>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="sr-only">Assistant is typing</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-1.5 rounded-full bg-white/50"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

const ChatPanel = React.forwardRef<
  HTMLTextAreaElement,
  React.HTMLAttributes<HTMLDivElement>
>((_, ref) => {
  const { triggerClose, showForm } = useFormContext();
  const sendBtnRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = React.useRef(true);

  const [status, setStatus] = React.useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (showForm) {
      setMessages(loadMessages());
    }
  }, [showForm]);

  React.useEffect(() => {
    if (!showForm) return;
    if (!shouldStickToBottomRef.current) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, showForm]);

  const clearConversation = React.useCallback(() => {
    globalThis.localStorage?.removeItem(MESSAGES_STORAGE_KEY);
    globalThis.localStorage?.removeItem(SESSION_ID_KEY);
    setMessages([]);
    setError(null);
    setStatus("idle");
  }, []);

  const scrollToBottom = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  const handleListScroll = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 48;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom <= threshold;
  }, []);

  const handleWheelCapture = React.useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const el = listRef.current;
      if (!el) return;
      const canScroll = el.scrollHeight > el.clientHeight + 1;
      if (!canScroll) return;
      e.stopPropagation();
    },
    []
  );

  const handleTouchMoveCapture = React.useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const el = listRef.current;
      if (!el) return;
      const canScroll = el.scrollHeight > el.clientHeight + 1;
      if (!canScroll) return;
      e.stopPropagation();
    },
    []
  );

  const submitText = React.useCallback(
    async (rawText: string) => {
      if (status === "sending") return;
      const text = rawText.trim();
      if (!text) return;

      setInputValue("");
      shouldStickToBottomRef.current = true;
      setStatus("sending");
      setError(null);

      try {
        const userMsg: ChatMessage = {
          id: `u-${crypto.randomUUID()}`,
          role: "user",
          content: text,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => {
          const next = [...prev, userMsg];
          saveMessages(next);
          return next;
        });
        scrollToBottom();

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, session_id: getSessionId() }),
        });

        const data = (await res.json().catch(() => null)) as
          | { answer?: string; error?: string }
          | null;

        if (!res.ok) {
          throw new Error(data?.error || "AI request failed");
        }

        const answer = String(data?.answer ?? "").trim();
        const assistantMsg: ChatMessage = {
          id: `a-${crypto.randomUUID()}`,
          role: "assistant",
          content: answer,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          saveMessages(next);
          return next;
        });
        scrollToBottom();
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [status, scrollToBottom]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitText(inputValue);
  }

  function handleKeys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") triggerClose();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtnRef.current?.click();
    }
  }

  return (
    <motion.div
      className="relative z-10 flex h-full min-h-0 flex-col"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Header */}
      <div
        className="relative z-[2] flex items-center justify-between"
        style={{ padding: "20px 20px 16px" }}
      >
        <div className="flex min-w-0 items-center" style={{ gap: 12 }}>
          {/* Avatar — soft glass orb */}
          <div
            aria-hidden
            className="relative grid place-items-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background:
                "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(255,255,255,0.18), transparent 60%), linear-gradient(135deg, rgba(0,240,255,0.50), rgba(167,139,250,0.40))",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.30), 0 4px 12px rgba(0,240,255,0.30)",
            }}
          >
            <span
              aria-hidden
              className="inline-block rounded-full"
              style={{
                width: 16,
                height: 16,
                background:
                  "radial-gradient(ellipse 60% 60% at 50% 30%, rgba(255,255,255,0.50), transparent 70%)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            />
          </div>
          <div className="min-w-0">
            <div
              className="truncate"
              style={{
                fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 15,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "#f5f5f7",
              }}
            >
              Aurexis Architect
            </div>
            <div
              className="inline-flex items-center"
              style={{
                marginTop: 4,
                fontSize: 11.5,
                color: "#94a3b8",
                gap: 6,
              }}
            >
              <span
                className={status === "sending" ? "animate-pulse" : ""}
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: status === "sending" ? "#00F0FF" : "#10B981",
                  boxShadow:
                    status === "sending"
                      ? "0 0 6px #00F0FF"
                      : "0 0 6px #10B981",
                }}
              />
              {status === "sending" ? "Thinking…" : "Online · replies in seconds"}
            </div>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 6 }}>
          <button
            type="button"
            onClick={clearConversation}
            className="grid place-items-center outline-none transition-all"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#94a3b8",
              fontSize: 14,
              fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#f5f5f7";
              e.currentTarget.style.borderColor = "rgba(0,240,255,0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            }}
            aria-label="New chat"
          >
            +
          </button>
          <button
            type="button"
            onClick={triggerClose}
            className="grid place-items-center outline-none transition-all"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#94a3b8",
              fontSize: 14,
              fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#f5f5f7";
              e.currentTarget.style.borderColor = "rgba(0,240,255,0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            }}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={handleListScroll}
        onWheelCapture={handleWheelCapture}
        onTouchMoveCapture={handleTouchMoveCapture}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-4 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent] [-webkit-overflow-scrolling:touch]"
        aria-live="polite"
      >
        {error ? (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.30)",
              borderRadius: 12,
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {/* Soft glass orb — the empty-state centerpiece */}
            <div
              aria-hidden
              style={{
                width: 60,
                height: 60,
                borderRadius: 999,
                background:
                  "radial-gradient(ellipse 50% 50% at 50% 30%, rgba(255,255,255,0.40), transparent 70%), linear-gradient(135deg, rgba(0,240,255,0.45), rgba(167,139,250,0.40))",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow:
                  "0 8px 24px rgba(0,240,255,0.30), inset 0 1px 0 rgba(255,255,255,0.40)",
                margin: "0 auto 22px",
              }}
            />

            <h3
              style={{
                fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 22,
                lineHeight: 1.15,
                letterSpacing: "-0.015em",
                color: "#f5f5f7",
                margin: "0 0 8px",
              }}
            >
              Hi. Ask me<br />anything.
            </h3>

            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                margin: "0 0 22px",
                maxWidth: 240,
                lineHeight: 1.5,
              }}
            >
              Services, process, pricing, or pick a thread to start.
            </p>

            <div
              className="flex flex-col"
              style={{ gap: 8, width: "100%" }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submitText(s)}
                  className="transition-all"
                  style={{
                    padding: "11px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    color: "#cbd5e1",
                    fontSize: 12.5,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(0,240,255,0.40)";
                    e.currentTarget.style.color = "#f5f5f7";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#cbd5e1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 12 }}>
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={isUser ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="flex flex-col" style={{ gap: 4, maxWidth: "80%" }}>
                    <div
                      style={{
                        padding: "10px 14px",
                        fontSize: 13,
                        lineHeight: 1.5,
                        borderRadius: 16,
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        background: isUser
                          ? "rgba(0,240,255,0.12)"
                          : "rgba(255,255,255,0.05)",
                        border: isUser
                          ? "1px solid rgba(0,240,255,0.25)"
                          : "1px solid rgba(255,255,255,0.08)",
                        color: isUser ? "#f5f5f7" : "#cbd5e1",
                        boxShadow: isUser
                          ? "inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 12px rgba(0,240,255,0.10)"
                          : "inset 0 1px 0 rgba(255,255,255,0.08)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {isUser ? m.content : <Linkify text={m.content} />}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                        fontSize: 9.5,
                        letterSpacing: "0.1em",
                        color: "#475569",
                        padding: "0 6px",
                        textAlign: isUser ? "right" : "left",
                      }}
                    >
                      {formatTime(m.created_at)}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {status === "sending" && (
              <div className="flex justify-start">
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 16,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="relative z-[2]"
        style={{ padding: "14px 20px 20px" }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center"
          style={{ gap: 10 }}
        >
          {/* Pill glass field wrapper */}
          <div
            className="relative flex-1 transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 999,
              padding: "11px 16px",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(0,240,255,0.45)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(0,240,255,0.12), 0 0 24px rgba(0,240,255,0.20)";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <label className="sr-only" htmlFor="aurexis-ai-input">
              Message
            </label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              id="aurexis-ai-input"
              ref={ref}
              placeholder="Ask the Architect…"
              name="message"
              rows={1}
              className="w-full resize-none bg-transparent outline-none"
              style={{
                color: "#f5f5f7",
                fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
                fontSize: 13.5,
                lineHeight: 1.4,
                minHeight: 20,
                maxHeight: 80,
              }}
              required
              onKeyDown={handleKeys}
              spellCheck={false}
            />
          </div>

          {/* Gradient cyan send button */}
          <button
            type="submit"
            ref={sendBtnRef}
            disabled={status === "sending"}
            className="grid shrink-0 place-items-center transition-all"
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              background: "linear-gradient(135deg, #00F0FF, #5cf5ff)",
              border: "none",
              color: "#02040A",
              cursor: status === "sending" ? "not-allowed" : "pointer",
              opacity: status === "sending" ? 0.55 : 1,
              boxShadow:
                "0 4px 14px rgba(0,240,255,0.40), inset 0 1px 0 rgba(255,255,255,0.40)",
            }}
            onMouseEnter={(e) => {
              if (status === "sending") return;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(0,240,255,0.55), inset 0 1px 0 rgba(255,255,255,0.40)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(0,240,255,0.40), inset 0 1px 0 rgba(255,255,255,0.40)";
            }}
            aria-label="Send message"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </motion.div>
  );
});
ChatPanel.displayName = "ChatPanel";
