export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="fc-section-label">
      <span>{children}</span>
      <i aria-hidden />
    </p>
  );
}
