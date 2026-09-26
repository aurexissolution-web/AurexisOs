// Spam guards for the public form routes. The counters live in this server
// instance's memory, so they blunt casual abuse but are not shared across
// serverless instances; move them to a shared store if abuse ever gets past them.
import type { NextRequest } from 'next/server';

const buckets = new Map<string, { count: number; resetAt: number }>();
let lastSweep = 0;

export function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

/** Counts a hit against `key`; true once it goes over `limit` inside the window. */
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastSweep > 10 * 60_000) {
    lastSweep = now;
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

/** A hidden "website" field that only bots fill in. */
export function isHoneypot(body: Record<string, unknown>): boolean {
  return typeof body.website === 'string' && body.website.trim().length > 0;
}

/** Trimmed string capped to `max` characters ('' when not a string). */
export function cap(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
