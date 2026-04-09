import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Trash2 } from "lucide-react";

interface ResourceCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  hoverBorder: string;
  hoverBg: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  deleteLabel?: string;
}

export const ResourceCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  hoverBorder,
  hoverBg,
  title,
  subtitle,
  badge,
  onClick,
  onDelete,
  deleteLabel = "Delete",
}: ResourceCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-surface-card p-4 rounded-card border border-border-subtle ${hoverBorder} ${hoverBg} cursor-pointer transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className={`p-2 rounded ${iconBg} flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <div className="overflow-hidden min-w-0">
            <h3 className="font-medium text-text-primary text-sm truncate">{title}</h3>
            {subtitle && <p className="text-xs text-text-muted mt-0.5 truncate font-mono">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {badge}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
              title={deleteLabel}
              aria-label={deleteLabel}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
