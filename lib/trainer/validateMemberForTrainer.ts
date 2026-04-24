import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type MemberAccessResult =
  | { ok: true; displayName: string; memberUserId: string }
  | { ok: false; reason: "no_member_param" | "not_trainer" | "not_found" | "not_assigned" };

/**
 * ログイン中のユーザーがトレーナーであり、指定 user_id が自分のメンバーか検証する。
 * 一覧画面の ?member= で会員データを出す際に使う。
 */
export async function validateMemberForTrainer(
  supabase: SupabaseClient<Database>,
  trainerUserId: string,
  memberUserId: string | null | undefined,
): Promise<MemberAccessResult> {
  if (!memberUserId?.trim()) {
    return { ok: false, reason: "no_member_param" };
  }

  const { data: self, error: selfErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", trainerUserId)
    .maybeSingle();

  if (selfErr || self?.role !== "trainer") {
    return { ok: false, reason: "not_trainer" };
  }

  const { data: row, error } = await supabase
    .from("profiles")
    .select("display_name, user_id")
    .eq("user_id", memberUserId.trim())
    .eq("trainer_id", trainerUserId)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, reason: "not_assigned" };
  }

  return {
    ok: true,
    displayName: row.display_name?.trim() || "メンバー",
    memberUserId: row.user_id,
  };
}
