import { useState } from "react";
import { Server, RefreshCw, Trash2, List } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useEMR } from "../hooks/useEMR";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { ClusterSummary, StepSummary } from "@aws-sdk/client-emr";

type Tab = "clusters" | "steps";

const CLUSTER_STATE_VARIANT = (state: string | undefined) => {
  if (state === "RUNNING" || state === "WAITING") return "success";
  if (state === "BOOTSTRAPPING" || state === "STARTING") return "warning";
  if (state === "TERMINATING") return "warning";
  if (state === "TERMINATED" || state === "TERMINATED_WITH_ERRORS") return "error";
  return "default";
};

const STEP_STATE_VARIANT = (state: string | undefined) => {
  if (state === "COMPLETED") return "success";
  if (state === "RUNNING") return "warning";
  if (state === "PENDING") return "info";
  if (state === "CANCELLED" || state === "FAILED" || state === "INTERRUPTED") return "error";
  return "default";
};

export default function EMR() {
  const { clusters, steps, selectedClusterId, loading, fetchSteps, terminateCluster, cancelStep, refresh } = useEMR();
  const [activeTab, setActiveTab] = useState<Tab>("clusters");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleTerminate = (cluster: ClusterSummary) => {
    confirm({
      title: `Terminate cluster "${cluster.Name || cluster.Id}"?`,
      description: "The cluster and all running steps will be terminated. This action cannot be undone.",
      confirmVariant: "danger",
      action: () => terminateCluster(cluster.Id!),
    });
  };

  const handleCancelStep = (step: StepSummary) => {
    confirm({
      title: `Cancel step "${step.Name || step.Id}"?`,
      description: "The step execution will be cancelled.",
      confirmVariant: "warning",
      action: () => cancelStep(selectedClusterId!, step.Id!),
    });
  };

  const handleViewSteps = async (cluster: ClusterSummary) => {
    await fetchSteps(cluster.Id!);
    setActiveTab("steps");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "clusters", label: `Clusters${clusters.length > 0 ? ` (${clusters.length})` : ""}` },
    {
      key: "steps",
      label: `Steps${selectedClusterId ? ` — ${selectedClusterId.slice(0, 8)}` : ""}${steps.length > 0 ? ` (${steps.length})` : ""}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="EMR"
        subtitle="Elastic MapReduce — big data clusters and job steps"
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
                ? "border-amber-700 text-text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && clusters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-amber-700" />
          <p className="mt-4 text-text-muted">Loading EMR clusters...</p>
        </div>
      ) : (
        <>
          {activeTab === "clusters" &&
            (clusters.length === 0 ? (
              <EmptyState
                title="No Clusters"
                description="No EMR clusters found. Use the AWS CLI or SDK to create one."
                icon={Server}
              />
            ) : (
              <DataTable
                rows={clusters}
                rowKey={(c: ClusterSummary) => c.Id || ""}
                accentColor="amber"
                columns={[
                  {
                    key: "id",
                    header: "Cluster ID",
                    render: (c: ClusterSummary) => <Badge variant="mono">{c.Id || "—"}</Badge>,
                  },
                  {
                    key: "name",
                    header: "Name",
                    render: (c: ClusterSummary) => (
                      <span className="font-medium text-text-primary">{c.Name || "—"}</span>
                    ),
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (c: ClusterSummary) => (
                      <Badge variant={CLUSTER_STATE_VARIANT(c.Status?.State)}>{c.Status?.State || "—"}</Badge>
                    ),
                  },
                  {
                    key: "normalizedInstanceHours",
                    header: "Instance Hours",
                    render: (c: ClusterSummary) => (
                      <span className="text-sm text-text-secondary">{c.NormalizedInstanceHours ?? "—"}</span>
                    ),
                  },
                  {
                    key: "created",
                    header: "Created",
                    render: (c: ClusterSummary) => (
                      <span className="text-sm text-text-secondary">
                        {c.Status?.Timeline?.CreationDateTime
                          ? new Date(c.Status.Timeline.CreationDateTime).toLocaleString()
                          : "—"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (c: ClusterSummary) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSteps(c)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-700"
                          title="View Steps"
                        >
                          <List className="w-3.5 h-3.5" />
                        </Button>
                        {c.Status?.State !== "TERMINATED" && c.Status?.State !== "TERMINATED_WITH_ERRORS" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTerminate(c)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            ))}

          {activeTab === "steps" &&
            (steps.length === 0 ? (
              <EmptyState
                title="No Steps"
                description={
                  selectedClusterId
                    ? "This cluster has no job steps."
                    : "Select a cluster and click the steps icon to view its steps."
                }
                icon={Server}
              />
            ) : (
              <DataTable
                rows={steps}
                rowKey={(s: StepSummary) => s.Id || ""}
                accentColor="amber"
                columns={[
                  {
                    key: "id",
                    header: "Step ID",
                    render: (s: StepSummary) => <Badge variant="mono">{s.Id || "—"}</Badge>,
                  },
                  {
                    key: "name",
                    header: "Name",
                    render: (s: StepSummary) => <span className="font-medium text-text-primary">{s.Name || "—"}</span>,
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (s: StepSummary) => (
                      <Badge variant={STEP_STATE_VARIANT(s.Status?.State)}>{s.Status?.State || "—"}</Badge>
                    ),
                  },
                  {
                    key: "actionOnFailure",
                    header: "On Failure",
                    render: (s: StepSummary) => (
                      <span className="text-sm text-text-secondary">{s.ActionOnFailure || "—"}</span>
                    ),
                  },
                  {
                    key: "created",
                    header: "Created",
                    render: (s: StepSummary) => (
                      <span className="text-sm text-text-secondary">
                        {s.Status?.Timeline?.CreationDateTime
                          ? new Date(s.Status.Timeline.CreationDateTime).toLocaleString()
                          : "—"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (s: StepSummary) =>
                      s.Status?.State === "RUNNING" || s.Status?.State === "PENDING" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelStep(s)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      ) : null,
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
