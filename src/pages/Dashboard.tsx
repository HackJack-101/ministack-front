import { useNavigate } from "react-router-dom";
import { Database, Table, MessageSquare, Bell, Lock, RefreshCw, Zap, Shield } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useState } from "react";
import { pluralize } from "../utils/format";

const services = [
  {
    name: "IAM",
    label: "Identity & Access",
    path: "/iam",
    icon: Shield,
    accent: "text-purple-600",
    iconBg: "bg-purple-600/10",
    countUnit: (n: number) => pluralize(n, "user"),
    countKey: "iam" as const,
  },
  {
    name: "S3",
    label: "Object Storage",
    path: "/s3",
    icon: Database,
    accent: "text-blue-500",
    iconBg: "bg-blue-500/10",
    countUnit: (n: number) => pluralize(n, "bucket"),
    countKey: "s3" as const,
  },
  {
    name: "Lambda",
    label: "Serverless Functions",
    path: "/lambda",
    icon: Zap,
    accent: "text-amber-500",
    iconBg: "bg-amber-500/10",
    countUnit: (n: number) => pluralize(n, "function"),
    countKey: "lambda" as const,
  },
  {
    name: "DynamoDB",
    label: "NoSQL Database",
    path: "/dynamodb",
    icon: Table,
    accent: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    countUnit: (n: number) => pluralize(n, "table"),
    countKey: "dynamoDB" as const,
  },
  {
    name: "SQS",
    label: "Message Queue",
    path: "/sqs",
    icon: MessageSquare,
    accent: "text-orange-500",
    iconBg: "bg-orange-500/10",
    countUnit: (n: number) => pluralize(n, "queue"),
    countKey: "sqs" as const,
  },
  {
    name: "SNS",
    label: "Pub/Sub Topics",
    path: "/sns",
    icon: Bell,
    accent: "text-rose-500",
    iconBg: "bg-rose-500/10",
    countUnit: (n: number) => pluralize(n, "topic"),
    countKey: "sns" as const,
  },
  {
    name: "Secrets Manager",
    label: "Secret Storage",
    path: "/secrets-manager",
    icon: Lock,
    accent: "text-purple-500",
    iconBg: "bg-purple-500/10",
    countUnit: (n: number) => pluralize(n, "secret"),
    countKey: "secrets" as const,
  },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const counts = useDashboard();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Overview</h1>
          <p className="text-xs text-text-muted mt-0.5">Local AWS emulator · 7 services</p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          title="Refresh counts"
          aria-label="Refresh counts"
          key={refreshKey}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
              <th className="px-4 py-2.5 font-medium text-text-muted text-left">Service</th>
              <th className="px-4 py-2.5 font-medium text-text-muted text-left">Type</th>
              <th className="px-4 py-2.5 font-medium text-text-muted text-left">Resources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {services.map(({ name, label, path, icon: Icon, accent, iconBg, countUnit, countKey }) => (
              <tr
                key={path}
                onClick={() => navigate(path)}
                className="hover:bg-surface-hover transition-colors cursor-pointer group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded transition-colors ${iconBg} group-hover:bg-surface-elevated`}>
                      <Icon className={`w-3.5 h-3.5 ${accent}`} />
                    </div>
                    <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                      {name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">{label}</td>
                <td className="px-4 py-3">
                  {counts.loading ? (
                    <div className="h-3 w-16 bg-surface-skeleton rounded animate-pulse" />
                  ) : (
                    <span className="text-sm text-text-secondary">{countUnit(counts[countKey])}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-1">
        <a
          href="https://github.com/Nahuel990/ministack"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-text-faint hover:text-text-muted transition-colors"
        >
          Ministack project
        </a>
        <span className="text-xs text-text-faint font-mono">v0.1.0</span>
      </div>
    </div>
  );
};
