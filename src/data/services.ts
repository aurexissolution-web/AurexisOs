import { ReactNode } from "react";

export type ServiceSlug = "ai-automation" | "web-engineering" | "mobile-ecosystems" | "data-engineering";

export interface ServiceFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ServiceData {
  slug: ServiceSlug;
  themeColor: string; // e.g., "#00F0FF"
  
  // 1. The Hero (Hook & Agitation)
  hero: {
    title: ReactNode | string;
    agitation: string;
    ctaText: string;
  };

  // 2. The Before & After (Paradigm Shift)
  beforeAfter: {
    oldWay: string[];
    aurexisStandard: string[];
  };

  // 3. The Tech Stack (Authority Check)
  techStack: {
    microCopy: string;
    logos: { name: string; url: string }[];
  };

  // 4. Feature Deep-Dive (Proof of Competence)
  features: ServiceFeature[];

  // 5. Specialized Process (Roadmap to Launch)
  process: {
    step: string;
    title: string;
    description: string;
  }[];

  // 6. Pricing Matrix
  pricing: {
    tier: string;
    price: string;
    description: string;
    features: string[];
    isRecommended?: boolean;
  }[];

  // 7. Anti-Risk FAQ
  faq: {
    question: string;
    answer: string;
  }[];

  // 8. Conversion
  conversion: {
    headline: string;
  };
}

export const servicesData: Record<ServiceSlug, ServiceData> = {
  "ai-automation": {
    slug: "ai-automation",
    themeColor: "#00F0FF",
    hero: {
      title: "Autonomous AI Agents for Unfair Efficiency.",
      agitation: "Stop paying humans to do machine-level work. We architect custom LLM workflows that eliminate manual friction, operating 24/7 without fatigue or context loss.",
      ctaText: "Book a Strategy Session",
    },
    beforeAfter: {
      oldWay: [
        "Endless manual data entry",
        "Siloed tools requiring human coordination",
        "High error rates and slow response times",
        "Scaling means adding more headcount",
      ],
      aurexisStandard: [
        "90% context-aware task automation",
        "Unified autonomous ecosystems",
        "Zero-hallucination structured outputs",
        "Scaling means adding computing power, not payroll",
      ],
    },
    techStack: {
      microCopy: "Built on enterprise-grade LLM infrastructure for maximum security, speed, and absolute data privacy.",
      logos: [
        { name: "OpenAI", url: "https://cdn.simpleicons.org/openai/white" },
        { name: "Anthropic", url: "https://cdn.simpleicons.org/anthropic/white" },
        { name: "Python", url: "https://cdn.simpleicons.org/python/white" },
        { name: "Supabase", url: "https://cdn.simpleicons.org/supabase/white" },
        { name: "PostgreSQL", url: "https://cdn.simpleicons.org/postgresql/white" },
        { name: "AWS", url: "https://cdn.simpleicons.org/amazonaws/white" },
        { name: "Pinecone", url: "https://cdn.simpleicons.org/pinecone/white" },
        { name: "Docker", url: "https://cdn.simpleicons.org/docker/white" },
      ],
    },
    features: [
      {
        title: "Custom RAG Systems",
        description: "We don't just wrap APIs. We build Retrieval-Augmented Generation pipelines that ground AI responses entirely in your proprietary company data.",
      },
      {
        title: "Agentic Workflows",
        description: "Deploy multi-agent systems that don't just answer questions, but autonomously execute complex, multi-step actions across your software stack.",
      },
      {
        title: "Predictive Analytics Engine",
        description: "Transform your historical data into foresight. We build models that predict customer churn, inventory shortages, and market shifts before they happen.",
      },
      {
        title: "Autonomous Orchestration",
        description: "Connect disparate APIs and legacy databases into unified, self-healing data pipelines that operate autonomously without human intervention.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Architecture & Mapping",
        description: "We dissect your operational bottlenecks, map the optimal data flows, and design the system architecture before writing a single line of code.",
      },
      {
        step: "02",
        title: "Model Engineering",
        description: "We build, fine-tune, and integrate the custom AI solution directly into your existing infrastructure using modern, scalable tech stacks.",
      },
      {
        step: "03",
        title: "Deployment & Scale",
        description: "We launch the system into production, establishing strict monitoring, self-correction protocols, and continuous optimization loops.",
      },
    ],
    pricing: [
      {
        tier: "Startup",
        price: "Custom Scope",
        description: "Rapid deployment of single-agent workflows for immediate bottleneck relief.",
        features: ["1 Custom AI Agent", "Basic RAG Implementation", "Standard API Integrations", "Email Support"],
      },
      {
        tier: "Growth",
        price: "Custom Scope",
        description: "Multi-agent systems designed to automate entire operational departments.",
        features: ["Up to 3 Specialized Agents", "Advanced Semantic Search", "Complex Workflow Automation", "Priority Slack Support"],
        isRecommended: true,
      },
      {
        tier: "Enterprise",
        price: "Custom Scope",
        description: "On-premise capable, fully autonomous ecosystems with ironclad compliance.",
        features: ["Unlimited Agent Swarms", "Fine-tuned Custom Models", "SOC2/HIPAA Compliance Prep", "Dedicated 24/7 Engineer"],
      },
    ],
    faq: [
      {
        question: "Who owns the Intellectual Property (IP)?",
        answer: "You do. 100%. We assign all necessary rights, title, and interest in the custom code and models we build directly to your company upon final payment.",
      },
      {
        question: "Is my proprietary data safe and private?",
        answer: "Absolutely. We utilize enterprise-tier APIs that explicitly guarantee zero data retention for training. Your data remains siloed, encrypted, and isolated from public models.",
      },
      {
        question: "How long does a custom AI build typically take?",
        answer: "We sprint fast. A standard single-agent workflow or custom RAG pipeline typically goes from architecture to production in 4-8 weeks, depending on data readiness and integration complexity.",
      },
      {
        question: "Do you offer post-launch maintenance?",
        answer: "Yes. AI models drift and APIs update. We offer transparent SLA (Service Level Agreement) tiers to continuously monitor, refine, and upgrade your system post-deployment.",
      },
    ],
    conversion: {
      headline: "Ready to stop scaling your headcount and start scaling your systems?",
    },
  },
  "web-engineering": {
    slug: "web-engineering",
    themeColor: "#E2E8F0", // Kept the ValueAdd color or could use #00F0FF? Using standard white/silver glow
    hero: {
      title: "Web Architecture That Competes and Converts.",
      agitation: "Stop losing customers to slow load times and generic templates. We engineer high-performance, immersive web applications that command authority and drive revenue.",
      ctaText: "Book a Strategy Session",
    },
    beforeAfter: {
      oldWay: [
        "Bloated WordPress templates",
        "3+ second load times bleeding conversions",
        "Static, uninspiring user interfaces",
        "Monolithic architectures that are hard to scale",
      ],
      aurexisStandard: [
        "Custom Next.js & React architectures",
        "Sub-second Core Web Vitals",
        "Immersive, hardware-accelerated WebGL/3D UI",
        "Headless, edge-deployed infrastructure",
      ],
    },
    techStack: {
      microCopy: "Built on modern edge infrastructure for maximum speed, SEO dominance, and zero downtime.",
      logos: [
        { name: "Next.js", url: "https://cdn.simpleicons.org/nextdotjs/white" },
        { name: "React", url: "https://cdn.simpleicons.org/react/white" },
        { name: "Vercel", url: "https://cdn.simpleicons.org/vercel/white" },
        { name: "TypeScript", url: "https://cdn.simpleicons.org/typescript/white" },
        { name: "Tailwind CSS", url: "https://cdn.simpleicons.org/tailwindcss/white" },
        { name: "Three.js", url: "https://cdn.simpleicons.org/threedotjs/white" },
        { name: "Prisma", url: "https://cdn.simpleicons.org/prisma/white" },
        { name: "Stripe", url: "https://cdn.simpleicons.org/stripe/white" },
      ],
    },
    features: [
      {
        title: "High-Performance Next.js",
        description: "We leverage server-side rendering and static generation to deliver lightning-fast load times that drastically improve SEO and user retention.",
      },
      {
        title: "Immersive WebGL & 3D",
        description: "Capture attention immediately. We build interactive 3D elements and fluid physics that elevate your brand narrative beyond flat websites.",
      },
      {
        title: "Headless Commerce & CMS",
        description: "Decouple your front-end from your back-end. Manage content easily while delivering a blisteringly fast, custom-designed user experience.",
      },
      {
        title: "Edge-Deployed Compute",
        description: "We push logic directly to your users. By deploying serverless functions to the edge network, we guarantee global zero-latency response times.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Architecture & Wireframing",
        description: "Mapping the user journey, optimizing conversion architecture, and establishing the technical infrastructure for scale.",
      },
      {
        step: "02",
        title: "Engineering & 3D Integration",
        description: "Building the custom front-end, integrating back-end logic, and weaving in hardware-accelerated visual elements.",
      },
      {
        step: "03",
        title: "Optimization & Edge Deployment",
        description: "Relentless performance tuning, comprehensive testing, and launching to the edge network for global sub-second response times.",
      },
    ],
    pricing: [
      {
        tier: "Startup",
        price: "Custom Scope",
        description: "High-converting single-page applications or marketing sites to establish aggressive authority.",
        features: ["Custom Next.js Front-end", "Advanced Animations", "Headless CMS Integration", "Basic SEO Setup"],
      },
      {
        tier: "Growth",
        price: "Custom Scope",
        description: "Complex multi-page platforms or headless commerce builds designed to drive revenue.",
        features: ["Full-Stack Next.js Architecture", "Interactive 3D / WebGL Elements", "Advanced E-commerce Engine", "Comprehensive Technical SEO"],
        isRecommended: true,
      },
      {
        tier: "Enterprise",
        price: "Custom Scope",
        description: "Massive scale platforms demanding intense data handling, custom software, and extreme security.",
        features: ["Micro-frontend Architecture", "Custom Database Engineering", "SOC2 Compliance Protocols", "Dedicated SLAs"],
      },
    ],
    faq: [
      {
        question: "Who owns the Intellectual Property (IP)?",
        answer: "You do. 100%. Upon completion, full ownership of the codebase and technical infrastructure is transferred directly to your organization.",
      },
      {
        question: "Do you use templates like WordPress or Webflow?",
        answer: "No. While those tools have their place, we strictly build custom software using technologies like React and Next.js. This ensures you have absolute control over performance, design, and scalability without being locked into a rigid platform.",
      },
      {
        question: "How long until we go live?",
        answer: "Depending on complexity, marketing sites take roughly 4-6 weeks, while complex SaaS platforms or headless e-commerce builds typically require 8-12+ weeks of focused engineering.",
      },
      {
        question: "What happens when it breaks?",
        answer: "Modern infrastructure built correctly rarely 'breaks'. However, we offer dedicated post-launch support and maintenance SLAs to handle updates, security patches, and feature additions.",
      },
    ],
    conversion: {
      headline: "Ready to build digital real estate that aggressively dominates your market?",
    },
  },
  "mobile-ecosystems": {
    slug: "mobile-ecosystems",
    themeColor: "#0047FF", 
    hero: {
      title: "Mobile Apps Users Actually Keep.",
      agitation: "Stop building clunky, slow apps that get uninstalled in a week. We engineer native-feeling, cross-platform mobile experiences that demand attention and drive daily engagement.",
      ctaText: "Book a Strategy Session",
    },
    beforeAfter: {
      oldWay: [
        "Janky cross-platform wrappers",
        "Dropped frames and sluggish navigation",
        "Mismatched iOS and Android experiences",
        "High uninstall rates and poor store reviews",
      ],
      aurexisStandard: [
        "Fluid 60fps React Native architecture",
        "Hardware-accelerated animations",
        "Pixel-perfect native parity",
        "Offline-first, real-time data synchronization",
      ],
    },
    techStack: {
      microCopy: "Built on industry-leading frameworks for seamless deployment across iOS and Android from a single robust codebase.",
      logos: [
        { name: "React Native", url: "https://cdn.simpleicons.org/react/white" },
        { name: "Expo", url: "https://cdn.simpleicons.org/expo/white" },
        { name: "Firebase", url: "https://cdn.simpleicons.org/firebase/white" },
        { name: "TypeScript", url: "https://cdn.simpleicons.org/typescript/white" },
        { name: "Supabase", url: "https://cdn.simpleicons.org/supabase/white" },
        { name: "Stripe", url: "https://cdn.simpleicons.org/stripe/white" },
        { name: "Sentry", url: "https://cdn.simpleicons.org/sentry/white" },
        { name: "PostgreSQL", url: "https://cdn.simpleicons.org/postgresql/white" },
      ],
    },
    features: [
      {
        title: "Cross-Platform Precision",
        description: "We use React Native to deliver apps that feel 100% native on both iOS and Android, drastically reducing your time-to-market without compromising quality.",
      },
      {
        title: "Offline-First Architectures",
        description: "Your app needs to work even in a tunnel. We implement sophisticated local caching and synchronization logic so the experience never breaks.",
      },
      {
        title: "High-Fidelity Animations",
        description: "We obsess over the 16ms frame budget. From micro-interactions to complex gestures, our apps feel incredibly crisp and responsive to the touch.",
      },
      {
        title: "Native Device Integration",
        description: "Deep, secure access to native device capabilities—from Bluetooth LE and biometric authentication to advanced camera processing pipelines.",
      },
    ],
    process: [
      {
        step: "01",
        title: "App Architecture & UX Mapping",
        description: "Defining the core loop, mapping user flows, and designing an intuitive interface that keeps users engaged.",
      },
      {
        step: "02",
        title: "Native Engineering",
        description: "Writing the fluid, cross-platform codebase, integrating powerful backend services, and polishing the tactile interactions.",
      },
      {
        step: "03",
        title: "App Store Deployment & Monitoring",
        description: "Navigating the rigorous App Store and Google Play review processes, launching smoothly, and monitoring crash analytics in real-time.",
      },
    ],
    pricing: [
      {
        tier: "MVPs",
        price: "Custom Scope",
        description: "Rapidly deployable core feature sets designed to validate your market and secure initial funding.",
        features: ["Core Feature Engineering", "Cross-Platform Build", "Backend Integration", "App Store Submission"],
      },
      {
        tier: "Full Product Build",
        price: "Custom Scope",
        description: "Comprehensive mobile platforms with complex features, real-time functionality, and robust infrastructure.",
        features: ["Advanced Animation/Gesture UI", "Offline-first Sync Engines", "Push Notification Architecture", "Strict Performance Audits"],
        isRecommended: true,
      },
      {
        tier: "Enterprise Migration",
        price: "Custom Scope",
        description: "Migrating legacy monolithic apps to modern React Native stacks without data loss or user disruption.",
        features: ["Phased Legacy Rewrite", "Complex System Integrations", "Bank-grade Security Audits", "Dedicated 24/7 SLA"],
      },
    ],
    faq: [
      {
        question: "Who owns the Intellectual Property (IP)?",
        answer: "You do. 100%. We assign all necessary rights, title, and interest in the codebase directly to your company upon final payment.",
      },
      {
        question: "Do you build for iOS or Android?",
        answer: "We build for both simultaneously. Using React Native and Expo, we compile native code for both iOS and Android from a single, robust codebase, saving you significant engineering costs.",
      },
      {
        question: "Will you handle the App Store submission process?",
        answer: "Yes. Apple and Google have notoriously strict review processes. We handle the entire build compiling, testing, and submission phase to ensure your app actually makes it to the store.",
      },
      {
        question: "How long does it take to build an app?",
        answer: "A solid, polished v1 typically takes 8-14 weeks depending on the complexity of the backend required and external integrations.",
      },
    ],
    conversion: {
      headline: "Ready to launch a mobile experience that your users refuse to delete?",
    },
  },
  "data-engineering": {
    slug: "data-engineering",
    themeColor: "#F59E0B",
    hero: {
      title: "One Source of Truth. Dashboards That Update Themselves.",
      agitation: "Stop running your business out of eight disconnected spreadsheets. We centralize your data — Stripe, your CRM, your website, your POS — and surface it in live dashboards built directly into your tools.",
      ctaText: "Book a Strategy Session",
    },
    beforeAfter: {
      oldWay: [
        "Numbers scattered across spreadsheets and SaaS tools",
        "Hours per week spent in manual data entry",
        "Decisions made on month-old PDF reports",
        "No single view of the actual business",
      ],
      aurexisStandard: [
        "One unified database — the source of truth",
        "Automated pipelines that pull data without manual entry",
        "Live dashboards updating in real time",
        "Role-based access — CEO sees everything, team sees their slice",
      ],
    },
    techStack: {
      microCopy: "Built on enterprise-grade data infrastructure — designed for security, scale, and zero-downtime pipelines.",
      logos: [
        { name: "Supabase", url: "https://cdn.simpleicons.org/supabase/white" },
        { name: "PostgreSQL", url: "https://cdn.simpleicons.org/postgresql/white" },
        { name: "Stripe", url: "https://cdn.simpleicons.org/stripe/white" },
        { name: "Next.js", url: "https://cdn.simpleicons.org/nextdotjs/white" },
        { name: "Python", url: "https://cdn.simpleicons.org/python/white" },
        { name: "Vercel", url: "https://cdn.simpleicons.org/vercel/white" },
        { name: "Tailwind CSS", url: "https://cdn.simpleicons.org/tailwindcss/white" },
        { name: "Google Cloud", url: "https://cdn.simpleicons.org/googlecloud/white" },
      ],
    },
    features: [
      {
        title: "API & System Integration",
        description: "We connect the scattered tools — CRM, Stripe, website forms, POS — so they speak to each other automatically. No more copy-pasting between systems.",
      },
      {
        title: "Database Architecture",
        description: "Secure, scalable PostgreSQL or Supabase databases designed to house all historical and real-time business data with proper access controls.",
      },
      {
        title: "Live BI Dashboards",
        description: "Custom-coded analytics portals built directly into your existing web app — KPIs, revenue tracking, lead conversion, team metrics — updating in real time.",
      },
      {
        title: "Automated Data Pipelines",
        description: "Invisible workflows that pull new sales, leads, and operational data into your database without anyone lifting a finger.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Audit & Mapping",
        description: "We catalog every data source you're running — spreadsheets, SaaS tools, manual processes — and map what should flow where.",
      },
      {
        step: "02",
        title: "Architecture & Migration",
        description: "We build the database, design the pipelines, and migrate your messy legacy data — cleaned and normalized — into the new source of truth.",
      },
      {
        step: "03",
        title: "Dashboards & DaaS",
        description: "We launch the live dashboards into your portal, then act as your outsourced data department — monitoring pipelines, adding metrics, interpreting numbers monthly.",
      },
    ],
    pricing: [
      {
        tier: "Infrastructure",
        price: "Custom Scope",
        description: "Centralized database, pipeline setup for up to 3 data sources, and a deployment-ready BI dashboard.",
        features: ["Database setup (Supabase or Postgres)", "3 data source connectors", "Looker Studio / Power BI dashboard", "Data migration from legacy systems"],
      },
      {
        tier: "Dashboard Ecosystem",
        price: "Custom Scope",
        description: "Full data architecture and a custom-coded Next.js dashboard integrated directly into your existing portal.",
        features: ["Custom database schema", "Unlimited data source integrations", "Custom-built Next.js dashboards", "Role-based access portals"],
        isRecommended: true,
      },
      {
        tier: "DaaS Retainer",
        price: "Custom Scope",
        description: "Recurring partnership — we run your data department, keep pipelines healthy, and expand the dashboard as you grow.",
        features: ["Pipeline monitoring & error resolution", "Monthly strategy & interpretation call", "Dashboard expansion as needed", "Automated PDF reporting"],
      },
    ],
    faq: [
      {
        question: "How is my business data kept secure?",
        answer: "Your data lives in your own database, isolated and encrypted at rest. We follow row-level security best practices and sign DPAs. PDPA-compliant by design.",
      },
      {
        question: "What if my data is currently scattered across messy Excel files?",
        answer: "That's the normal starting point. We handle data cleaning and migration as part of the Infrastructure phase — taking your legacy files, normalizing the formats, and importing them cleanly into the new database.",
      },
      {
        question: "How long until I see my first live dashboard?",
        answer: "Infrastructure + first dashboard typically lands in 3-5 weeks depending on how many data sources we're connecting. Subsequent dashboard expansions take days, not weeks.",
      },
      {
        question: "What does the DaaS retainer actually cover?",
        answer: "Monitoring your data pipelines so they don't silently break, monthly strategy calls where we sit down with you to interpret what the numbers mean, and ongoing dashboard expansion as your business evolves.",
      },
    ],
    conversion: {
      headline: "Ready to stop running your business out of eight spreadsheets and start running it out of one dashboard?",
    },
  },
};
