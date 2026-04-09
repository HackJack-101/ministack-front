import React, { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface EditQueueModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (attributes: Record<string, string>) => Promise<void>;
  isLoading?: boolean;
  initialAttributes: Record<string, string>;
}

export const EditQueueModal = ({ open, onClose, onConfirm, isLoading, initialAttributes }: EditQueueModalProps) => {
  const [visibilityTimeout, setVisibilityTimeout] = useState(30);
  const [useDlq, setUseDlq] = useState(false);
  const [dlqArn, setDlqArn] = useState("");
  const [maxReceiveCount, setMaxReceiveCount] = useState(5);

  useEffect(() => {
    if (open && initialAttributes) {
      setVisibilityTimeout(parseInt(initialAttributes.VisibilityTimeout || "30"));
      
      if (initialAttributes.RedrivePolicy) {
        try {
          const policy = JSON.parse(initialAttributes.RedrivePolicy);
          setUseDlq(true);
          setDlqArn(policy.deadLetterTargetArn || "");
          setMaxReceiveCount(parseInt(policy.maxReceiveCount || "5"));
        } catch (e) {
          console.error("Failed to parse redrive policy", e);
        }
      } else {
        setUseDlq(false);
        setDlqArn("");
        setMaxReceiveCount(5);
      }
    }
  }, [open, initialAttributes]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const attributes: Record<string, string> = {
      VisibilityTimeout: visibilityTimeout.toString(),
    };

    if (useDlq && dlqArn) {
      attributes.RedrivePolicy = JSON.stringify({
        deadLetterTargetArn: dlqArn,
        maxReceiveCount: maxReceiveCount.toString(),
      });
    } else if (!useDlq && initialAttributes.RedrivePolicy) {
      // If we are explicitly removing the DLQ, we might need to send an empty redrive policy or handle it
      // AWS SDK usually expects the attribute to be set.
      attributes.RedrivePolicy = "";
    }

    await onConfirm(attributes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-default rounded-card shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Settings className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">Edit Queue Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          <div className="p-4 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Visibility Timeout (seconds)"
                min={0}
                max={43200}
                value={visibilityTimeout}
                onChange={(e) => setVisibilityTimeout(parseInt(e.target.value))}
                accentColor="orange"
              />
            </div>

            <div className="pt-4 border-t border-border-subtle space-y-4">
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setUseDlq(!useDlq)}>
                <input
                  type="checkbox"
                  checked={useDlq}
                  onChange={(e) => setUseDlq(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-border-default text-orange-500 focus:ring-orange-500/30 bg-surface-input"
                />
                <div className="flex flex-col">
                  <span className="text-sm text-text-primary font-medium">Dead Letter Queue</span>
                  <span className="text-[11px] text-text-muted">Redirect messages that cannot be processed to another queue.</span>
                </div>
              </div>

              {useDlq && (
                <div className="pl-6 space-y-4 border-l-2 border-orange-500/20 animate-in fade-in slide-in-from-left-2 duration-200">
                  <Input
                    label="DLQ ARN"
                    placeholder="arn:aws:sqs:us-east-1:123456789012:my-dlq"
                    value={dlqArn}
                    onChange={(e) => setDlqArn(e.target.value)}
                    required={useDlq}
                    accentColor="orange"
                    className="text-xs font-mono"
                  />
                  <Input
                    type="number"
                    label="Max Receive Count"
                    min={1}
                    max={1000}
                    value={maxReceiveCount}
                    onChange={(e) => setMaxReceiveCount(parseInt(e.target.value))}
                    accentColor="orange"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-border-subtle flex justify-end gap-2 bg-surface-card mt-auto">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="warning" size="sm" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
