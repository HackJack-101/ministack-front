import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal = ({ open, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const titleId = "modal-title";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-surface-card border border-border-default rounded-card w-full ${maxWidth} shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-elevated/50">
          <h3 id={titleId} className="text-base font-semibold text-text-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 hover:bg-surface-active text-text-muted hover:text-text-primary rounded-btn transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[85vh]">{children}</div>
      </div>
    </div>
  );
};
