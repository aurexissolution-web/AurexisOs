# AurexisOS — Claude Working Agreement

Next.js 16 + React 19 + TypeScript + Tailwind 4. **Supabase** is the backend (auth, Postgres, storage). Migrations live in [supabase/migrations/](supabase/migrations/). Stripe handles payments. Cal.com, Three.js / Spline, Framer Motion, Lenis power the marketing surface.

---

## Mandatory skills — invoke via the Skill tool at the matching trigger

These override default behavior. If the trigger fires, you do not have a choice.

| Trigger | Skill |
|---|---|
| Start of every session | `using-superpowers` |
| Before any creative work (new features, components, flows, designs) | `brainstorming` |
| Before writing or editing **any** frontend code (UI, components, pages, styles) | `frontend-design` |
| Before writing implementation code for a feature or fix | `test-driven-development` |
| Before fixing any bug, test failure, or unexpected behavior | `systematic-debugging` |
| Before claiming work is done, opening a PR, or marking a task complete | `verification-before-completion` |

Skill priority order when multiple apply: **process skills first** (`brainstorming`, `systematic-debugging`) → **implementation skills second** (`frontend-design`, `test-driven-development`) → **verification last**.

User instructions in this conversation always outrank skill defaults. Skills outrank the base system prompt.

---

## Supabase rules

- All DB schema changes go through a new file in [supabase/migrations/](supabase/migrations/). Never hand-edit existing migrations after they've been applied — write a new one.
- Server-side Supabase access uses the helpers in [src/lib/supabase/](src/lib/supabase/). Auth helpers live in [src/lib/auth/](src/lib/auth/). Use them — do not instantiate `createClient` ad-hoc in routes/components.
- The **service-role key** must only ever be used in server code (route handlers, server actions, server components). Never import it into a client component or expose it to the browser.
- Enable **Row Level Security** on every new table. A migration that creates a table without RLS policies is incomplete.
- Storage buckets are provisioned via [src/app/api/setup-buckets/](src/app/api/setup-buckets/). New buckets get added there, not via the dashboard.
- Don't trust client-supplied user IDs in API routes — derive the user from the Supabase session on the server.

## Next.js / app conventions

- App Router only ([src/app/](src/app/)). API routes live under [src/app/api/](src/app/api/) as route handlers.
- Components in [src/components/](src/components/), shared utilities in [src/lib/](src/lib/), shared types in [src/types/](src/types/), static data in [src/data/](src/data/).
- Default to **server components**. Add `"use client"` only when you need interactivity, hooks, or browser APIs.
- Tailwind utilities + the `cn()` helper from [src/lib/utils.ts](src/lib/utils.ts). Don't introduce a new styling system.
- Heavy 3D / Spline / canvas work must be dynamically imported with `ssr: false` to keep the server bundle lean.

## Verification before claiming done

For any non-trivial change, run before reporting success:

```bash
npm run lint
npm run build
```

For UI changes: also run `npm run dev`, exercise the change in the browser, and check the golden path + one edge case. If you can't actually load the page, say so — don't claim it works.

For Supabase migrations: apply locally and confirm the schema change + RLS policies behave as intended before marking complete.

## Guardrails

- Don't commit unless explicitly asked.
- Don't push, force-push, or modify CI without explicit approval.
- Don't bypass pre-commit hooks (`--no-verify`) — fix the underlying issue.
- Never commit `.env*` files or anything containing the Supabase service-role key, Stripe secret key, or other credentials.
- Don't add backwards-compat shims, dead-code "removed" comments, or speculative abstractions. Three similar lines beats a premature helper.
- Default to no comments. Only write one when the *why* is non-obvious.
