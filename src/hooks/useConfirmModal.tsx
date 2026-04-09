import { useState } from "react";
import { ConfirmModal } from "../components/ui/ConfirmModal";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "warning";
  action: () => void;
}

export const useConfirmModal = () => {
  const [modal, setModal] = useState<ConfirmOptions & { open: boolean }>({
    open: false,
    title: "",
    description: "",
    action: () => {},
  });

  const confirm = (options: ConfirmOptions) => {
    setModal({ ...options, open: true });
  };

  const close = () => setModal((prev) => ({ ...prev, open: false }));

  const ConfirmModalComponent = (
    <ConfirmModal
      open={modal.open}
      title={modal.title}
      description={modal.description}
      confirmLabel={modal.confirmLabel}
      confirmVariant={modal.confirmVariant}
      onConfirm={() => {
        modal.action();
        close();
      }}
      onCancel={close}
    />
  );

  return { confirm, ConfirmModalComponent };
};
