import type { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "ghost"
  | "outline"
  | "purple"
  | "rose"
  | "cyan"
  | "indigo"
  | "teal"
  | "pink"
  | "amber"
  | "emerald"
  | "sky";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-500 text-white border-blue-500/30",
  secondary: "bg-purple-600 hover:bg-purple-500 text-white border-purple-500/30",
  success: "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30",
  danger: "bg-red-600 hover:bg-red-500 text-white border-red-500/30",
  warning: "bg-amber-600 hover:bg-amber-500 text-white border-amber-500/30",
  purple: "bg-purple-600 hover:bg-purple-500 text-white border-purple-500/30",
  rose: "bg-rose-600 hover:bg-rose-500 text-white border-rose-500/30",
  cyan: "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500/30",
  indigo: "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30",
  teal: "bg-teal-600 hover:bg-teal-500 text-white border-teal-500/30",
  pink: "bg-pink-600 hover:bg-pink-500 text-white border-pink-500/30",
  amber: "bg-amber-600 hover:bg-amber-500 text-white border-amber-500/30",
  emerald: "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30",
  sky: "bg-sky-600 hover:bg-sky-500 text-white border-sky-500/30",
  ghost:
    "bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary border-transparent",
  outline:
    "bg-transparent border-border-default hover:bg-surface-hover text-text-secondary hover:text-text-primary",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-[11px] gap-1.5 rounded",
  sm: "px-3 py-1.5 text-[12px] gap-1.5 rounded",
  md: "px-3.5 py-2 text-[13px] gap-2 rounded-btn",
  lg: "px-5 py-2.5 text-[14px] gap-2 rounded-btn",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        relative inline-flex items-center justify-center font-medium transition-colors
        disabled:opacity-50 disabled:pointer-events-none
        border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin absolute" />}
      <div className={`flex items-center gap-[inherit] ${isLoading ? "opacity-0" : "opacity-100"}`}>
        {leftIcon}
        {children}
        {rightIcon}
      </div>
    </button>
  );
};
