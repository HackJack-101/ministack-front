import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, Table, MessageSquare, Bell, Lock, Zap, Shield } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, accent: "text-purple-500", activeBg: "bg-purple-500/10" },
  { name: "IAM", path: "/iam", icon: Shield, accent: "text-purple-600", activeBg: "bg-purple-600/10" },
  { name: "S3", path: "/s3", icon: Database, accent: "text-blue-500", activeBg: "bg-blue-500/10" },
  { name: "Lambda", path: "/lambda", icon: Zap, accent: "text-amber-500", activeBg: "bg-amber-500/10" },
  { name: "DynamoDB", path: "/dynamodb", icon: Table, accent: "text-emerald-500", activeBg: "bg-emerald-500/10" },
  { name: "SQS", path: "/sqs", icon: MessageSquare, accent: "text-orange-500", activeBg: "bg-orange-500/10" },
  { name: "SNS", path: "/sns", icon: Bell, accent: "text-rose-500", activeBg: "bg-rose-500/10" },
  { name: "Secrets Manager", path: "/secrets-manager", icon: Lock, accent: "text-purple-500", activeBg: "bg-purple-500/10" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-12 left-0 bottom-0 w-12 z-30 bg-surface-card border-r border-border-subtle flex flex-col py-2">
      <ul className="flex flex-col gap-0.5 px-1.5">
        {navItems.map(({ name, path, icon: Icon, accent, activeBg }) => {
          const isActive = location.pathname === path;
          return (
            <li key={path} className="relative group">
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
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full ${accent.replace("text-", "bg-")}`} />
                )}
                <Icon className="w-4 h-4" />
              </Link>
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-surface-elevated border border-border-default rounded text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-sm">
                {name}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
