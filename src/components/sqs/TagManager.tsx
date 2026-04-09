import React, { useState } from "react";
import { Tag, Plus, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface TagManagerProps {
  tags: Record<string, string>;
  onAddTag: (key: string, value: string) => Promise<void>;
  onRemoveTag: (key: string) => Promise<void>;
  isLoading?: boolean;
}

export const TagManager = ({ tags, onAddTag, onRemoveTag, isLoading }: TagManagerProps) => {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey) return;
    await onAddTag(newKey, newValue);
    setNewKey("");
    setNewValue("");
    setIsAdding(false);
  };

  return (
    <div className="bg-surface-card rounded-card border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5 text-orange-500" />
          Tags
        </h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsAdding(!isAdding)}
          className={isAdding ? "text-red-500" : "text-orange-500"}
        >
          {isAdding ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4 p-3 bg-surface-elevated rounded border border-border-subtle space-y-3 animate-in fade-in slide-in-from-top-2">
          <Input
            label="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Environment"
            required
            accentColor="orange"
            className="text-xs py-1"
          />
          <Input
            label="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Production"
            accentColor="orange"
            className="text-xs py-1"
          />
          <Button type="submit" variant="warning" size="xs" className="w-full" isLoading={isLoading} disabled={!newKey}>
            Add Tag
          </Button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {Object.entries(tags).length === 0 ? (
          <p className="text-[10px] text-text-faint italic px-1">No tags assigned</p>
        ) : (
          Object.entries(tags).map(([key, value]) => (
            <div
              key={key}
              className="group flex items-center gap-1.5 px-2 py-1 bg-surface-elevated border border-border-subtle rounded text-[10px] hover:border-orange-500/30 transition-colors"
            >
              <span className="text-text-secondary font-medium">{key}:</span>
              <span className="text-text-muted">{value}</span>
              <button
                onClick={() => onRemoveTag(key)}
                className="ml-1 text-text-faint hover:text-red-500 transition-colors"
                disabled={isLoading}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
