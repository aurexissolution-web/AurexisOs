// src/lib/navigation/analytics.ts
// Privacy-conscious, no-op-safe event layer for primary navigation. Dispatches
// to whatever analytics is present (Google Analytics gtag or Vercel Analytics
// `va`) and does nothing when none is configured — analytics must never break
// navigation.

export type NavAnalyticsEvent = "nav_menu_open" | "nav_menu_close";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    va?: (event: string, properties?: Record<string, unknown>) => void;
  }
}

export function trackNavEvent(
  event: NavAnalyticsEvent,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  try {
    const payload = { surface: "primary_nav", ...params };
    if (typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    }
    if (typeof window.va === "function") {
      window.va("event", { name: event, ...payload });
    }
    if (process.env.NODE_ENV !== "production") {
      console.debug("[nav] track:", event, payload);
    }
  } catch {
    // Swallow — a failed analytics call must not affect navigation.
  }
}
