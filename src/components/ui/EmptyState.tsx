import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="py-12 px-6">
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-text-faint mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-text-secondary">{title}</p>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 text-xs text-text-muted hover:text-text-secondary border border-border-subtle hover:border-border-default px-3 py-1.5 rounded transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  </div>
);
