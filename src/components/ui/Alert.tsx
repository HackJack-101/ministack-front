import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  message: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

const config: Record<
  AlertType,
  { bg: string; border: string; text: string; Icon: typeof CheckCircle2; iconColor: string }
> = {
  success: {
    bg: "bg-emerald-500/10",
    border: "border border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border border-red-500/20",
    text: "text-red-600 dark:text-red-400",
    Icon: AlertCircle,
    iconColor: "text-red-500",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    Icon: Info,
    iconColor: "text-blue-500",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border border-yellow-500/20",
    text: "text-yellow-600 dark:text-yellow-400",
    Icon: AlertTriangle,
    iconColor: "text-yellow-500",
  },
};

export const Alert = ({ type, message, onDismiss, autoDismissMs }: AlertProps) => {
  useEffect(() => {
    if (autoDismissMs && onDismiss) {
      const t = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(t);
    }
  }, [autoDismissMs, onDismiss]);

  const { bg, border, text, Icon, iconColor } = config[type];

  return (
    <div
      className={`py-3 px-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 rounded-card shadow-lg ${bg} ${border} ${text}`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
      <p className="text-[13px] font-medium flex-1 leading-tight">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:bg-surface-active p-1 rounded transition-colors ml-1"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
