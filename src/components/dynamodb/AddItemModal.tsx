import React, { useState } from "react";
import { Table, X, Code } from "lucide-react";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/Input";
import type { TableInfo } from "../../hooks/useDynamoDB";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (json: string) => Promise<void>;
  table: TableInfo;
  isLoading?: boolean;
}

export const AddItemModal = ({ open, onClose, onConfirm, table, isLoading }: AddItemModalProps) => {
  const [json, setJson] = useState(
    `{\n  "${table.PartitionKey}": "value"${table.SortKey ? `,\n  "${table.SortKey}": "value"` : ""}\n}`,
  );
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      JSON.parse(json);
      await onConfirm(json);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid JSON or failed to add item");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-default rounded-card shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Table className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">Add Item to {table.TableName}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div className="relative">
              <TextArea
                label="Item JSON"
                value={json}
                onChange={(e) => setJson(e.target.value)}
                required
                rows={10}
                accentColor="emerald"
                className="pl-9"
              />
              <Code className="absolute top-[34px] left-3 w-3.5 h-3.5 text-text-muted" />
            </div>
            {error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : (
              <p className="text-xs text-text-muted">
                Must include primary key:{" "}
                <code className="text-emerald-500">
                  {table.PartitionKey}
                  {table.SortKey ? `, ${table.SortKey}` : ""}
                </code>
              </p>
            )}
          </div>

          <div className="p-4 border-t border-border-subtle flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="success" size="sm" isLoading={isLoading}>
              Create Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
