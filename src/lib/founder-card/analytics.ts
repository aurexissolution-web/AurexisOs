// src/lib/founder-card/analytics.ts
// Privacy-conscious, no-op-safe event layer. Dispatches to whatever analytics is
// present (Google Analytics gtag or Vercel Analytics `va`) and does nothing when
// none is configured — analytics must never break the page.

export type FounderCardEvent =
  | "book_discovery_click"
  | "whatsapp_click"
  | "save_contact_click"
  | "email_click"
  | "website_click"
  | "linkedin_click"
  | "instagram_click";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    va?: (event: string, properties?: Record<string, unknown>) => void;
  }
}

export function track(
  event: FounderCardEvent,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  try {
    const payload = { surface: "founder_card", ...params };
    if (typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    }
    if (typeof window.va === "function") {
      window.va("event", { name: event, ...payload });
    }
    if (process.env.NODE_ENV !== "production") {
      // Visibility while developing; harmless in production (stripped path).
      console.debug("[founder-card] track:", event, payload);
    }
  } catch {
    // Swallow — a failed analytics call must not affect the user.
  }
}
