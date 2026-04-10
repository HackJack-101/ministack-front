import React, { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (userName: string) => Promise<void>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ open, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!open) {
      setUserName("");
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
    if (!userName) return;

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
              <User className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Create IAM User</h3>
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
            label="User Name"
            placeholder="my-new-user"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            autoFocus
            accentColor="purple"
          />
        </form>

        <div className="p-4 border-t border-border-subtle flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="purple" size="sm" onClick={handleSubmit} isLoading={loading} disabled={!userName}>
            Create User
          </Button>
        </div>
      </div>
    </div>
  );
};
