import { TrendingUp, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useAutoScaling } from "../hooks/useAutoScaling";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { AutoScalingGroup } from "@aws-sdk/client-auto-scaling";

export default function AutoScaling() {
  const { groups, loading, deleteGroup, refresh } = useAutoScaling();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDelete = (group: AutoScalingGroup) => {
    confirm({
      title: `Delete group "${group.AutoScalingGroupName}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteGroup(group.AutoScalingGroupName!),
    });
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (!status) return "success";
    if (status.toLowerCase().includes("delete")) return "error";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AutoScaling"
        subtitle="Auto Scaling groups"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      {loading && groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-amber-400" />
          <p className="mt-4 text-text-muted">Loading Auto Scaling groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <EmptyState title="No Auto Scaling Groups" description="No Auto Scaling groups found." icon={TrendingUp} />
      ) : (
        <DataTable
          rows={groups}
          rowKey={(g: AutoScalingGroup) => g.AutoScalingGroupARN || g.AutoScalingGroupName || ""}
          accentColor="amber"
          columns={[
            {
              key: "name",
              header: "Group Name",
              render: (g: AutoScalingGroup) => (
                <span className="font-medium text-text-primary">{g.AutoScalingGroupName || "—"}</span>
              ),
            },
            {
              key: "desired",
              header: "Desired",
              render: (g: AutoScalingGroup) => (
                <span className="text-sm text-text-secondary">{g.DesiredCapacity ?? "—"}</span>
              ),
            },
            {
              key: "min",
              header: "Min",
              render: (g: AutoScalingGroup) => <span className="text-sm text-text-secondary">{g.MinSize ?? "—"}</span>,
            },
            {
              key: "max",
              header: "Max",
              render: (g: AutoScalingGroup) => <span className="text-sm text-text-secondary">{g.MaxSize ?? "—"}</span>,
            },
            {
              key: "status",
              header: "Status",
              render: (g: AutoScalingGroup) => (
                <Badge variant={getStatusBadgeVariant(g.Status)}>{g.Status || "ACTIVE"}</Badge>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (g: AutoScalingGroup) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(g)}
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
