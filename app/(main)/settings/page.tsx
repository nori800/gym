"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, LogIn, User, Moon, Bell, Trash2 } from "lucide-react";

export default function SettingsPage() {
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
          <MenuItem icon={Moon} label="テーマ" sub="ライト" />
          <MenuItem icon={Bell} label="通知" />
        </div>
      </section>

      {/* Data */}
      <section>
        <h2 className="mb-3 px-1 text-xs font-title uppercase tracking-[0.12em] text-muted">
          データ
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <MenuItem icon={Trash2} label="キャッシュクリア" danger />
        </div>
      </section>

      <p className="pt-4 text-center text-xs text-muted">FormCheck v0.1.0</p>
    </div>
  );
}

function ProfileForm() {
  const [name, setName] = useState("ゲストユーザー");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");

  const handleSave = () => {
    console.log("profile save", { name, height, weight, goal });
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
            保存
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
  danger?: boolean;
};

function MenuItem({ icon: Icon, label, sub, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      className="flex min-h-[62px] w-full items-center gap-3.5 px-[18px] text-left transition-colors active:bg-surface"
    >
      <Icon size={18} strokeWidth={1.5} className={danger ? "text-danger" : "text-secondary"} />
      <span className={`flex-1 text-lg font-semibold ${danger ? "text-danger" : "text-primary"}`}>
        {label}
      </span>
      {sub && <span className="text-sm text-muted">{sub}</span>}
      <ChevronRight size={16} strokeWidth={1.5} className="text-muted" />
    </button>
  );
}
