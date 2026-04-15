import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Palette } from "lucide-react";
import { serviceTokens } from "../../design-system/serviceTokens";

const navItems = Object.values(serviceTokens);

export const Sidebar = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<{ name: string; top: number } | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close tooltip on scroll
  useEffect(() => {
    const handleScroll = () => setHoveredItem(null);
    const nav = navRef.current;
    if (nav) {
      nav.addEventListener("scroll", handleScroll);
      return () => nav.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-12 left-0 bottom-0 w-12 z-30 bg-surface-card border-r border-border-subtle flex flex-col py-2 overflow-y-auto scrollbar-hide"
    >
      <ul className="flex flex-col gap-0.5 px-1.5 pb-4">
        {navItems.map(({ label: name, path, icon: Icon, iconColor: accent, iconBg: activeBg }) => {
          const isActive = path === "/" ? location.pathname === "/" : (location.pathname + "/").startsWith(path + "/");
          return (
            <li
              key={path}
              className="relative group"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({ name, top: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                to={path}
                className={`flex items-center justify-center w-9 h-9 rounded transition-colors duration-150 ${
                  isActive
                    ? `${activeBg} ${accent}`
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-hover"
                }`}
                aria-label={name}
              >
                {isActive && (
                  <span
                    className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-current ${accent}`}
                  />
                )}
                <Icon className="w-4 h-4" />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mx-3 my-2 border-t border-border-subtle" />

      <ul className="flex flex-col gap-0.5 px-1.5 pb-20">
        <li
          className="relative group"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredItem({ name: "Design System", top: rect.top + rect.height / 2 });
          }}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            to="/design-system"
            className={`flex items-center justify-center w-9 h-9 rounded transition-colors duration-150 ${
              (location.pathname + "/").startsWith("/design-system/")
                ? "bg-indigo-600/10 text-indigo-600"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-hover"
            }`}
            aria-label="Design System"
          >
            {(location.pathname + "/").startsWith("/design-system/") && (
              <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-current" />
            )}
            <Palette className="w-4 h-4" />
          </Link>
        </li>
      </ul>
      {hoveredItem &&
        createPortal(
          <div
            style={{
              top: hoveredItem.top,
              left: "48px",
            }}
            className="fixed -translate-y-1/2 ml-2 px-2 py-1 bg-surface-elevated border border-border-default rounded text-xs text-text-primary whitespace-nowrap pointer-events-none z-[100] shadow-md transition-opacity duration-150"
          >
            {hoveredItem.name}
          </div>,
          document.body,
        )}
    </nav>
  );
};
