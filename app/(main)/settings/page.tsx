"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, LogIn, User, Moon, Bell, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <h1 className="text-xl font-title">設定</h1>

      <section className="flex items-center gap-4 rounded-xl bg-surface p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
          <User size={22} strokeWidth={1.5} className="text-muted" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-title">ゲストユーザー</p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-title text-primary transition-all active:scale-[0.98]"
        >
          <LogIn size={13} strokeWidth={1.5} />
          ログイン
        </Link>
      </section>

      <ProfileForm />

      <section>
        <h2 className="mb-3 px-1 text-xs font-title text-muted">
          一般
        </h2>
        <div className="divide-y divide-border rounded-xl bg-surface">
          <MenuItem icon={Moon} label="テーマ" sub="ライト" />
          <MenuItem icon={Bell} label="通知" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 px-1 text-xs font-title text-muted">
          データ
        </h2>
        <div className="divide-y divide-border rounded-xl bg-surface">
          <MenuItem icon={Trash2} label="キャッシュクリア" danger />
        </div>
      </section>

      <p className="pt-4 text-center text-[11px] text-muted">FormCheck v0.1.0</p>
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
      <h2 className="mb-3 px-1 text-xs font-title text-muted">
        プロフィール
      </h2>
      <div className="space-y-3 rounded-xl bg-surface p-4">
        <Field label="表示名">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            className="h-12 w-full rounded-xl border-0 bg-white px-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="身長 (cm)">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              className="h-12 w-full rounded-xl border-0 bg-white px-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </Field>
          <Field label="体重 (kg)">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="65"
              className="h-12 w-full rounded-xl border-0 bg-white px-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </Field>
        </div>
        <Field label="目標">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            maxLength={200}
            placeholder="ベンチプレス 100kg"
            className="h-12 w-full rounded-xl border-0 bg-white px-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </Field>
        <button
          type="button"
          onClick={handleSave}
          className="h-12 w-full rounded-xl bg-accent text-xs font-title text-primary transition-all active:scale-[0.98]"
        >
          保存
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-label text-secondary">{label}</label>
      {children}
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
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-white/60"
    >
      <Icon size={18} strokeWidth={1.5} className={danger ? "text-danger" : "text-secondary"} />
      <span className={`flex-1 text-sm font-label ${danger ? "text-danger" : "text-primary"}`}>
        {label}
      </span>
      {sub && <span className="text-[11px] text-muted">{sub}</span>}
      <ChevronRight size={14} strokeWidth={1.5} className="text-muted/50" />
    </button>
  );
}
