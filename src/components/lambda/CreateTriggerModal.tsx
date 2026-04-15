import React, { useState } from "react";
import { MessageSquare, Table } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useSQS } from "../../hooks/useSQS";
import { useDynamoDB } from "../../hooks/useDynamoDB";
import type { CreateEventSourceMappingForm } from "../../hooks/useLambda";

interface CreateTriggerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (params: CreateEventSourceMappingForm) => Promise<boolean>;
  functionName: string;
}

export const CreateTriggerModal = ({ open, onClose, onConfirm, functionName }: CreateTriggerModalProps) => {
  const { queues, loading: queuesLoading } = useSQS();
  const { tables, loading: tablesLoading } = useDynamoDB();

  const [type, setType] = useState<"sqs" | "dynamodb">("sqs");
  const [sourceArn, setSourceArn] = useState("");
  const [batchSize, setBatchSize] = useState(10);
  const [enabled, setEnabled] = useState(true);
  const [startingPosition, setStartingPosition] = useState<"TRIM_HORIZON" | "LATEST">("LATEST");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceArn) return;

    setIsSubmitting(true);
    const success = await onConfirm({
      FunctionName: functionName,
      EventSourceArn: sourceArn,
      BatchSize: batchSize,
      Enabled: enabled,
      StartingPosition: type === "dynamodb" ? startingPosition : undefined,
    });

    if (success) {
      onClose();
      // Reset form
      setSourceArn("");
      setBatchSize(10);
      setEnabled(true);
    }
    setIsSubmitting(false);
  };

  const selectedTablesWithStreams = tables.filter((t) => t.StreamArn);

  return (
    <Modal open={open} onClose={onClose} title="Add Trigger" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Trigger Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setType("sqs");
                setSourceArn("");
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                type === "sqs"
                  ? "border-orange-500 bg-orange-500/5 shadow-sm"
                  : "border-border-subtle bg-surface-elevated hover:border-text-faint"
              }`}
            >
              <div className={`p-2 rounded-lg ${type === "sqs" ? "bg-orange-500/20" : "bg-surface-card"}`}>
                <MessageSquare className={`w-5 h-5 ${type === "sqs" ? "text-orange-500" : "text-text-muted"}`} />
              </div>
              <div className="text-left">
                <span
                  className={`block text-sm font-semibold ${type === "sqs" ? "text-text-primary" : "text-text-muted"}`}
                >
                  SQS
                </span>
                <span className="text-[10px] text-text-faint">Simple Queue Service</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setType("dynamodb");
                setSourceArn("");
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                type === "dynamodb"
                  ? "border-emerald-500 bg-emerald-500/5 shadow-sm"
                  : "border-border-subtle bg-surface-elevated hover:border-text-faint"
              }`}
            >
              <div className={`p-2 rounded-lg ${type === "dynamodb" ? "bg-emerald-500/20" : "bg-surface-card"}`}>
                <Table className={`w-5 h-5 ${type === "dynamodb" ? "text-emerald-500" : "text-text-muted"}`} />
              </div>
              <div className="text-left">
                <span
                  className={`block text-sm font-semibold ${type === "dynamodb" ? "text-text-primary" : "text-text-muted"}`}
                >
                  DynamoDB
                </span>
                <span className="text-[10px] text-text-faint">NoSQL Streams</span>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {type === "sqs" ? (
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                SQS Queue
              </label>
              <select
                value={sourceArn}
                onChange={(e) => setSourceArn(e.target.value)}
                required
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="">Select a queue...</option>
                {queues.map((q) => (
                  <option key={q.arn} value={q.arn}>
                    {q.url.split("/").pop()} ({q.arn})
                  </option>
                ))}
              </select>
              {queuesLoading && <p className="text-[10px] text-text-faint mt-1">Loading queues...</p>}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                DynamoDB Table (must have streams enabled)
              </label>
              <select
                value={sourceArn}
                onChange={(e) => setSourceArn(e.target.value)}
                required
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Select a table...</option>
                {selectedTablesWithStreams.map((t) => (
                  <option key={t.StreamArn} value={t.StreamArn}>
                    {t.TableName}
                  </option>
                ))}
              </select>
              {tablesLoading && <p className="text-[10px] text-text-faint mt-1">Loading tables...</p>}
              {!tablesLoading && selectedTablesWithStreams.length === 0 && (
                <p className="text-[10px] text-amber-500 mt-1">No tables with streams enabled found.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                Batch Size
              </label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                min={1}
                max={type === "sqs" ? 10000 : 1000}
                required
                className="focus:ring-amber-500/50"
              />
            </div>
            {type === "dynamodb" && (
              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  Starting Position
                </label>
                <select
                  value={startingPosition}
                  onChange={(e) => setStartingPosition(e.target.value as "TRIM_HORIZON" | "LATEST")}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="LATEST">LATEST</option>
                  <option value="TRIM_HORIZON">TRIM_HORIZON</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded border-border-subtle text-amber-500 focus:ring-amber-500/50 h-4 w-4"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-text-secondary">
              Enable Trigger
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="success" isLoading={isSubmitting} disabled={!sourceArn}>
            Add Trigger
          </Button>
        </div>
      </form>
    </Modal>
  );
};
