import {
  LayoutDashboard,
  Database,
  Table,
  MessageSquare,
  Bell,
  Lock,
  Zap,
  Shield,
  FileText,
  Settings,
  Mail,
  Activity,
  Key,
  Globe,
  HardDrive,
  Cpu,
  Box,
  Layers2,
  GitMerge,
  Waves,
  BadgeCheck,
  ShieldCheck,
  Users,
  BarChart3,
  Globe2,
  Network,
  Scale,
  Cloud,
  Flame,
  Package,
  Sparkles,
  Map,
  TrendingUp,
  Hammer,
  SlidersHorizontal,
  Combine,
  Search,
  Folder,
  Server,
  Layers,
  FolderSync,
  CalendarClock,
  SearchCode,
  type LucideIcon,
} from "lucide-react";
import type { ButtonVariant } from "../components/ui/Button";
import type { BadgeVariant } from "../components/ui/Badge";

export type ServiceKey =
  | "dashboard"
  | "iam"
  | "lambda"
  | "ec2"
  | "ecs"
  | "stepFunctions"
  | "s3"
  | "dynamodb"
  | "rds"
  | "route53"
  | "acm"
  | "wafv2"
  | "sqs"
  | "sns"
  | "eventbridge"
  | "ses"
  | "kms"
  | "secretsManager"
  | "cognito"
  | "cloudformation"
  | "cloudwatchLogs"
  | "parameterStore"
  | "kinesis"
  | "cloudwatchMetrics"
  | "apiGatewayV2"
  | "apiGatewayV1"
  | "elbv2"
  | "cloudfront"
  | "elasticache"
  | "firehose"
  | "ecr"
  | "appsync"
  | "cloudMap"
  | "autoScaling"
  | "codeBuild"
  | "appConfig"
  | "glue"
  | "athena"
  | "efs"
  | "emr"
  | "eks"
  | "transferFamily"
  | "scheduler"
  | "openSearch";

export interface ServiceToken {
  label: string;
  path: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  buttonVariant: ButtonVariant;
  badgeVariant: BadgeVariant;
  focusRing: string;
  category:
    | "core"
    | "compute"
    | "storage"
    | "database"
    | "network"
    | "appIntegration"
    | "security"
    | "management"
    | "streaming"
    | "developer";
}

export const serviceTokens: Record<ServiceKey, ServiceToken> = {
  dashboard: {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    buttonVariant: "purple",
    badgeVariant: "purple",
    focusRing: "focus:border-purple-500/60",
    category: "core",
  },
  iam: {
    label: "IAM",
    path: "/iam",
    icon: Shield,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-600/10",
    buttonVariant: "purple",
    badgeVariant: "purple",
    focusRing: "focus:border-purple-600/60",
    category: "core",
  },
  lambda: {
    label: "Lambda",
    path: "/lambda",
    icon: Zap,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    buttonVariant: "amber",
    badgeVariant: "amber",
    focusRing: "focus:border-amber-500/60",
    category: "compute",
  },
  ec2: {
    label: "EC2",
    path: "/ec2",
    icon: Cpu,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-600/10",
    buttonVariant: "orange",
    badgeVariant: "orange",
    focusRing: "focus:border-orange-600/60",
    category: "compute",
  },
  ecs: {
    label: "ECS",
    path: "/ecs",
    icon: Box,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    buttonVariant: "orange",
    badgeVariant: "orange",
    focusRing: "focus:border-orange-500/60",
    category: "compute",
  },
  stepFunctions: {
    label: "Step Functions",
    path: "/states",
    icon: GitMerge,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-600/10",
    buttonVariant: "rose",
    badgeVariant: "rose",
    focusRing: "focus:border-rose-600/60",
    category: "compute",
  },
  s3: {
    label: "S3",
    path: "/s3",
    icon: HardDrive,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    buttonVariant: "blue",
    badgeVariant: "blue",
    focusRing: "focus:border-blue-500/60",
    category: "storage",
  },
  dynamodb: {
    label: "DynamoDB",
    path: "/dynamodb",
    icon: Table,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    buttonVariant: "emerald",
    badgeVariant: "emerald",
    focusRing: "focus:border-emerald-500/60",
    category: "database",
  },
  rds: {
    label: "RDS",
    path: "/rds",
    icon: Database,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-600/10",
    buttonVariant: "primary",
    badgeVariant: "blue",
    focusRing: "focus:border-blue-600/60",
    category: "database",
  },
  route53: {
    label: "Route 53",
    path: "/route53",
    icon: Globe,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/10",
    buttonVariant: "sky",
    badgeVariant: "sky",
    focusRing: "focus:border-sky-500/60",
    category: "network",
  },
  acm: {
    label: "ACM",
    path: "/acm",
    icon: BadgeCheck,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-600/10",
    buttonVariant: "emerald",
    badgeVariant: "emerald",
    focusRing: "focus:border-emerald-600/60",
    category: "network",
  },
  wafv2: {
    label: "WAFv2",
    path: "/wafv2",
    icon: ShieldCheck,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
    buttonVariant: "rose",
    badgeVariant: "rose",
    focusRing: "focus:border-rose-500/60",
    category: "network",
  },
  sqs: {
    label: "SQS",
    path: "/sqs",
    icon: MessageSquare,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    buttonVariant: "orange",
    badgeVariant: "orange",
    focusRing: "focus:border-orange-500/60",
    category: "appIntegration",
  },
  sns: {
    label: "SNS",
    path: "/sns",
    icon: Bell,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
    buttonVariant: "rose",
    badgeVariant: "rose",
    focusRing: "focus:border-rose-500/60",
    category: "appIntegration",
  },
  eventbridge: {
    label: "EventBridge",
    path: "/eventbridge",
    icon: Activity,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    buttonVariant: "teal",
    badgeVariant: "teal",
    focusRing: "focus:border-teal-500/60",
    category: "appIntegration",
  },
  ses: {
    label: "SES",
    path: "/ses",
    icon: Mail,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    buttonVariant: "pink",
    badgeVariant: "pink",
    focusRing: "focus:border-pink-500/60",
    category: "appIntegration",
  },
  kms: {
    label: "KMS",
    path: "/kms",
    icon: Key,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-600/10",
    buttonVariant: "amber",
    badgeVariant: "amber",
    focusRing: "focus:border-amber-600/60",
    category: "security",
  },
  secretsManager: {
    label: "Secrets Manager",
    path: "/secrets-manager",
    icon: Lock,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    buttonVariant: "purple",
    badgeVariant: "purple",
    focusRing: "focus:border-purple-500/60",
    category: "security",
  },
  cognito: {
    label: "Cognito",
    path: "/cognito",
    icon: Users,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-600/10",
    buttonVariant: "indigo",
    badgeVariant: "indigo",
    focusRing: "focus:border-indigo-600/60",
    category: "security",
  },
  cloudformation: {
    label: "CloudFormation",
    path: "/cloudformation",
    icon: Layers2,
    iconColor: "text-pink-600",
    iconBg: "bg-pink-600/10",
    buttonVariant: "pink",
    badgeVariant: "pink",
    focusRing: "focus:border-pink-600/60",
    category: "management",
  },
  cloudwatchLogs: {
    label: "CloudWatch Logs",
    path: "/logs",
    icon: FileText,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    buttonVariant: "cyan",
    badgeVariant: "cyan",
    focusRing: "focus:border-cyan-500/60",
    category: "management",
  },
  parameterStore: {
    label: "Parameter Store",
    path: "/ssm",
    icon: Settings,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    buttonVariant: "indigo",
    badgeVariant: "indigo",
    focusRing: "focus:border-indigo-500/60",
    category: "management",
  },
  kinesis: {
    label: "Kinesis",
    path: "/kinesis",
    icon: Waves,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10",
    buttonVariant: "sky",
    badgeVariant: "blue",
    focusRing: "focus:border-blue-400/60",
    category: "streaming",
  },
  cloudwatchMetrics: {
    label: "CloudWatch Metrics",
    path: "/cloudwatch-metrics",
    icon: BarChart3,
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-600/10",
    buttonVariant: "cyan",
    badgeVariant: "cyan",
    focusRing: "focus:border-cyan-600/60",
    category: "management",
  },
  apiGatewayV2: {
    label: "API Gateway v2",
    path: "/apigw-v2",
    icon: Globe2,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    buttonVariant: "purple",
    badgeVariant: "purple",
    focusRing: "focus:border-violet-500/60",
    category: "network",
  },
  apiGatewayV1: {
    label: "API Gateway v1",
    path: "/apigw-v1",
    icon: Network,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-600/10",
    buttonVariant: "purple",
    badgeVariant: "purple",
    focusRing: "focus:border-violet-600/60",
    category: "network",
  },
  elbv2: {
    label: "ELBv2 / ALB",
    path: "/elbv2",
    icon: Scale,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    buttonVariant: "teal",
    badgeVariant: "teal",
    focusRing: "focus:border-green-500/60",
    category: "network",
  },
  cloudfront: {
    label: "CloudFront",
    path: "/cloudfront",
    icon: Cloud,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-600/10",
    buttonVariant: "sky",
    badgeVariant: "sky",
    focusRing: "focus:border-sky-600/60",
    category: "network",
  },
  elasticache: {
    label: "ElastiCache",
    path: "/elasticache",
    icon: Database,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    buttonVariant: "rose",
    badgeVariant: "rose",
    focusRing: "focus:border-red-500/60",
    category: "database",
  },
  firehose: {
    label: "Firehose",
    path: "/firehose",
    icon: Flame,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/10",
    buttonVariant: "orange",
    badgeVariant: "orange",
    focusRing: "focus:border-orange-400/60",
    category: "streaming",
  },
  ecr: {
    label: "ECR",
    path: "/ecr",
    icon: Package,
    iconColor: "text-orange-700",
    iconBg: "bg-orange-700/10",
    buttonVariant: "orange",
    badgeVariant: "orange",
    focusRing: "focus:border-orange-700/60",
    category: "compute",
  },
  appsync: {
    label: "AppSync",
    path: "/appsync",
    icon: Sparkles,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-400/10",
    buttonVariant: "purple",
    badgeVariant: "purple",
    focusRing: "focus:border-purple-400/60",
    category: "appIntegration",
  },
  cloudMap: {
    label: "Cloud Map",
    path: "/cloud-map",
    icon: Map,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-600/10",
    buttonVariant: "teal",
    badgeVariant: "teal",
    focusRing: "focus:border-teal-600/60",
    category: "network",
  },
  autoScaling: {
    label: "AutoScaling",
    path: "/autoscaling",
    icon: TrendingUp,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
    buttonVariant: "amber",
    badgeVariant: "amber",
    focusRing: "focus:border-amber-400/60",
    category: "compute",
  },
  codeBuild: {
    label: "CodeBuild",
    path: "/codebuild",
    icon: Hammer,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    buttonVariant: "emerald",
    badgeVariant: "emerald",
    focusRing: "focus:border-emerald-500/60",
    category: "developer",
  },
  appConfig: {
    label: "AppConfig",
    path: "/appconfig",
    icon: SlidersHorizontal,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-400/10",
    buttonVariant: "indigo",
    badgeVariant: "indigo",
    focusRing: "focus:border-indigo-400/60",
    category: "management",
  },
  glue: {
    label: "Glue",
    path: "/glue",
    icon: Combine,
    iconColor: "text-teal-700",
    iconBg: "bg-teal-700/10",
    buttonVariant: "teal",
    badgeVariant: "teal",
    focusRing: "focus:border-teal-700/60",
    category: "developer",
  },
  athena: {
    label: "Athena",
    path: "/athena",
    icon: Search,
    iconColor: "text-cyan-700",
    iconBg: "bg-cyan-700/10",
    buttonVariant: "cyan",
    badgeVariant: "cyan",
    focusRing: "focus:border-cyan-700/60",
    category: "developer",
  },
  efs: {
    label: "EFS",
    path: "/efs",
    icon: Folder,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    buttonVariant: "indigo",
    badgeVariant: "indigo",
    focusRing: "focus:border-violet-500/60",
    category: "storage",
  },
  emr: {
    label: "EMR",
    path: "/emr",
    icon: Server,
    iconColor: "text-amber-700",
    iconBg: "bg-amber-700/10",
    buttonVariant: "amber",
    badgeVariant: "amber",
    focusRing: "focus:border-amber-700/60",
    category: "compute",
  },
  eks: {
    label: "EKS",
    path: "/eks",
    icon: Layers,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/10",
    buttonVariant: "orange",
    badgeVariant: "orange",
    focusRing: "focus:border-orange-400/60",
    category: "compute",
  },
  transferFamily: {
    label: "Transfer Family",
    path: "/transfer-family",
    icon: FolderSync,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-600/10",
    buttonVariant: "sky",
    badgeVariant: "sky",
    focusRing: "focus:border-sky-600/60",
    category: "network",
  },
  scheduler: {
    label: "Scheduler",
    path: "/scheduler",
    icon: CalendarClock,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-600/10",
    buttonVariant: "teal",
    badgeVariant: "teal",
    focusRing: "focus:border-teal-600/60",
    category: "appIntegration",
  },
  openSearch: {
    label: "OpenSearch",
    path: "/opensearch",
    icon: SearchCode,
    iconColor: "text-blue-700",
    iconBg: "bg-blue-700/10",
    buttonVariant: "primary",
    badgeVariant: "blue",
    focusRing: "focus:border-blue-700/60",
    category: "database",
  },
};

export const getServiceToken = (key: ServiceKey) => serviceTokens[key];
