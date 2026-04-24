import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
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

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "検索キーワードは2文字以上必要です" },
      { status: 400 },
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[search-member] createAdminClient failed:", err);
    return NextResponse.json(
      { error: "サーバー設定エラーが発生しました" },
      { status: 500 },
    );
  }

  const isEmail = query.includes("@");

  if (isEmail) {
    const { data: authUsers, error: authErr } = await admin.auth.admin.listUsers({
      perPage: 10,
    });

    if (authErr) {
      console.error("[search-member] auth listUsers error:", authErr.message);
      return NextResponse.json(
        { error: "ユーザー検索に失敗しました" },
        { status: 500 },
      );
    }

    const matched = authUsers.users.filter(
      (u) => u.email && u.email.toLowerCase().includes(query.toLowerCase()),
    );

    if (matched.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const matchedIds = matched.map((u) => u.id);

    const { data: profiles, error: profileErr } = await admin
      .from("profiles")
      .select("id, user_id, display_name, trainer_id")
      .in("user_id", matchedIds);

    if (profileErr) {
      console.error("[search-member] profile fetch error:", profileErr.message);
      return NextResponse.json(
        { error: "プロフィール検索に失敗しました" },
        { status: 500 },
      );
    }

    const results = (profiles ?? []).map((p) => {
      const authUser = matched.find((u) => u.id === p.user_id);
      return {
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name || "名前未設定",
        email_hint: authUser?.email
          ? maskEmail(authUser.email)
          : null,
        has_trainer: !!p.trainer_id,
        is_self: p.user_id === user.id,
      };
    });

    return NextResponse.json({ results });
  }

  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("id, user_id, display_name, trainer_id")
    .ilike("display_name", `%${query}%`)
    .limit(10);

  if (profileErr) {
    console.error("[search-member] profile search error:", profileErr.message);
    return NextResponse.json(
      { error: "プロフィール検索に失敗しました" },
      { status: 500 },
    );
  }

  const results = (profiles ?? []).map((p) => ({
    id: p.id,
    user_id: p.user_id,
    display_name: p.display_name || "名前未設定",
    email_hint: null,
    has_trainer: !!p.trainer_id,
    is_self: p.user_id === user.id,
  }));

  return NextResponse.json({ results });
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}
