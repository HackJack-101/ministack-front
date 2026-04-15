import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Shield, Info, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useSQS } from "../hooks/useSQS";
import { useToast } from "../hooks/useToast";

export const SQSCreateQueue = () => {
  const navigate = useNavigate();
  const sqs = useSQS();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [isFifo, setIsFifo] = useState(false);
  const [contentBasedDeduplication, setContentBasedDeduplication] = useState(false);
  const [visibilityTimeout, setVisibilityTimeout] = useState(30);
  const [useDlq, setUseDlq] = useState(false);
  const [dlqArn, setDlqArn] = useState("");
  const [maxReceiveCount, setMaxReceiveCount] = useState(5);

  const handleCreate = async () => {
    if (!name) {
      toast.error("Queue name is required");
      return;
    }

    setLoading(true);
    try {
      let finalName = name;
      if (isFifo && !name.endsWith(".fifo")) {
        finalName = `${name}.fifo`;
      }

      const attributes: Record<string, string> = {
        VisibilityTimeout: visibilityTimeout.toString(),
      };

      if (isFifo) {
        attributes.FifoQueue = "true";
        if (contentBasedDeduplication) {
          attributes.ContentBasedDeduplication = "true";
        }
      }

      if (useDlq && dlqArn) {
        attributes.RedrivePolicy = JSON.stringify({
          deadLetterTargetArn: dlqArn,
          maxReceiveCount: maxReceiveCount.toString(),
        });
      }

      await sqs.createQueue(finalName, attributes);
      toast.success(`Queue "${finalName}" created successfully`);
      navigate(`/sqs/${finalName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create queue");
    } finally {
      setLoading(false);
    }
  };

  const handleFifoChange = (checked: boolean) => {
    setIsFifo(checked);
    if (checked && !name.endsWith(".fifo") && name.length > 0) {
      setName((prev) => `${prev}.fifo`);
    } else if (!checked && name.endsWith(".fifo")) {
      setName((prev) => prev.replace(/\.fifo$/, ""));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/sqs")}
          className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Create SQS Queue" subtitle="Configure a new message queue with advanced settings" />
      </div>

      <div className="bg-surface-card border border-border-default rounded-card shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border-subtle bg-surface-elevated/30">
          <div className="max-w-md">
            <Input
              label="Queue Name"
              placeholder={isFifo ? "my-queue.fifo" : "my-queue"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              accentColor="orange"
              autoFocus
              required
              className={isFifo ? "font-mono" : ""}
            />
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Configuration</h3>
              </div>

              <div className="space-y-6 bg-surface-elevated p-6 rounded-xl border border-border-subtle">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      id="fifo-toggle"
                      checked={isFifo}
                      onChange={(e) => handleFifoChange(e.target.checked)}
                      className="w-4 h-4 rounded border-border-default text-orange-500 focus:ring-orange-500/30 bg-surface-input"
                    />
                  </div>
                  <label htmlFor="fifo-toggle" className="flex flex-col cursor-pointer">
                    <span className="text-sm text-text-primary font-medium">FIFO Queue</span>
                    <span className="text-[11px] text-text-muted mt-0.5">
                      Ensure first-in-first-out delivery and exactly-once processing.
                    </span>
                  </label>
                </div>

                {isFifo && (
                  <div className="ml-7 animate-in fade-in slide-in-from-top-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contentBasedDeduplication}
                        onChange={(e) => setContentBasedDeduplication(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-border-default text-orange-500 focus:ring-orange-500/30 bg-surface-input"
                      />
                      <span className="text-xs text-text-secondary">Enable Content-Based Deduplication</span>
                    </label>
                  </div>
                )}

                <div className="pt-2">
                  <Input
                    type="number"
                    label="Visibility Timeout (seconds)"
                    value={visibilityTimeout}
                    onChange={(e) => setVisibilityTimeout(parseInt(e.target.value) || 0)}
                    min={0}
                    max={43200}
                    accentColor="orange"
                  />
                  <p className="mt-1.5 text-[10px] text-text-muted">
                    The duration that messages are invisible to other consumers after being received.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Dead-Letter Queue
                </h3>
              </div>
              <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle space-y-6">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      id="dlq-toggle"
                      checked={useDlq}
                      onChange={(e) => setUseDlq(e.target.checked)}
                      className="w-4 h-4 rounded border-border-default text-orange-500 focus:ring-orange-500/30 bg-surface-input"
                    />
                  </div>
                  <label htmlFor="dlq-toggle" className="flex flex-col cursor-pointer">
                    <span className="text-sm text-text-primary font-medium">Enable Redrive Policy</span>
                    <span className="text-[11px] text-text-muted mt-0.5">
                      Send undeliverable messages to a dead-letter queue.
                    </span>
                  </label>
                </div>

                {useDlq && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">DLQ ARN</label>
                      <select
                        className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500/60 text-sm transition-colors"
                        value={dlqArn}
                        onChange={(e) => setDlqArn(e.target.value)}
                        required={useDlq}
                      >
                        <option value="">Select a queue...</option>
                        {sqs.queues.map((q) => (
                          <option key={q.arn} value={q.arn}>
                            {q.url.split("/").pop()} ({q.arn})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-text-muted mt-1">
                        Choose an existing queue to serve as the dead-letter queue.
                      </p>
                    </div>
                    <Input
                      type="number"
                      label="Max Receive Count"
                      value={maxReceiveCount}
                      onChange={(e) => setMaxReceiveCount(parseInt(e.target.value) || 1)}
                      min={1}
                      accentColor="orange"
                    />
                  </div>
                )}

                <div className="flex items-start gap-2 text-text-faint p-3 bg-surface-card rounded-lg border border-border-subtle/50">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed">
                    A dead-letter queue is where messages are sent if they cannot be processed successfully after a
                    certain number of attempts.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle bg-surface-elevated/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate("/sqs")} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="orange"
            onClick={handleCreate}
            isLoading={loading}
            disabled={!name}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            Create Queue
          </Button>
        </div>
      </div>
    </div>
  );
};
