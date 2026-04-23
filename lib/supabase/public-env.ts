/**
 * ブラウザ・サーバー共通の Supabase 公開キー。
 * ダッシュボードの Publishable key（推奨）を優先し、
 * まだ `NEXT_PUBLIC_SUPABASE_ANON_KEY` だけを置いている場合はフォールバックする。
 *
 * `process.env.A || process.env.B` の一行だと、Webpack の DefinePlugin が
 * 片方だけリテラル化して片方がブラウザで `undefined` のまま残ることがあるため、
 * `process.env.*` は分岐で直接参照する。
 */
export function getSupabasePublishableKey(): string {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (typeof publishable === "string") {
    const t = publishable.trim();
    if (t !== "") return t;
  }
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (typeof anon === "string") {
    const t = anon.trim();
    if (t !== "") return t;
  }
  return "";
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (typeof url === "string") {
    const t = url.trim();
    if (t !== "") return t;
  }
  return "";
}

export function resolveSupabasePublicConfig(): {
  url: string;
  publishableKey: string;
} {
  return {
    url: getSupabaseUrl(),
    publishableKey: getSupabasePublishableKey(),
  };
}
