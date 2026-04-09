import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Database,
  Table,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: <LayoutDashboard className="w-4 h-4" />,
    accentColor: "bg-purple-500",
    activeBg: "bg-purple-500/[0.08]",
    activeText: "text-purple-300",
    activeIcon: "text-purple-400",
  },
  {
    name: "S3",
    path: "/s3",
    icon: <Database className="w-4 h-4" />,
    accentColor: "bg-blue-500",
    activeBg: "bg-blue-500/[0.08]",
    activeText: "text-blue-300",
    activeIcon: "text-blue-400",
  },
  {
    name: "DynamoDB",
    path: "/dynamodb",
    icon: <Table className="w-4 h-4" />,
    accentColor: "bg-emerald-500",
    activeBg: "bg-emerald-500/[0.08]",
    activeText: "text-emerald-300",
    activeIcon: "text-emerald-400",
  },
  {
    name: "SQS",
    path: "/sqs",
    icon: <MessageSquare className="w-4 h-4" />,
    accentColor: "bg-orange-500",
    activeBg: "bg-orange-500/[0.08]",
    activeText: "text-orange-300",
    activeIcon: "text-orange-400",
  },
  {
    name: "SNS",
    path: "/sns",
    icon: <Bell className="w-4 h-4" />,
    accentColor: "bg-rose-500",
    activeBg: "bg-rose-500/[0.08]",
    activeText: "text-rose-300",
    activeIcon: "text-rose-400",
  },
  {
    name: "Secrets Manager",
    path: "/secrets-manager",
    icon: <Lock className="w-4 h-4" />,
    accentColor: "bg-purple-500",
    activeBg: "bg-purple-500/[0.08]",
    activeText: "text-purple-300",
    activeIcon: "text-purple-400",
  },
];

const Navigation = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => {
  const location = useLocation();

  return (
    <nav
      className={`bg-[#0D0E12] text-white min-h-screen border-r border-white/[0.05] flex-shrink-0 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`border-b border-white/[0.05] flex items-center ${collapsed ? "px-4 py-6 justify-center" : "px-6 py-8"}`}
      >
        {collapsed ? (
          <div className="p-1.5 bg-white/5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white/70" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-wider uppercase text-white/90 block leading-tight">
                Ministack
              </span>
              <p className="text-[10px] text-white/30 tracking-widest uppercase mt-0.5">Local AWS Emulator</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 px-2 py-5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] px-3 mb-3 font-semibold">Services</p>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`relative flex items-center gap-3 py-2.5 text-[13px] font-medium transition-all duration-200 rounded-lg group ${
                    collapsed ? "px-3 justify-center" : "px-3"
                  } ${
                    isActive
                      ? `${item.activeBg} ${item.activeText}`
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Active left-bar indicator */}
                  {isActive && (
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${item.accentColor}`}
                    />
                  )}
                  <span
                    className={`transition-all duration-200 group-hover:scale-110 ${
                      isActive ? item.activeIcon : "text-white/30 group-hover:text-white/60"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-white/[0.05] bg-black/10">
        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-4 py-3 text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200 ${
            collapsed ? "justify-center" : "justify-end"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {!collapsed && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-white/[0.04]">
            <p className="text-[10px] text-white/25 font-medium tracking-wider uppercase">v0.1.0</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-white/30 font-mono tracking-tighter">4566</p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#07080A] text-gray-100">
      <Navigation collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 overflow-auto dot-grid">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};
