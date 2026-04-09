import React, { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface CreateTopicModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export const CreateTopicModal = ({ open, onClose, onConfirm, isLoading }: CreateTopicModalProps) => {
  const [name, setName] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await onConfirm(name);
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-default rounded-card shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">Create SNS Topic</h2>
          </div>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <Input
              label="Topic Name"
              placeholder="my-cool-topic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              accentColor="rose"
            />
          </div>

          <div className="p-4 border-t border-border-subtle flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="rose" size="sm" isLoading={isLoading}>
              Create Topic
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
