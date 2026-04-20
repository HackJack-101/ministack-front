import { useState } from "react";
import { Flame, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useFirehose } from "../hooks/useFirehose";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import type { DeliveryStreamDescription } from "@aws-sdk/client-firehose";

export default function Firehose() {
  const { streams, loading, createStream, deleteStream, refresh } = useFirehose();
  const token = serviceTokens.firehose;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [streamName, setStreamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamName.trim()) return;
    setIsCreating(true);
    await createStream(streamName);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setStreamName("");
  };

  const handleDelete = (stream: DeliveryStreamDescription) => {
    confirm({
      title: `Delete stream "${stream.DeliveryStreamName}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteStream(stream.DeliveryStreamName!),
    });
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (status === "ACTIVE") return "success";
    if (status === "DELETING" || status === "CREATING_FAILED" || status === "DELETING_FAILED") return "error";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firehose"
        subtitle="Delivery streams"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Stream
            </Button>
          </>
        }
      />

      {loading && streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-orange-400" />
          <p className="mt-4 text-text-muted">Loading delivery streams...</p>
        </div>
      ) : streams.length === 0 ? (
        <EmptyState
          title="No Delivery Streams"
          description="Create a Firehose delivery stream to get started."
          icon={Flame}
          action={
            <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Stream
            </Button>
          }
        />
      ) : (
        <DataTable
          rows={streams}
          rowKey={(s: DeliveryStreamDescription) => s.DeliveryStreamName || ""}
          accentColor="orange"
          columns={[
            {
              key: "name",
              header: "Stream Name",
              render: (s: DeliveryStreamDescription) => (
                <span className="font-medium text-text-primary">{s.DeliveryStreamName || "—"}</span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (s: DeliveryStreamDescription) => (
                <Badge variant={getStatusBadgeVariant(s.DeliveryStreamStatus)}>{s.DeliveryStreamStatus || "—"}</Badge>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (s: DeliveryStreamDescription) => <Badge variant="orange">{s.DeliveryStreamType || "—"}</Badge>,
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (s: DeliveryStreamDescription) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(s)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Delivery Stream">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Stream Name"
            placeholder="my-delivery-stream"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
            required
            autoFocus
            accentColor="orange"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} variant={token.buttonVariant}>
              Create Stream
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}
