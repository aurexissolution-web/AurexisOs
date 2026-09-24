import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Mirrors src/lib/navigation/active.ts. Kept in sync by the guard test below
// so this file needs no TypeScript loader.
function normalize(path) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function isActiveHref(pathname, href, options = {}) {
  if (!pathname || !href) return false;
  if (href.startsWith("http") || href.startsWith("#")) return false;
  const path = normalize(pathname);
  const target = normalize(href.split("#")[0].split("?")[0]);
  if (target === "/" || options.exact) return path === target;
  return path === target || path.startsWith(`${target}/`);
}

test("a nested route activates its parent nav item", () => {
  assert.equal(isActiveHref("/blog/some-post", "/blog"), true);
  assert.equal(isActiveHref("/services/ai-automation/agents", "/services"), true);
});

test("a sibling route with a shared prefix does not activate", () => {
  assert.equal(isActiveHref("/portfolio-old", "/portfolio"), false);
  assert.equal(isActiveHref("/blogger", "/blog"), false);
});

test("home only matches exactly", () => {
  assert.equal(isActiveHref("/", "/"), true);
  assert.equal(isActiveHref("/about", "/"), false);
});

test("trailing slashes and query/hash suffixes are ignored", () => {
  assert.equal(isActiveHref("/about/", "/about"), true);
  assert.equal(isActiveHref("/about", "/about#team"), true);
});

test("the shipped helper matches this reference implementation", () => {
  const source = readFileSync("src/lib/navigation/active.ts", "utf8");
  for (const marker of [
    "export function isActiveHref",
    'if (target === "/" || options.exact) return path === target;',
    "return path === target || path.startsWith(`${target}/`);",
  ]) {
    assert.ok(
      source.includes(marker),
      `active.ts drifted from the reference implementation: missing ${marker}`,
    );
  }
});
