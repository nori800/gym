"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { translateSupabaseAuthError } from "@/lib/supabase/translateAuthError";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "有効なメールアドレスを入力してください";
    if (!password) e.password = "パスワードを入力してください";
    else if (password.length < 8) e.password = "8文字以上で入力してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setErrors({ server: translateSupabaseAuthError(error.message) });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-12 pt-24">
      <header className="mb-12">
        <h1 className="text-xl font-title">FormCheck</h1>
      </header>

      {errors.server && (
        <div className="mb-5 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {errors.server}
        </div>
      )}

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
            disabled={loading}
            className={`h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 disabled:opacity-50 ${errors.email ? "ring-2 ring-danger" : "focus:ring-primary/10"}`}
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
            disabled={loading}
            className={`h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 disabled:opacity-50 ${errors.password ? "ring-2 ring-danger" : "focus:ring-primary/10"}`}
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-8 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-colors duration-150 active:scale-[0.98] disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        ログイン
      </button>

      <p className="mt-8 text-center text-xs text-muted">
        <Link href="/signup" className="font-title text-primary underline underline-offset-2">
          新規登録
        </Link>
      </p>
    </div>
  );
}
