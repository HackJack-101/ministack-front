import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface CreateLogGroupModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
}

export const CreateLogGroupModal: React.FC<CreateLogGroupModalProps> = ({ open, onClose, onConfirm }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onConfirm(name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Log Group">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Log Group Name"
          placeholder="e.g. /aws/lambda/my-function"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          accentColor="cyan"
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="cyan" isLoading={loading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};
