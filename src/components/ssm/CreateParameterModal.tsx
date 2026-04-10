import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input, TextArea } from "../ui/Input";
import { Button } from "../ui/Button";

interface CreateParameterModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, value: string, type: "String" | "StringList" | "SecureString") => Promise<void>;
  initialName?: string;
  initialValue?: string;
  initialType?: "String" | "StringList" | "SecureString";
  isEdit?: boolean;
}

export const CreateParameterModal: React.FC<CreateParameterModalProps> = ({
  open,
  onClose,
  onConfirm,
  initialName = "",
  initialValue = "",
  initialType = "String",
  isEdit = false,
}) => {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue);
  const [type, setType] = useState<"String" | "StringList" | "SecureString">(initialType);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setValue(initialValue);
      setType(initialType);
    }
  }, [open, initialName, initialValue, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;
    setLoading(true);
    try {
      await onConfirm(name.trim(), value.trim(), type);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Parameter" : "Create Parameter"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Name"
          placeholder="e.g. /config/database_url"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus={!isEdit}
          disabled={isEdit}
          accentColor="indigo"
        />
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
            disabled={isEdit}
          >
            <option value="String">String</option>
            <option value="StringList">StringList</option>
            <option value="SecureString">SecureString</option>
          </select>
        </div>
        <TextArea
          label="Value"
          placeholder="Enter parameter value..."
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          required
          rows={4}
          accentColor="indigo"
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="indigo" isLoading={loading}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
