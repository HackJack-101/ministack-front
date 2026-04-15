import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface ObjectKeyModalProps {
  open: boolean;
  title: string;
  initialValue: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export const ObjectKeyModal = ({ open, title, initialValue, onConfirm, onClose }: ObjectKeyModalProps) => {
  const [value, setValue] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [prevOpen, setPrevOpen] = useState(open);

  if (initialValue !== prevInitialValue || open !== prevOpen) {
    setPrevInitialValue(initialValue);
    setPrevOpen(open);
    if (open) {
      setValue(initialValue);
    }
  }

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-btn text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!value.trim()}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};
