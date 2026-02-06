"use client";

import React, { useState, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

// ============================================================
// Toast Types & Interfaces
// ============================================================
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// ============================================================
// Toast Context
// ============================================================
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// ============================================================
// Toast Provider
// ============================================================
interface ToastProviderProps {
  children: React.ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ============================================================
// Toast Container
// ============================================================
interface ToastContainerProps {
  toasts: Toast[];
  position: NonNullable<ToastProviderProps["position"]>;
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position,
  onRemove,
}) => {
  const positions = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-3 w-full max-w-sm",
        positions[position]
      )}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// ============================================================
// Toast Item
// ============================================================
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-info" />,
  };

  const borders = {
    success: "border-l-4 border-l-success",
    error: "border-l-4 border-l-error",
    warning: "border-l-4 border-l-warning",
    info: "border-l-4 border-l-info",
  };

  return (
    <div
      className={cn(
        "bg-white shadow-lg border border-neutral-200 p-4 flex items-start gap-3",
        "transform transition-all duration-300",
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0",
        borders[toast.type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-neutral-900">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm text-neutral-600">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleRemove}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-label="关闭"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ============================================================
// Toast Hook Helpers
// ============================================================
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string, duration?: number) =>
      addToast({ type: "success", title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      addToast({ type: "error", title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      addToast({ type: "warning", title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      addToast({ type: "info", title, message, duration }),
  };
};

// ============================================================
// Standalone Toast Component (for manual usage)
// ============================================================
interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  onClose,
  className,
}) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-info" />,
  };

  const borders = {
    success: "border-l-4 border-l-success",
    error: "border-l-4 border-l-error",
    warning: "border-l-4 border-l-warning",
    info: "border-l-4 border-l-info",
  };

  return (
    <div
      className={cn(
        "bg-white shadow-lg border border-neutral-200 p-4 flex items-start gap-3",
        borders[type],
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
        {message && <p className="mt-1 text-sm text-neutral-600">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ToastProvider;
