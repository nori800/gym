"use client";

import { X, Loader2 } from "lucide-react";
import type { Json } from "@/types/database.types";

type TemplateRow = {
  id: string;
  title: string;
  blocks_json: Json;
  categories: string[];
};

interface Props {
  templates: TemplateRow[];
  loading: boolean;
  onSelect: (tpl: TemplateRow) => void;
  onClose: () => void;
}

export function TemplatePickerSheet({ templates, loading, onSelect, onClose }: Props) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="閉じる"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md"
        role="dialog"
        aria-modal="true"
        aria-label="テンプレート一覧"
      >
        <div className="max-h-[70dvh] overflow-y-auto rounded-t-[18px] bg-white pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-fade-in">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
          <div className="px-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight">テンプレートから作成</h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
                aria-label="閉じる"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={20} className="animate-spin text-muted" />
              </div>
            ) : templates.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-secondary">テンプレートがありません</p>
                <p className="mt-1 text-xs text-muted">
                  ワークアウト作成後に「テンプレートとして保存」できます
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onSelect(tpl)}
                    className="w-full rounded-[14px] bg-surface px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.99]"
                  >
                    <p className="text-sm font-bold tracking-tight">{tpl.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {tpl.categories.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-extrabold text-secondary"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
