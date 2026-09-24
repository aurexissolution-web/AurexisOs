import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sharp from "sharp";

const pageCompositionSource = await readFile(
  new URL("../src/components/founder-card/FounderCardPage.tsx", import.meta.url),
  "utf8",
);

const connectSource = await readFile(
  new URL("../src/components/founder-card/ConnectSection.tsx", import.meta.url),
  "utf8",
);

const foundersDataSource = await readFile(
  new URL("../src/data/founder-cards.ts", import.meta.url),
  "utf8",
);

const heroSource = await readFile(
  new URL("../src/components/founder-card/FounderHero.tsx", import.meta.url),
  "utf8",
);

const footerSource = await readFile(
  new URL("../src/components/founder-card/FounderFooter.tsx", import.meta.url),
  "utf8",
);

const sanjayRouteSource = await readFile(
  new URL("../src/app/sanjay/page.tsx", import.meta.url),
  "utf8",
);

const vasshanrajRouteSource = await readFile(
  new URL("../src/app/vasshanraj/page.tsx", import.meta.url),
  "utf8",
);

const primaryActionsSource = await readFile(
  new URL("../src/components/founder-card/PrimaryActions.tsx", import.meta.url),
  "utf8",
);

test("the shared page builder composes the approved cinematic founder-card sections", () => {
  assert.match(pageCompositionSource, /<FounderHero\s+card=\{card\}\s*\/>/);
  assert.match(pageCompositionSource, /<Capabilities\s*\/>/);
  assert.match(pageCompositionSource, /<OwnershipPanel\s*\/>/);
  assert.match(pageCompositionSource, /<ConnectSection\s+card=\{card\}\s*\/>/);
  assert.match(pageCompositionSource, /<FounderFooter\s+card=\{card\}\s*\/>/);
});

test("removes the previous centred SaaS-style component sequence", () => {
  assert.doesNotMatch(pageCompositionSource, /<Hero\s*\/>/);
  assert.doesNotMatch(pageCompositionSource, /<FounderProfile\s*\/>/);
  assert.doesNotMatch(pageCompositionSource, /<AboutAurexis\s*\/>/);
  assert.doesNotMatch(pageCompositionSource, /<TrustPoints\s*\/>/);
  assert.doesNotMatch(pageCompositionSource, /max-w-\[580px\]/);
});

test("the Organization JSON-LD only claims a founder relation for an actual founder", () => {
  assert.match(pageCompositionSource, /card\.isFounder\s*\?\s*\{\s*founder:/);
});

test("sanjay's route delegates to the shared page builder with his own card", () => {
  assert.match(sanjayRouteSource, /FOUNDER_CARDS\.sanjay/);
  assert.match(sanjayRouteSource, /<FounderCardPage\s+card=\{card\}\s*\/>/);
});

test("uses Instagram instead of duplicating WhatsApp in the connect grid", () => {
  assert.match(connectSource, /label:\s*"Instagram"/);
  assert.match(connectSource, /href:\s*card\.instagramUrl/);
  assert.doesNotMatch(connectSource, /label:\s*"WhatsApp"/);
  assert.match(
    foundersDataSource,
    /https:\/\/www\.instagram\.com\/aurexissolution/,
  );
});

test("uses Sanjay's dedicated CEO email and Vasshan's CTO email on their cards", () => {
  assert.match(
    foundersDataSource,
    /email:\s*"ceo\.sanjay@aurexissolution\.com"/,
  );
  assert.match(
    foundersDataSource,
    /email:\s*"vasshanraj@aurexissolution\.com"/,
  );
});

test("uses the approved discovery call booking route for sanjay and vasshan's own link", () => {
  assert.match(
    foundersDataSource,
    /https:\/\/cal\.com\/aurexis-solution\/discoverycall/,
  );
  assert.match(
    foundersDataSource,
    /https:\/\/cal\.com\/vasshan-raj\/30min/,
  );
});

test("sanjay is the only card marked isFounder", () => {
  assert.match(foundersDataSource, /isFounder:\s*true/);
  assert.match(foundersDataSource, /isFounder:\s*false/);
});

test("uses the approved value statement with only the growth phrase highlighted", () => {
  assert.match(
    heroSource,
    /Helping growing businesses cut operational waste, recover valuable time and create room for\s*<span className="fc-value-emphasis">more profitable growth<\/span>\./,
  );
  assert.doesNotMatch(
    heroSource,
    /Helping growing businesses operate with greater clarity, control and less manual work/,
  );
});

test("uses one genuinely transparent official logo in the header and footer", async () => {
  const expectedPath = "/brand/aurexis-logo-transparent.png";
  assert.match(heroSource, new RegExp(`src=["']${expectedPath}["']`));
  assert.match(footerSource, new RegExp(`src=["']${expectedPath}["']`));
  assert.doesNotMatch(heroSource, /mixBlendMode/);
  assert.doesNotMatch(footerSource, /mixBlendMode/);

  const logoPath = fileURLToPath(
    new URL("../public/brand/aurexis-logo-transparent.png", import.meta.url),
  );
  const { channels } = await sharp(logoPath).stats();
  assert.equal(channels.length, 4);
  assert.equal(channels[3].min, 0);
  assert.equal(channels[3].max, 255);
});

test("vasshanraj's route delegates to the shared page builder with his own card", () => {
  assert.match(vasshanrajRouteSource, /FOUNDER_CARDS\.vasshanraj/);
  assert.match(vasshanrajRouteSource, /<FounderCardPage\s+card=\{card\}\s*\/>/);
});

test("analytics events record which person's card they came from", () => {
  assert.match(
    primaryActionsSource,
    /track\("book_discovery_click",\s*\{\s*card:\s*card\.slug\s*\}\)/,
  );
  assert.match(
    primaryActionsSource,
    /track\("whatsapp_click",\s*\{\s*card:\s*card\.slug\s*\}\)/,
  );
  assert.match(
    primaryActionsSource,
    /track\("save_contact_click",\s*\{\s*card:\s*card\.slug\s*\}\)/,
  );
  assert.match(
    connectSource,
    /track\(event,\s*\{\s*card:\s*card\.slug\s*\}\)/,
  );
});
