"use client";

import { useState } from "react";
import { PenSquare, Scale } from "lucide-react";
import { BodyDetail } from "@/components/body/BodyDetail";
import { BodyLogForm } from "@/components/body/BodyLogForm";
import { MOCK_BODY_LOGS } from "@/lib/mocks/bodyLogs";
import { FocusTrap } from "@/components/common/FocusTrap";

export default function BodyPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isEmpty = MOCK_BODY_LOGS.length === 0;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)]">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            Body
          </p>
          <h1 className="mt-1 text-xl font-title tracking-tight">ボディログ</h1>
        </div>
        <p className="pb-1 text-xs font-caption text-muted">
          全 {MOCK_BODY_LOGS.length} 件
        </p>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <Scale size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">まだ記録がありません</p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            右下の「記録する」から体重・体脂肪率を記録しましょう。推移をグラフで確認できます。
          </p>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
          >
            <PenSquare size={14} strokeWidth={2} />
            最初の記録を追加
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <BodyDetail />
        </div>
      )}

      {/* Backdrop */}
      {sheetOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] transition-opacity"
          aria-label="閉じる"
          onClick={() => setSheetOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      {sheetOpen && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md"
          role="dialog"
          aria-modal="true"
          aria-label="記録を追加"
        >
          <FocusTrap>
            <div className="pointer-events-auto max-h-[min(92dvh,calc(100dvh-1rem))] overflow-y-auto rounded-t-[18px] animate-fade-in">
              <BodyLogForm onClose={() => setSheetOpen(false)} />
            </div>
          </FocusTrap>
        </div>
      )}

      {/* FAB */}
      {!sheetOpen && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="記録を追加"
          className="fixed bottom-20 right-5 z-40 flex items-center gap-2 rounded-full bg-inverse px-5 py-3.5 text-xs font-extrabold tracking-wide text-on-inverse shadow-lg transition-all duration-200 active:scale-95"
        >
          <PenSquare size={14} strokeWidth={2} />
          記録する
        </button>
      )}
    </div>
  );
}
