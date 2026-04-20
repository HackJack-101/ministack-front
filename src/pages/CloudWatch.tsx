import { useState } from "react";
import { BarChart3, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useCloudWatchMetrics } from "../hooks/useCloudWatchMetrics";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { Metric, MetricAlarm } from "@aws-sdk/client-cloudwatch";

export default function CloudWatch() {
  const { metrics, alarms, loading, deleteAlarm, refresh } = useCloudWatchMetrics();
  const [activeTab, setActiveTab] = useState<"metrics" | "alarms">("metrics");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDeleteAlarm = (name: string) => {
    confirm({
      title: `Delete alarm "${name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteAlarm(name),
    });
  };

  const getAlarmBadgeVariant = (state: string | undefined) => {
    if (state === "OK") return "success";
    if (state === "ALARM") return "error";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CloudWatch Metrics"
        subtitle="Metrics and alarms"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "metrics"
              ? "border-cyan-600 text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setActiveTab("alarms")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "alarms"
              ? "border-cyan-600 text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Alarms
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-cyan-600" />
          <p className="mt-4 text-text-muted">Loading...</p>
        </div>
      ) : activeTab === "metrics" ? (
        metrics.length === 0 ? (
          <EmptyState title="No Metrics" description="No CloudWatch metrics found." icon={BarChart3} />
        ) : (
          <DataTable
            rows={metrics}
            rowKey={(m: Metric) => `${m.Namespace}-${m.MetricName}`}
            accentColor="cyan"
            columns={[
              {
                key: "namespace",
                header: "Namespace",
                render: (m: Metric) => <span className="font-medium text-text-primary">{m.Namespace || "—"}</span>,
              },
              {
                key: "metricName",
                header: "Metric Name",
                render: (m: Metric) => <span className="text-sm text-text-secondary">{m.MetricName || "—"}</span>,
              },
              {
                key: "dimensions",
                header: "Dimensions",
                render: (m: Metric) => (
                  <span className="text-xs text-text-muted font-mono">
                    {m.Dimensions?.map((d) => `${d.Name}=${d.Value}`).join(", ") || "—"}
                  </span>
                ),
              },
            ]}
          />
        )
      ) : alarms.length === 0 ? (
        <EmptyState title="No Alarms" description="No CloudWatch alarms configured." icon={BarChart3} />
      ) : (
        <DataTable
          rows={alarms}
          rowKey={(a: MetricAlarm) => a.AlarmName || ""}
          accentColor="cyan"
          columns={[
            {
              key: "name",
              header: "Alarm Name",
              render: (a: MetricAlarm) => <span className="font-medium text-text-primary">{a.AlarmName || "—"}</span>,
            },
            {
              key: "state",
              header: "State",
              render: (a: MetricAlarm) => (
                <Badge variant={getAlarmBadgeVariant(a.StateValue)}>{a.StateValue || "UNKNOWN"}</Badge>
              ),
            },
            {
              key: "metricName",
              header: "Metric Name",
              render: (a: MetricAlarm) => <span className="text-sm text-text-secondary">{a.MetricName || "—"}</span>,
            },
            {
              key: "threshold",
              header: "Threshold",
              render: (a: MetricAlarm) => (
                <span className="text-sm text-text-secondary">{a.Threshold?.toString() || "—"}</span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (a: MetricAlarm) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAlarm(a.AlarmName!)}
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
