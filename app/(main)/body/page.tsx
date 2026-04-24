"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PenSquare, Scale, Loader2, LogIn } from "lucide-react";
import { BodyDetail } from "@/components/body/BodyDetail";
import { BodyLogForm } from "@/components/body/BodyLogForm";
import { FocusTrap } from "@/components/common/FocusTrap";
import { AppToast } from "@/components/common/AppToast";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import type { BodyLog } from "@/types";

export default function BodyPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast, show, dismiss } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BodyLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BodyLog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [logs, setLogs] = useState<BodyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setFetchError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("body_logs")
      .select("id, user_id, log_date, weight, body_fat_pct, created_at")
      .eq("user_id", user.id)
      .order("log_date", { ascending: true });

    if (error) {
      setFetchError("ボディログの取得に失敗しました。再読み込みしてください。");
      setLogs([]);
      setLoading(false);
      return;
    }

    if (data) {
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
      setLogs([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchLogs();
  }, [authLoading, fetchLogs]);

  const handleSaved = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  const openEdit = useCallback((log: BodyLog) => {
    setEditTarget(log);
    setSheetOpen(true);
  }, []);

  const openNew = useCallback(() => {
    setEditTarget(null);
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || !user) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("body_logs")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("user_id", user.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      show("削除に失敗しました", "error");
    } else {
      show("記録を削除しました", "success");
      fetchLogs();
    }
  }, [deleteTarget, user, fetchLogs, show]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-[calc(100dvh-6rem)]">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">Body</p>
            <h1 className="mt-1 text-xl font-title tracking-tight">ボディログ</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <LogIn size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">ログインして記録を始めよう</p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            体重・体脂肪率を記録して推移を確認するには、ログインが必要です。
          </p>
          <Link
            href="/login"
            className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
          >
            <LogIn size={14} strokeWidth={2} />
            ログインする
          </Link>
        </div>
      </div>
    );
  }

  const isEmpty = logs.length === 0;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)]">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">Body</p>
          <h1 className="mt-1 text-xl font-title tracking-tight">ボディログ</h1>
        </div>
        {!isEmpty && (
          <p className="pb-1 text-xs font-caption text-muted">全 {logs.length} 件</p>
        )}
      </header>

      {fetchError && (
        <div className="mt-4 rounded-xl bg-danger/10 px-4 py-3">
          <p className="text-sm font-bold text-danger">{fetchError}</p>
        </div>
      )}

      {isEmpty && !fetchError ? (
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
            onClick={openNew}
            className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
          >
            <PenSquare size={14} strokeWidth={2} />
            最初の記録を追加
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <BodyDetail
            logs={logs}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      )}

      {/* Sheet: new / edit */}
      {sheetOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] transition-opacity"
          aria-label="閉じる"
          onClick={() => { setSheetOpen(false); setEditTarget(null); }}
        />
      )}

      {sheetOpen && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md"
          role="dialog"
          aria-modal="true"
          aria-label={editTarget ? "記録を編集" : "記録を追加"}
        >
          <FocusTrap>
            <div className="pointer-events-auto max-h-[min(92dvh,calc(100dvh-1rem))] overflow-y-auto rounded-t-[18px] animate-fade-in">
              <BodyLogForm
                editLog={editTarget}
                onClose={() => { setSheetOpen(false); setEditTarget(null); }}
                onSaved={handleSaved}
              />
            </div>
          </FocusTrap>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setDeleteTarget(null)}
            aria-label="閉じる"
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md"
            role="alertdialog"
            aria-modal="true"
            aria-label="記録を削除"
          >
            <FocusTrap>
              <div className="rounded-t-[18px] bg-white px-6 pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-5 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-sheet-up">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
                <h3 className="text-lg font-bold tracking-tight">この記録を削除しますか？</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  {deleteTarget.log_date} の記録（{deleteTarget.weight} kg）を削除します。この操作は取り消せません。
                </p>
                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="min-h-[44px] flex-1 rounded-xl bg-chip text-sm font-extrabold text-secondary transition-all duration-150 active:scale-[0.98]"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex min-h-[44px] flex-[2] items-center justify-center gap-2 rounded-xl bg-danger text-sm font-extrabold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                  >
                    {deleting && <Loader2 size={14} className="animate-spin" />}
                    削除する
                  </button>
                </div>
              </div>
            </FocusTrap>
          </div>
        </>
      )}

      {!sheetOpen && !deleteTarget && (
        <button
          type="button"
          onClick={openNew}
          aria-label="記録を追加"
          className="fixed bottom-20 right-5 z-40 flex items-center gap-2 rounded-full bg-inverse px-5 py-3.5 text-xs font-extrabold tracking-wide text-on-inverse shadow-lg transition-all duration-200 active:scale-95"
        >
          <PenSquare size={14} strokeWidth={2} />
          記録する
        </button>
      )}

      <AppToast toast={toast} onDismiss={dismiss} />
    </div>
  );
}
