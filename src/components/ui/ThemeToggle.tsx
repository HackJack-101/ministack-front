import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import type { Theme } from "../../hooks/useTheme";

const icons: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };
const next: Record<Theme, Theme> = { dark: "light", light: "system", system: "dark" };
const labels: Record<Theme, string> = { dark: "Dark mode", light: "Light mode", system: "System theme" };

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];

  return (
    <button
      onClick={() => setTheme(next[theme])}
      className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
      title={labels[theme]}
      aria-label={labels[theme]}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};
