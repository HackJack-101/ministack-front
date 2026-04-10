import { RefreshCw, Trash2, Box } from "lucide-react";
import { useECS } from "../hooks/useECS";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useState } from "react";

export const ECS = () => {
  const { clusters, loading, refresh, deleteCluster } = useECS();
  const [deleteModalCluster, setDeleteModalCluster] = useState<string | null>(null);

  const columns = [
    {
      key: "name",
      header: "Cluster Name / ARN",
      render: (arn: string) => {
        const name = arn.split("/").pop();
        return (
          <div className="flex flex-col">
            <span className="font-medium text-text-primary">{name}</span>
            <span className="text-[10px] text-text-faint font-mono mt-0.5">{arn}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (arn: string) => (
        <div className="flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModalCluster(arn);
            }}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Delete Cluster"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="ECS"
        subtitle="Container Service"
        actions={
          <button
            onClick={refresh}
            className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            title="Refresh clusters"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <DataTable
          columns={columns}
          rows={clusters}
          rowKey={(arn: string) => arn}
          loading={loading && clusters.length === 0}
          emptyIcon={Box}
          emptyTitle="No clusters found"
          emptyDescription="Run containerized applications at scale."
          accentColor="text-orange-500"
        />
      </div>

      <ConfirmModal
        open={!!deleteModalCluster}
        onCancel={() => setDeleteModalCluster(null)}
        onConfirm={() => {
          if (deleteModalCluster) {
            deleteCluster(deleteModalCluster);
            setDeleteModalCluster(null);
          }
        }}
        title="Delete Cluster"
        description={`Are you sure you want to delete cluster "${deleteModalCluster?.split("/").pop()}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};
