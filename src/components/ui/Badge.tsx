import type { ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "mono"
  | "purple"
  | "amber"
  | "orange"
  | "rose"
  | "blue"
  | "emerald"
  | "sky"
  | "teal"
  | "pink"
  | "cyan"
  | "indigo";

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
  info: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
  mono: "bg-surface-elevated text-text-secondary border-border-default font-mono",
  purple: "bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400",
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  orange: "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400",
  rose: "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400",
  blue: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  sky: "bg-sky-500/10 text-sky-600 border-sky-500/30 dark:text-sky-400",
  teal: "bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400",
  pink: "bg-pink-500/10 text-pink-600 border-pink-500/30 dark:text-pink-400",
  cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:text-cyan-400",
  indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:text-indigo-400",
};

export const Badge = ({ children, variant = "default", className = "" }: BadgeProps) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-[10px] border rounded uppercase tracking-wider font-semibold shadow-sm transition-colors ${variantMap[variant]} ${className}`}
  >
    {children}
  </span>
);
