# Aurexis Architect Bot — Liquid Glass Redesign — Design Spec

**Status:** Direction & mockup approved by user — 2026-05-21
**Mockup (frozen reference):** [.superpowers/brainstorm/bot-2026-05-21/content/direction-b-glass.html](.superpowers/brainstorm/bot-2026-05-21/content/direction-b-glass.html)
**Replaces:** the visual surface of [src/components/ui/ai-input.tsx](src/components/ui/ai-input.tsx) (`MorphPanel` + `ChatPanel` + `DockButton` + `TypingDots`)
**Does NOT replace:** [src/components/ui/ChatbotWidget.tsx](src/components/ui/ChatbotWidget.tsx) wrapper, [src/app/api/ai/route.ts](src/app/api/ai/route.ts), localStorage persistence, click-outside close, rate limiting, session ID logic. Behavior is fully preserved.

---

## Context

The Aurexis Architect chat widget is the OpenRouter-backed AI assistant that floats `fixed bottom-6 right-6` on every public page (hidden on `/login` and `/portal/*`). It's a 48px circular dock button that morphs into a 380×520 chat panel via a Framer Motion layout animation.

The current visual register is competent but generic — dark `#0A0A0A/95` panel with `border-white/[0.08]`, sparkles avatar, white-inverted user bubbles, cyan→blue gradient dock with a pulsing radial halo. It doesn't feel particularly Aurexis. After brainstorming three aesthetic directions (Editorial Notebook, Liquid Glass, Architect Console), the user picked **B — Liquid Glass**: deep glassmorphism with cyan ambient glow, layered depth, drifting orb on the dock, and tinted glass message bubbles for both roles. Most "premium-modern" of the three; reads as Apple-Vision-Pro-adjacent without abandoning the existing brand palette.

This is a **visual-only** redesign. Behavior, backend, persistence, and the wrapper component all stay exactly as they are.

---

## Architecture

```
src/components/ui/ai-input.tsx          ← MODIFY: full visual rewrite of MorphPanel + ChatPanel + DockButton + TypingDots
src/components/ui/ChatbotWidget.tsx     ← UNCHANGED (still hides on /login + /portal/*)
src/app/api/ai/route.ts                 ← UNCHANGED (OpenRouter, rate limit, system prompt)
src/app/chatbot-ui-kit/page.tsx         ← UNCHANGED (showcase page; auto-picks up the new visuals)
```

### Why this shape

- The component is already self-contained — there is no real architecture decision to make beyond "rewrite the visual surface of one file."
- We keep Framer Motion (`motion/react`) for the morph animation, message stagger entry, and dock hover/tap — those are existing and well-suited.
- We add no new dependencies. All glass effects are pure CSS (`backdrop-filter`, multi-layer `box-shadow`, gradient `background`).
- The 496-line file is appropriate — splitting it would add files without making any single concern easier to understand. Keep it as one file.

### Data flow

Unchanged. `MorphPanel` still:
- Reads/writes messages from `localStorage` via `loadMessages()` / `saveMessages()`
- Maintains a session ID in `localStorage` via `getSessionId()`
- POSTs to `/api/ai` with `{ message, session_id, history }` (whatever the existing payload shape is)
- Click-outside via `mousedown` listener on `document`

---

## Visual specification

### Tokens

Add these as local constants at the top of the rewritten file (or use existing `var(--*)` tokens from `globals.css` where they exist). The mockup uses these values; production must match.

```ts
const TOKENS = {
  panelBg:        'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04))',
  panelBorder:    '1px solid rgba(255,255,255,0.10)',
  panelRadius:    22,                          // up from current 20
  panelBlur:      'blur(40px) saturate(180%)',
  panelShadow: [
    'inset 0 1px 0 rgba(255,255,255,0.18)',    // top rim-light
    'inset 0 0 0 1px rgba(0,240,255,0.06)',   // cyan tint
    '0 28px 80px rgba(0,0,0,0.5)',             // deep drop
    '0 0 60px rgba(0,240,255,0.10)',           // cyan halo
  ].join(', '),
  panelAmbient:   'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,240,255,0.08), transparent 60%)',
  panelRimTop:    'linear-gradient(to right, transparent, rgba(0,240,255,0.55), transparent)',

  dockSize:       56,                          // up from current 48
  dockRadius:     999,
  dockBg:         'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(255,255,255,0.2), transparent 60%), linear-gradient(135deg, rgba(0,240,255,0.55), rgba(167,139,250,0.45))',
  dockBorder:     '1px solid rgba(255,255,255,0.18)',
  dockShadow: [
    'inset 0 1px 0 rgba(255,255,255,0.4)',
    '0 8px 28px rgba(0,240,255,0.4)',
    '0 0 0 1px rgba(0,240,255,0.2)',
  ].join(', '),
  dockOrbBlur:    16,                          // drifting orb behind the dock

  userBubbleBg:     'rgba(0,240,255,0.12)',
  userBubbleBorder: '1px solid rgba(0,240,255,0.25)',
  userBubbleShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,240,255,0.1)',

  assistantBubbleBg:     'rgba(255,255,255,0.05)',
  assistantBubbleBorder: '1px solid rgba(255,255,255,0.08)',
  assistantBubbleShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',

  bubbleRadius:   16,
  bubbleBlur:     'blur(12px)',

  inputBg:         'rgba(255,255,255,0.04)',
  inputBorder:     '1px solid rgba(255,255,255,0.10)',
  inputBlur:       'blur(12px)',
  inputRadius:     999,
  inputFocusGlow:  '0 0 0 3px rgba(0,240,255,0.12), 0 0 24px rgba(0,240,255,0.2)',
  inputFocusBorder:'rgba(0,240,255,0.45)',

  sendBg:         'linear-gradient(135deg, #00F0FF, #5cf5ff)',
  sendShadow:     '0 4px 14px rgba(0,240,255,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
  sendShadowHover:'0 6px 20px rgba(0,240,255,0.55)',

  cyan:    '#00F0FF',
  violet:  '#A78BFA',
  emerald: '#10B981',
  ink:     '#f5f5f7',
  ink2:    '#cbd5e1',
  ink3:    '#94a3b8',
  ink5:    '#475569',
};
```

These should be inlined into the JSX `style={{ ... }}` props (matching the codebase's prevailing pattern from `/portfolio` and `/contact`) rather than abstracted into a token module — the bot is one self-contained file and the values are referenced once each.

### Components

#### `MorphPanel` (outer container)

Keep the existing structure (Framer Motion `motion.div` with `layout`, spring animation between `DOCK_SIZE` and `PANEL_*`, `AnimatePresence` swap between `DockButton` and `ChatPanel`). Update visual props only:

- `width / height`: `DOCK_SIZE = 56` (up from 48); `PANEL_WIDTH = 380`, `PANEL_HEIGHT = 520` (unchanged).
- `borderRadius` animate-target: `showForm ? 22 : 999` (up from `20 : 999`).
- `className`/`style` on the panel state: apply `TOKENS.panelBg`, `TOKENS.panelBorder`, `TOKENS.panelBlur`, `TOKENS.panelShadow`. Drop the existing `bg-[#0A0A0A]/95` and the dual-shadow classes.
- `maxWidth: 92vw`, `maxHeight: 78vh` — unchanged.

Add inside the panel (only when `showForm`):
- A `::before`-equivalent absolutely-positioned `<span>` for the top rim-light (`TOKENS.panelRimTop` as background, height 1px, `left: 12%; right: 12%`).
- A `::after`-equivalent absolutely-positioned `<span>` for the bottom ambient cyan glow (`TOKENS.panelAmbient` as background, full inset, pointer-events none).

These two `<span>` elements live in JSX (not CSS pseudo-elements) because they need to participate in React render and don't belong in globals.css.

#### `DockButton`

The closed-state 56×56 circular button. Major changes:

- Replace the existing pulsing radial halo `motion.div` with a **drifting orb wrapper** (`80×80` `position: relative` container around the dock):
  - The wrapper has a `::before`-equivalent radial-gradient blob behind the dock, blurred 16px, animating `translate(0,0) → translate(8px,-8px)` and `opacity 0.8 → 1` over 6s ease-in-out alternate (CSS animation or Framer Motion).
- The dock itself:
  - Replace `bg-gradient-to-br from-[#00F0FF]/10 to-[#0047FF]/10` with `TOKENS.dockBg`.
  - Apply `TOKENS.dockBorder` and `TOKENS.dockShadow`.
  - Inner icon: drop the Lucide `Sparkles` and replace with a **soft glass orb** — a `22×22` `rounded-full` `<div>` with `background: radial-gradient(ellipse 60% 60% at 50% 30%, rgba(255,255,255,0.7), transparent 70%)` and `backdrop-filter: blur(6px)`.
- `whileHover: { scale: 1.06 }` (down from 1.1 — more restrained).
- `whileTap: { scale: 0.95 }` (unchanged).
- `aria-label`: unchanged ("Open Aurexis AI chat").

The dock wrapper takes the `fixed bottom-6 right-6 z-50` positioning from `ChatbotWidget.tsx` — no changes there.

#### `ChatPanel` (inside the morphed panel)

##### Header (top section)

- Padding: `20px 20px 16px` (slightly looser than current `px-4 pt-4 pb-3`).
- Left side: avatar + name + status, gap 12px.
- **Avatar** (40×40 instead of current 36):
  - `border-radius: 999`
  - Background:
    ```ts
    background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(255,255,255,0.18), transparent 60%), linear-gradient(135deg, rgba(0,240,255,0.5), rgba(167,139,250,0.4))'
    ```
  - Border: `1px solid rgba(255,255,255,0.15)`
  - Shadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(0,240,255,0.3)`
  - Inner: a `16×16` rounded-full with `background: radial-gradient(ellipse 60% 60% at 50% 30%, rgba(255,255,255,0.5), transparent 70%); backdrop-filter: blur(4px);` — gives the avatar a "glassy gem" feel.
  - Drop the `Sparkles` icon entirely.
- **Name**: "Aurexis Architect" — `fontFamily: var(--font-plus-jakarta)`, `fontWeight: 500` (down from 600), `fontSize: 15`, `lineHeight: 1.1`, `letterSpacing: -0.01em`, `color: #f5f5f7`.
- **Status row** (replaces existing "Online" / "Thinking..." line):
  - 11.5px sans, `color: #94a3b8`, gap 6, with an inline `::before`-equivalent dot.
  - When `status === 'idle'`: dot is emerald `#10B981` with `boxShadow: 0 0 6px #10B981`; text reads "Online · replies in seconds".
  - When `status === 'sending'`: dot is cyan `#00F0FF` pulsing (existing animation); text reads "Thinking…".
  - Implement the variant via a state-conditional `style` on the dot span.
- **Action buttons** (right side, gap 6):
  - Two 32×32 (down from 36) `rounded-full` buttons: `+` (new chat) and `×` (close).
  - Background: `rgba(255,255,255,0.04)`, border: `1px solid rgba(255,255,255,0.06)`, color: `#94a3b8`.
  - Hover: `background: rgba(255,255,255,0.08)`, `color: #f5f5f7`, `border-color: rgba(0,240,255,0.3)`.
  - Glyph: a `+` character and a `×` character (use simple text, not Lucide icons — keeps it lighter and aligns with the glass aesthetic).
  - `aria-label`: "New chat" and "Close chat" respectively (unchanged from current).

**Drop** the `mx-4 h-px bg-white/[0.06]` divider line below the header — the glass surface itself provides enough separation.

##### Body (messages area)

- Padding: `8px 20px 20px` (slightly less top padding than header bottom).
- Scroll behavior: unchanged (`overflow-y: auto`, `overscroll-contain`, sticky-to-bottom logic, `handleWheelCapture`, `handleTouchMoveCapture` — keep all of it).
- Scrollbar: keep the existing `scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent` styling.

###### Empty state (when `messages.length === 0`)

Centered vertically (`flex-direction: column; align-items: center; justify-content: center; text-align: center`).

- **Orb** (60×60, the visual centerpiece):
  ```ts
  background: 'radial-gradient(ellipse 50% 50% at 50% 30%, rgba(255,255,255,0.4), transparent 70%), linear-gradient(135deg, rgba(0,240,255,0.45), rgba(167,139,250,0.4))'
  border: '1px solid rgba(255,255,255,0.15)'
  borderRadius: 999
  boxShadow: '0 8px 24px rgba(0,240,255,0.3), inset 0 1px 0 rgba(255,255,255,0.4)'
  margin: '0 auto 22px'
  ```
- **Heading**: "Hi. Ask me / anything." (two lines via `<br/>`). 22px sans, weight 500, line-height 1.15, `color: #f5f5f7`, margin-bottom 8.
- **Description**: "Services, process, pricing, or pick a thread to start." — 13px, `color: #94a3b8`, max-width 240, margin-bottom 22.
- **Suggestion chips** (3 buttons stacked, gap 8, full width):
  ```ts
  padding: '11px 14px'
  background: 'rgba(255,255,255,0.03)'
  border: '1px solid rgba(255,255,255,0.08)'
  borderRadius: 14
  backdropFilter: 'blur(8px)'
  color: '#cbd5e1'
  fontSize: 12.5
  textAlign: 'left'
  ```
  Hover: `background: rgba(255,255,255,0.06)`, `border-color: rgba(0,240,255,0.4)`, `color: #f5f5f7`, `transform: translateY(-1px)`.

  Default chip texts (these are visual placeholders for now — clicking them inserts the text into the input and submits; see Interaction details below):
  - `What services do you build?`
  - `How do you price projects?`
  - `Book a 45-min strategy call`

###### Messages list (when `messages.length > 0`)

Vertical stack, gap 12 (slightly tighter than current 3 → effectively 12px from message margin-bottom).

- Each message is a `<motion.div>` with the existing `initial / animate / transition` (opacity + y stagger) — keep this.
- Layout per message: a flex column with `gap: 4` and a meta line below the bubble.
- **User messages** align right:
  - Bubble:
    ```ts
    padding: '10px 14px'
    fontSize: 13
    lineHeight: 1.5
    borderRadius: 16
    backdropFilter: 'blur(12px)'
    background: 'rgba(0,240,255,0.12)'
    border: '1px solid rgba(0,240,255,0.25)'
    color: '#f5f5f7'
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,240,255,0.1)'
    maxWidth: '80%'
    ```
- **Assistant messages** align left:
  - Same shape, different palette:
    ```ts
    background: 'rgba(255,255,255,0.05)'
    border: '1px solid rgba(255,255,255,0.08)'
    color: '#cbd5e1'
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)'
    ```
- **Meta line** (timestamp) below each bubble:
  - `fontFamily: var(--font-geist-mono)`, `fontSize: 9.5`, `letterSpacing: 0.1em`, `color: #475569`, `padding: '0 6px'`.
  - Format: existing `formatTime()` output (`HH:MM`).

###### Typing indicator

Render when `status === 'sending'`. Same `TypingDots` component (3 bouncing dots), but wrap in an assistant-style glass bubble:
- Same bubble styling as assistant messages above.
- Inside: the existing `TypingDots` content (3 `<motion.span>` dots). Keep the existing animation timing.

###### Error state

When `error` is non-null:
- Render a single block in place of messages with:
  ```ts
  padding: '10px 14px'
  background: 'rgba(248,113,113,0.08)'
  border: '1px solid rgba(248,113,113,0.3)'
  borderRadius: 12
  color: '#fca5a5'
  fontSize: 13
  ```
- Content: the existing `error` string.

##### Input (bottom section)

- Outer padding: `14px 20px 20px`.
- Display: flex, gap 10, align-items center.
- **Field wrapper** (the pill that contains the textarea):
  - `flex: 1`, `position: relative`.
  - `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.10)`, `borderRadius: 999`, `padding: 11px 16px`, `backdropFilter: blur(12px)`.
  - Focus-within state:
    - `background: rgba(255,255,255,0.06)`
    - `border-color: rgba(0,240,255,0.45)`
    - `box-shadow: 0 0 0 3px rgba(0,240,255,0.12), 0 0 24px rgba(0,240,255,0.2)`
  - Transition: `all 0.25s` on the above three.
- **Textarea**: full width, transparent background, no border, no outline, `color: #f5f5f7`, `font-size: 13.5`, `font-family: var(--font-plus-jakarta)`. Placeholder color `#475569`. Existing `rows={1}` + min/max-height stay.
- **Send button** (38×38, replaces current 36 `bg-white text-black`):
  - `borderRadius: 999`
  - `background: linear-gradient(135deg, #00F0FF, #5cf5ff)`
  - `color: #02040A`, `font-size: 16`, `font-weight: 700`
  - Inner glyph: `<ArrowUp className="w-4 h-4" />` from `lucide-react` (matches the existing import; do not switch to a text glyph).
  - `box-shadow: 0 4px 14px rgba(0,240,255,0.4), inset 0 1px 0 rgba(255,255,255,0.4)`
  - Hover: `transform: translateY(-1px)`, `box-shadow: 0 6px 20px rgba(0,240,255,0.55)`
  - Disabled state (when `status === 'sending'`): `opacity: 0.55`, `cursor: not-allowed`, no hover transform.

##### Interaction additions (small, in-scope)

These are visual-adjacent and worth adding because the redesign restructures the empty state:

- **Suggestion chips in the empty state are clickable.** On click:
  - Set `inputValue` to the chip's text.
  - Programmatically submit the form (call the existing `handleSubmit` flow, e.g. by clicking the hidden submit button via `sendBtnRef.current?.click()`).
  - This means the user clicks "How do you price projects?" → that text gets sent as their message → the assistant responds.
- Chip data should live as a `SUGGESTIONS` constant near the top of the file (three strings, matching the mockup copy).

This is the only behavioral addition. Everything else — backend, persistence, click-outside, rate limiting — is untouched.

---

## Reusable primitives & dependencies

Imported as-is (already present):
- `motion`, `AnimatePresence` from `motion/react`
- `ArrowUp` from `lucide-react` (used by the send button)
- `cn` from `@/lib/utils`

Deliberately NOT reused:
- `Sparkles` from `lucide-react` — the dock icon becomes a soft glass orb (CSS-only), and the empty-state icon becomes a larger orb. No sparkles anywhere in the new design.
- `Plus`, `X` from `lucide-react` — the header action buttons render as text glyphs (`+` and `×`), matching the glass aesthetic and slightly reducing the icon-import surface. Remove from the import list.

No new dependencies. All glass effects are CSS.

---

## Animation discipline

| Element | Mechanism | Reduced-motion |
|---|---|---|
| Panel morph (dock ↔ panel) | Framer Motion `layout` + spring (existing) | Framer respects user preference automatically; keep as-is |
| Dock drifting orb (background) | CSS `@keyframes` ease-in-out alternate 6s | Gate via `motion-safe:` Tailwind utility |
| Dock hover scale (1.06) | Framer `whileHover` | Respected (hover-triggered) |
| Dock tap (0.95) | Framer `whileTap` | Respected (user-triggered) |
| Panel rim-light + ambient glow | Static CSS — no animation | N/A |
| Message stagger entry | Framer Motion `initial/animate` (existing) | Framer respects user preference |
| Typing dots | Framer Motion `animate` opacity+y loop (existing) | Framer respects user preference |
| Input focus glow | CSS `transition` (focus-within) | Respected (user-triggered) |
| Send button hover lift | CSS `transition` | Respected (hover-triggered) |
| Suggestion chip hover lift | CSS `transition` | Respected (hover-triggered) |
| Status dot pulse (sending state) | Existing Tailwind `animate-pulse` | Already gated via `motion-safe` |

The only NEW animation in the redesign is the dock drifting orb. Everything else is either CSS-driven (respected by default) or Framer Motion that already respects `prefers-reduced-motion`.

---

## Verification

After the implementation plan executes:

1. **Static checks**
   - `npm run lint` clean.
   - `npm run build` clean. The widget compiles inside the existing `ChatbotWidget.tsx` mount in `src/app/layout.tsx`.
   - TypeScript strict clean.

2. **Visual diff vs the mockup**
   - Start dev server. Open `http://localhost:3001/` (any public page) and look at the bottom-right corner. The dock should be the new 56×56 glass bubble with a drifting orb behind it.
   - Click the dock. The panel morphs open (existing animation) and shows the new glass surface, glass avatar, glass message bubbles.
   - Compare side-by-side with `http://localhost:6035/direction-b-glass.html` at 1440px. Spacing, typography sizes, color values should match within a tight tolerance.

3. **States**
   - **Empty state** (clear localStorage first or use a fresh incognito window): orb + "Hi. Ask me / anything." + 3 chips visible. Click a chip → it submits as a message and the chat begins.
   - **Populated state**: messages render with cyan glass for user, neutral glass for assistant, timestamps below.
   - **Sending state**: status dot turns cyan and the typing-dots indicator appears in an assistant-style glass bubble.
   - **Error state**: trigger a failed request (kill the dev server momentarily, or pass a malformed body via DevTools) — the red error block appears in the body area.

4. **Behavior (regression check — must NOT change)**
   - Messages persist across page reloads (localStorage).
   - `+` button clears the conversation and starts a new session.
   - `×` button closes the panel (collapse back to dock).
   - Clicking outside the panel closes it.
   - Rate limiting still kicks in at >10 requests/minute (test by spamming submit).
   - Widget is hidden on `/login` and `/portal/*` (test by navigating there).

5. **A11y + reduced motion**
   - Tab order: dock → (after open) close button → new chat button → suggestion chips → textarea → send button. All focusable, visible focus rings.
   - `aria-label`s on dock and action buttons preserved.
   - `aria-live="polite"` on the messages area preserved.
   - DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → dock orb stops drifting; panel morph still works (Framer respects); typing dots still animate (this is conscious — it's a status indicator).

6. **Mobile (390px)**
   - The widget's `maxWidth: 92vw`, `maxHeight: 78vh` constraints kick in. The panel scales down to fit; the dock stays at 56×56 in the corner.
   - Touch scrolling inside the messages list still works (`overscroll-contain`, `touch-pan-y` — kept from existing).
   - No horizontal scroll, no layout breaks.

7. **chatbot-ui-kit showcase page**
   - Open `http://localhost:3001/chatbot-ui-kit`. The mounted `<MorphPanel />` should reflect the new visuals. No changes needed in that page file.

---

## Out of scope

- **Behavioral changes beyond the suggestion chips submitting on click.** No slash commands, no inline action buttons ("Book a call" / "Send to email"), no attachments, no markdown rendering in assistant messages (current code renders plain text — keep it).
- **Surfacing pattern changes.** The widget still floats `fixed bottom-6 right-6`. No sticky page CTAs that open it, no fullscreen modal mode, no slide-in drawer alternative.
- **New brand voice / personality.** The `CONTEXT_PREAMBLE` system prompt in `/api/ai/route.ts` is unchanged. The assistant is still "Aurexis Architect" with the same opening line and tone.
- **Notification badge / unread count** when the panel is closed but a new message arrived (not currently supported and not added here).
- **Multi-conversation history / sidebar.** Single conversation, localStorage-persisted, clearable via `+` button. Unchanged.
- **Backend changes.** OpenRouter, rate limiting (10/min/IP), `chat_logs` Supabase table writes — all unchanged.
- **Telegram or email notification of new chats to the team.** Not added; orthogonal to this design.
