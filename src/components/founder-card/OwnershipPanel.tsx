import { ShieldCheck } from "lucide-react";

export function OwnershipPanel() {
  return (
    <section className="fc-ownership-panel" aria-labelledby="ownership-title">
      <ShieldCheck aria-hidden className="fc-ownership-icon" strokeWidth={1.4} />
      <div>
        <h2 id="ownership-title" className="fc-ownership-title">
          Your systems, accounts and data remain yours.
        </h2>
        <p className="fc-ownership-copy">
          Built around business outcomes. Supported from assessment through ongoing improvement.
        </p>
      </div>
    </section>
  );
}
