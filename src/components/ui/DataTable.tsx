import type { ReactNode } from "react";
import { Spinner } from "./Spinner";
import { EmptyState } from "./EmptyState";
import type { LucideIcon } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  accentColor?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyIcon,
  emptyTitle = "No items found",
  emptyDescription,
  emptyAction,
  accentColor = "text-blue-500",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-2.5 font-medium text-text-muted ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <Spinner size="md" color={accentColor} label="Loading..." />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyIcon && (
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-colors ${onRowClick ? "cursor-pointer hover:bg-surface-hover" : "hover:bg-surface-hover/50"}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-text-secondary text-sm ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
