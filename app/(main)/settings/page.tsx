"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogIn, LogOut, User, Bell, Trash2, X, Loader2, AlertTriangle, Download, FileText } from "lucide-react";
import { FocusTrap } from "@/components/common/FocusTrap";
import { AppToast } from "@/components/common/AppToast";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import {
  exportWorkoutsCSV,
  exportBodyLogsCSV,
  downloadCSV,
} from "@/lib/utils/export";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast, show, dismiss } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [exporting, setExporting] = useState<"workouts" | "body" | null>(null);

  const handleExportWorkouts = useCallback(async () => {
    if (!user) return;
    setExporting("workouts");
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("workouts")
        .select("title, workout_date, blocks_json")
        .eq("user_id", user.id)
        .order("workout_date", { ascending: false });

      if (error) {
        show("データの取得に失敗しました", "error");
        return;
      }

      type BlockJson = { movements?: { nameJa?: string; weight?: number; reps?: number; sets?: number; category?: string }[] };
      const workouts = (data ?? []).map((w) => {
        const blocks = (Array.isArray(w.blocks_json) ? w.blocks_json : []) as BlockJson[];
        return {
          log_date: w.workout_date,
          title: w.title,
          movements: blocks.flatMap((b) =>
            (b.movements ?? []).map((m) => ({
              exercise_type: m.nameJa ?? "",
              weight: m.weight,
              reps: m.reps,
              sets: m.sets,
              category: m.category,
            })),
          ),
        };
      });

      const csv = exportWorkoutsCSV(workouts);
      downloadCSV(csv, `formcheck-workouts-${new Date().toISOString().split("T")[0]}.csv`);
      show("ワークアウトデータをエクスポートしました", "success");
    } catch {
      show("エクスポートに失敗しました", "error");
    } finally {
      setExporting(null);
    }
  }, [user, show]);

  const handleExportBody = useCallback(async () => {
    if (!user) return;
    setExporting("body");
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("body_logs")
        .select("log_date, weight, body_fat_pct")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false });

      if (error) {
        show("データの取得に失敗しました", "error");
        return;
      }

      const logs = (data ?? []).map((l) => ({
        log_date: l.log_date,
        weight_kg: l.weight,
        body_fat_pct: l.body_fat_pct,
      }));

      const csv = exportBodyLogsCSV(logs);
      downloadCSV(csv, `formcheck-body-${new Date().toISOString().split("T")[0]}.csv`);
      show("体組成データをエクスポートしました", "success");
    } catch {
      show("エクスポートに失敗しました", "error");
    } finally {
      setExporting(null);
    }
  }, [user, show]);

  const handleCacheClear = useCallback(() => {
    sessionStorage.clear();
    localStorage.removeItem("formcheck_onboarding_complete");
    setConfirmOpen(false);
    show("キャッシュをクリアしました", "success");
  }, [show]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  }, [signOut, router]);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmText !== "削除する") return;
    setDeletingAccount(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setDeletingAccount(false);
      show("アカウント削除に失敗しました", "error");
      return;
    }
    await signOut();
    router.push("/login");
    router.refresh();
  }, [deleteConfirmText, signOut, router, show]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-title">設定</h1>

      {/* User card */}
      <section className="flex items-center gap-4 rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
          <User size={22} strokeWidth={1.5} className="text-muted" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-title">{user?.email ?? "ゲストユーザー"}</p>
          {user && (
            <p className="mt-0.5 text-xs text-muted">ログイン中</p>
          )}
        </div>
        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-extrabold tracking-wide text-secondary transition-all duration-150 active:scale-[0.98]"
          >
            <LogOut size={13} strokeWidth={1.5} />
            ログアウト
          </button>
        ) : (
          <Link
            href="/login"
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-inverse px-4 py-2 text-xs font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98]"
          >
            <LogIn size={13} strokeWidth={1.5} />
            ログイン
          </Link>
        )}
      </section>

      {/* Profile */}
      {!authLoading && user && <ProfileForm userId={user.id} onToast={show} />}

      {/* General */}
      <section>
        <h2 className="mb-3 px-1 text-xs font-title uppercase tracking-[0.12em] text-muted">
          一般
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <MenuItem icon={Bell} label="通知" sub="準備中" />
        </div>
      </section>

      {/* Export */}
      {user && (
        <section>
          <h2 className="mb-3 px-1 text-xs font-title uppercase tracking-[0.12em] text-muted">
            データエクスポート
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <button
              type="button"
              onClick={handleExportWorkouts}
              disabled={exporting === "workouts"}
              className="flex min-h-[62px] w-full items-center gap-3.5 px-[18px] text-left transition-colors active:bg-surface disabled:opacity-50"
            >
              {exporting === "workouts" ? (
                <Loader2 size={18} strokeWidth={1.5} className="animate-spin text-primary" />
              ) : (
                <Download size={18} strokeWidth={1.5} className="text-primary" />
              )}
              <div className="flex-1">
                <span className="text-sm font-semibold text-primary">ワークアウト CSV</span>
                <p className="text-xs text-secondary">全ワークアウト履歴をエクスポート</p>
              </div>
              <ChevronRight size={16} strokeWidth={1.5} className="text-muted" />
            </button>
            <button
              type="button"
              onClick={handleExportBody}
              disabled={exporting === "body"}
              className="flex min-h-[62px] w-full items-center gap-3.5 px-[18px] text-left transition-colors active:bg-surface disabled:opacity-50"
            >
              {exporting === "body" ? (
                <Loader2 size={18} strokeWidth={1.5} className="animate-spin text-primary" />
              ) : (
                <FileText size={18} strokeWidth={1.5} className="text-primary" />
              )}
              <div className="flex-1">
                <span className="text-sm font-semibold text-primary">体組成 CSV</span>
                <p className="text-xs text-secondary">体重・体脂肪率をエクスポート</p>
              </div>
              <ChevronRight size={16} strokeWidth={1.5} className="text-muted" />
            </button>
          </div>
        </section>
      )}

      {/* Data */}
      <section>
        <h2 className="mb-3 px-1 text-xs font-title uppercase tracking-[0.12em] text-muted">
          データ
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex min-h-[62px] w-full items-center gap-3.5 px-[18px] text-left transition-colors active:bg-surface"
          >
            <Trash2 size={18} strokeWidth={1.5} className="text-danger" />
            <span className="flex-1 text-lg font-semibold text-danger">キャッシュクリア</span>
            <ChevronRight size={16} strokeWidth={1.5} className="text-muted" />
          </button>
        </div>
      </section>

      {/* Danger zone */}
      {user && (
        <section>
          <h2 className="mb-3 px-1 text-xs font-title uppercase tracking-[0.12em] text-danger/80">
            危険ゾーン
          </h2>
          <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <button
              type="button"
              onClick={() => setDeleteAccountOpen(true)}
              className="flex min-h-[62px] w-full items-center gap-3.5 px-[18px] text-left transition-colors active:bg-surface"
            >
              <AlertTriangle size={18} strokeWidth={1.5} className="text-danger" />
              <span className="flex-1 text-lg font-semibold text-danger">アカウント削除</span>
              <ChevronRight size={16} strokeWidth={1.5} className="text-muted" />
            </button>
          </div>
        </section>
      )}

      <p className="pt-4 text-center text-xs text-muted">FormCheck v0.5.0</p>

      {/* Cache clear confirmation */}
      {confirmOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setConfirmOpen(false)}
            aria-label="閉じる"
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md"
            role="alertdialog"
            aria-modal="true"
            aria-label="キャッシュクリアの確認"
          >
            <FocusTrap>
              <div className="rounded-t-[18px] bg-white px-6 pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-5 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-sheet-up">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold tracking-tight">キャッシュをクリアしますか？</h3>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
                    aria-label="閉じる"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  セッションデータとオンボーディング状態がリセットされます。
                </p>
                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    className="min-h-[44px] flex-1 rounded-xl bg-chip text-sm font-extrabold text-secondary transition-all duration-150 active:scale-[0.98]"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleCacheClear}
                    className="min-h-[44px] flex-[2] rounded-xl bg-danger text-sm font-extrabold text-white transition-all duration-150 active:scale-[0.98]"
                  >
                    クリアする
                  </button>
                </div>
              </div>
            </FocusTrap>
          </div>
        </>
      )}

      {/* Account deletion confirmation */}
      {deleteAccountOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={() => { setDeleteAccountOpen(false); setDeleteConfirmText(""); }}
            aria-label="閉じる"
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md"
            role="alertdialog"
            aria-modal="true"
            aria-label="アカウント削除の確認"
          >
            <FocusTrap>
              <div className="rounded-t-[18px] bg-white px-6 pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-5 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-sheet-up">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold tracking-tight text-danger">アカウントを削除しますか？</h3>
                  <button
                    type="button"
                    onClick={() => { setDeleteAccountOpen(false); setDeleteConfirmText(""); }}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
                    aria-label="閉じる"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  すべてのデータ（プロフィール、動画、体重記録など）が完全に削除されます。この操作は取り消せません。
                </p>
                <div className="mt-4">
                  <label className="text-xs font-semibold text-secondary">
                    確認のため「削除する」と入力してください
                  </label>
                  <input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="削除する"
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-primary placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-danger/30"
                  />
                </div>
                <div className="mt-5 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setDeleteAccountOpen(false); setDeleteConfirmText(""); }}
                    className="min-h-[44px] flex-1 rounded-xl bg-chip text-sm font-extrabold text-secondary transition-all duration-150 active:scale-[0.98]"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "削除する" || deletingAccount}
                    className="flex min-h-[44px] flex-[2] items-center justify-center gap-2 rounded-xl bg-danger text-sm font-extrabold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
                  >
                    {deletingAccount && <Loader2 size={14} className="animate-spin" />}
                    完全に削除する
                  </button>
                </div>
              </div>
            </FocusTrap>
          </div>
        </>
      )}

      <AppToast toast={toast} onDismiss={dismiss} />
    </div>
  );
}

type MenuItemProps = {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  sub?: string;
};

function MenuItem({ icon: Icon, label, sub }: MenuItemProps) {
  return (
    <button
      type="button"
      className="flex min-h-[62px] w-full items-center gap-3.5 px-[18px] text-left transition-colors active:bg-surface"
    >
      <Icon size={18} strokeWidth={1.5} className="text-secondary" />
      <span className="flex-1 text-lg font-semibold text-primary">{label}</span>
      {sub && <span className="text-sm text-muted">{sub}</span>}
      <ChevronRight size={16} strokeWidth={1.5} className="text-muted" />
    </button>
  );
}
