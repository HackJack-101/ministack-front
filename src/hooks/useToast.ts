import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { createElement } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastActions {
  addToast: (type: ToastType, message: string, durationMs?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastStateContext = createContext<Toast[]>([]);
export const ToastActionsContext = createContext<ToastActions | null>(null);

export const useToast = () => {
  const actions = useContext(ToastActionsContext);
  if (!actions) throw new Error("useToast must be used within ToastProvider");

  return useMemo(
    () => ({
      success: (message: string) => actions.addToast("success", message, 4000),
      error: (message: string) => actions.addToast("error", message),
      info: (message: string) => actions.addToast("info", message, 4000),
      warning: (message: string) => actions.addToast("warning", message, 6000),
      dismiss: actions.removeToast,
    }),
    [actions],
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, durationMs?: number) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      if (durationMs) {
        setTimeout(() => removeToast(id), durationMs);
      }
    },
    [removeToast],
  );

  const actions = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return createElement(
    ToastStateContext.Provider,
    { value: toasts },
    createElement(ToastActionsContext.Provider, { value: actions }, children),
  );
};
