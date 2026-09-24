import { CAPABILITIES } from "@/data/founder-cards";
import { SectionLabel } from "./SectionLabel";
import { Search, Workflow, ChartNoAxesCombined, ChevronRight } from "lucide-react";

const icons = [Search, Workflow, ChartNoAxesCombined] as const;

export function Capabilities() {
  return (
    <section aria-label="Capabilities">
      <SectionLabel>What I Help Businesses Build</SectionLabel>
      <div className="fc-capability-grid">
        {CAPABILITIES.map((capability, index) => {
          const Icon = icons[index];
          return (
            <article key={capability.name} className="fc-capability-item">
              <Icon aria-hidden className="fc-capability-icon" strokeWidth={1.55} />
              <div className="min-w-0">
                <h2 className="fc-capability-title">{capability.name}</h2>
                <p className="fc-capability-copy">{capability.body}</p>
              </div>
              <ChevronRight aria-hidden className="fc-capability-arrow" strokeWidth={1.5} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
