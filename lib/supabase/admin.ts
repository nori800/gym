import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSupabaseUrl } from "./public-env";

/**
 * Service-role client that bypasses RLS.
 * Only use in server-side code (API routes, server actions) where
 * the caller has already been authorized by application logic.
 */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY が設定されていません。" +
        "共有リンクの閲覧には service role キーが必要です。",
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
