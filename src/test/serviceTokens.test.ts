import { expect, test } from "vitest";
import { serviceTokens, type ServiceKey } from "../design-system/serviceTokens";

test("every service token has a non-empty configuration", () => {
  Object.values(serviceTokens).forEach((token) => {
    expect(token.label).toBeTruthy();
    expect(token.path).toBeTruthy();
    expect(token.icon).toBeTruthy();
    expect(token.iconColor).toMatch(/^text-/);
    expect(token.iconBg).toMatch(/^bg-/);
    expect(token.buttonVariant).toBeTruthy();
    expect(token.badgeVariant).toBeTruthy();
    expect(token.focusRing).toMatch(/^focus:border-/);
  });
});

test("all service keys are present in the tokens map", () => {
  const expectedKeys: ServiceKey[] = [
    "dashboard",
    "iam",
    "lambda",
    "ec2",
    "ecs",
    "stepFunctions",
    "s3",
    "dynamodb",
    "rds",
    "route53",
    "acm",
    "wafv2",
    "sqs",
    "sns",
    "eventbridge",
    "ses",
    "kms",
    "secretsManager",
    "cognito",
    "cloudformation",
    "cloudwatchLogs",
    "parameterStore",
    "kinesis",
  ];

  expectedKeys.forEach((key) => {
    expect(serviceTokens[key]).toBeDefined();
  });
});
