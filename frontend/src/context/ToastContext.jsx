import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircleIcon, AlertCircleIcon, XCircleIcon, XIcon } from "../components/common/Icons";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-lg border p-3.5 shadow-lg transition-all ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : toast.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-blue-200 bg-blue-50 text-blue-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && (
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
              )}
              {toast.type === "error" && (
                <XCircleIcon className="h-5 w-5 shrink-0 text-rose-600" />
              )}
              {toast.type === "info" && (
                <AlertCircleIcon className="h-5 w-5 shrink-0 text-blue-600" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded p-1 text-slate-400 hover:text-slate-700"
              aria-label="Dismiss toast"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.log("Toast:", msg),
      removeToast: () => {},
    };
  }
  return context;
}
