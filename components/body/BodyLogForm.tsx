"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PrimaryRecordButton } from "@/components/common/PrimaryRecordButton";

type BodyLogFormProps = {
  onClose: () => void;
  onSaved?: () => void;
};

/** ボディ記録フォーム（ワークアウトのメタ画面と同系の白カード） */
export function BodyLogForm({ onClose, onSaved }: BodyLogFormProps) {
  const [weight, setWeight] = useState("");
  const [fat, setFat] = useState("");

  const handleSave = () => {
    if (!weight) return;
    console.log("body log", {
      weight: parseFloat(weight),
      body_fat: fat ? parseFloat(fat) : null,
    });
    setWeight("");
    setFat("");
    onSaved?.();
    onClose();
  };

  return (
    <div className="rounded-t-2xl bg-white px-5 pb-[max(1.75rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-caption uppercase tracking-[0.12em] text-muted">
            Body
          </p>
          <h2 className="mt-0.5 text-[15px] font-bold tracking-tight">記録を追加</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
          aria-label="閉じる"
        >
          <X size={20} strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">
            体重 (kg)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="70.0"
            autoFocus
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13px] font-bold text-primary placeholder:text-muted/50 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">
            体脂肪率 (%)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="16.0"
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13px] font-bold text-primary placeholder:text-muted/50 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 flex-1 rounded-xl bg-chip text-[12px] font-bold text-secondary transition-transform duration-150 active:scale-[0.98]"
        >
          キャンセル
        </button>
        <PrimaryRecordButton
          type="button"
          onClick={handleSave}
          disabled={!weight}
          className="flex-[2]"
        >
          記録する
        </PrimaryRecordButton>
      </div>
    </div>
  );
}
