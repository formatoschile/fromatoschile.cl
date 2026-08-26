"use client";

import React from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { classNames } from "@/lib/utils/classNames";

import type { ToastItem } from "./ToastContext";

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const VARIANT_ICON = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const Icon = VARIANT_ICON[toast.variant];

  const handleDismiss = () => {
    onDismiss(toast.id);
  };

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      className={classNames(
        "border-ink pointer-events-auto flex w-full max-w-sm items-start gap-3 border bg-white px-4 py-3 shadow-lg",
        {
          "border-red-600": toast.variant === "error",
          "border-brand-ink": toast.variant === "success",
        }
      )}
    >
      <Icon
        className={classNames("mt-0.5 h-5 w-5 flex-none", {
          "text-red-600": toast.variant === "error",
          "text-brand-ink": toast.variant === "success",
          "text-ink": toast.variant === "info",
        })}
      />
      <p className="text-ink flex-1 text-sm">{toast.message}</p>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={handleDismiss}
        className="text-ink/60 hover:text-ink cursor-pointer"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
