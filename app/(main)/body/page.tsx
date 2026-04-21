"use client";

import { useState } from "react";
import { PenSquare } from "lucide-react";
import { BodyDetail } from "@/components/body/BodyDetail";
import { BodyLogForm } from "@/components/body/BodyLogForm";
import { MOCK_BODY_LOGS } from "@/lib/mocks/bodyLogs";

export default function BodyPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100dvh-6rem)]">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-caption uppercase tracking-[0.12em] text-muted">
            Body
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-tight">ボディログ</h1>
        </div>
        <p className="pb-1 text-[11px] font-caption text-muted">
          全 {MOCK_BODY_LOGS.length} 件
        </p>
      </header>

      <div className="mt-6">
        <BodyDetail />
      </div>

      {sheetOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px] transition-opacity"
          aria-label="閉じる"
          onClick={() => setSheetOpen(false)}
        />
      )}

      {sheetOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md">
          <div className="pointer-events-auto max-h-[min(92dvh,calc(100dvh-1rem))] overflow-y-auto rounded-t-2xl animate-fade-in">
            <BodyLogForm onClose={() => setSheetOpen(false)} />
          </div>
        </div>
      )}

      {!sheetOpen && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="記録を追加"
          className="fixed bottom-20 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-inverse text-on-inverse shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 active:scale-95"
        >
          <PenSquare size={20} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
