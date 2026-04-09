import { useContext } from "react";
import { ToastStateContext, ToastActionsContext } from "../../hooks/useToast";
import { Alert } from "./Alert";

export const ToastContainer = () => {
  const toasts = useContext(ToastStateContext);
  const actions = useContext(ToastActionsContext);
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 w-full max-w-xs">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onDismiss={() => actions?.removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
