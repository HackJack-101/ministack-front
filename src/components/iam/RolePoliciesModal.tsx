import React, { useState, useEffect, useCallback } from "react";
import { Shield, FileKey, Plus, Trash2, Search, Link as LinkIcon, ShieldCheck, Zap } from "lucide-react";
import type { Policy } from "@aws-sdk/client-iam";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useIAM } from "../../hooks/useIAM";

interface RolePoliciesModalProps {
  open: boolean;
  onClose: () => void;
  roleName: string;
}

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

export const RolePoliciesModal: React.FC<RolePoliciesModalProps> = ({ open, onClose, roleName }) => {
  const {
    policies,
    listAttachedRolePolicies,
    attachRolePolicy,
    detachRolePolicy,
    listRolePolicies,
    putRolePolicy,
    deleteRolePolicy,
  } = useIAM();
  const [attachedPolicies, setAttachedPolicies] = useState<{ PolicyName?: string; PolicyArn?: string }[]>([]);
  const [inlinePolicies, setInlinePolicies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPolicies = useCallback(async () => {
    if (!roleName) return;
    setLoading(true);
    try {
      const [attached, inline] = await Promise.all([listAttachedRolePolicies(roleName), listRolePolicies(roleName)]);
      setAttachedPolicies(attached);
      setInlinePolicies(inline);
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  }, [roleName, listAttachedRolePolicies, listRolePolicies]);

  useEffect(() => {
    if (open && roleName) {
      fetchPolicies();
    }
  }, [open, roleName, fetchPolicies]);

  const handleAttach = async (policyArn: string) => {
    setActionLoading(`attach-${policyArn}`);
    try {
      await attachRolePolicy(roleName, policyArn);
      await fetchPolicies();
    } catch {
      // Error handled by hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleDetach = async (policyArn: string) => {
    setActionLoading(`detach-${policyArn}`);
    try {
      await detachRolePolicy(roleName, policyArn);
      await fetchPolicies();
    } catch {
      // Error handled by hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteInline = async (policyName: string) => {
    setActionLoading(`delete-inline-${policyName}`);
    try {
      await deleteRolePolicy(roleName, policyName);
      await fetchPolicies();
    } catch {
      // Error handled by hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplyWildcard = async (templateId: string) => {
    const template = WILDCARD_PERMISSION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setActionLoading(`wildcard-${templateId}`);
    try {
      await putRolePolicy(roleName, template.policyName, JSON.stringify(template.policy, null, 2));
      await fetchPolicies();
    } catch {
      // Error handled by hook
    } finally {
      setActionLoading(null);
    }
  };

  const availablePolicies = policies.filter(
    (p: Policy) =>
      !attachedPolicies.some((ap) => ap.PolicyArn === p.Arn) &&
      (p.PolicyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Arn?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <Modal open={open} onClose={onClose} title="Manage Role Policies" maxWidth="max-w-2xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pr-3">
        <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
          <Shield className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider">Role Name</p>
            <p className="text-sm font-mono text-text-primary">{roleName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Quick Wildcard Permissions
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {WILDCARD_PERMISSION_TEMPLATES.map((template) => {
              const isApplied = inlinePolicies.includes(template.policyName);
              return (
                <Button
                  key={template.id}
                  variant={isApplied ? "outline" : "ghost"}
                  size="sm"
                  className={`h-auto py-2 flex flex-col items-center gap-1 text-[10px] border-border-subtle hover:bg-surface-hover ${
                    isApplied ? "bg-purple-500/5 border-purple-500/20 text-purple-600 font-semibold" : ""
                  }`}
                  onClick={() => handleApplyWildcard(template.id)}
                  isLoading={actionLoading === `wildcard-${template.id}`}
                  disabled={!!actionLoading}
                >
                  <Zap className={`w-3.5 h-3.5 ${isApplied ? "text-purple-500" : "text-text-muted"}`} />
                  {template.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Attached Policies ({attachedPolicies.length})
            </h4>
          </div>

          <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-card">
            {loading ? (
              <div className="p-8 text-center text-text-muted text-sm italic">Loading policies...</div>
            ) : attachedPolicies.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm italic">No managed policies attached.</div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {attachedPolicies.map((policy) => (
                  <div
                    key={policy.PolicyArn}
                    className="flex items-center justify-between p-3 hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileKey className="w-4 h-4 text-purple-500/50" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{policy.PolicyName}</p>
                        <p className="text-[10px] text-text-muted font-mono truncate">{policy.PolicyArn}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => policy.PolicyArn && handleDetach(policy.PolicyArn)}
                      isLoading={actionLoading === `detach-${policy.PolicyArn}`}
                      disabled={!!actionLoading}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Detach
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Inline Policies ({inlinePolicies.length})
            </h4>
          </div>

          <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-card">
            {loading ? (
              <div className="p-8 text-center text-text-muted text-sm italic">Loading policies...</div>
            ) : inlinePolicies.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm italic">No inline policies defined.</div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {inlinePolicies.map((policyName) => (
                  <div
                    key={policyName}
                    className="flex items-center justify-between p-3 hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-purple-500/50" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{policyName}</p>
                        <p className="text-[10px] text-text-muted italic">Inline Policy</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => handleDeleteInline(policyName)}
                      isLoading={actionLoading === `delete-inline-${policyName}`}
                      disabled={!!actionLoading}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Attach New Policy</h4>
            </div>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Filter policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs bg-surface-base border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>

          <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-card max-h-60 overflow-y-auto">
            {availablePolicies.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm italic">
                {searchTerm ? "No matching policies found." : "No more policies available to attach."}
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {availablePolicies.map((policy) => (
                  <div
                    key={policy.Arn}
                    className="flex items-center justify-between p-3 hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileKey className="w-4 h-4 text-purple-500/50" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{policy.PolicyName}</p>
                        <p className="text-[10px] text-text-muted font-mono truncate">{policy.Arn}</p>
                      </div>
                    </div>
                    <Button
                      variant="purple"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => policy.Arn && handleAttach(policy.Arn)}
                      isLoading={actionLoading === `attach-${policy.Arn}`}
                      disabled={!!actionLoading}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Attach
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={!!actionLoading}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
