import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Box, FileJson, Globe, Info, Layers, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input, TextArea } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useIAM } from "../hooks/useIAM";
import { useToast } from "../hooks/useToast";
import { formatJson } from "../utils/format";

const TRUST_POLICY_TEMPLATES = [
  {
    id: "lambda",
    name: "Lambda",
    icon: Zap,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "lambda.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      ],
    },
  },
  {
    id: "ec2",
    name: "EC2",
    icon: Box,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "ec2.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      ],
    },
  },
  {
    id: "ecs",
    name: "ECS Tasks",
    icon: Layers,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "ecs-tasks.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      ],
    },
  },
  {
    id: "full-access",
    name: "Full Access",
    icon: Globe,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            AWS: "*",
          },
          Action: "sts:AssumeRole",
        },
      ],
    },
  },
];

const WILDCARD_PERMISSION_TEMPLATES = [
  {
    id: "s3-full",
    name: "S3",
    policyName: "S3FullAccess",
    policy: {
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Action: "s3:*", Resource: "*" }],
    },
  },
  {
    id: "sqs-full",
    name: "SQS",
    policyName: "SQSFullAccess",
    policy: {
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Action: "sqs:*", Resource: "*" }],
    },
  },
  {
    id: "secrets-full",
    name: "Secrets Manager",
    policyName: "SecretsManagerFullAccess",
    policy: {
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Action: "secretsmanager:*", Resource: "*" }],
    },
  },
  {
    id: "lambda-full",
    name: "Lambda",
    policyName: "LambdaFullAccess",
    policy: {
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Action: "lambda:*", Resource: "*" }],
    },
  },
  {
    id: "cw-logs-full",
    name: "CloudWatch Logs",
    policyName: "CloudWatchLogsFullAccess",
    policy: {
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Action: "logs:*", Resource: "*" }],
    },
  },
];

const DEFAULT_ASSUME_ROLE_POLICY = JSON.stringify(TRUST_POLICY_TEMPLATES[0].policy, null, 2);

export const IAMCreateRole = () => {
  const navigate = useNavigate();
  const iam = useIAM();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [policyDocument, setPolicyDocument] = useState(DEFAULT_ASSUME_ROLE_POLICY);
  const [selectedWildcards, setSelectedWildcards] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!roleName || !policyDocument) {
      toast.error("Role name and trust policy are required");
      return;
    }

    setLoading(true);
    try {
      await iam.createRole(roleName, policyDocument);

      // Apply selected wildcards as inline policies
      for (const wildcardId of selectedWildcards) {
        const template = WILDCARD_PERMISSION_TEMPLATES.find((t) => t.id === wildcardId);
        if (template) {
          await iam.putRolePolicy(roleName, template.policyName, JSON.stringify(template.policy, null, 2));
        }
      }

      toast.success(`Role "${roleName}" created successfully`);
      navigate("/iam");
    } catch (err: any) {
      toast.error(err.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  const toggleWildcard = (id: string) => {
    setSelectedWildcards((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/iam")}
          className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Create IAM Role" subtitle="Define a role and its trust relationship" />
      </div>

      <div className="bg-surface-card border border-border-default rounded-card shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border-subtle bg-surface-elevated/30">
          <div className="max-w-md">
            <Input
              label="Role Name"
              placeholder="e.g. my-service-role"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              accentColor="purple"
              autoFocus
              required
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Trust Relationship
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-text-muted font-mono bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle">
                  JSON Editor
                </div>
                <button
                  type="button"
                  onClick={() => setPolicyDocument(formatJson(policyDocument))}
                  className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium text-purple-600 hover:text-purple-700 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 rounded transition-colors group"
                  title="Format JSON (Prettier)"
                >
                  <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  Format
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TRUST_POLICY_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setPolicyDocument(JSON.stringify(template.policy, null, 2))}
                  leftIcon={<template.icon className="w-3.5 h-3.5 text-purple-500" />}
                  className="bg-surface-elevated/50 text-[11px] font-medium"
                >
                  {template.name}
                </Button>
              ))}
            </div>

            <TextArea
              label=""
              value={policyDocument}
              onChange={(e) => setPolicyDocument(e.target.value)}
              required
              spellCheck={false}
              rows={12}
              accentColor="purple"
              className="font-mono text-xs"
            />

            <div className="flex items-start gap-3 p-4 bg-surface-elevated border border-border-subtle rounded-xl">
              <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-text-secondary font-medium">What is a trust relationship?</p>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  The trust relationship policy specifies which principals (users, roles, services, or SAML providers)
                  can assume this role. By default, we've provided a policy that allows the Lambda service to assume
                  this role.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-6 border-t border-border-subtle">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Quick Wildcard Permissions
              </h3>
            </div>
            <p className="text-[11px] text-text-muted">
              Select full access permissions to be added as inline policies to the role upon creation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {WILDCARD_PERMISSION_TEMPLATES.map((template) => {
                const isSelected = selectedWildcards.includes(template.id);
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => toggleWildcard(template.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-700 shadow-sm ring-1 ring-purple-500/20"
                        : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-purple-500/30 hover:bg-surface-hover"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-semibold">{template.name}</p>
                      <p className="text-[9px] text-text-muted truncate">Full Access (*)</p>
                    </div>
                    {isSelected && <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border-subtle bg-surface-elevated/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate("/iam")} disabled={loading}>
            Cancel
          </Button>
          <Button variant="purple" onClick={handleCreate} isLoading={loading} disabled={!roleName || !policyDocument}>
            Create Role
          </Button>
        </div>
      </div>
    </div>
  );
};
