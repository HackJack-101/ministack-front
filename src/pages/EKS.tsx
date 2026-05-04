import { useState } from "react";
import { Layers, RefreshCw, Trash2, List } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useEKS } from "../hooks/useEKS";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { Cluster, Nodegroup } from "@aws-sdk/client-eks";

type Tab = "clusters" | "nodegroups";

const CLUSTER_STATUS_VARIANT = (status: string | undefined) => {
  if (status === "ACTIVE") return "success";
  if (status === "CREATING" || status === "UPDATING") return "warning";
  if (status === "DELETING") return "warning";
  if (status === "FAILED") return "error";
  return "default";
};

const NODEGROUP_STATUS_VARIANT = (status: string | undefined) => {
  if (status === "ACTIVE") return "success";
  if (status === "CREATING" || status === "UPDATING") return "warning";
  if (status === "DELETING") return "warning";
  if (status === "CREATE_FAILED" || status === "DELETE_FAILED" || status === "DEGRADED") return "error";
  return "default";
};

export default function EKS() {
  const {
    clusters,
    nodegroups,
    selectedClusterName,
    loading,
    fetchNodegroups,
    deleteCluster,
    deleteNodegroup,
    refresh,
  } = useEKS();
  const [activeTab, setActiveTab] = useState<Tab>("clusters");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDeleteCluster = (cluster: Cluster) => {
    confirm({
      title: `Delete cluster "${cluster.name}"?`,
      description: "The cluster and all associated nodegroups will be deleted. This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteCluster(cluster.name!),
    });
  };

  const handleDeleteNodegroup = (ng: Nodegroup) => {
    confirm({
      title: `Delete nodegroup "${ng.nodegroupName}"?`,
      description: "This nodegroup will be permanently removed.",
      confirmVariant: "danger",
      action: () => deleteNodegroup(ng.clusterName!, ng.nodegroupName!),
    });
  };

  const handleViewNodegroups = async (cluster: Cluster) => {
    await fetchNodegroups(cluster.name!);
    setActiveTab("nodegroups");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "clusters", label: `Clusters${clusters.length > 0 ? ` (${clusters.length})` : ""}` },
    {
      key: "nodegroups",
      label: `Nodegroups${selectedClusterName ? ` — ${selectedClusterName}` : ""}${nodegroups.length > 0 ? ` (${nodegroups.length})` : ""}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="EKS"
        subtitle="Elastic Kubernetes Service — managed Kubernetes clusters"
        actions={
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === key
                ? "border-orange-400 text-text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && clusters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-orange-400" />
          <p className="mt-4 text-text-muted">Loading EKS clusters...</p>
        </div>
      ) : (
        <>
          {activeTab === "clusters" &&
            (clusters.length === 0 ? (
              <EmptyState
                title="No Clusters"
                description="No EKS clusters found. Use the AWS CLI or SDK to create one."
                icon={Layers}
              />
            ) : (
              <DataTable
                rows={clusters}
                rowKey={(c: Cluster) => c.name || ""}
                accentColor="orange"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (c: Cluster) => <span className="font-medium text-text-primary">{c.name || "—"}</span>,
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (c: Cluster) => <Badge variant={CLUSTER_STATUS_VARIANT(c.status)}>{c.status || "—"}</Badge>,
                  },
                  {
                    key: "version",
                    header: "K8s Version",
                    render: (c: Cluster) => <span className="text-sm text-text-secondary">{c.version || "—"}</span>,
                  },
                  {
                    key: "endpoint",
                    header: "Endpoint",
                    render: (c: Cluster) => (
                      <span className="font-mono text-xs text-text-muted truncate max-w-xs block">
                        {c.endpoint || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (c: Cluster) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewNodegroups(c)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-400"
                          title="View Nodegroups"
                        >
                          <List className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCluster(c)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            ))}

          {activeTab === "nodegroups" &&
            (nodegroups.length === 0 ? (
              <EmptyState
                title="No Nodegroups"
                description={
                  selectedClusterName
                    ? "This cluster has no nodegroups."
                    : "Select a cluster and click the nodegroups icon to view its nodegroups."
                }
                icon={Layers}
              />
            ) : (
              <DataTable
                rows={nodegroups}
                rowKey={(ng: Nodegroup) => ng.nodegroupName || ""}
                accentColor="orange"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (ng: Nodegroup) => (
                      <span className="font-medium text-text-primary">{ng.nodegroupName || "—"}</span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (ng: Nodegroup) => (
                      <Badge variant={NODEGROUP_STATUS_VARIANT(ng.status)}>{ng.status || "—"}</Badge>
                    ),
                  },
                  {
                    key: "instanceTypes",
                    header: "Instance Types",
                    render: (ng: Nodegroup) => (
                      <span className="text-sm text-text-secondary">{ng.instanceTypes?.join(", ") || "—"}</span>
                    ),
                  },
                  {
                    key: "desiredSize",
                    header: "Nodes",
                    render: (ng: Nodegroup) => (
                      <span className="text-sm text-text-secondary">
                        {ng.scalingConfig ? `${ng.scalingConfig.desiredSize} / ${ng.scalingConfig.maxSize}` : "—"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (ng: Nodegroup) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNodegroup(ng)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    ),
                  },
                ]}
              />
            ))}
        </>
      )}

      {ConfirmModalComponent}
    </div>
  );
}
