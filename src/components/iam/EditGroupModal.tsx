import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface EditGroupModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newGroupName: string) => Promise<void>;
  initialGroupName: string;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({ open, onClose, onConfirm, initialGroupName }) => {
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState(initialGroupName);

  useEffect(() => {
    if (open) {
      setGroupName(initialGroupName);
    }
  }, [open, initialGroupName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || groupName === initialGroupName) {
      if (!groupName) return;
      onClose();
      return;
    }

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
    <Modal open={open} onClose={onClose} title="Edit IAM Group">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl mb-4">
          <Users className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider">Current Group Name</p>
            <p className="text-sm font-mono text-text-primary">{initialGroupName}</p>
          </div>
        </div>

        <Input
          label="New Group Name"
          placeholder="my-updated-group"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
          autoFocus
          accentColor="purple"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="purple"
            size="sm"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!groupName || groupName === initialGroupName}
          >
            Update Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};
