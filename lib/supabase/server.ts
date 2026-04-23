import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";
import { resolveSupabasePublicConfig } from "./public-env";

export async function createServerSupabaseClient() {
  const { url, publishableKey } = resolveSupabasePublicConfig();
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase の環境変数が不足しています。`NEXT_PUBLIC_SUPABASE_URL` と " +
        "`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` を設定してください。",
    );
  }

  const cookieStore = await cookies();
  return createServerClient<Database>(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    },
  );
}
