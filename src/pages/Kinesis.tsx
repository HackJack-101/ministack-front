import { useState } from "react";
import { Waves, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useKinesis } from "../hooks/useKinesis";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";

export default function Kinesis() {
  const { streams, loading, createStream, deleteStream, refresh } = useKinesis();
  const kinesisToken = serviceTokens.kinesis;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [streamName, setStreamName] = useState("");
  const [shardCount, setShardCount] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamName.trim()) return;

    setIsCreating(true);
    await createStream(streamName, shardCount);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setStreamName("");
    setShardCount(1);
  };

  const handleDelete = (name: string) => {
    confirm({
      title: "Delete Stream",
      description: `Are you sure you want to delete Kinesis stream "${name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: () => deleteStream(name),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kinesis"
        subtitle="Real-time data streaming and ingestion"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant={kinesisToken.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Stream
            </Button>
          </>
        }
      />

      {loading && streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-sky-500" />
          <p className="mt-4 text-text-muted">Loading streams...</p>
        </div>
      ) : streams.length === 0 ? (
        <EmptyState
          title="No Streams"
          description="Create a Kinesis stream to ingest real-time data."
          icon={Waves}
          action={
            <Button variant={kinesisToken.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Stream
            </Button>
          }
        />
      ) : (
        <DataTable
          rows={streams}
          rowKey={(p) => p}
          accentColor="sky"
          columns={[
            {
              key: "name",
              header: "Stream Name",
              render: (p: any) => (
                <div className="flex items-center">
                  <Waves className={`w-4 h-4 mr-2 ${kinesisToken.iconColor}`} />
                  <span className="font-medium text-text-primary">{p}</span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: () => <Badge variant={kinesisToken.badgeVariant}>ACTIVE</Badge>,
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (p: any) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Kinesis Stream">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Stream Name"
            placeholder="my-stream"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
            required
            autoFocus
            accentColor="sky"
          />
          <Input
            label="Shard Count"
            type="number"
            min={1}
            value={shardCount}
            onChange={(e) => setShardCount(parseInt(e.target.value))}
            required
            accentColor="sky"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} variant={kinesisToken.buttonVariant}>
              Create Stream
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}
