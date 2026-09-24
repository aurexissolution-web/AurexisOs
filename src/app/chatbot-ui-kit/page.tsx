"use client";

import { MorphPanel } from "@/components/ui/ai-input";

const tokens = {
  colors: {
    background: "#030408",
    surface: "#0A0B10",
    border: "rgba(255,255,255,0.10)",
    text: "#F1F5F9",
    textMuted: "rgba(255,255,255,0.55)",
    accent: "#00F0FF",
    accent2: "#0047FF",
    accent3: "#8B5CF6",
  },
  typography: {
    font: "Plus Jakarta Sans (app default)",
    title: "14px / 600 / tracking-tight",
    body: "14px / 400 / leading-relaxed",
    meta: "10–11px / 500 / tracking-wide",
  },
  spacing: {
    panelPadding: 16,
    bubblePadding: "12px 16px",
    gap: 12,
    radiusPanel: 22,
    radiusBubble: 16,
    radiusInput: 16,
  },
  behaviors: {
    open: "Spring expand from dock to panel",
    close: "Close button, Escape, or click outside",
    send: "⌘+Enter or Send button",
    typing: "Animated dots while waiting",
    scroll: "Auto-scroll to latest message",
  },
};

function TokenBlock({ value }: { value: unknown }) {
  return (
    <pre className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/80">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function ChatbotUIKitPage() {
  return (
    <div className="min-h-svh w-full bg-[#02040A] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                UI Kit
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                Aurexis AI Chatbot
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/60">
                Premium chat UI system: refined spacing, accessible contrast,
                and motion that feels effortless.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">Colors</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(tokens.colors).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0A0B10] px-3 py-2 text-xs text-white/70"
                    >
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ background: v }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-white/80">{k}</span>
                      <span className="opacity-70">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">Typography</div>
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  <div className="flex justify-between gap-4">
                    <span className="text-white/50">Font</span>
                    <span className="text-white/80">{tokens.typography.font}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-white/50">Title</span>
                    <span className="text-white/80">{tokens.typography.title}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-white/50">Body</span>
                    <span className="text-white/80">{tokens.typography.body}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-white/50">Meta</span>
                    <span className="text-white/80">{tokens.typography.meta}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">Spacing & Radius</div>
                <div className="mt-4">
                  <TokenBlock value={tokens.spacing} />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold">Behaviors</div>
                <div className="mt-4">
                  <TokenBlock value={tokens.behaviors} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Interactive Prototype</div>
            <p className="mt-2 text-sm text-white/60">
              Live component with real motion, input states, and accessibility
              behavior.
            </p>
            <div className="mt-6 flex justify-center">
              <MorphPanel initialOpen />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

