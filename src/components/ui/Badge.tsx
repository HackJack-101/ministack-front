import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "mono";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-text-secondary border-border-default",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400",
  error: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400",
  mono: "bg-surface-elevated text-text-secondary border-border-default font-mono",
};

export const Badge = ({ children, variant = "default", className = "" }: BadgeProps) => (
  <span
    className={`inline-flex items-center px-1.5 py-0.5 text-[10px] border rounded uppercase tracking-wider font-medium ${variantMap[variant]} ${className}`}
  >
    {children}
  </span>
);
