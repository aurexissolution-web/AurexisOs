// Small shared input checks for admin server actions. Pure: no imports.
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isId = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v);
export const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
/** "2026-09-25" only; anything else is null. */
export const dateOrNull = (v: unknown): string | null =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(new Date(`${v}T00:00:00Z`).getTime()) ? v : null;
export const money = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= 0 && n < 1e9 ? Math.round(n * 100) / 100 : null;
};
