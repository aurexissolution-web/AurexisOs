"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";
import { SectionDivider } from "@/components/ui/section-divider";

const problems = [
  {
    number: "01",
    category: "Leads",
    title: "Messages go missing",
    body: "A message on WhatsApp, a form on the website, a DM on Instagram, a call you couldn't take. Nobody follows up on Tuesday and the job goes to someone else.",
    image: "/images/problem-01.jpg",
  },
  {
    number: "02",
    category: "Daily Work",
    title: "Everything lives in your head",
    body: "Job sheets, prices, who's been paid, what's still owed. It works — until you're on site, or sick, or someone else needs to know.",
    image: "/images/problem-02.jpg",
  },
  {
    number: "03",
    category: "Money",
    title: "You find out too late",
    body: "Which job actually made money? Who still owes you? You'll know at year end, when your accountant finally tells you.",
    image: "/images/problem-03.jpg",
  },
];

export function TheShift() {
  const reduce = useSafeReducedMotion();

  return (
    <section className="relative bg-[var(--color-background)] py-16 px-6 md:py-20">
      <SectionDivider />
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          className="mx-auto max-w-6xl text-center mb-10 lg:mb-8"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reduce ? 0 : 0.5 }}
        >
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40 mb-5">
            When The Business Outgrows The Notebook
          </span>
          <h2 className="text-3xl md:text-5xl xl:text-[56px] font-extrabold tracking-[-0.02em] leading-[1.05] text-white">
            <span className="lg:whitespace-nowrap">
              Your business grew. The way you run it{" "}
              <em
                className="font-serif italic text-[var(--color-electric-cyan)] font-normal whitespace-nowrap"
                style={{ filter: "drop-shadow(0 0 18px rgba(0,240,255,0.32))" }}
              >
                didn&rsquo;t
              </em>
              .
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:divide-x lg:divide-white/[0.06]">
          {problems.map((item, i) => (
            <motion.article
              key={item.number}
              className="px-0 py-8 lg:px-8 lg:py-0 border-b border-white/[0.06] lg:border-b-0 last:border-b-0"
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : i * 0.08, ease: "easeOut" }}
            >
              <div className="relative mb-6 aspect-[4/5] w-full overflow-hidden rounded-2xl lg:mx-auto lg:mb-4 lg:h-[36vh] lg:max-h-[440px] lg:w-auto lg:max-w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  style={{ filter: "saturate(0.75) hue-rotate(-6deg) brightness(0.94)" }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--color-background)] to-transparent"
                />
              </div>

              <div
                aria-hidden
                className="font-serif italic text-[64px] md:text-[88px] lg:text-[56px] leading-none text-white/[0.08] mb-3 select-none lg:mb-1"
              >
                {item.number}
              </div>

              <motion.div
                aria-hidden
                className="h-px w-10 origin-left bg-[var(--color-electric-cyan)]/60 mb-4 lg:mb-2"
                initial={{ scaleX: reduce ? 1 : 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: reduce ? 0 : 0.5,
                  delay: reduce ? 0 : i * 0.08 + 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55 mb-4 lg:mb-2">
                {item.category}
              </div>

              <h3 className="font-serif italic text-[18px] md:text-[20px] leading-snug text-white mb-4 lg:mb-2">
                {item.title}
              </h3>

              <p className="text-[15px] leading-[1.6] text-white/70 max-w-md text-pretty lg:text-[13.5px] lg:leading-[1.5]">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.p
          className="mx-auto max-w-none text-center mt-10 lg:mt-6 text-base md:text-lg xl:text-xl lg:whitespace-nowrap text-white/65 leading-relaxed text-balance"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reduce ? 0 : 0.5 }}
        >
          More apps won&rsquo;t fix it.{" "}
          <em
            className="font-serif italic text-[var(--color-electric-cyan)] font-normal whitespace-nowrap"
            style={{ filter: "drop-shadow(0 0 14px rgba(0,240,255,0.28))" }}
          >
            One system will.
          </em>
        </motion.p>
      </div>
    </section>
  );
}
