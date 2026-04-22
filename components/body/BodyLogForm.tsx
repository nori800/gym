"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PrimaryRecordButton } from "@/components/common/PrimaryRecordButton";
import { DatePickerField } from "@/components/common/DatePickerField";

type BodyLogFormProps = {
  onClose: () => void;
  onSaved?: () => void;
};

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function BodyLogForm({ onClose, onSaved }: BodyLogFormProps) {
  const [date, setDate] = useState(getTodayString);
  const [weight, setWeight] = useState("");
  const [fat, setFat] = useState("");

  const handleSave = () => {
    if (!weight) return;
    console.log("body log", {
      log_date: date,
      weight: parseFloat(weight),
      body_fat: fat ? parseFloat(fat) : null,
    });
    setWeight("");
    setFat("");
    onSaved?.();
    onClose();
  };

  return (
    <div className="rounded-t-[18px] bg-white px-5 pb-[max(1.75rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            Body
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight">記録を追加</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
          aria-label="閉じる"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-5">
        <DatePickerField value={date} onChange={setDate} aria-label="記録する日を選択" />
      </div>

      <div className="mt-3 overflow-hidden rounded-[18px] bg-surface shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex min-h-[62px] items-center justify-between border-b border-border px-[18px]">
          <label htmlFor="weight-input" className="text-lg font-semibold">体重</label>
          <div className="flex items-baseline gap-1">
            <input
              id="weight-input"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70.0"
              autoFocus
              className="w-20 bg-transparent text-right text-lg font-metric text-primary placeholder:text-muted/50 focus:outline-none"
            />
            <span className="text-sm text-muted">kg</span>
          </div>
        </div>
        <div className="flex min-h-[62px] items-center justify-between px-[18px]">
          <label htmlFor="fat-input" className="text-lg font-semibold">体脂肪率</label>
          <div className="flex items-baseline gap-1">
            <input
              id="fat-input"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="16.0"
              className="w-20 bg-transparent text-right text-lg font-metric text-primary placeholder:text-muted/50 focus:outline-none"
            />
            <span className="text-sm text-muted">%</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] flex-1 rounded-xl bg-chip text-sm font-extrabold text-secondary transition-all duration-150 active:scale-[0.98]"
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
