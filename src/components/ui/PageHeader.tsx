import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backButton?: {
    label: string;
    onClick: () => void;
  };
}

export const PageHeader = ({ title, subtitle, actions, backButton }: PageHeaderProps) => {
  return (
    <header className="flex flex-col gap-4 pb-4 border-b border-border-subtle">
      {backButton && (
        <button
          onClick={backButton.onClick}
          className="flex items-center text-xs font-medium text-text-muted hover:text-text-primary transition-colors group w-fit"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          {backButton.label}
        </button>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-semibold text-text-primary">{title}</h1>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </header>
  );
};
