// The follow-up email series. Pure, no imports, so node:test can load it.
// Step 0 is the welcome email; each later step goes out N days after sign-up.

export const DRIP_STEPS = [{ day: 0 }, { day: 3 }, { day: 7 }, { day: 14 }] as const;

/** When the email at `step` is due, or null once the series is finished. */
export function nextDripAt(signedUpAt: string, step: number): string | null {
  const s = DRIP_STEPS[step];
  if (!s) return null;
  return new Date(new Date(signedUpAt).getTime() + s.day * 86_400_000).toISOString();
}

/** Plain text from the admin composer to paragraphs: blank lines split, empty ones drop. */
export function bodyToBlocks(body: string): string[] {
  return body
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
