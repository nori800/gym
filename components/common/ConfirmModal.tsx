"use client";

import { useCallback, useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel],
  );

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-[210] flex items-center justify-center px-6"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={handleKeyDown}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fade-in">
          <h3 className="text-base font-bold tracking-tight text-primary">{title}</h3>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-secondary">{description}</p>
          )}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex flex-1 min-h-[44px] items-center justify-center rounded-xl bg-chip text-sm font-bold text-secondary transition-all active:scale-[0.98]"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className={`flex flex-1 min-h-[44px] items-center justify-center rounded-xl text-sm font-extrabold transition-all active:scale-[0.98] ${
                danger
                  ? "bg-danger text-white"
                  : "bg-inverse text-on-inverse"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
