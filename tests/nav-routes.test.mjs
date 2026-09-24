import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const navigation = readFileSync("src/data/navigation.ts", "utf8");

function hrefsFrom(exportName) {
  const block = navigation.match(
    new RegExp(`export const ${exportName}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`),
  );
  assert.ok(block, `${exportName} not found in navigation.ts`);
  return [...block[1].matchAll(/href:\s*"([^"]+)"/g)].map(([, href]) => href);
}

/** App Router: /a/b resolves to src/app/a/b/page.tsx, ignoring any #anchor. */
function routeExists(href) {
  const path = href.split("#")[0].split("?")[0].replace(/\/$/, "");
  if (path === "") return existsSync("src/app/page.tsx");
  return existsSync(`src/app${path}/page.tsx`);
}

test("every primary nav link resolves to a real page", () => {
  const hrefs = hrefsFrom("NAV_LINKS");
  assert.equal(hrefs.length, 4, "expected four primary nav destinations");
  for (const href of hrefs) {
    assert.ok(routeExists(href), `primary nav points at a missing route: ${href}`);
  }
});

test("the navbar CTA destination exists", () => {
  assert.ok(existsSync("src/app/contact/page.tsx"));
});

test("the primary nav is flat — no dropdown descriptors remain", () => {
  assert.doesNotMatch(navigation, /solutions-dropdown/);
  assert.doesNotMatch(navigation, /ecosystem-dropdown/);
  const navbar = readFileSync("src/components/layout/Navbar.tsx", "utf8");
  assert.doesNotMatch(navbar, /SolutionsMenu|TechEcosystemMenu/);
});
