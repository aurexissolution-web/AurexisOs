export type LabPillar = "ecosystem" | "ai" | "web" | "app";

export type LabExplorationType =
  | "interactive"
  | "mockup"
  | "prototype"
  | "video"
  | "case";

export type LabStatus = {
  tone: "live" | "build";
  /** Display label, e.g. "LIVE" or "IN BUILD · LIVE MAY 28" */
  label: string;
};

export type LabExplorationCta = {
  label: string;
  href: string;
};

export type LabExplorationNote = {
  title: string;
  href: string;
};

export type LabExploration = {
  slug: string;
  pillar: LabPillar;
  type: LabExplorationType;
  status: LabStatus;
  hook: string;
  title: string;
  description: string;
  /** Image URL — admin portal uploads + populates */
  thumbnail: string;
  /** Outcome metric or context line */
  outcome: string;
  primaryCta: LabExplorationCta;
  secondaryCta?: LabExplorationCta;
  note?: LabExplorationNote;
  isFeatured?: boolean;
};

// Default primary CTA label per exploration type.
// Cards can override via `exp.primaryCta.label` when needed.
export const TYPE_CTA_LABELS: Record<LabExplorationType, string> = {
  interactive: "Try it live",
  mockup: "View mockup",
  prototype: "Open prototype",
  video: "Watch",
  case: "Read",
};

// Human label for pillar (used in pills + filter chips).
export const PILLAR_LABELS: Record<LabPillar, string> = {
  ecosystem: "Ecosystem",
  ai: "AI",
  web: "Web",
  app: "App",
};

// Human label for type (used in card pills).
export const TYPE_LABELS: Record<LabExplorationType, string> = {
  interactive: "Interactive",
  mockup: "Mockup",
  prototype: "Prototype",
  video: "Video",
  case: "Case",
};
