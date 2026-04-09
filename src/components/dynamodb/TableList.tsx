import { Table as TableIcon, Trash2 } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

interface TableListProps {
  tables: string[];
  loading: boolean;
  onSelect: (name: string) => void;
  onDelete: (e: React.MouseEvent, name: string) => void;
  onCreateClick: () => void;
}

export const TableList = ({ tables, loading, onSelect, onDelete, onCreateClick }: TableListProps) => {
  return (
    <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
            <th className="px-4 py-2.5 font-medium text-text-muted">Table Name</th>
            <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="h-3 w-48 bg-surface-skeleton rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))
          ) : tables.length === 0 ? (
            <tr>
              <td colSpan={2}>
                <EmptyState
                  icon={TableIcon}
                  title="No tables found"
                  description="Create your first DynamoDB table to get started."
                  action={{ label: "Create Table", onClick: onCreateClick }}
                />
              </td>
            </tr>
          ) : (
            tables.map((tableName) => (
              <tr
                key={tableName}
                className="hover:bg-surface-hover cursor-pointer transition-colors group"
                onClick={() => onSelect(tableName)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-500/10 rounded">
                      <TableIcon className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{tableName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => onDelete(e, tableName)}
                    className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Table"
                    aria-label="Delete Table"
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
