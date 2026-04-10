import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newUserName: string) => Promise<void>;
  initialUserName: string;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ open, onClose, onConfirm, initialUserName }) => {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState(initialUserName);

  useEffect(() => {
    if (open) {
      setUserName(initialUserName);
    }
  }, [open, initialUserName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || userName === initialUserName) {
      if (!userName) return;
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onConfirm(userName);
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit IAM User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl mb-4">
          <User className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider">Current User Name</p>
            <p className="text-sm font-mono text-text-primary">{initialUserName}</p>
          </div>
        </div>

        <Input
          label="New User Name"
          placeholder="my-updated-user"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
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
            disabled={!userName || userName === initialUserName}
          >
            Update User
          </Button>
        </div>
      </form>
    </Modal>
  );
};
