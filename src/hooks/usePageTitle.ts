import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_NAMES: Record<string, string> = {
  "/": "Dashboard",
  "/secrets-manager": "Secrets Manager",
  "/s3": "S3",
  "/s3/create": "S3 > Create Bucket",
  "/dynamodb": "DynamoDB",
  "/dynamodb/create": "DynamoDB > Create Table",
  "/sqs": "SQS",
  "/sqs/create": "SQS > Create Queue",
  "/sns": "SNS",
  "/lambda": "Lambda",
  "/lambda/create": "Lambda > Create Function",
  "/logs": "CloudWatch Logs",
  "/ssm": "SSM",
  "/ses": "SES",
  "/eventbridge": "EventBridge",
  "/route53": "Route 53",
  "/kms": "KMS",
  "/iam": "IAM",
  "/iam/policies/create": "IAM > Create Policy",
  "/iam/roles/create": "IAM > Create Role",
  "/cloudformation": "CloudFormation",
  "/ec2": "EC2",
  "/rds": "RDS",
  "/ecs": "ECS",
  "/cognito": "Cognito",
  "/wafv2": "WAFv2",
  "/acm": "ACM",
  "/kinesis": "Kinesis",
  "/states": "Step Functions",
  "/design-system": "Design System",
};

function derivePageName(pathname: string, search: string): string {
  // Exact match first
  if (ROUTE_NAMES[pathname]) return ROUTE_NAMES[pathname];

  const searchParams = new URLSearchParams(search);
  const stream = searchParams.get("stream");

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";

  const base = `/${segments[0]}`;
  const baseName = ROUTE_NAMES[base];

  if (segments.length >= 2) {
    const sub = segments[1];

    // /logs/:logGroupName?stream=...
    if (base === "/logs") {
      // Decode the log group name from the path segments
      const logGroup = segments.slice(1).map(decodeURIComponent).join("/");
      if (stream) {
        return `CloudWatch Logs > ${logGroup} > ${stream}`;
      }
      return `CloudWatch Logs > ${logGroup}`;
    }

    // /s3/:bucketName/...
    if (base === "/s3") {
      const bucket = sub;
      if (segments.length > 2) {
        const prefix = segments.slice(2).join("/");
        return `S3 > ${bucket} > ${prefix}`;
      }
      return `S3 > ${bucket}`;
    }

    // /cognito/user-pools/:poolId
    if (base === "/cognito" && sub === "user-pools" && segments[2]) {
      return `Cognito > ${segments[2]}`;
    }

    if (baseName) {
      return `${baseName} > ${sub}`;
    }
  }

  return baseName || segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" > ");
}

export function usePageTitle() {
  const location = useLocation();
  // useParams is not directly useful here since we're outside a Route,
  // but we derive the name from the pathname directly.
  useEffect(() => {
    const name = derivePageName(location.pathname, location.search);
    document.title = `${name} - Ministack`;
  }, [location.pathname, location.search]);
}
