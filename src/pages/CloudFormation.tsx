import { RefreshCw, Trash2, Layers2, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { Stack } from "@aws-sdk/client-cloudformation";
import { useCloudFormation } from "../hooks/useCloudFormation";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useState } from "react";

export const CloudFormation = () => {
  const { stacks, loading, refresh, deleteStack } = useCloudFormation();
  const [deleteModalStack, setDeleteModalStack] = useState<string | null>(null);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    if (status.endsWith("_COMPLETE")) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {status}
        </Badge>
      );
    }

    if (status.endsWith("_FAILED") || status.endsWith("_ROLLBACK")) {
      return (
        <Badge variant="error" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {status}
        </Badge>
      );
    }

    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <Clock className="w-3 h-3 animate-spin-slow" />
        {status}
      </Badge>
    );
  };

  const columns = [
    {
      key: "name",
      header: "Stack Name",
      render: (stack: Stack) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{stack.StackName}</span>
          <span className="text-[10px] text-text-faint font-mono mt-0.5">{stack.StackId}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (stack: Stack) => getStatusBadge(stack.StackStatus),
    },
    {
      key: "created",
      header: "Created",
      render: (stack: Stack) => stack.CreationTime?.toLocaleString() ?? "Unknown",
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (stack: Stack) => (
        <div className="flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModalStack(stack.StackName || null);
            }}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Delete Stack"
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
        title="CloudFormation"
        subtitle="Infrastructure as Code"
        actions={
          <button
            onClick={refresh}
            className="p-2 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            title="Refresh stacks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <DataTable
          columns={columns}
          rows={stacks}
          rowKey={(s: Stack) => s.StackId!}
          loading={loading && stacks.length === 0}
          emptyIcon={Layers2}
          emptyTitle="No stacks found"
          emptyDescription="Deploy some infrastructure via CloudFormation."
          accentColor="text-pink-600"
        />
      </div>

      <ConfirmModal
        open={!!deleteModalStack}
        onCancel={() => setDeleteModalStack(null)}
        onConfirm={() => {
          if (deleteModalStack) {
            deleteStack(deleteModalStack);
            setDeleteModalStack(null);
          }
        }}
        title="Delete Stack"
        description={`Are you sure you want to delete stack "${deleteModalStack}"? This will delete all resources associated with this stack.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};
