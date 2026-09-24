"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Download,
  Layers,
  Paperclip,
  SendHorizontal,
} from "lucide-react";
import { Linkify } from "./linkify";

// Must stay identical to the floating widget's key in ai-input.tsx: /api/ai loads
// prior turns from Supabase chat_logs by session_id, so a mismatch would silently
// start a separate conversation instead of continuing the visitor's existing one.
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

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export interface HeroChatSolution {
  name: string;
  priceLabel: string;
}

// TEMPORARY: no real services PDF exists in the repo yet. This placeholder
// file (public/aurexis-services-placeholder.pdf) exists only to verify the
// download button works end-to-end. Swap this constant for the real asset
// path before shipping — do not present the placeholder's content as real.
const SERVICES_PDF_HREF = "/aurexis-services-placeholder.pdf";

/**
 * Purely a visual selector — like the model picker it replaces, choosing an
 * option here only updates this button's label. It does not change the
 * message sent to /api/ai; wiring that up is a separate, explicit decision.
 */
function SolutionPicker({ solutions }: { solutions: HeroChatSolution[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<HeroChatSolution | null>(null);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-[#8a8a8f] transition-all duration-200 hover:bg-white/5 hover:text-white active:scale-95"
      >
        <Layers className="size-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">{selected ? selected.name : "All solutions"}</span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-2 min-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1e]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f]">
                Select Solution
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-all duration-150 ${
                  selected === null ? "bg-white/10 text-white" : "text-[#a0a0a5] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex-1 text-sm font-medium">All solutions</span>
                {selected === null && <Check className="size-4 shrink-0 text-[#5EE3DA]" />}
              </button>
              {solutions.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    setSelected(s);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-all duration-150 ${
                    selected?.name === s.name ? "bg-white/10 text-white" : "text-[#a0a0a5] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="block text-[11px] text-[#6a6a6f]">{s.priceLabel}</span>
                  </div>
                  {selected?.name === s.name && <Check className="size-4 shrink-0 text-[#5EE3DA]" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AttachButton() {
  return (
    <button
      type="button"
      disabled
      title="Attach files — coming soon"
      aria-label="Attach files (coming soon)"
      className="flex size-8 items-center justify-center rounded-full text-[#5a5a5f] transition-colors disabled:cursor-not-allowed"
    >
      <Paperclip className="size-4" strokeWidth={1.5} />
    </button>
  );
}

function DownloadPdfButton() {
  return (
    <a
      href={SERVICES_PDF_HREF}
      download
      title="Download services PDF"
      aria-label="Download services PDF"
      className="flex size-8 items-center justify-center rounded-full text-[#8a8a8f] transition-colors hover:bg-white/5 hover:text-white"
    >
      <Download className="size-4" strokeWidth={1.5} />
    </a>
  );
}

interface ChatInputHandle {
  fillAndSend: (text: string) => void;
}

const ChatInput = React.forwardRef<
  ChatInputHandle,
  {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    solutions: HeroChatSolution[];
  }
>(function ChatInput({ onSend, disabled, placeholder = "What do you need fixed?", solutions }, ref) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const submit = (text: string) => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setMessage("");
  };

  React.useImperativeHandle(ref, () => ({
    // Suggested prompts drive the textarea externally: fill it, then send
    // through the exact same submit path a manual "Ask" click would take.
    fillAndSend: (text: string) => {
      setMessage(text);
      submit(text);
    },
  }));

  const handleSubmit = () => submit(message);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Ask the Aurexis Architect"
        className="max-h-[200px] min-h-[80px] w-full resize-none bg-transparent px-5 pb-3 pt-5 text-[15px] text-white placeholder-[#5a5a5f] focus:outline-none"
        style={{ height: "80px" }}
      />
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <div className="flex items-center gap-1">
          <SolutionPicker solutions={solutions} />
          <AttachButton />
        </div>
        <div className="flex items-center gap-2">
          <DownloadPdfButton />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className="flex items-center gap-2 rounded-full bg-[#5EE3DA] px-4 py-2 text-sm font-semibold text-black shadow-[0_0_20px_rgba(94,227,218,0.3)] transition-all duration-200 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Ask</span>
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
});

const SUGGESTED_PROMPTS = [
  "How much does this cost?",
  "Which one do I actually need?",
  "How long does a build take?",
] as const;

function SuggestedPrompts({
  onSelect,
  disabled,
}: {
  onSelect: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          disabled={disabled}
          className="rounded-full border border-[#5EE3DA]/35 bg-[#5EE3DA]/[0.04] px-6 py-2.5 text-[12.5px] font-medium text-white transition-all hover:-translate-y-0.5 hover:border-[#5EE3DA]/60 hover:bg-[#5EE3DA]/[0.08] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

function RayBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full select-none overflow-hidden">
      <div className="absolute inset-0 bg-[#0f0f0f]" />
      <div
        className="absolute left-1/2 h-[1800px] w-[4000px] -translate-x-1/2 sm:w-[6000px]"
        style={{
          background:
            "radial-gradient(circle at center 800px, rgba(94, 227, 218, 0.8) 0%, rgba(94, 227, 218, 0.35) 14%, rgba(94, 227, 218, 0.18) 18%, rgba(94, 227, 218, 0.08) 22%, rgba(17, 17, 20, 0.2) 25%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[175px] h-[1600px] w-[1600px] sm:top-1/2 sm:h-[2865px] sm:w-[3043px]"
        style={{ transform: "translate(-50%) rotate(180deg)" }}
      >
        <div
          className="absolute -mt-[13px] h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(43.89% 25.74% at 50.02% 97.24%, #111114 0%, #0f0f0f 100%)",
            border: "16px solid white",
            transform: "rotate(180deg)",
            zIndex: 5,
          }}
        />
        <div
          className="absolute -mt-[11px] h-full w-full rounded-full bg-[#0f0f0f]"
          style={{ border: "23px solid #BCEFEA", transform: "rotate(180deg)", zIndex: 4 }}
        />
        <div
          className="absolute -mt-[8px] h-full w-full rounded-full bg-[#0f0f0f]"
          style={{ border: "23px solid #96E4DC", transform: "rotate(180deg)", zIndex: 3 }}
        />
        <div
          className="absolute -mt-[4px] h-full w-full rounded-full bg-[#0f0f0f]"
          style={{ border: "23px solid #74DCD2", transform: "rotate(180deg)", zIndex: 2 }}
        />
        <div
          className="absolute h-full w-full rounded-full bg-[#0f0f0f]"
          style={{
            border: "20px solid #5EE3DA",
            boxShadow: "0 -15px 24.8px rgba(94, 227, 218, 0.6)",
            transform: "rotate(180deg)",
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
}

export interface HeroChatProps {
  title: string;
  accent: string;
  subtitle: string;
  placeholder?: string;
  badge?: React.ReactNode;
  trustLine?: string;
  explainer?: string;
  solutions?: HeroChatSolution[];
}

export function HeroChat({
  title,
  accent,
  subtitle,
  placeholder = "What do you need fixed?",
  badge,
  trustLine,
  explainer,
  solutions = [],
}: HeroChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const hasConversation = messages.length > 0 || status === "sending" || Boolean(error);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, status]);

  async function handleSend(text: string) {
    setStatus("sending");
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: `u-${crypto.randomUUID()}`, role: "user", content: text },
    ]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: getSessionId() }),
      });
      const data = (await res.json().catch(() => null)) as
        | { answer?: string; error?: string }
        | null;

      if (!res.ok) throw new Error(data?.error || "AI request failed");

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${crypto.randomUUID()}`,
          role: "assistant",
          content: String(data?.answer ?? "").trim(),
        },
      ]);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-[#0f0f0f] px-4 py-24">
      <RayBackground />

      <div className="relative z-10 flex w-full flex-col items-center">
        {badge}
        {trustLine && (
          <p className="-mt-4 mb-6 text-[13px] font-medium text-white/60">
            {trustLine}
          </p>
        )}

        <div className="mb-6 text-center">
          <h1 className="mb-1 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {title}{" "}
            <span className="bg-gradient-to-b from-[#5EE3DA] via-[#5EE3DA] to-white bg-clip-text italic text-transparent">
              {accent}
            </span>
          </h1>
          <p className="text-base font-semibold text-[#8a8a8f] sm:text-lg">
            {subtitle}
          </p>
        </div>

        <div className="mb-6 mt-2 w-full max-w-[700px]">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent" />
            <div className="relative flex flex-col overflow-hidden rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)]">
              {hasConversation && (
                <div
                  ref={threadRef}
                  aria-live="polite"
                  className="max-h-[360px] space-y-3 overflow-y-auto border-b border-white/[0.08] px-4 py-4 text-left"
                >
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[85%] rounded-2xl bg-white/[0.07] px-4 py-2.5 text-[14px] text-white/90"
                          : "max-w-[95%] rounded-2xl border border-[#5EE3DA]/20 bg-[#5EE3DA]/[0.05] px-4 py-3 text-[14px] leading-[1.6] text-white/80"
                      }
                    >
                      {m.role === "assistant" ? <Linkify text={m.content} /> : m.content}
                    </div>
                  ))}

                  {status === "sending" && (
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#5EE3DA]/70">
                      Thinking…
                    </p>
                  )}

                  {error && <p className="text-[13px] text-[#fca5a5]">{error}</p>}
                </div>
              )}

              <ChatInput
                ref={chatInputRef}
                onSend={handleSend}
                disabled={status === "sending"}
                placeholder={placeholder}
                solutions={solutions}
              />
            </div>
          </div>
        </div>

        {!hasConversation && (
          <>
            <div className="mb-4 w-full">
              <SuggestedPrompts
                onSelect={(text) => chatInputRef.current?.fillAndSend(text)}
              />
            </div>

            {explainer && (
              <p className="mb-6 max-w-[500px] text-center text-[14px] text-white/50 sm:mb-8">
                {explainer}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
