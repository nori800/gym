"use client";

import { Loader2 } from "lucide-react";

interface Props {
  memo: string;
  saving: boolean;
  onMemoChange: (v: string) => void;
  onSave: () => void;
}

export function MemoPanel({ memo, saving, onMemoChange, onSave }: Props) {
  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        rows={3}
        placeholder="フォームの気づきなど"
        className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/10"
      />
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-colors duration-150 active:scale-[0.98] disabled:opacity-40"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        保存
      </button>
    </div>
  );
}
