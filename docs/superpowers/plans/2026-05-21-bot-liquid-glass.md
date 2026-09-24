# Bot — Liquid Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the visual surface of the Aurexis Architect chat widget (`MorphPanel` + `ChatPanel` + `DockButton` in `src/components/ui/ai-input.tsx`) to the Liquid Glass aesthetic — deep glassmorphism, cyan ambient glow, drifting orb on the dock, tinted glass message bubbles — while preserving every existing behavior (OpenRouter backend, localStorage persistence, click-outside close, rate limiting, session ID).

**Architecture:** Single-file rewrite of `src/components/ui/ai-input.tsx`. No new dependencies, no new components, no backend changes. Visual changes happen via inline `style={{ ... }}` props and new JSX ornaments (top rim-light span, bottom ambient glow span). The one behavioral addition is clickable suggestion chips in the empty state that submit on click.

**Tech Stack:** React client component · `motion/react` (existing) · `lucide-react` ArrowUp (existing) · Tailwind utilities + inline styles · pure-CSS glass effects (`backdrop-filter`, multi-layer `box-shadow`, gradients).

**Spec:** [docs/superpowers/specs/2026-05-21-bot-liquid-glass-design.md](docs/superpowers/specs/2026-05-21-bot-liquid-glass-design.md)

**Mockup (frozen):** [.superpowers/brainstorm/bot-2026-05-21/content/direction-b-glass.html](.superpowers/brainstorm/bot-2026-05-21/content/direction-b-glass.html) — served at `http://localhost:6035/direction-b-glass.html`.

---

## Project conventions (read once before starting)

- **No automatic commits.** Per `CLAUDE.md`, do not commit unless the user explicitly says so. Each task ends with an *optional* commit step — execute it only if the user has approved committing for this session.
- **No test runner.** Verification per task is `npm run lint` + `npm run build`. Browser visual check happens at the final task.
- **Single file scope.** All work is in `src/components/ui/ai-input.tsx`. Do NOT touch `src/components/ui/ChatbotWidget.tsx`, `src/app/api/ai/route.ts`, `src/app/layout.tsx`, or `src/app/chatbot-ui-kit/page.tsx`.
- **Behavior is sacred.** localStorage helpers (`loadMessages`, `saveMessages`, `getSessionId`), the click-outside `useEffect`, the scroll-to-bottom logic, the rate-limit-respecting fetch to `/api/ai`, the keyboard handler (`Escape` to close, `Enter` to submit) — all stay exactly as they are. Only the visual surface changes, plus one small addition (clickable suggestion chips).
- **Drop `Sparkles, Plus, X` from the `lucide-react` import.** The new design uses CSS-only orbs for the dock + avatar + empty state, and text glyphs (`+` / `×`) for the header action buttons. Keep `ArrowUp` for the send button.

---

## Task 1: Foundation — add `SUGGESTIONS` constant + bump panel size constants

**Files:**
- Modify: `src/components/ui/ai-input.tsx`

- [ ] **Step 1: Read the current file once**

Read `src/components/ui/ai-input.tsx` end-to-end so you know which sections later tasks will edit.

- [ ] **Step 2: Add the `SUGGESTIONS` constant near the existing constants block**

Find the existing constants near the top of the file:

```ts
const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 520;
const DOCK_SIZE = 48;
```

Replace that block with:

```ts
const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 520;
const DOCK_SIZE = 56;

// Empty-state suggestion chips. Clicking one submits it as the user's first message.
const SUGGESTIONS = [
  "What services do you build?",
  "How do you price projects?",
  "Book a 45-min strategy call",
] as const;
```

The `DOCK_SIZE` bump from 48 to 56 is the only existing-constant change in this task.

- [ ] **Step 3: Update the `lucide-react` import**

Find:

```ts
import { ArrowUp, Plus, X, Sparkles } from "lucide-react";
```

Replace with:

```ts
import { ArrowUp } from "lucide-react";
```

The other three icons stop being used in the new design.

- [ ] **Step 4: Verify lint**

Run from `/Users/sanjaygunabalan2626gmail.com/Documents/AurexisOS`:
```bash
npm run lint
```

Expected: lint will report unused-variable errors for `Plus`, `X`, `Sparkles` and possibly `cn` — IGNORE them; those JSX usages will be replaced in later tasks. If lint fails on something else (e.g. typo in the new constants), fix it. The build will still succeed because `Plus`, `X`, `Sparkles` are imported but unused; ESLint may flag this as a warning depending on config.

If lint hard-fails because of unused imports (some configs are strict): proceed anyway and confirm `npm run build` still passes. The error gets resolved in Task 2 when the JSX consumers are rewritten.

- [ ] **Step 5: (Optional) Commit**

```bash
git add src/components/ui/ai-input.tsx
git commit -m "feat(bot): bump DOCK_SIZE to 56, add SUGGESTIONS, drop unused icons"
```

---

## Task 2: Rewrite `DockButton` — drifting orb + soft glass icon

**Files:**
- Modify: `src/components/ui/ai-input.tsx` (the `DockButton` function, currently around lines 143-167)

- [ ] **Step 1: Locate the current `DockButton`**

The current function (after Task 1) is:

```tsx
function DockButton() {
  const { triggerOpen } = useFormContext();
  return (
    <motion.button
      type="button"
      onClick={triggerOpen}
      className="group relative flex h-full w-full items-center justify-center outline-none bg-gradient-to-br from-[#00F0FF]/10 to-[#0047FF]/10 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Open Aurexis AI chat"
    >
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00F0FF]/30 to-[#0047FF]/30 blur-md"
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 rounded-full bg-white/[0.02]" />
      <Sparkles className="size-5 text-[#00F0FF] transition-colors duration-300 group-hover:text-white relative z-10 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
    </motion.button>
  );
}
```

- [ ] **Step 2: Replace it entirely with this Liquid Glass version**

```tsx
function DockButton() {
  const { triggerOpen } = useFormContext();
  return (
    <motion.button
      type="button"
      onClick={triggerOpen}
      className="group relative flex h-full w-full items-center justify-center outline-none overflow-hidden rounded-full"
      style={{
        background:
          "radial-gradient(ellipse 60% 60% at 50% 30%, rgba(255,255,255,0.20), transparent 60%), linear-gradient(135deg, rgba(0,240,255,0.55), rgba(167,139,250,0.45))",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.40), 0 8px 28px rgba(0,240,255,0.40), 0 0 0 1px rgba(0,240,255,0.20)",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Open Aurexis AI chat"
    >
      {/* Drifting orb behind — produces the slow ambient glow */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          inset: -10,
          borderRadius: 999,
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,240,255,0.40), transparent 60%)",
          filter: "blur(16px)",
        }}
        animate={{ x: [0, 8, 0], y: [0, -8, 0], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft glass icon at the center */}
      <span
        aria-hidden
        className="relative z-10 inline-block rounded-full"
        style={{
          width: 22,
          height: 22,
          background:
            "radial-gradient(ellipse 60% 60% at 50% 30%, rgba(255,255,255,0.70), transparent 70%)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
    </motion.button>
  );
}
```

- [ ] **Step 3: Verify lint + build**

```bash
npm run lint && npm run build
```

Expected: clean. The unused-import warning from Task 1 (`Sparkles` reference inside DockButton) is now resolved.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/components/ui/ai-input.tsx
git commit -m "feat(bot): redesign dock button with drifting orb + glass icon"
```

---

## Task 3: Update `MorphPanel` panel styling + add inner ornaments

**Files:**
- Modify: `src/components/ui/ai-input.tsx` (the `MorphPanel` function return JSX, currently around lines 99-140)

- [ ] **Step 1: Locate the current `motion.div` that wraps the dock/panel**

The current JSX inside `MorphPanel` looks like:

```tsx
return (
  <div className="relative">
    <motion.div
      ref={wrapperRef}
      data-panel
      layout
      className={cn(
        "relative flex flex-col overflow-hidden backdrop-blur-xl",
        showForm
          ? "border border-white/[0.08] bg-[#0A0A0A]/95 shadow-[0_32px_80px_rgba(0,0,0,0.8),_0_0_0_1px_rgba(255,255,255,0.04)]"
          : "border border-white/[0.08] bg-[#0A0A0A]/90 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      )}
      initial={false}
      animate={{
        width: showForm ? PANEL_WIDTH : DOCK_SIZE,
        height: showForm ? PANEL_HEIGHT : DOCK_SIZE,
        borderRadius: showForm ? 20 : 999,
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
      }}
    >
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
```

- [ ] **Step 2: Replace it entirely with this glass version**

```tsx
return (
  <div className="relative">
    <motion.div
      ref={wrapperRef}
      data-panel
      layout
      className="relative flex flex-col overflow-hidden"
      initial={false}
      animate={{
        width: showForm ? PANEL_WIDTH : DOCK_SIZE,
        height: showForm ? PANEL_HEIGHT : DOCK_SIZE,
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
```

> **Why this shape:** We move the glass styling from `className` to `style` because the values are too specific for Tailwind utilities (multi-layer shadow, exact gradient). The `cn(...)` helper is no longer needed here — if `cn` is no longer used anywhere in the file after this task, drop its import in a later cleanup. If it stays used (e.g. in `TypingDots`), leave it. The two `<span>` ornaments must be inside the morphing `motion.div` so they participate in the morph (they only render when `showForm` is true, so the dock state remains clean).

- [ ] **Step 3: Verify lint + build**

```bash
npm run lint && npm run build
```

Expected: clean.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/components/ui/ai-input.tsx
git commit -m "feat(bot): glass panel styling + rim-light + ambient glow"
```

---

## Task 4: Rewrite `ChatPanel` header

**Files:**
- Modify: `src/components/ui/ai-input.tsx` (the header section inside `ChatPanel`, currently around lines 343-386)

- [ ] **Step 1: Locate the current header + divider**

The current header is:

```tsx
{/* Header */}
<div className="flex items-center justify-between px-4 pt-4 pb-3">
  <div className="flex min-w-0 items-center gap-3">
    <div className="relative grid size-9 place-items-center rounded-full bg-white/[0.06] border border-white/[0.08]">
      <Sparkles className="size-4 text-white/70" />
    </div>
    <div className="min-w-0">
      <div className="truncate text-[14px] font-semibold tracking-tight text-white">
        Aurexis Architect
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-white/40">
        <span
          className={cn(
            "inline-block size-1.5 rounded-full",
            status === "sending"
              ? "bg-white/60 animate-pulse"
              : "bg-emerald-500"
          )}
        />
        {status === "sending" ? "Thinking..." : "Online"}
      </div>
    </div>
  </div>

  <div className="flex items-center gap-1.5">
    <button
      type="button"
      onClick={clearConversation}
      className="grid size-8 place-items-center rounded-full text-white/40 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/70 outline-none"
      aria-label="New chat"
    >
      <Plus className="size-4" aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={triggerClose}
      className="grid size-8 place-items-center rounded-full text-white/40 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/70 outline-none"
      aria-label="Close chat"
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  </div>
</div>

<div className="mx-4 h-px bg-white/[0.06]" />
```

- [ ] **Step 2: Replace BOTH the header `<div>` AND the divider `<div>` below it with this glass version**

```tsx
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

{/* The mx-4 divider is intentionally REMOVED — glass surface itself separates */}
```

> **Why the inline `onMouseEnter`/`onMouseLeave` instead of Tailwind `hover:` classes:** the background/border/color values are specific enough that defining them as Tailwind arbitrary values would clutter the JSX more than these handlers. If you prefer a `<style jsx>` block or a globals.css class, that's also acceptable — but this approach keeps the change self-contained to the file.

- [ ] **Step 3: Verify lint + build**

```bash
npm run lint && npm run build
```

Expected: clean. The `Sparkles, Plus, X` imports are no longer referenced here; if Task 1 didn't remove them yet, do so now.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/components/ui/ai-input.tsx
git commit -m "feat(bot): glass header with orb avatar + text-glyph action buttons"
```

---

## Task 5: Rewrite empty state with clickable suggestion chips

**Files:**
- Modify: `src/components/ui/ai-input.tsx` (the empty-state branch inside `ChatPanel`'s messages area, currently around lines 401-409, AND add a `submitText` helper near the existing `handleSubmit`)

- [ ] **Step 1: Refactor `handleSubmit` to extract a `submitText(text)` helper**

The current `handleSubmit` (around lines 266-324) reads `inputValue` from state. To let chips submit programmatically, extract the submission logic into a function that takes a `text` parameter.

Find:

```tsx
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (status === "sending") return;

  const text = inputValue.trim();
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
    // ... rest of try block as-is ...
```

Replace the entire `handleSubmit` function with these two functions:

```tsx
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
  [status, scrollToBottom],
);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  await submitText(inputValue);
}
```

> Behavior is identical for form submission. `submitText` is now reusable by the chip click handler.

- [ ] **Step 2: Locate the current empty-state branch**

The current branch (inside the messages area `<div>`, after the error block):

```tsx
) : messages.length === 0 ? (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="grid size-12 place-items-center rounded-full bg-white/[0.04] border border-white/[0.06] mb-4">
      <Sparkles className="size-5 text-white/30" />
    </div>
    <p className="text-[13px] text-white/30 max-w-[220px] leading-relaxed">
      Ask anything about Aurexis services, process, or pricing.
    </p>
  </div>
) : (
```

- [ ] **Step 3: Replace it with this glass version**

```tsx
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
```

- [ ] **Step 4: Verify lint + build**

```bash
npm run lint && npm run build
```

Expected: clean.

- [ ] **Step 5: (Optional) Commit**

```bash
git add src/components/ui/ai-input.tsx
git commit -m "feat(bot): glass empty state with orb + clickable suggestion chips"
```

---

## Task 6: Rewrite messages list + typing indicator + error block

**Files:**
- Modify: `src/components/ui/ai-input.tsx` (the messages list and typing indicator inside `ChatPanel`'s body, currently around lines 397-454)

- [ ] **Step 1: Locate the error block + messages list + typing indicator**

The current code (inside the messages `<div>`) is:

```tsx
{error ? (
  <div className="rounded-xl border border-red-500/10 bg-red-500/5 px-3.5 py-2.5 text-[13px] text-red-300/80">
    {error}
  </div>
) : messages.length === 0 ? (
  // ... empty state (already rewritten in Task 5)
) : (
  <div className="flex flex-col gap-3">
    {messages.map((m) => {
      const isUser = m.role === "user";
      return (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn("flex", isUser ? "justify-end" : "justify-start")}
        >
          <div className={cn("max-w-[85%]")}>
            <div
              className={cn(
                "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                isUser
                  ? "bg-white text-black"
                  : "bg-white/[0.05] border border-white/[0.06] text-white/80"
              )}
            >
              {m.content}
            </div>
            <div
              className={cn(
                "mt-1 text-[10px] text-white/25",
                isUser ? "text-right pr-1" : "text-left pl-1"
              )}
            >
              {formatTime(m.created_at)}
            </div>
          </div>
        </motion.div>
      );
    })}

    {status === "sending" && (
      <div className="flex justify-start">
        <div className="rounded-2xl bg-white/[0.05] border border-white/[0.06] px-3.5 py-2.5">
          <TypingDots />
        </div>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 2: Replace the error block, messages-list branch, and typing indicator with this glass version**

Replace just the `{error ? (...) :` block opening and the `: (` populated branch — keep the empty-state branch from Task 5 untouched.

```tsx
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
  // ... empty state from Task 5 stays here ...
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
              {m.content}
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
```

> The `whiteSpace: "pre-wrap", wordBreak: "break-word"` on the bubble preserves line breaks from the assistant's response and prevents long URLs from overflowing the bubble.

- [ ] **Step 3: Verify lint + build**

```bash
npm run lint && npm run build
```

Expected: clean.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/components/ui/ai-input.tsx
git commit -m "feat(bot): glass message bubbles + typing/error states"
```

---

## Task 7: Rewrite input field + send button

**Files:**
- Modify: `src/components/ui/ai-input.tsx` (the input form at the bottom of `ChatPanel`, currently around lines 458-489)

- [ ] **Step 1: Locate the current input form**

The current form is:

```tsx
{/* Input */}
<div className="px-4 pb-4 pt-2">
  <form
    onSubmit={handleSubmit}
    className="group/form relative flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 transition-all focus-within:border-white/[0.15] focus-within:bg-white/[0.05]"
  >
    <label className="sr-only" htmlFor="aurexis-ai-input">
      Message
    </label>
    <textarea
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      id="aurexis-ai-input"
      ref={ref}
      placeholder="Ask me anything..."
      name="message"
      rows={1}
      className="min-h-[36px] max-h-[80px] flex-1 resize-none rounded-lg bg-transparent px-2.5 py-2 text-[13px] text-white placeholder:text-white/30 outline-none"
      required
      onKeyDown={handleKeys}
      spellCheck={false}
    />

    <button
      type="submit"
      ref={sendBtnRef}
      disabled={status === "sending"}
      className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-black transition-all hover:bg-white/90 active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:active:scale-100"
      aria-label="Send message"
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </button>
  </form>
</div>
```

- [ ] **Step 2: Replace it with this glass version**

```tsx
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
```

> Note the placeholder copy changes from "Ask me anything..." to "Ask the Architect…" — matches the mockup.

- [ ] **Step 3: Verify lint + build**

```bash
npm run lint && npm run build
```

Expected: clean.

- [ ] **Step 4: Cleanup pass — remove `cn` import if unused**

Run:

```bash
grep -c "cn(" src/components/ui/ai-input.tsx
```

If the count is `0`, the `cn` helper is no longer used in the file. Remove the import line:

```ts
import { cn } from "@/lib/utils";
```

If the count is `>0`, leave the import.

Re-run `npm run lint` after this cleanup.

- [ ] **Step 5: (Optional) Commit**

```bash
git add src/components/ui/ai-input.tsx
git commit -m "feat(bot): glass pill input + gradient cyan send button"
```

---

## Task 8: Final verification

**Files:** none — pure verification.

- [ ] **Step 1: Cold lint + build**

```bash
rm -rf .next
npm run lint
npm run build
```

Expected: both clean. The build summary should show `src/components/ui/ai-input.tsx` compiling without warnings.

- [ ] **Step 2: Start the dev server (if not running) and visit the site**

```bash
npm run dev
```

Open `http://localhost:3001/` in your browser (any public page that isn't `/login` or `/portal/*`).

Visual checks against the mockup at `http://localhost:6035/direction-b-glass.html`:

| Element | Expected |
|---|---|
| **Dock (closed)** | 56×56 cyan-violet gradient bubble with a soft drifting orb halo behind it. Hovers scale to ~1.06. |
| **Open animation** | Existing spring morph from dock to panel — unchanged. |
| **Panel surface** | Glass (`rgba(255,255,255,0.06)` base, 40px blur), thin top cyan rim-light hairline, soft bottom cyan ambient glow. |
| **Header** | 40×40 cyan-violet orb avatar (no sparkle), "Aurexis Architect" (sans 15px weight 500), status row with emerald dot + "Online · replies in seconds". Two 32×32 glass action buttons with text glyphs (`+` and `×`). No divider line below header. |
| **Empty state** (fresh incognito) | 60×60 orb + "Hi. Ask me / anything." + 3 glass chip buttons. Clicking a chip submits it as the user's first message and starts a real conversation. |
| **User bubble** | Cyan-tinted glass, right-aligned, 80% max-width, mono timestamp below in right-align. |
| **Assistant bubble** | Neutral glass, left-aligned, same shape, mono timestamp left-align. |
| **Typing indicator** | 3 bouncing dots inside an assistant-style glass bubble. |
| **Input** | Pill-shaped glass field; focus state glows cyan. 38×38 gradient cyan send button; hover lifts and glow intensifies. |

- [ ] **Step 3: Behavior regression check**

These must continue to work exactly as before:

- Type a message + press Enter → message appears + assistant responds.
- Type + click send button → same flow.
- Press Escape while focused → panel closes.
- Click outside the panel → panel closes.
- Click the `+` button → conversation clears, session ID resets, empty state returns.
- Click the `×` button → panel collapses to dock.
- Refresh the page → messages persist (localStorage).
- Visit `/login` → widget is NOT visible.
- Visit `/portal/...` (any portal route) → widget is NOT visible.

- [ ] **Step 4: Reduced-motion check**

DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload. Expected:
- Dock orb stops drifting (Framer Motion respects the preference).
- Panel morph still works (status-indicator behavior preferred over no animation here).
- Status dot pulse stops when sending.
- Typing dots still animate (status indicator — kept intentionally).

- [ ] **Step 5: Mobile (390px)**

DevTools → device emulation → iPhone 14 (390×844). Open `/`. Click the dock.
- Panel scales down to fit (uses `maxWidth: 92vw, maxHeight: 78vh`).
- All elements remain legible.
- Touch scrolling inside messages still works.

- [ ] **Step 6: Report results**

Summarize: lint ✅, build ✅, visual match vs mockup ✅, all behaviors preserved ✅, reduced-motion ✅, mobile ✅.

- [ ] **Step 7: (Optional) Final commit**

If commits weren't done per-task and the user approves a final commit:

```bash
git add src/components/ui/ai-input.tsx
git commit -m "feat(bot): Liquid Glass redesign of Aurexis Architect widget"
```

---

## Out-of-scope reminders (for future sessions)

- Behavioral additions beyond clickable suggestion chips (slash commands, action buttons, attachments, markdown rendering) are NOT in scope.
- Surfacing pattern changes (sticky CTA, slide-in drawer, fullscreen mode) are NOT in scope.
- Brand voice / system prompt changes in `/api/ai/route.ts` are NOT in scope.
- Notification badge for unread messages while closed is NOT in scope.
- Multi-conversation history / sidebar is NOT in scope.
