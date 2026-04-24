import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
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

  // Verify ownership: video/workout must belong to the current user
  if (video_id) {
    const { data: v } = await supabase
      .from("videos")
      .select("id")
      .eq("id", video_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!v) {
      return NextResponse.json(
        { error: "指定された動画が見つかりません" },
        { status: 403 },
      );
    }
  }
  if (workout_id) {
    const { data: w } = await supabase
      .from("workouts")
      .select("id")
      .eq("id", workout_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!w) {
      return NextResponse.json(
        { error: "指定されたワークアウトが見つかりません" },
        { status: 403 },
      );
    }
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

  // Use admin client (service role) to fetch the shared resources,
  // since the viewer may be unauthenticated and RLS would block access.
  const admin = createAdminClient();
  const result: Record<string, unknown> = { shared_at: link.created_at };

  if (link.video_id) {
    const { data: video, error: videoErr } = await admin
      .from("videos")
      .select("id, user_id, title, exercise_type, shot_date, duration, memo")
      .eq("id", link.video_id)
      .single();

    if (videoErr || !video) {
      return NextResponse.json(
        { error: "共有された動画が見つかりません" },
        { status: 404 },
      );
    }
    if (video.user_id !== link.user_id) {
      return NextResponse.json(
        { error: "共有リンクが無効です" },
        { status: 403 },
      );
    }
    const { user_id: _u, ...safeVideo } = video;
    result.video = safeVideo;
  }

  if (link.workout_id) {
    const { data: workout, error: workoutErr } = await admin
      .from("workouts")
      .select("id, user_id, title, workout_date, blocks_json, total_sets, total_volume")
      .eq("id", link.workout_id)
      .single();

    if (workoutErr || !workout) {
      return NextResponse.json(
        { error: "共有されたワークアウトが見つかりません" },
        { status: 404 },
      );
    }
    if (workout.user_id !== link.user_id) {
      return NextResponse.json(
        { error: "共有リンクが無効です" },
        { status: 403 },
      );
    }
    const { user_id: _u, ...safeWorkout } = workout;
    result.workout = safeWorkout;
  }

  return NextResponse.json(result);
}
