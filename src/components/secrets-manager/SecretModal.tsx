import React, { useState } from "react";
import { Lock, Code } from "lucide-react";
import { Button } from "../ui/Button";
import { Input, TextArea } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useToast } from "../../hooks/useToast";

interface SecretModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, value: string) => Promise<void>;
  isLoading?: boolean;
  initialData?: { name: string; value: string };
}

export const SecretModal = ({ open, onClose, onConfirm, isLoading, initialData }: SecretModalProps) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const toast = useToast();

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open);
    setPrevInitialData(initialData);
    if (open) {
      setName(initialData?.name ?? "");
      setValue(initialData?.value ?? "");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;
    try {
      await onConfirm(name, value);
      setName("");
      setValue("");
      onClose();
    } catch {
      // Error handled by parent or toast
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, 2));
    } catch {
      toast.error("Invalid JSON format");
    }
  };

  const isEdit = !!initialData;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Secret" : "Create Secret"} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <Input
            label="Secret Name"
            placeholder="my-secret-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isEdit}
            required
            accentColor="purple"
            autoFocus={!isEdit}
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium">
                Secret Value
              </label>
              <button
                type="button"
                onClick={formatJson}
                className="flex items-center gap-1 text-[10px] text-purple-500 hover:text-purple-400 font-medium transition-colors uppercase tracking-wider"
              >
                <Code className="w-3 h-3" />
                Format JSON
              </button>
            </div>
            <TextArea
              placeholder='{"api_key": "xyz123"}'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              rows={12}
              accentColor="purple"
              autoFocus={isEdit}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="purple" isLoading={isLoading} leftIcon={<Lock className="w-3.5 h-3.5" />}>
            {isEdit ? "Save Changes" : "Create Secret"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
