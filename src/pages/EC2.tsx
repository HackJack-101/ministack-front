import { RefreshCw, Trash2, Cpu, Play, Square } from "lucide-react";
import type { Instance } from "@aws-sdk/client-ec2";
import { useEC2 } from "../hooks/useEC2";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useState } from "react";

export const EC2 = () => {
  const { instances, loading, refresh, terminateInstance, startInstance, stopInstance } = useEC2();
  const [deleteModalInstance, setDeleteModalInstance] = useState<string | null>(null);

  const getStatusBadge = (state?: string) => {
    switch (state) {
      case "running":
        return <Badge variant="success">{state}</Badge>;
      case "stopped":
        return <Badge variant="error">{state}</Badge>;
      case "pending":
      case "stopping":
      case "starting":
        return <Badge variant="warning">{state}</Badge>;
      case "terminated":
        return <Badge variant="default">{state}</Badge>;
      default:
        return <Badge variant="default">{state || "unknown"}</Badge>;
    }
  };

  const columns = [
    {
      key: "id",
      header: "Instance ID",
      render: (instance: Instance) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary font-mono text-[11px]">{instance.InstanceId}</span>
          <span className="text-[10px] text-text-faint mt-0.5">
            {instance.InstanceType} · {instance.Placement?.AvailabilityZone}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (instance: Instance) => getStatusBadge(instance.State?.Name),
    },
    {
      key: "publicIp",
      header: "Public IP",
      render: (instance: Instance) => instance.PublicIpAddress || "-",
    },
    {
      key: "privateIp",
      header: "Private IP",
      render: (instance: Instance) => instance.PrivateIpAddress || "-",
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (instance: Instance) => (
        <div className="flex items-center justify-end gap-1">
          {instance.State?.Name === "stopped" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startInstance(instance.InstanceId);
              }}
              className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors"
              title="Start Instance"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
          {instance.State?.Name === "running" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopInstance(instance.InstanceId);
              }}
              className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
              title="Stop Instance"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModalInstance(instance.InstanceId);
            }}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Terminate Instance"
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
        title="EC2"
        subtitle="Compute Instances"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              title="Refresh instances"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <DataTable
          columns={columns}
          rows={instances}
          rowKey={(i: Instance) => i.InstanceId!}
          loading={loading && instances.length === 0}
          emptyIcon={Cpu}
          emptyTitle="No instances found"
          emptyDescription="Launch some virtual servers in the cloud."
          accentColor="text-orange-600"
        />
      </div>

      <ConfirmModal
        open={!!deleteModalInstance}
        onCancel={() => setDeleteModalInstance(null)}
        onConfirm={() => {
          if (deleteModalInstance) {
            terminateInstance(deleteModalInstance);
            setDeleteModalInstance(null);
          }
        }}
        title="Terminate Instance"
        description={`Are you sure you want to terminate instance "${deleteModalInstance}"? This action is permanent and all data on the root volume will be lost.`}
        confirmLabel="Terminate"
        confirmVariant="danger"
      />
    </div>
  );
};
