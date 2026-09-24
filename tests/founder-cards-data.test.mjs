import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/data/founder-cards.ts", import.meta.url),
  "utf8",
);

test("registry has exactly sanjay and vasshanraj", () => {
  assert.match(
    source,
    /export const FOUNDER_CARDS:[^=]*=\s*\{\s*sanjay,\s*vasshanraj,\s*\};/,
  );
});

test("sanjay is marked as the founder", () => {
  assert.match(source, /slug:\s*"sanjay"/);
  assert.match(source, /name:\s*"Sanjay Gunabalan"/);
  assert.match(source, /title:\s*"Founder & CEO"/);
  assert.match(source, /isFounder:\s*true/);
  assert.match(source, /eyebrowLabel:\s*"Founder-led"/);
  assert.match(source, /email:\s*"ceo\.sanjay@aurexissolution\.com"/);
  assert.match(source, /cardPath:\s*"\/sanjay"/);
  assert.match(source, /vcardFileName:\s*"sanjay-gunabalan-aurexis\.vcf"/);
});

test("vasshanraj is CTO, not a founder", () => {
  assert.match(source, /slug:\s*"vasshanraj"/);
  assert.match(source, /name:\s*"Vasshan Raj"/);
  assert.match(source, /title:\s*"Chief Technology Officer"/);
  assert.match(source, /isFounder:\s*false/);
  assert.match(source, /eyebrowLabel:\s*"Engineering-led"/);
  assert.match(source, /email:\s*"vasshanraj@aurexissolution\.com"/);
  assert.match(source, /phoneDisplay:\s*"\+60 11-6960 6717"/);
  assert.match(source, /phoneLink:\s*"\+601169606717"/);
  assert.match(source, /linkedin:\s*"https:\/\/www\.linkedin\.com\/in\/vasshan-raj"/);
  assert.match(source, /linkedinIsPersonal:\s*true/);
  assert.match(source, /instagramUrl:\s*"https:\/\/www\.instagram\.com\/aurexissolution"/);
  assert.match(source, /bookingUrl:\s*"https:\/\/cal\.com\/vasshan-raj\/30min"/);
  assert.match(source, /cardPath:\s*"\/vasshanraj"/);
  assert.match(source, /vcardFileName:\s*"vasshan-raj-aurexis\.vcf"/);
  assert.match(source, /portrait:\s*"\/images\/vasshan-raj\.jpg"/);
});

test("exports a getFounderCard lookup helper", () => {
  assert.match(source, /export function getFounderCard/);
});

test("getFounderCard only returns own registry entries, not inherited Object.prototype members", () => {
  assert.match(source, /Object\.hasOwn\(FOUNDER_CARDS,\s*slug\)/);
});
