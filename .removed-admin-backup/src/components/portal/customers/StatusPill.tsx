import type { CustomerStatus } from "@/types/portal";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const STATUS_STYLE: Record<CustomerStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  dormant: { label: "Dormant", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  archived: { label: "Archived", color: "rgba(255,255,255,0.40)", bg: "rgba(255,255,255,0.04)" },
};

export function CustomerStatusPill({ status }: { status: CustomerStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: "0.20em",
        textTransform: "uppercase",
        color: s.color,
        background: s.bg,
        borderRadius: 999,
        padding: "3px 9px",
      }}
    >
      <span aria-hidden style={{ width: 5, height: 5, borderRadius: 999, background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
      {s.label}
    </span>
  );
}
