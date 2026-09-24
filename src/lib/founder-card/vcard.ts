// src/lib/founder-card/vcard.ts
// Pure builder for a valid, cross-device vCard 3.0. No dependencies so it can be
// unit-checked in isolation and reused by the /api/vcard/[slug] route.
import type { FounderCardData } from "@/data/founder-cards";

/** vCard 3.0 text escaping: backslash, newline, comma, semicolon. */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildVCard(card: FounderCardData): string {
  const p = card;

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    // N: Family;Given;Additional;Prefix;Suffix
    `N:${esc(p.lastName)};${esc(p.firstName)};;;`,
    `FN:${esc(p.name)}`,
    `ORG:${esc(p.company)}`,
    `TITLE:${esc(p.title)}`,
    `TEL;TYPE=CELL,VOICE:${p.phoneLink}`,
    `EMAIL;TYPE=INTERNET,WORK:${p.email}`,
    // Digital-card URL first (primary), then the company website.
    `URL:${p.cardUrl}`,
    `URL;TYPE=WORK:${p.website}`,
    // Public location only — never a residential/street address.
    `ADR;TYPE=WORK:;;;${esc(p.publicLocation)};;;`,
  ];

  if (p.linkedin) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${p.linkedin}`);
  }

  lines.push(`NOTE:${esc(p.vcardNote)}`);
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  // vCard requires CRLF line breaks.
  return lines.join("\r\n") + "\r\n";
}
