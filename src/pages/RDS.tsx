import { RefreshCw, Trash2, Database } from "lucide-react";
import { useRDS } from "../hooks/useRDS";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useState } from "react";

export const RDS = () => {
  const { instances, loading, refresh, deleteInstance } = useRDS();
  const [deleteModalInstance, setDeleteModalInstance] = useState<string | null>(null);

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return <Badge variant="success">{status}</Badge>;
      case "deleting":
      case "failed":
        return <Badge variant="error">{status}</Badge>;
      case "creating":
      case "modifying":
      case "rebooting":
      case "starting":
      case "stopping":
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="default">{status || "unknown"}</Badge>;
    }
  };

  const columns = [
    {
      key: "id",
      header: "DB Instance",
      render: (instance: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{instance.DBInstanceIdentifier}</span>
          <span className="text-[10px] text-text-faint mt-0.5">
            {instance.Engine} {instance.EngineVersion} · {instance.DBInstanceClass}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (instance: any) => getStatusBadge(instance.DBInstanceStatus),
    },
    {
      key: "endpoint",
      header: "Endpoint",
      render: (instance: any) => (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-secondary">
          {instance.Endpoint ? (
            <span>
              {instance.Endpoint.Address}:{instance.Endpoint.Port}
            </span>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (instance: any) => (
        <div className="flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModalInstance(instance.DBInstanceIdentifier);
            }}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Delete Instance"
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
        title="RDS"
        subtitle="Relational Database Service"
        actions={
          <button
            onClick={refresh}
            className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            title="Refresh instances"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <DataTable
          columns={columns}
          rows={instances}
          rowKey={(i: any) => i.DBInstanceIdentifier}
          loading={loading && instances.length === 0}
          emptyIcon={Database}
          emptyTitle="No DB instances found"
          emptyDescription="Create a managed relational database."
          accentColor="text-blue-600"
        />
      </div>

      <ConfirmModal
        open={!!deleteModalInstance}
        onCancel={() => setDeleteModalInstance(null)}
        onConfirm={() => {
          if (deleteModalInstance) {
            deleteInstance(deleteModalInstance);
            setDeleteModalInstance(null);
          }
        }}
        title="Delete DB Instance"
        description={`Are you sure you want to delete DB instance "${deleteModalInstance}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};
