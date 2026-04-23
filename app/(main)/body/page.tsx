"use client";

import { useState, useEffect, useCallback } from "react";
import { PenSquare, Scale, Loader2 } from "lucide-react";
import { BodyDetail } from "@/components/body/BodyDetail";
import { BodyLogForm } from "@/components/body/BodyLogForm";
import { FocusTrap } from "@/components/common/FocusTrap";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { MOCK_BODY_LOGS } from "@/lib/mocks/bodyLogs";
import type { BodyLog } from "@/types";

export default function BodyPage() {
  const { user, loading: authLoading } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [logs, setLogs] = useState<BodyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs(MOCK_BODY_LOGS);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("body_logs")
      .select("id, user_id, log_date, weight, body_fat_pct, created_at")
      .eq("user_id", user.id)
      .order("log_date", { ascending: true });

    if (data && data.length > 0) {
      setLogs(
        data.map((d: { id: string; user_id: string; log_date: string; weight: number | null; body_fat_pct: number | null; created_at: string }) => ({
          id: d.id,
          user_id: d.user_id,
          log_date: d.log_date,
          weight: d.weight ?? 0,
          body_fat: d.body_fat_pct ?? null,
          created_at: d.created_at,
        })),
      );
    } else {
      setLogs(MOCK_BODY_LOGS);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchLogs();
  }, [authLoading, fetchLogs]);

  const handleSaved = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  const isEmpty = logs.length === 0;

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-6rem)]">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">Body</p>
          <h1 className="mt-1 text-xl font-title tracking-tight">ボディログ</h1>
        </div>
        <p className="pb-1 text-xs font-caption text-muted">全 {logs.length} 件</p>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <Scale size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">体重を記録しよう</p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            体重・体脂肪率を定期的に記録して、推移をグラフで確認できます。
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
          <BodyDetail logs={logs} />
        </div>
      )}

      {sheetOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] transition-opacity"
          aria-label="閉じる"
          onClick={() => setSheetOpen(false)}
        />
      )}

      {sheetOpen && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md"
          role="dialog"
          aria-modal="true"
          aria-label="記録を追加"
        >
          <FocusTrap>
            <div className="pointer-events-auto max-h-[min(92dvh,calc(100dvh-1rem))] overflow-y-auto rounded-t-[18px] animate-fade-in">
              <BodyLogForm onClose={() => setSheetOpen(false)} onSaved={handleSaved} />
            </div>
          </FocusTrap>
        </div>
      )}

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
