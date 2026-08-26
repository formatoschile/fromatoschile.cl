"use client";

import React, { createContext, use, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ShowToastOptions {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ShowToastOptions) => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_DURATION_MS = 4000;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = ({
    message,
    variant = "info",
    durationMs = DEFAULT_DURATION_MS,
  }: ShowToastOptions) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => dismissToast(id), durationMs);
  };

  return (
    <ToastContext value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext>
  );
};

export function useToast() {
  const context = use(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
