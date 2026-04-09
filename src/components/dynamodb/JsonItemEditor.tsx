import { useState } from "react";
import { Code } from "lucide-react";
import type { TableInfo } from "../../hooks/useDynamoDB";

interface JsonItemEditorProps {
  table: TableInfo;
  onSubmit: (json: string) => Promise<void>;
  onClose: () => void;
}

export const JsonItemEditor = ({ table, onSubmit, onClose }: JsonItemEditorProps) => {
  const [json, setJson] = useState(
    `{\n  "${table.PartitionKey}": "value"${table.SortKey ? `,\n  "${table.SortKey}": "value"` : ""}\n}`,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      JSON.parse(json);
      await onSubmit(json);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid JSON or failed to add item");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium mb-1.5 block">
          Item JSON
        </label>
        <div className="relative">
          <Code className="absolute top-2.5 left-3 w-3.5 h-3.5 text-text-muted" />
          <textarea
            required
            rows={8}
            className="w-full bg-surface-input border border-border-default rounded-btn pl-9 pr-3 py-2 font-mono text-sm focus:outline-none focus:border-emerald-500/60 text-text-primary transition-colors"
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
        </div>
        {error ? (
          <p className="text-xs text-red-500 mt-1.5">{error}</p>
        ) : (
          <p className="text-xs text-text-muted mt-1.5">
            Must include primary key:{" "}
            <code className="text-emerald-500">
              {table.PartitionKey}
              {table.SortKey ? `, ${table.SortKey}` : ""}
            </code>
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-btn text-sm font-medium transition-colors"
        >
          Put Item
        </button>
      </div>
    </form>
  );
};
