export type ServiceHubEntry = {
  id: "ecosystem" | "ai-automation" | "web-engineering" | "mobile-ecosystems" | "data-engineering";
  index: "01" | "02" | "03" | "04" | "05";
  label: string;
  title: string;
  /** Optional substring of `title` that should render in the accent gradient (e.g. "AI" in "AI Automation."). */
  titleColored?: string;
  pull: string;
  /** 3 short outcome lines rendered as a vertical list inside the row. */
  outcomes: [string, string, string];
  /** Hex accent color used on the label dot, hover hairline, and arrow ring. */
  accent: string;
};

export const servicesHub: ServiceHubEntry[] = [
  {
    id: "ecosystem",
    index: "01",
    label: "Full Stack",
    title: "Ecosystem.",
    pull:
      "Web, mobile, and AI engineered as one organism — shared data, shared design, one team.",
    outcomes: [
      "Web · Mobile · AI on one architecture",
      "Single source of truth across surfaces",
      "End-to-end delivery in one engagement",
    ],
    accent: "#0047FF",
  },
  {
    id: "ai-automation",
    index: "02",
    label: "AI & LLM",
    title: "AI Automation.",
    titleColored: "AI",
    pull:
      "Custom LLMs, RAG pipelines, autonomous workflow agents — engineered to replace repetitive ops, not just speed them up.",
    outcomes: [
      "50+ hours / week reclaimed per team",
      "Custom GPT-4o fine-tuned agents",
      "Autonomous decision-making pipelines",
    ],
    accent: "#00F0FF",
  },
  {
    id: "web-engineering",
    index: "03",
    label: "Web & SEO",
    title: "Web Engineering.",
    titleColored: "Engineering.",
    pull:
      "Ultra-fast, meticulously designed digital platforms — built for SEO dominance and conversion, not the design awards reel.",
    outcomes: [
      "Sub-1.5s global load times",
      "99+ Lighthouse performance score",
      "Headless CMS & e-commerce ready",
    ],
    accent: "#8B5CF6",
  },
  {
    id: "mobile-ecosystems",
    index: "04",
    label: "Mobile & App",
    title: "Mobile Ecosystems.",
    titleColored: "Ecosystems.",
    pull:
      "Seamless iOS and Android experiences built with React Native — designed to scale from zero to a hundred thousand users without friction.",
    outcomes: [
      "iOS + Android from one codebase",
      "60fps animations as standard",
      "App Store launch support included",
    ],
    accent: "#10B981",
  },
  {
    id: "data-engineering",
    index: "05",
    label: "Data & BI",
    title: "Data Engineering.",
    titleColored: "Engineering.",
    pull:
      "Stripe, your CRM, and three messy spreadsheets — unified into one live source of truth, then surfaced in dashboards that update themselves.",
    outcomes: [
      "One source of truth across every tool",
      "Live BI dashboards built into your portal",
      "Automated pipelines — no manual entry",
    ],
    accent: "#F59E0B",
  },
];
