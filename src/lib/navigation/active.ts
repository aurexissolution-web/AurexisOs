// Pure route-matching helpers — no React, so they can be unit-tested directly.

export interface ActiveHrefOptions {
  exact?: boolean;
}

function normalize(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/**
 * Prefix matching so `/blog/some-post` lights up the `/blog` nav item, while
 * `/portfolio-old` never matches `/portfolio`.
 */
export function isActiveHref(
  pathname: string,
  href: string,
  options: ActiveHrefOptions = {},
): boolean {
  if (!pathname || !href) return false;
  if (href.startsWith("http") || href.startsWith("#")) return false;

  const path = normalize(pathname);
  const target = normalize(href.split("#")[0].split("?")[0]);

  if (target === "/" || options.exact) return path === target;
  return path === target || path.startsWith(`${target}/`);
}

export function activeNavLabel(
  pathname: string,
  links: ReadonlyArray<{ label: string; href: string }>,
): string | null {
  let best: { label: string; length: number } | null = null;
  for (const link of links) {
    if (!isActiveHref(pathname, link.href)) continue;
    if (!best || link.href.length > best.length) {
      best = { label: link.label, length: link.href.length };
    }
  }
  return best?.label ?? null;
}
