import { ShieldCheck, Circle } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

export const TopBar = () => (
  <header className="fixed top-0 left-0 right-0 h-12 z-40 bg-surface-card border-b border-border-subtle flex items-center px-4 gap-4">
    {/* Logo */}
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="p-1 bg-surface-elevated rounded">
        <ShieldCheck className="w-4 h-4 text-text-secondary" />
      </div>
      <span className="text-sm font-semibold text-text-primary tracking-tight">Ministack</span>
    </div>

    <div className="flex-1" />

    {/* Right side */}
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Circle className="w-1.5 h-1.5 text-emerald-500 fill-emerald-500" />
          <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-40" />
        </div>
        <code className="text-[11px] text-text-muted font-mono">localhost:4566</code>
      </div>
      <div className="h-4 w-px bg-border-subtle" />
      <ThemeToggle />
    </div>
  </header>
);
