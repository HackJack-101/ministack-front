import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="py-12 px-6">
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-text-faint mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-text-secondary">{title}</p>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
        {action && (
          <div className="mt-3">
            {typeof action === "object" && action !== null && "label" in action && "onClick" in action ? (
              <button
                onClick={(action as { label: string; onClick: () => void }).onClick}
                className="text-xs text-text-muted hover:text-text-secondary border border-border-subtle hover:border-border-default px-3 py-1.5 rounded transition-colors"
              >
                {(action as { label: string; onClick: () => void }).label}
              </button>
            ) : (
              action
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
