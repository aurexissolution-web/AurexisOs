# Hide Chatbot on Founder Card Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the global “Ask Aurexis” widget throughout the `/sanjay` route namespace without changing its behavior elsewhere.

**Architecture:** Move the pathname exclusion rule into a small pure function so the exact and nested route behavior can be tested independently. `ChatbotWidget` remains the single rendering boundary and returns `null` when the predicate says the current route is excluded.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Node.js built-in test runner, ESLint

---

### Task 1: Add a tested chatbot visibility predicate

**Files:**
- Create: `src/components/ui/chatbot-visibility.ts`
- Create: `tests/chatbot-visibility.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/chatbot-visibility.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { shouldHideChatbot } from "../src/components/ui/chatbot-visibility.ts";

test("hides the chatbot throughout the Sanjay route namespace", () => {
  assert.equal(shouldHideChatbot("/sanjay"), true);
  assert.equal(shouldHideChatbot("/sanjay/contact"), true);
});

test("preserves existing protected-route exclusions", () => {
  assert.equal(shouldHideChatbot("/login"), true);
  assert.equal(shouldHideChatbot("/portal"), true);
  assert.equal(shouldHideChatbot("/portal/admin"), true);
});

test("keeps the chatbot visible on other public routes", () => {
  assert.equal(shouldHideChatbot("/"), false);
  assert.equal(shouldHideChatbot("/services"), false);
  assert.equal(shouldHideChatbot("/sanjay-profile"), false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/chatbot-visibility.test.mjs
```

Expected: FAIL because `src/components/ui/chatbot-visibility.ts` does not exist.

- [ ] **Step 3: Add the minimal predicate implementation**

Create `src/components/ui/chatbot-visibility.ts`:

```ts
export function shouldHideChatbot(pathname: string | null): boolean {
  return (
    pathname === "/login" ||
    pathname?.startsWith("/portal") === true ||
    pathname === "/sanjay" ||
    pathname?.startsWith("/sanjay/") === true
  );
}
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
node --test tests/chatbot-visibility.test.mjs
```

Expected: three passing tests and zero failures.

### Task 2: Use the predicate in the global widget

**Files:**
- Modify: `src/components/ui/ChatbotWidget.tsx`

- [ ] **Step 1: Replace the inline route guard**

Update `ChatbotWidget.tsx` to import and use the tested predicate:

```tsx
"use client";

import { MorphPanel } from "@/components/ui/ai-input";
import { shouldHideChatbot } from "@/components/ui/chatbot-visibility";
import { usePathname } from "next/navigation";

export function ChatbotWidget() {
  const pathname = usePathname();

  if (shouldHideChatbot(pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <MorphPanel />
    </div>
  );
}
```

- [ ] **Step 2: Run the focused test again**

Run:

```bash
node --test tests/chatbot-visibility.test.mjs
```

Expected: three passing tests and zero failures.

- [ ] **Step 3: Run application verification**

Run:

```bash
npx eslint src middleware.ts next.config.ts tests/chatbot-visibility.test.mjs
npm run build
```

Expected: both commands exit successfully.

- [ ] **Step 4: Verify in the browser**

With `npm run dev` running:

1. Open `http://localhost:3000/sanjay` and confirm no button named “Open Aurexis AI chat” is present.
2. Open `http://localhost:3000/` and confirm one button named “Open Aurexis AI chat” is present.
3. Open `http://localhost:3000/sanjay/example` and confirm no button named “Open Aurexis AI chat” is present, regardless of whether the route resolves to content or a 404.

