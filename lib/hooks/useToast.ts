"use client";

import { useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "info";

export type ToastState = {
  message: string;
  type: ToastType;
  visible: boolean;
};

export function useToast(defaultDuration = 3000) {
  const [toast, setToast] = useState<ToastState>({ message: "", type: "info", visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = "info", duration?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, duration ?? defaultDuration);
  }, [defaultDuration]);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return { toast, show, dismiss };
}
