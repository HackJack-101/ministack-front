import { Database, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useElastiCache } from "../hooks/useElastiCache";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { CacheCluster } from "@aws-sdk/client-elasticache";

export default function ElastiCache() {
  const { clusters, loading, deleteCacheCluster, refresh } = useElastiCache();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDelete = (cluster: CacheCluster) => {
    confirm({
      title: `Delete cluster "${cluster.CacheClusterId}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteCacheCluster(cluster.CacheClusterId!),
    });
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (status === "available") return "success";
    if (status === "deleted" || status === "deleting") return "error";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ElastiCache"
        subtitle="In-memory cache clusters"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      {loading && clusters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-red-500" />
          <p className="mt-4 text-text-muted">Loading clusters...</p>
        </div>
      ) : clusters.length === 0 ? (
        <EmptyState title="No Cache Clusters" description="No ElastiCache clusters found." icon={Database} />
      ) : (
        <DataTable
          rows={clusters}
          rowKey={(c: CacheCluster) => c.CacheClusterId || ""}
          accentColor="rose"
          columns={[
            {
              key: "clusterId",
              header: "Cluster ID",
              render: (c: CacheCluster) => (
                <span className="font-medium text-text-primary">{c.CacheClusterId || "—"}</span>
              ),
            },
            {
              key: "engine",
              header: "Engine",
              render: (c: CacheCluster) => <Badge variant="rose">{c.Engine || "—"}</Badge>,
            },
            {
              key: "status",
              header: "Status",
              render: (c: CacheCluster) => (
                <Badge variant={getStatusBadgeVariant(c.CacheClusterStatus)}>{c.CacheClusterStatus || "—"}</Badge>
              ),
            },
            {
              key: "nodes",
              header: "Nodes",
              render: (c: CacheCluster) => (
                <span className="text-sm text-text-secondary">{c.NumCacheNodes ?? "—"}</span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (c: CacheCluster) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(c)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      {ConfirmModalComponent}
    </div>
  );
}
