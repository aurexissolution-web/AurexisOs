import assert from "node:assert/strict";
import test from "node:test";
import { isFounderCardRoute } from "../src/lib/founder-card/routes.ts";

test("matches every registered founder-card route namespace", () => {
  assert.equal(isFounderCardRoute("/sanjay"), true);
  assert.equal(isFounderCardRoute("/sanjay/example"), true);
  assert.equal(isFounderCardRoute("/vasshanraj"), true);
  assert.equal(isFounderCardRoute("/vasshanraj/example"), true);
});

test("does not match similarly named or unrelated routes", () => {
  assert.equal(isFounderCardRoute("/"), false);
  assert.equal(isFounderCardRoute("/services"), false);
  assert.equal(isFounderCardRoute("/sanjay-profile"), false);
  assert.equal(isFounderCardRoute("/vasshanraj-profile"), false);
  assert.equal(isFounderCardRoute(null), false);
});
