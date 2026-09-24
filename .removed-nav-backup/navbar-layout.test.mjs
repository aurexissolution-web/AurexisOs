import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navigation = readFileSync("src/data/navigation.ts", "utf8");
const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");
const ctaButton = readFileSync("src/components/ui/demo.tsx", "utf8");
const solutionsMenu = readFileSync("src/components/layout/SolutionsMenu.tsx", "utf8");

const primaryLinks = navigation.match(
  /export const PRIMARY_NAV_LINKS[^=]*=\s*\[([\s\S]*?)\];/,
)[1];
const entries = [...primaryLinks.matchAll(/\{([^}]*)\}/g)].map(([, body]) => ({
  label: body.match(/label:\s*"([^"]+)"/)?.[1],
  href: body.match(/href:\s*"([^"]+)"/)?.[1],
  type: body.match(/type:\s*"([^"]+)"/)?.[1],
}));

test("primary nav is Solutions · Work · About · Insights, in that order", () => {
  assert.deepEqual(
    entries.map((e) => e.label),
    ["Solutions", "Work", "About", "Insights"],
  );
});

test("primary nav links point at the right pages", () => {
  const byLabel = Object.fromEntries(entries.map((e) => [e.label, e]));
  assert.equal(byLabel.Solutions.type, "solutions-dropdown");
  assert.equal(byLabel.Work.href, "/portfolio");
  assert.equal(byLabel.About.href, "/about");
  assert.equal(byLabel.Insights.href, "/blog");
});

test("navbar no longer renders the tech ecosystem dropdown", () => {
  assert.doesNotMatch(navbar, /TechEcosystemMenu/);
  assert.doesNotMatch(navbar, /ecosystem-dropdown/);
  assert.doesNotMatch(navigation, /ecosystem-dropdown/);
});

test("every navbar CTA reads Contact and links to /contact", () => {
  for (const source of [navbar, ctaButton]) {
    assert.doesNotMatch(source, /Start Project/);
    assert.doesNotMatch(source, /\/contact#brief/);
  }
  assert.match(ctaButton, /href="\/contact"/);
  assert.match(ctaButton, />\s*Contact\s*</);
  assert.equal((navbar.match(/href="\/contact"/g) || []).length, 2, "mobile + scrolled-pill CTAs");
});

test("tech ecosystem stays reachable from the Solutions menu", () => {
  assert.match(navigation, /href: "\/tech-ecosystem",\s*analyticsId: "ecosystem_crosslink_click"/);
  assert.match(solutionsMenu, /SOLUTIONS_FOOTER_LINKS\.map/);
});
