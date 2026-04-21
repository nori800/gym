"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "有効なメールアドレスを入力してください";
    if (!password) e.password = "パスワードを入力してください";
    else if (password.length < 8) e.password = "8文字以上で入力してください";
    if (confirm && confirm !== password) e.confirm = "パスワードが一致しません";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log("signup", { email, password });
  };

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-12 pt-24">
      <header className="mb-12">
        <h1 className="text-xl font-title">FormCheck</h1>
      </header>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-[11px] font-label text-secondary">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate}
            placeholder="you@example.com"
            className={`h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 ${errors.email ? "ring-2 ring-danger" : "focus:ring-primary/10"}`}
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-label text-secondary">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validate}
            placeholder="8 文字以上"
            className={`h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 ${errors.password ? "ring-2 ring-danger" : "focus:ring-primary/10"}`}
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-label text-secondary">
            パスワード（確認）
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={validate}
            placeholder="もう一度入力"
            className={`h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 ${errors.confirm ? "ring-2 ring-danger" : "focus:ring-primary/10"}`}
          />
          {errors.confirm && <p className="mt-1 text-xs text-danger">{errors.confirm}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-8 min-h-[44px] w-full rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-colors duration-150 active:scale-[0.98]"
      >
        登録する
      </button>

      <p className="mt-8 text-center text-xs text-muted">
        <Link href="/login" className="font-title text-primary underline underline-offset-2">
          ログイン
        </Link>
      </p>
    </div>
  );
}
