import React, { useState, useEffect } from "react";
import { X, Users } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (groupName: string) => Promise<void>;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (!open) {
      setGroupName("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;

    setLoading(true);
    try {
      await onConfirm(groupName);
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-card border border-border-default rounded-card max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 rounded">
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Create IAM Group</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-hover rounded-btn transition-colors text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input
            label="Group Name"
            placeholder="my-new-group"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            autoFocus
            accentColor="purple"
          />
        </form>

        <div className="p-4 border-t border-border-subtle flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="purple" size="sm" onClick={handleSubmit} isLoading={loading} disabled={!groupName}>
            Create Group
          </Button>
        </div>
      </div>
    </div>
  );
};
