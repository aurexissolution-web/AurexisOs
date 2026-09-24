import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeSource = await readFile(
  new URL("../src/app/api/vcard/[slug]/route.ts", import.meta.url),
  "utf8",
);

test("looks up the card by slug and 404s when it's unknown", () => {
  assert.match(routeSource, /getFounderCard\(slug\)/);
  assert.match(routeSource, /if \(!card\)/);
  assert.match(routeSource, /status:\s*404/);
});

test("serves the vCard with the right content type, filename, and cache header", () => {
  assert.match(routeSource, /"Content-Type":\s*"text\/vcard; charset=utf-8"/);
  assert.match(routeSource, /filename="\$\{card\.vcardFileName\}"/);
  assert.match(routeSource, /"Cache-Control":\s*"public, max-age=3600"/);
});
