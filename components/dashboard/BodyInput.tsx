"use client";

import { useState } from "react";
import { Scale } from "lucide-react";

export function BodyInput() {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [fat, setFat] = useState("");

  const handleSave = () => {
    console.log("body log", { weight: parseFloat(weight), body_fat: fat ? parseFloat(fat) : null });
    setWeight("");
    setFat("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface py-3 text-xs font-title text-primary transition-colors active:bg-surface/80"
      >
        <Scale size={14} strokeWidth={1.5} />
        体重・体脂肪を記録
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-caption text-muted">体重 (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="70.0"
            autoFocus
            className="h-10 w-full rounded-lg border-0 bg-white px-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-caption text-muted">体脂肪率 (%)</label>
          <input
            type="number"
            step="0.1"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="16.0"
            className="h-10 w-full rounded-lg border-0 bg-white px-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-9 flex-1 rounded-lg text-xs font-title text-secondary transition-colors active:text-primary"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!weight}
          className="h-9 flex-1 rounded-lg bg-accent text-xs font-title text-primary transition-all active:scale-[0.98] disabled:opacity-40"
        >
          記録
        </button>
      </div>
    </div>
  );
}
