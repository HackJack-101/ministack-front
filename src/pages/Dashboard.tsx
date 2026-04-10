import { useNavigate } from "react-router-dom";
import {
  Database,
  Table,
  MessageSquare,
  Bell,
  Lock,
  RefreshCw,
  Zap,
  Shield,
  FileText,
  Settings,
  Mail,
  Activity,
  Key,
  RotateCcw,
  Globe,
  Layers2,
  Box,
  Cpu,
  BadgeCheck,
  ShieldCheck,
  Waves,
  GitMerge,
  Users,
  HardDrive,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useState } from "react";
import { pluralize } from "../utils/format";
import { useToast } from "../hooks/useToast";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { useHealth } from "../hooks/useHealth";

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
    icon: HardDrive,
    accent: "text-blue-500",
    iconBg: "bg-blue-500/10",
    countUnit: (n: number) => pluralize(n, "bucket"),
    countKey: "s3" as const,
  },
  {
    name: "EC2",
    label: "Compute Instances",
    path: "/ec2",
    icon: Cpu,
    accent: "text-orange-600",
    iconBg: "bg-orange-600/10",
    countUnit: (n: number) => pluralize(n, "instance"),
    countKey: "ec2" as const,
  },
  {
    name: "RDS",
    label: "Relational Database",
    path: "/rds",
    icon: Database,
    accent: "text-blue-600",
    iconBg: "bg-blue-600/10",
    countUnit: (n: number) => pluralize(n, "instance"),
    countKey: "rds" as const,
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
    name: "ECS",
    label: "Container Service",
    path: "/ecs",
    icon: Box,
    accent: "text-orange-500",
    iconBg: "bg-orange-500/10",
    countUnit: (n: number) => pluralize(n, "cluster"),
    countKey: "ecs" as const,
  },
  {
    name: "CloudFormation",
    label: "Infrastructure as Code",
    path: "/cloudformation",
    icon: Layers2,
    accent: "text-pink-600",
    iconBg: "bg-pink-600/10",
    countUnit: (n: number) => pluralize(n, "stack"),
    countKey: "cloudformation" as const,
  },
  {
    name: "Step Functions",
    label: "Workflow Orchestration",
    path: "/states",
    icon: GitMerge,
    accent: "text-rose-600",
    iconBg: "bg-rose-600/10",
    countUnit: (n: number) => pluralize(n, "state machine"),
    countKey: "sfn" as const,
  },
  {
    name: "ACM",
    label: "Certificate Manager",
    path: "/acm",
    icon: BadgeCheck,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-600/10",
    countUnit: (n: number) => pluralize(n, "certificate"),
    countKey: "acm" as const,
  },
  {
    name: "WAFv2",
    label: "Web Application Firewall",
    path: "/wafv2",
    icon: ShieldCheck,
    accent: "text-rose-500",
    iconBg: "bg-rose-500/10",
    countUnit: (n: number) => pluralize(n, "web acl"),
    countKey: "wafv2" as const,
  },
  {
    name: "Cognito",
    label: "User Identity",
    path: "/cognito",
    icon: Users,
    accent: "text-indigo-600",
    iconBg: "bg-indigo-600/10",
    countUnit: (n: number) => pluralize(n, "user pool"),
    countKey: "cognito" as const,
  },
  {
    name: "Kinesis",
    label: "Real-time Streams",
    path: "/kinesis",
    icon: Waves,
    accent: "text-blue-400",
    iconBg: "bg-blue-400/10",
    countUnit: (n: number) => pluralize(n, "stream"),
    countKey: "kinesis" as const,
  },
  {
    name: "CloudWatch Logs",
    label: "Application Logs",
    path: "/logs",
    icon: FileText,
    accent: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    countUnit: (n: number) => pluralize(n, "log group"),
    countKey: "logs" as const,
  },
  {
    name: "Parameter Store",
    label: "Configuration & Secrets",
    path: "/ssm",
    icon: Settings,
    accent: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    countUnit: (n: number) => pluralize(n, "parameter"),
    countKey: "ssm" as const,
  },
  {
    name: "KMS",
    label: "Key Management",
    path: "/kms",
    icon: Key,
    accent: "text-amber-600",
    iconBg: "bg-amber-600/10",
    countUnit: (n: number) => pluralize(n, "key"),
    countKey: "kms" as const,
  },
  {
    name: "SES",
    label: "Email Service",
    path: "/ses",
    icon: Mail,
    accent: "text-pink-500",
    iconBg: "bg-pink-500/10",
    countUnit: (n: number) => pluralize(n, "identity"),
    countKey: "ses" as const,
  },
  {
    name: "EventBridge",
    label: "Event Bus",
    path: "/eventbridge",
    icon: Activity,
    accent: "text-teal-500",
    iconBg: "bg-teal-500/10",
    countUnit: (n: number) => pluralize(n, "bus"),
    countKey: "events" as const,
  },
  {
    name: "Route 53",
    label: "DNS & Domains",
    path: "/route53",
    icon: Globe,
    accent: "text-sky-500",
    iconBg: "bg-sky-500/10",
    countUnit: (n: number) => pluralize(n, "zone"),
    countKey: "route53" as const,
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
  const { version } = useHealth();
  const toast = useToast();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    confirm({
      title: "Reset all services?",
      description: "This will wipe every service back to empty. This action cannot be undone.",
      confirmLabel: "Reset Everything",
      action: async () => {
        setResetting(true);
        try {
          // Use relative URL to leverage proxy and avoid CORS
          const response = await fetch("/_ministack/reset", { method: "POST" });
          if (response.ok) {
            toast.success("All services reset successfully");
            setRefreshKey((k) => k + 1);
            window.location.reload();
          } else {
            toast.error("Failed to reset services");
          }
        } catch {
          toast.error("Failed to connect to Ministack");
        } finally {
          setResetting(false);
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Overview</h1>
          <p className="text-xs text-text-muted mt-0.5">Local AWS emulator · {services.length} services</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
            title="Wipe all data"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            Reset State
          </button>
          <div className="w-px h-4 bg-border-subtle mx-1" />
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
        {version && <span className="text-xs text-text-faint font-mono">v{version}</span>}
      </div>

      {ConfirmModalComponent}
    </div>
  );
};
