import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileJson, Shield } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input, TextArea } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useIAM } from "../hooks/useIAM";
import { useToast } from "../hooks/useToast";

const DEFAULT_POLICY_DOCUMENT = JSON.stringify(
  {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "*",
        Resource: "*",
      },
    ],
  },
  null,
  2
);

export const IAMCreatePolicy = () => {
  const navigate = useNavigate();
  const iam = useIAM();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [policyName, setPolicyName] = useState("");
  const [policyDocument, setPolicyDocument] = useState(DEFAULT_POLICY_DOCUMENT);

  const handleCreate = async () => {
    if (!policyName || !policyDocument) {
      toast.error("Policy name and document are required");
      return;
    }

    setLoading(true);
    try {
      await iam.createPolicy(policyName, policyDocument);
      toast.success(`Policy "${policyName}" created successfully`);
      navigate("/iam");
    } catch (err: any) {
      toast.error(err.message || "Failed to create policy");
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
          title="Create IAM Policy" 
          subtitle="Define permissions using JSON policy documents" 
        />
      </div>

      <div className="bg-surface-card border border-border-default rounded-card shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border-subtle bg-surface-elevated/30">
          <div className="max-w-md">
            <Input
              label="Policy Name"
              placeholder="e.g. ReadOnlyAccess"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
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
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Policy Document</h3>
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
              rows={15}
              accentColor="purple"
              className="font-mono text-xs"
            />
            
            <div className="flex items-start gap-3 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
              <Shield className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">
                Policies define permissions for an action regardless of the method that you use to perform the operation. 
                AWS provides managed policies for common use cases.
              </p>
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
            disabled={!policyName || !policyDocument}
          >
            Create Policy
          </Button>
        </div>
      </div>
    </div>
  );
};
