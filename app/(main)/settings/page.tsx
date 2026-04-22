"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, LogIn, User, Bell, Trash2, X } from "lucide-react";
import { FocusTrap } from "@/components/common/FocusTrap";

export default function SettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCacheClear = useCallback(() => {
    sessionStorage.clear();
    localStorage.removeItem("formcheck_onboarding_complete");
    setConfirmOpen(false);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-title">設定</h1>

      {/* User card */}
      <section className="flex items-center gap-4 rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
          <User size={22} strokeWidth={1.5} className="text-muted" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-title">ゲストユーザー</p>
        </div>
        <Link
          href="/login"
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-inverse px-4 py-2 text-xs font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98]"
        >
          <LogIn size={13} strokeWidth={1.5} />
          ログイン
        </Link>
      </section>

      {/* Profile */}
      <ProfileForm />

      {/* General */}
      <section>
        <h2 className="mb-3 px-1 text-xs font-title uppercase tracking-[0.12em] text-muted">
          一般
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <MenuItem icon={Bell} label="通知" sub="準備中" />
        </div>
      </section>

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

      <p className="pt-4 text-center text-xs text-muted">FormCheck v0.1.0</p>

      {/* Cache clear confirmation dialog */}
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
                    className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
                    aria-label="閉じる"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  セッションデータとオンボーディング状態がリセットされます。ワークアウト履歴のモックデータには影響しません。
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
    </div>
  );
}

function ProfileForm() {
  const [name, setName] = useState("ゲストユーザー");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("formcheck_profile", JSON.stringify({ name, height, weight, goal }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section>
      <h2 className="mb-3 px-1 text-xs font-title uppercase tracking-[0.12em] text-muted">
        プロフィール
      </h2>
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="divide-y divide-border">
          <FieldRow label="表示名">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              aria-label="表示名"
              className="w-full bg-transparent text-right text-sm font-metric text-primary focus:outline-none"
            />
          </FieldRow>
          <FieldRow label="身長">
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                aria-label="身長（cm）"
                className="w-16 bg-transparent text-right text-sm font-metric text-primary placeholder:text-muted/50 focus:outline-none"
              />
              <span className="text-xs text-muted">cm</span>
            </div>
          </FieldRow>
          <FieldRow label="体重">
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
                aria-label="体重（kg）"
                className="w-16 bg-transparent text-right text-sm font-metric text-primary placeholder:text-muted/50 focus:outline-none"
              />
              <span className="text-xs text-muted">kg</span>
            </div>
          </FieldRow>
          <FieldRow label="目標">
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              maxLength={200}
              placeholder="ベンチプレス 100kg"
              aria-label="目標"
              className="w-full bg-transparent text-right text-sm text-primary placeholder:text-muted/50 focus:outline-none"
            />
          </FieldRow>
        </div>
        <div className="px-[18px] py-3.5">
          <button
            type="button"
            onClick={handleSave}
            className="min-h-[44px] w-full rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98]"
          >
            {saved ? "保存しました" : "保存"}
          </button>
        </div>
      </div>
    </section>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[62px] items-center justify-between gap-4 px-[18px]">
      <label className="shrink-0 text-lg font-semibold">{label}</label>
      <div className="min-w-0 flex-1">{children}</div>
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
    <div className="flex min-h-[62px] w-full items-center gap-3.5 px-[18px] text-left">
      <Icon size={18} strokeWidth={1.5} className="text-secondary" />
      <span className="flex-1 text-lg font-semibold text-primary">{label}</span>
      {sub && <span className="text-sm text-muted">{sub}</span>}
      <ChevronRight size={16} strokeWidth={1.5} className="text-muted" />
    </div>
  );
}
