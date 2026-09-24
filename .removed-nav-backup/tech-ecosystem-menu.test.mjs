import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navigation = readFileSync("src/data/navigation.ts", "utf8");
const techPage = readFileSync("src/app/tech-ecosystem/page.tsx", "utf8");

test("tech ecosystem menu exposes the six capability anchors", () => {
  const expected = [
    "/tech-ecosystem#presence",
    "/tech-ecosystem#flow",
    "/tech-ecosystem#core",
    "/tech-ecosystem#connect",
    "/tech-ecosystem#data-foundation",
    "/tech-ecosystem#intelligence",
  ];

  for (const href of expected) {
    assert.match(navigation, new RegExp(href.replace("#", "#")));
  }
  assert.match(navigation, /TECH_ECOSYSTEM_ITEMS/);
  assert.match(navigation, /TECH_ECOSYSTEM_OVERVIEW/);
});

test("tech ecosystem page exposes real capability anchor targets", () => {
  for (const id of [
    "presence",
    "flow",
    "core",
    "connect",
    "data-foundation",
    "intelligence",
  ]) {
    assert.match(techPage, new RegExp(`id="${id}"`));
  }
});
