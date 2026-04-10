import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useSQS } from "../../hooks/useSQS";
import { useToast } from "../../hooks/useToast";
import { Send, AlertCircle } from "lucide-react";

interface RedriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceQueueUrl: string;
  sourceQueueName: string;
  messageCount: number;
}

export const RedriveModal: React.FC<RedriveModalProps> = ({
  isOpen,
  onClose,
  sourceQueueUrl,
  sourceQueueName,
  messageCount,
}) => {
  const { queues, moveMessages } = useSQS();
  const toast = useToast();
  const [destinationUrl, setDestinationUrl] = useState("");
  const [isRedriving, setIsRedriving] = useState(false);

  const handleRedrive = async () => {
    if (!destinationUrl) return;

    setIsRedriving(true);
    try {
      const moved = await moveMessages(sourceQueueUrl, destinationUrl);
      toast.success(`Successfully redriven ${moved} messages to ${destinationUrl.split("/").pop()}`);
      onClose();
    } catch {
      // Error is handled in moveMessages hook
    } finally {
      setIsRedriving(false);
    }
  };

  const availableDestinations = queues.filter((q) => q.url !== sourceQueueUrl);

  return (
    <Modal open={isOpen} onClose={onClose} title="Redrive Messages" maxWidth="max-w-md">
      <div className="space-y-6">
        <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-card">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary">
                Moving messages from <span className="text-orange-500">{sourceQueueName}</span>
              </p>
              <p className="text-xs text-text-muted leading-relaxed">
                This will move all available messages from the current queue to a destination queue of your choice.
                Useful for processing failed messages from a Dead Letter Queue.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Destination Queue
            </label>
            <select
              className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500/60 text-sm transition-colors"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              disabled={isRedriving}
            >
              <option value="">Select a destination queue...</option>
              {availableDestinations.map((q) => (
                <option key={q.url} value={q.url}>
                  {q.url.split("/").pop()} ({q.approximateNumberOfMessages} messages)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-text-faint">
              Only available messages ({messageCount}) will be moved. Invisible or delayed messages cannot be redriven
              until they become available.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isRedriving}>
            Cancel
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={handleRedrive}
            isLoading={isRedriving}
            disabled={!destinationUrl || messageCount === 0}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Start Redrive
          </Button>
        </div>
      </div>
    </Modal>
  );
};
