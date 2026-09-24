"use client";

import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Service {
  index: string;
  label: string;
  title: string;
  description: string;
  accent: string;
  video: string;
}

const services: Service[] = [
  {
    index: "01",
    label: "AI",
    title: "Automation.",
    description:
      "Automating the repetitive work — quotes, follow-ups, data entry — so it runs without a person watching it.",
    accent: "#00F0FF",
    video: "01-ai.mp4",
  },
  {
    index: "02",
    label: "Website",
    title: "Websites.",
    description:
      "Fast, clean sites built to convert, not just exist. Sub-second load times where the infrastructure allows it.",
    accent: "#E2E8F0",
    video: "02-website.mp4",
  },
  {
    index: "03",
    label: "Systems",
    title: "Systems.",
    description:
      "One connected system instead of five tools that don't talk to each other. Web, database and automation as one build.",
    accent: "#7C5CFF",
    video: "04-ecosystem.mp4",
  },
];

interface VideoVisualProps {
  video: string;
  accent: string;
  reduce: boolean;
}

function VideoVisual({ video, accent, reduce }: VideoVisualProps) {
  if (reduce) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 55%, ${accent}40 0%, ${accent}12 30%, transparent 65%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={`/videos/value-add/${video}`} type="video/mp4" />
      </video>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-color"
        style={{ background: accent }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
        style={{ background: accent }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/15"
      />
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
  index: number;
  reduce: boolean;
}

function ServiceCard({ service, index, reduce }: ServiceCardProps) {
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay: reduce ? 0 : 0.1 + index * 0.06,
        ease: easeOut,
      }}
      whileHover={reduce ? undefined : { y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.16] bg-gradient-to-b from-white/[0.025] to-transparent transition-[border-color] duration-300"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${service.accent}55, 0 28px 55px -22px ${service.accent}40`,
        }}
      />

      <div className="relative aspect-[16/10] overflow-hidden">
        <VideoVisual
          video={service.video}
          accent={service.accent}
          reduce={reduce}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--color-background))",
          }}
        />
      </div>

      <div className="relative flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.32em] text-white/30">
            {service.index}
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.32em]"
            style={{ color: `${service.accent}cc` }}
          >
            {service.label}
          </span>
        </div>

        <h4 className="whitespace-pre-line font-serif text-[18px] italic leading-[1.1] tracking-[-0.015em] text-white md:text-[19px]">
          {service.title}
        </h4>

        <p className="text-[12px] leading-[1.55] text-white/60 md:text-[12.5px]">
          {service.description}
        </p>
      </div>
    </motion.article>
  );
}

export function ValueAdd() {
  const reduceMotion = useSafeReducedMotion();
  const reduce = reduceMotion === true;

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-background)] py-14 md:py-16 lg:py-12">
      <SectionDivider />
      <div className="container relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12 lg:mb-12">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-px w-10 bg-[var(--color-electric-cyan)]/60"
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.42em] text-[var(--color-electric-cyan)]/80 md:text-[11px]">
                Core Capabilities
              </span>
            </div>
            <h3
              className="font-serif text-[30px] leading-[1.05] tracking-[-0.015em] text-white md:text-[40px] lg:text-[44px] xl:text-[48px]"
              style={{ fontStyle: "normal" }}
            >
              What Aurexis <br className="hidden md:block" />
              <span className="text-white/30">actually builds.</span>
            </h3>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
            className="max-w-xs text-[13.5px] leading-[1.6] text-white/55 md:text-right md:text-[14px]"
          >
            Three disciplines. One aim — architecture that compounds in your
            favour.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {services.map((service, i) => (
            <ServiceCard
              key={service.index}
              service={service}
              index={i}
              reduce={reduce}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
