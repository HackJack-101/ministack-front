import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const Section = ({ title, description, children }: SectionProps) => (
  <section className="space-y-4">
    <div className="space-y-1">
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</h2>
      {description && <p className="text-xs text-text-muted">{description}</p>}
    </div>
    <div className="p-6 bg-surface-card border border-border-default rounded-card shadow-sm">{children}</div>
  </section>
);
