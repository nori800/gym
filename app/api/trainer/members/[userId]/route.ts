import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type UpdateMemberBody = {
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  joinedOn?: string;
  trainerMemo?: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { data: trainerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (trainerProfile?.role !== "trainer") {
    return NextResponse.json(
      { error: "トレーナー権限が必要です" },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as UpdateMemberBody | null;
  const displayName = normalizeText(body?.displayName, 80);
  if (!displayName) {
    return NextResponse.json(
      { error: "会員名を入力してください" },
      { status: 400 },
    );
  }

  const joinedOn = normalizeDate(body?.joinedOn);
  if (body?.joinedOn && !joinedOn) {
    return NextResponse.json(
      { error: "入会日は YYYY-MM-DD 形式で入力してください" },
      { status: 400 },
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[trainer-member] createAdminClient failed:", err);
    return NextResponse.json(
      { error: "サーバー設定エラーが発生しました" },
      { status: 500 },
    );
  }

  const { data: updated, error } = await admin
    .from("profiles")
    .update({
      display_name: displayName,
      phone_number: normalizeText(body?.phoneNumber, 40),
      address: normalizeText(body?.address, 200),
      joined_on: joinedOn,
      trainer_memo: normalizeText(body?.trainerMemo, 1000),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("trainer_id", user.id)
    .select("id, user_id, display_name, phone_number, address, joined_on, trainer_memo")
    .single();

  if (error) {
    console.error("[trainer-member] update error:", error.message);
    return NextResponse.json(
      { error: "会員情報の保存に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ member: updated });
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
}
