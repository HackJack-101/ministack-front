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

export default function Kinesis() {
  const { streams, loading, createStream, deleteStream, refresh } = useKinesis();
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
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Stream
            </Button>
          </>
        }
      />

      {loading && streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="blue" />
          <p className="mt-4 text-gray-500">Loading streams...</p>
        </div>
      ) : streams.length === 0 ? (
        <EmptyState
          title="No Streams"
          description="Create a Kinesis stream to ingest real-time data."
          icon={Waves}
          action={{
            label: "Create Stream",
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <DataTable
          rows={streams}
          rowKey={(p) => p}
          columns={[
            {
              key: "name",
              header: "Stream Name",
              render: (p: any) => (
                <div className="flex items-center">
                  <Waves className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{p}</span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: () => <Badge variant="success">ACTIVE</Badge>,
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
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
          />
          <Input
            label="Shard Count"
            type="number"
            min={1}
            value={shardCount}
            onChange={(e) => setShardCount(parseInt(e.target.value))}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} color="blue">
              Create Stream
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}
