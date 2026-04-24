import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { video_id, workout_id } = body as {
    video_id?: string;
    workout_id?: string;
  };

  if (!video_id && !workout_id) {
    return NextResponse.json(
      { error: "video_id または workout_id が必要です" },
      { status: 400 },
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("shared_links")
    .insert({
      user_id: user.id,
      video_id: video_id ?? null,
      workout_id: workout_id ?? null,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, token")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "共有リンクの作成に失敗しました" },
      { status: 500 },
    );
  }

  const url = `${request.nextUrl.origin}/share/${data.token}`;
  return NextResponse.json({ token: data.token, url });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "token パラメータが必要です" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();

  type SharedLinkRow = {
    id: string;
    user_id: string;
    video_id: string | null;
    workout_id: string | null;
    token: string;
    expires_at: string;
    created_at: string;
  };

  // Use security-definer function to bypass RLS safely with token-based access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links, error } = await (supabase.rpc as any)("get_shared_link_by_token", { p_token: token });

  const rows = links as SharedLinkRow[] | null;
  const link = rows?.[0] ?? null;

  if (error || !link) {
    return NextResponse.json(
      { error: "共有リンクが見つかりません" },
      { status: 404 },
    );
  }

  const result: Record<string, unknown> = { shared_at: link.created_at };

  if (link.video_id) {
    const { data: video } = await supabase
      .from("videos")
      .select("id, title, exercise_type, shot_date, duration, memo")
      .eq("id", link.video_id)
      .single();
    result.video = video;
  }

  if (link.workout_id) {
    const { data: workout } = await supabase
      .from("workouts")
      .select("id, title, workout_date, blocks_json, total_sets, total_volume")
      .eq("id", link.workout_id)
      .single();
    result.workout = workout;
  }

  return NextResponse.json(result);
}
