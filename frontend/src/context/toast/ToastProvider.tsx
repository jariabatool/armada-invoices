import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { ToastContext, type Toast, type ToastContextValue, type ToastVariant } from "./toast-context";

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.variant}`} role="status">
            {toast.variant === "success" ? <CheckCircle2 size={18} aria-hidden /> : <XCircle size={18} aria-hidden />}
            <span className="toast__message">{toast.message}</span>
            <button type="button" className="toast__close" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
              <X size={16} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
