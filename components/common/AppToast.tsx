"use client";

import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import type { ToastState } from "@/lib/hooks/useToast";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
} as const;

const BG = {
  success: "bg-inverse text-on-inverse",
  error: "bg-danger text-white",
  info: "bg-inverse text-on-inverse",
} as const;

interface AppToastProps {
  toast: ToastState;
  onDismiss: () => void;
}

export function AppToast({ toast, onDismiss }: AppToastProps) {
  const Icon = ICONS[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-[max(1rem,env(safe-area-inset-top,16px))] z-[300] -translate-x-1/2 transition-all duration-300 ${
        toast.visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-4 opacity-0"
      }`}
    >
      <div className={`flex items-center gap-2.5 rounded-2xl px-5 py-3.5 shadow-lg ${BG[toast.type]}`}>
        <Icon size={16} strokeWidth={2} className="shrink-0" />
        <span className="text-sm font-bold">{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 shrink-0 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="閉じる"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
