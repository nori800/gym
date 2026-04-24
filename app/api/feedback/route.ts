import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const videoId = request.nextUrl.searchParams.get("video_id");
  if (!videoId) {
    return NextResponse.json(
      { error: "video_id が必要です" },
      { status: 400 },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("video_feedback")
    .select("id, video_id, trainer_user_id, body, frame_time, created_at, updated_at")
    .eq("video_id", videoId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[feedback/GET] error:", error.message);
    return NextResponse.json(
      { error: "フィードバックの取得に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ feedback: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "trainer") {
    return NextResponse.json(
      { error: "トレーナー権限が必要です" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディが不正です" },
      { status: 400 },
    );
  }

  const { video_id, body: feedbackBody, frame_time } = body as {
    video_id?: string;
    body?: string;
    frame_time?: number;
  };

  if (!video_id || !feedbackBody?.trim()) {
    return NextResponse.json(
      { error: "video_id と body が必要です" },
      { status: 400 },
    );
  }

  const { data: video } = await supabase
    .from("videos")
    .select("id, user_id")
    .eq("id", video_id)
    .single();

  if (!video) {
    return NextResponse.json(
      { error: "動画が見つかりません" },
      { status: 404 },
    );
  }

  const { data: memberProfile } = await supabase
    .from("profiles")
    .select("trainer_id")
    .eq("user_id", video.user_id)
    .single();

  if (memberProfile?.trainer_id !== user.id) {
    return NextResponse.json(
      { error: "この会員の動画にフィードバックする権限がありません" },
      { status: 403 },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: feedback, error: insertErr } = await (supabase as any)
    .from("video_feedback")
    .insert({
      video_id,
      trainer_user_id: user.id,
      body: feedbackBody.trim(),
      frame_time: frame_time ?? null,
    })
    .select("id, video_id, trainer_user_id, body, frame_time, created_at")
    .single();

  if (insertErr) {
    console.error("[feedback/POST] insert error:", insertErr.message);
    return NextResponse.json(
      { error: "フィードバックの保存に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ feedback }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const feedbackId = request.nextUrl.searchParams.get("id");
  if (!feedbackId) {
    return NextResponse.json(
      { error: "id が必要です" },
      { status: 400 },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("video_feedback")
    .delete()
    .eq("id", feedbackId)
    .eq("trainer_user_id", user.id);

  if (error) {
    console.error("[feedback/DELETE] error:", error.message);
    return NextResponse.json(
      { error: "フィードバックの削除に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
