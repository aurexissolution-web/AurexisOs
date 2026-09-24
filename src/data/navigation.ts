// src/data/navigation.ts
// Centralised navigation data, shared by the navbar overlay.

export type NavLink = {
  label: string;
  href: string;
  /** Two-digit index shown beside the label in the menu overlay. */
  stage: string;
};

/** Flat primary navigation — every destination is one click, no dropdowns. */
export const NAV_LINKS: ReadonlyArray<NavLink> = [
  { label: "Solutions", href: "/solutions", stage: "01" },
  { label: "Work", href: "/work", stage: "02" },
  { label: "About", href: "/about", stage: "03" },
  { label: "Insights", href: "/insights", stage: "04" },
];
