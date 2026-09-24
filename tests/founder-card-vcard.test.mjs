import assert from "node:assert/strict";
import test from "node:test";
import { buildVCard } from "../src/lib/founder-card/vcard.ts";

const baseCard = {
  slug: "vasshanraj",
  name: "Vasshan Raj",
  firstName: "Vasshan",
  lastName: "Raj",
  title: "Chief Technology Officer",
  company: "Aurexis Solution",
  initials: "VR",
  portrait: "/images/vasshan-raj.jpg",
  publicLocation: "Malaysia",
  isFounder: false,
  eyebrowLabel: "Engineering-led",
  positioning:
    "Engineering the data and AI infrastructure that make Aurexis systems reliable, visible and yours to own.",
  email: "vasshanraj@aurexissolution.com",
  phoneDisplay: "+60 11-6960 6717",
  phoneLink: "+601169606717",
  whatsappUrl: "https://wa.me/601169606717",
  website: "https://aurexissolution.com",
  websiteDisplay: "aurexissolution.com",
  linkedin: "https://www.linkedin.com/in/vasshan-raj",
  linkedinIsPersonal: true,
  instagramUrl: "https://www.instagram.com/aurexissolution",
  instagramDisplay: "@aurexissolution",
  bookingUrl: "https://cal.com/vasshan-raj/30min",
  cardPath: "/vasshanraj",
  cardUrl: "https://aurexissolution.com/vasshanraj",
  vcardFileName: "vasshan-raj-aurexis.vcf",
  vcardNote: "Chief Technology Officer of Aurexis Solution.",
};

test("builds a valid, correctly-addressed vCard", () => {
  const vcard = buildVCard(baseCard);
  assert.match(vcard, /^BEGIN:VCARD\r\n/);
  assert.match(vcard, /FN:Vasshan Raj\r\n/);
  assert.match(vcard, /ORG:Aurexis Solution\r\n/);
  assert.match(vcard, /TITLE:Chief Technology Officer\r\n/);
  assert.match(vcard, /TEL;TYPE=CELL,VOICE:\+601169606717\r\n/);
  assert.match(vcard, /EMAIL;TYPE=INTERNET,WORK:vasshanraj@aurexissolution\.com\r\n/);
  assert.match(vcard, /URL:https:\/\/aurexissolution\.com\/vasshanraj\r\n/);
  assert.match(
    vcard,
    /X-SOCIALPROFILE;TYPE=linkedin:https:\/\/www\.linkedin\.com\/in\/vasshan-raj\r\n/,
  );
  assert.match(vcard, /NOTE:Chief Technology Officer of Aurexis Solution\.\r\n/);
  assert.match(vcard, /END:VCARD\r\n$/);
});

test("escapes vCard special characters in the note", () => {
  const vcard = buildVCard({
    ...baseCard,
    vcardNote: "Line one\nComma, semi; back\\slash",
  });
  assert.match(vcard, /NOTE:Line one\\nComma\\, semi\\; back\\\\slash\r\n/);
});

test("omits the LinkedIn line when linkedin is empty", () => {
  const vcard = buildVCard({ ...baseCard, linkedin: "" });
  assert.doesNotMatch(vcard, /X-SOCIALPROFILE/);
});
