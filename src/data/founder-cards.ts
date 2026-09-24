// src/data/founder-cards.ts
// Central, typed content configuration for Aurexis digital name cards.
// One entry per person, keyed by the URL slug their card lives at.
import { CHANNELS } from "@/data/contact-config";

/** Canonical production origin (non-www). One host used for EVERY absolute URL:
 * metadata, JSON-LD, QR target, vCard, and sharing — so they never diverge. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aurexissolution.com"
).replace(/\/+$/, "");

/** Whether this deployment is the confirmed production host (drives robots). */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

const COMPANY_LINKEDIN = "https://www.linkedin.com/company/aurexissolution/";
const PERSONAL_LINKEDIN = (process.env.NEXT_PUBLIC_FOUNDER_LINKEDIN_URL || "").trim();

export interface FounderCardData {
  slug: "sanjay" | "vasshanraj";
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  initials: string;
  portrait: string | null;
  publicLocation: string;
  /** Drives whether the Organization JSON-LD `founder` field points at this
   * person, and which hero eyebrow label is used. Only true for a founder. */
  isFounder: boolean;
  eyebrowLabel: string;
  positioning: string;
  email: string;
  phoneDisplay: string;
  phoneLink: string;
  whatsappUrl: string;
  website: string;
  websiteDisplay: string;
  linkedin: string;
  /** true only when a real personal profile is configured; controls the label. */
  linkedinIsPersonal: boolean;
  instagramUrl: string;
  instagramDisplay: string;
  bookingUrl: string;
  cardPath: string;
  cardUrl: string;
  vcardFileName: string;
  vcardNote: string;
}

const SANJAY_WHATSAPP_MESSAGE =
  "Hi Sanjay, I found your Aurexis digital card and would like to discuss a business systems requirement.";

const VASSHAN_WHATSAPP_MESSAGE =
  "Hi Vasshan, I found your Aurexis digital card and would like to discuss a business systems requirement.";

const sanjay: FounderCardData = {
  slug: "sanjay",
  name: "Sanjay Gunabalan",
  firstName: "Sanjay",
  lastName: "Gunabalan",
  title: "Founder & CEO",
  company: "Aurexis Solution",
  initials: "SG",
  portrait: "/images/cto.jpg",
  publicLocation: "Malaysia",
  isFounder: true,
  eyebrowLabel: "Founder-led",
  positioning:
    "Turning scattered operations into connected, visible and manageable business systems.",
  email: "ceo.sanjay@aurexissolution.com",
  phoneDisplay: "+60 16-407 1129",
  phoneLink: CHANNELS.phone,
  whatsappUrl: `${CHANNELS.whatsappUrl}?text=${encodeURIComponent(SANJAY_WHATSAPP_MESSAGE)}`,
  website: SITE_URL,
  websiteDisplay: SITE_URL.replace(/^https?:\/\//, ""),
  linkedin: PERSONAL_LINKEDIN || COMPANY_LINKEDIN,
  linkedinIsPersonal: Boolean(PERSONAL_LINKEDIN),
  instagramUrl: "https://www.instagram.com/aurexissolution",
  instagramDisplay: "@aurexissolution",
  bookingUrl:
    (process.env.NEXT_PUBLIC_FOUNDER_BOOKING_URL || "").trim() ||
    "https://cal.com/aurexis-solution/discoverycall",
  cardPath: "/sanjay",
  cardUrl: `${SITE_URL}/sanjay`,
  vcardFileName: "sanjay-gunabalan-aurexis.vcf",
  vcardNote:
    "Founder & CEO of Aurexis Solution. Helping growing businesses turn scattered operations into connected, visible and manageable business systems.",
};

const vasshanraj: FounderCardData = {
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
  whatsappUrl: `https://wa.me/601169606717?text=${encodeURIComponent(VASSHAN_WHATSAPP_MESSAGE)}`,
  website: SITE_URL,
  websiteDisplay: SITE_URL.replace(/^https?:\/\//, ""),
  linkedin: "https://www.linkedin.com/in/vasshan-raj",
  linkedinIsPersonal: true,
  instagramUrl: "https://www.instagram.com/aurexissolution",
  instagramDisplay: "@aurexissolution",
  bookingUrl: "https://cal.com/vasshan-raj/30min",
  cardPath: "/vasshanraj",
  cardUrl: `${SITE_URL}/vasshanraj`,
  vcardFileName: "vasshan-raj-aurexis.vcf",
  vcardNote:
    "Chief Technology Officer of Aurexis Solution. Engineering the data and AI infrastructure behind Aurexis client systems.",
};

export const FOUNDER_CARDS: Record<FounderCardData["slug"], FounderCardData> = {
  sanjay,
  vasshanraj,
};

export function getFounderCard(slug: string): FounderCardData | undefined {
  return Object.hasOwn(FOUNDER_CARDS, slug)
    ? (FOUNDER_CARDS as Record<string, FounderCardData>)[slug]
    : undefined;
}

// ── Content blocks (data-driven rendering, shared across every card) ──

/** Three concise capabilities. No ™/® — plain names, short descriptions. */
export const CAPABILITIES: ReadonlyArray<{ name: string; body: string }> = [
  {
    name: "Business Systems Assessment",
    body: "Find gaps across workflows, tools, data and reporting.",
  },
  {
    name: "Workflow Improvement",
    body: "Simplify repetitive processes and connect disconnected work.",
  },
  {
    name: "Managed Operations",
    body: "Monitor, optimise and improve the system after launch.",
  },
];
