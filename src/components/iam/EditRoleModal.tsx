import React, { useState, useEffect } from "react";
import { Shield, FileJson, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useIAM } from "../../hooks/useIAM";
import { formatJson } from "../../utils/format";

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (policyDocument: string) => Promise<void>;
  roleName: string;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({ open, onClose, onConfirm, roleName }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [policyDocument, setPolicyDocument] = useState("");
  const { getRole } = useIAM();

  useEffect(() => {
    if (open && roleName) {
      const fetchRole = async () => {
        setFetching(true);
        try {
          const role = await getRole(roleName);
          if (role?.AssumeRolePolicyDocument) {
            // AssumeRolePolicyDocument from SDK is often a URI encoded string or already an object
            const doc =
              typeof role.AssumeRolePolicyDocument === "string"
                ? decodeURIComponent(role.AssumeRolePolicyDocument)
                : JSON.stringify(role.AssumeRolePolicyDocument, null, 2);

            // Try to format it if it's a string
            try {
              setPolicyDocument(JSON.stringify(JSON.parse(doc), null, 2));
            } catch {
              setPolicyDocument(doc);
            }
          }
        } catch {
          onClose();
        } finally {
          setFetching(false);
        }
      };
      fetchRole();
    }
  }, [open, roleName, getRole, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyDocument) return;

    setLoading(true);
    try {
      await onConfirm(policyDocument);
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Trust Policy" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl mb-4">
          <Shield className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider">Role Name</p>
            <p className="text-sm font-mono text-text-primary">{roleName}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Trust Relationship JSON
              </h4>
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
          <TextArea
            label=""
            value={policyDocument}
            onChange={(e) => setPolicyDocument(e.target.value)}
            required
            spellCheck={false}
            rows={12}
            accentColor="purple"
            className="font-mono text-xs"
            placeholder={fetching ? "Fetching trust policy..." : "Loading..."}
            disabled={fetching}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="purple"
            size="sm"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!policyDocument || fetching}
          >
            Update Trust Policy
          </Button>
        </div>
      </form>
    </Modal>
  );
};
