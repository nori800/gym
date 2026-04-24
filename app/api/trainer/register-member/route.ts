import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RegisterMemberBody = {
  profileId?: string;
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  joinedOn?: string;
  trainerMemo?: string;
};

export async function POST(request: NextRequest) {
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

  const body = (await request.json().catch(() => null)) as RegisterMemberBody | null;
  if (!body?.profileId) {
    return NextResponse.json(
      { error: "登録する会員を選択してください" },
      { status: 400 },
    );
  }

  const displayName = normalizeText(body.displayName, 80);
  if (!displayName) {
    return NextResponse.json(
      { error: "会員名を入力してください" },
      { status: 400 },
    );
  }

  const joinedOn = normalizeDate(body.joinedOn);
  if (body.joinedOn && !joinedOn) {
    return NextResponse.json(
      { error: "入会日は YYYY-MM-DD 形式で入力してください" },
      { status: 400 },
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[register-member] createAdminClient failed:", err);
    return NextResponse.json(
      { error: "サーバー設定エラーが発生しました" },
      { status: 500 },
    );
  }

  const { data: target, error: targetError } = await admin
    .from("profiles")
    .select("id, user_id, trainer_id, role")
    .eq("id", body.profileId)
    .single();

  if (targetError || !target) {
    return NextResponse.json(
      { error: "会員候補が見つかりません" },
      { status: 404 },
    );
  }

  if (target.user_id === user.id) {
    return NextResponse.json(
      { error: "自分自身は会員として登録できません" },
      { status: 400 },
    );
  }

  if (target.role === "trainer") {
    return NextResponse.json(
      { error: "トレーナーアカウントは会員として登録できません" },
      { status: 400 },
    );
  }

  if (target.trainer_id && target.trainer_id !== user.id) {
    return NextResponse.json(
      { error: "この会員は既に別のトレーナーに紐づいています" },
      { status: 409 },
    );
  }

  const { data: updated, error: updateError } = await admin
    .from("profiles")
    .update({
      trainer_id: user.id,
      display_name: displayName,
      phone_number: normalizeText(body.phoneNumber, 40),
      address: normalizeText(body.address, 200),
      joined_on: joinedOn,
      trainer_memo: normalizeText(body.trainerMemo, 1000),
      updated_at: new Date().toISOString(),
    })
    .eq("id", target.id)
    .select("id, user_id, display_name, phone_number, address, joined_on, trainer_memo")
    .single();

  if (updateError) {
    console.error("[register-member] update error:", updateError.message);
    return NextResponse.json(
      { error: "会員登録に失敗しました" },
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
