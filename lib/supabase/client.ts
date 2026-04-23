import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// ブラウザ用チャンクでは `process.env.NEXT_PUBLIC_*` をモジュール先頭で直接参照する。
// 別モジュールや `a || b` 一行だと DefinePlugin が片方だけ `process` ポリフィルに残し、
// 実行時に `undefined` になり @supabase/ssr が失敗することがある。
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const publishableTrimmed = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
).trim();
const anonTrimmed = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
const supabasePublishableKey =
  publishableTrimmed !== "" ? publishableTrimmed : anonTrimmed;

export function createClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase の環境変数が不足しています。`.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と " +
        "`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` を設定し、開発サーバーを再起動してください。" +
        "（移行中のみ `NEXT_PUBLIC_SUPABASE_ANON_KEY` でも可）",
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
