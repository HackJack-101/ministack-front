import { useMemo, useState } from "react";
import { Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Table as TableIcon } from "lucide-react";
import type { TableInfo } from "../../hooks/useDynamoDB";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";

interface ItemsTableProps {
  items: Record<string, unknown>[];
  loading: boolean;
  selectedTable: TableInfo;
  onDelete: (item: Record<string, unknown>) => void;
}

export const ItemsTable = ({ items, loading, selectedTable, onDelete }: ItemsTableProps) => {
  const [sortField, setSortField] = useState<string>(selectedTable.PartitionKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const allKeys = useMemo(() => {
    const keysSet = new Set<string>();
    items.forEach((item) => Object.keys(item).forEach((k) => keysSet.add(k)));
    const result: string[] = [];
    if (keysSet.has(selectedTable.PartitionKey)) result.push(selectedTable.PartitionKey);
    if (selectedTable.SortKey && keysSet.has(selectedTable.SortKey)) result.push(selectedTable.SortKey);
    keysSet.forEach((k) => {
      if (k !== selectedTable.PartitionKey && k !== selectedTable.SortKey) result.push(k);
    });
    return result;
  }, [items, selectedTable]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const va = String(a[sortField] ?? "");
      const vb = String(b[sortField] ?? "");
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [items, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-subtle text-[11px] uppercase tracking-wider">
            {allKeys.map((key) => (
              <th
                key={key}
                className="px-4 py-2.5 font-medium text-text-muted cursor-pointer hover:text-text-secondary select-none"
                onClick={() => handleSort(key)}
              >
                <span className="flex items-center gap-1">
                  {key === selectedTable.PartitionKey ? (
                    <span className="text-emerald-500">{key} (PK)</span>
                  ) : key === selectedTable.SortKey ? (
                    <span className="text-emerald-500">{key} (SK)</span>
                  ) : (
                    key
                  )}
                  {sortField === key ? (
                    sortDir === "asc" ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3 h-3 opacity-40" />
                  )}
                </span>
              </th>
            ))}
            <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {loading ? (
            <tr>
              <td colSpan={allKeys.length + 1} className="px-4 py-10 text-center">
                <Spinner size="md" color="text-emerald-500" label="Scanning table items..." />
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={allKeys.length + 1} className="py-16">
                <EmptyState icon={TableIcon} title="No items found" description="Add an item to get started." />
              </td>
            </tr>
          ) : (
            sorted.map((item, idx) => (
              <tr key={idx} className="hover:bg-surface-hover transition-colors group">
                {allKeys.map((key) => (
                  <td key={key} className="px-4 py-3 text-sm">
                    <span
                      className={
                        key === selectedTable.PartitionKey || key === selectedTable.SortKey
                          ? "text-emerald-500 font-medium font-mono"
                          : "text-text-secondary group-hover:text-text-primary transition-colors"
                      }
                    >
                      {item[key] !== undefined ? (
                        typeof item[key] === "object" ? (
                          JSON.stringify(item[key])
                        ) : (
                          String(item[key])
                        )
                      ) : (
                        <span className="text-text-faint italic text-xs">null</span>
                      )}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(item)}
                    className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Item"
                    aria-label="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
