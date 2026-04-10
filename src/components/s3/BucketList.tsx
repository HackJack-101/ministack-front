import type { Bucket } from "@aws-sdk/client-s3";
import { Database, Trash2, Settings } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

interface BucketListProps {
  buckets: Bucket[];
  loading: boolean;
  onSelect: (name: string) => void;
  onDelete: (e: React.MouseEvent, name: string) => void;
  onSettings: (e: React.MouseEvent, name: string) => void;
  onCreateClick: () => void;
}

export const BucketList = ({ buckets, loading, onSelect, onDelete, onSettings, onCreateClick }: BucketListProps) => {
  return (
    <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
            <th className="px-4 py-2.5 font-medium text-text-muted">Name</th>
            <th className="px-4 py-2.5 font-medium text-text-muted">Created</th>
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
                  <td className="px-4 py-3">
                    <div className="h-3 w-24 bg-surface-skeleton rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))
          ) : buckets.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <EmptyState
                  icon={Database}
                  title="No buckets found"
                  description="Create your first S3 bucket to start storing objects."
                  action={{ label: "Create Bucket", onClick: onCreateClick }}
                />
              </td>
            </tr>
          ) : (
            buckets.map((bucket) => (
              <tr
                key={bucket.Name}
                className="hover:bg-surface-hover cursor-pointer transition-colors group"
                onClick={() => onSelect(bucket.Name!)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded">
                      <Database className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{bucket.Name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">{bucket.CreationDate?.toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={(e) => onSettings(e, bucket.Name!)}
                      className="p-1.5 text-text-faint hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Bucket Settings"
                      aria-label="Bucket Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => onDelete(e, bucket.Name!)}
                      className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Bucket"
                      aria-label="Delete Bucket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
