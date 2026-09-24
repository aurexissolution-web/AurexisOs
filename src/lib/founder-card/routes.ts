// Every founder-card route namespace. Add a new person's `cardPath` here
// too when they get a card — kept as a literal (not derived from
// src/data/founder-cards.ts) so this stays a plain, dependency-free,
// directly testable function.
const CARD_PATHS = ["/sanjay", "/vasshanraj"];

export function isFounderCardRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return CARD_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
