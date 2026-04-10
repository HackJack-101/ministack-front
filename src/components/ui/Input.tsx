import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  accentColor?:
    | "purple"
    | "blue"
    | "amber"
    | "emerald"
    | "orange"
    | "rose"
    | "cyan"
    | "indigo"
    | "teal"
    | "pink"
    | "sky";
}

const accentColorMap = {
  purple: "focus:border-purple-500/60",
  blue: "focus:border-blue-500/60",
  amber: "focus:border-amber-500/60",
  emerald: "focus:border-emerald-500/60",
  orange: "focus:border-orange-500/60",
  rose: "focus:border-rose-500/60",
  cyan: "focus:border-cyan-500/60",
  indigo: "focus:border-indigo-500/60",
  teal: "focus:border-teal-500/60",
  pink: "focus:border-pink-500/60",
  sky: "focus:border-sky-500/60",
};

export const Input = ({ label, accentColor = "blue", className = "", ...props }: InputProps) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">{label}</label>
      )}
      <input
        className={`w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary placeholder:text-text-faint focus:outline-none ${accentColorMap[accentColor]} transition-colors font-sans text-sm ${className}`}
        {...props}
      />
    </div>
  );
};

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  accentColor?:
    | "purple"
    | "blue"
    | "amber"
    | "emerald"
    | "orange"
    | "rose"
    | "cyan"
    | "indigo"
    | "teal"
    | "pink"
    | "sky";
}

export const TextArea = ({ label, accentColor = "blue", className = "", ...props }: TextAreaProps) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">{label}</label>
      )}
      <textarea
        className={`w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary placeholder:text-text-faint focus:outline-none ${accentColorMap[accentColor]} transition-colors font-mono text-sm resize-none ${className}`}
        {...props}
      />
    </div>
  );
};
