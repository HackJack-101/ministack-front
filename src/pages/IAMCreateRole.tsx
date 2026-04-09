import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileJson, Info } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input, TextArea } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useIAM } from "../hooks/useIAM";
import { useToast } from "../hooks/useToast";

const DEFAULT_ASSUME_ROLE_POLICY = JSON.stringify(
  {
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
  null,
  2
);

export const IAMCreateRole = () => {
  const navigate = useNavigate();
  const iam = useIAM();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [policyDocument, setPolicyDocument] = useState(DEFAULT_ASSUME_ROLE_POLICY);

  const handleCreate = async () => {
    if (!roleName || !policyDocument) {
      toast.error("Role name and trust policy are required");
      return;
    }

    setLoading(true);
    try {
      await iam.createRole(roleName, policyDocument);
      toast.success(`Role "${roleName}" created successfully`);
      navigate("/iam");
    } catch (err: any) {
      toast.error(err.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
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
        <PageHeader 
          title="Create IAM Role" 
          subtitle="Define a role and its trust relationship" 
        />
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
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Trust Relationship</h3>
              </div>
              <div className="text-[10px] text-text-muted font-mono bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle">
                JSON Editor
              </div>
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
                  The trust relationship policy specifies which principals (users, roles, services, or SAML providers) can assume this role. 
                  By default, we've provided a policy that allows the Lambda service to assume this role.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border-subtle bg-surface-elevated/30 flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/iam")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="purple" 
            onClick={handleCreate} 
            isLoading={loading}
            disabled={!roleName || !policyDocument}
          >
            Create Role
          </Button>
        </div>
      </div>
    </div>
  );
};
