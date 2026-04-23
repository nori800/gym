"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  TrendingUp,
  Camera,
  ChevronRight,
  Dumbbell,
  Sparkles,
  Loader2,
  LogIn,
} from "lucide-react";
import { formatJapaneseLongDate } from "@/lib/utils/formatRecordDate";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { AppToast } from "@/components/common/AppToast";
import { createClient } from "@/lib/supabase/client";

type DashboardData = {
  weekSessions: number;
  latestWeight: { weight: number; date: string } | null;
  videoCount: number;
  recentWorkouts: {
    id: string;
    title: string;
    date: string;
    durationMin: number;
    totalSets: number;
  }[];
};

function getIsoWeekRange(): { monday: string; sunday: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return { monday: fmt(monday), sunday: fmt(sunday) };
}

function getSuggestedWorkout(categories: string[]) {
  if (categories.length === 0) return null;
  const freq: Record<string, number> = {};
  for (const c of categories) freq[c] = (freq[c] || 0) + 1;
  const sorted = Object.entries(freq).sort((a, b) => a[1] - b[1]);
  const leastTrained = sorted[0]?.[0];
  const suggestions: Record<string, string> = {
    胸: "プッシュデー（胸・肩・三頭）",
    背中: "プルデー（背中・二頭）",
    肩: "ショルダーデー（肩メイン）",
    腕: "アームデー（腕集中）",
    脚: "レッグデー（脚メイン）",
  };
  return {
    category: leastTrained,
    suggestion: suggestions[leastTrained ?? ""] ?? "フルボディ",
    reason: `${leastTrained}のトレーニング頻度が低め`,
  };
}

const EMPTY_DATA: DashboardData = {
  weekSessions: 0,
  latestWeight: null,
  videoCount: 0,
  recentWorkouts: [],
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setData(EMPTY_DATA);
      setAllCategories([]);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    const { monday, sunday } = getIsoWeekRange();

    async function fetchDashboard() {
      try {
        const [weekRes, recentRes, bodyRes, videosRes] = await Promise.all([
          supabase
            .from("workouts")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user!.id)
            .gte("workout_date", monday)
            .lte("workout_date", sunday),
          supabase
            .from("workouts")
            .select("id, title, workout_date, duration_min, total_sets, categories")
            .eq("user_id", user!.id)
            .order("workout_date", { ascending: false })
            .limit(10),
          supabase
            .from("body_logs")
            .select("weight, log_date")
            .eq("user_id", user!.id)
            .order("log_date", { ascending: false })
            .limit(1),
          supabase
            .from("videos")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user!.id),
        ]);

        if (weekRes.error) throw weekRes.error;
        if (recentRes.error) throw recentRes.error;
        if (bodyRes.error) throw bodyRes.error;
        if (videosRes.error) throw videosRes.error;

        if (cancelled) return;

        const workouts = recentRes.data ?? [];
        const bodyLog = bodyRes.data?.[0];
        const videoCount = videosRes.count ?? 0;

        const recentWorkouts = workouts.slice(0, 3).map((w) => ({
          id: w.id,
          title: w.title,
          date: w.workout_date,
          durationMin: w.duration_min ?? 0,
          totalSets: w.total_sets ?? 0,
        }));

        setData({
          weekSessions: weekRes.count ?? 0,
          latestWeight: bodyLog
            ? { weight: bodyLog.weight ?? 0, date: bodyLog.log_date }
            : null,
          videoCount,
          recentWorkouts,
        });
        setAllCategories(workouts.flatMap((w) => w.categories ?? []));
        setFetchError(false);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "データの取得に失敗しました";
        showToast(message, "error");
        setData(EMPTY_DATA);
        setAllCategories([]);
        setFetchError(true);
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, showToast]);

  if (!data) {
    return (
      <div
        className="flex items-center justify-center py-24"
        role="status"
        aria-label="読み込み中"
      >
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  const suggestion = getSuggestedWorkout(allCategories);

  return (
    <div className="space-y-8">
      <AppToast toast={toast} onDismiss={dismissToast} />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-title tracking-tight">FormCheck</h1>
        </div>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-all duration-150 active:bg-chip active:scale-95"
          aria-label="設定"
        >
          <Settings size={20} strokeWidth={1.5} />
        </Link>
      </header>

      {!user ? (
        <section>
          <div className="rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
                <LogIn size={18} strokeWidth={1.5} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">
                  ログインして始めよう
                </p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">
                  ログインするとワークアウトや体重の記録を保存できます。
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
            >
              ログイン / サインアップ
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col justify-center rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
              <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
                今週
              </p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-metric leading-none">
                  {data.weekSessions}
                </span>
                <span className="text-sm font-caption text-muted">
                  セッション
                </span>
              </p>
            </div>
            <div className="flex flex-col justify-center rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
              <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
                体重
              </p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-metric leading-none">
                  {data.latestWeight?.weight ?? "—"}
                </span>
                <span className="text-sm font-caption text-muted">kg</span>
              </p>
              {data.latestWeight && (
                <p className="mt-1 text-xs text-secondary">
                  {formatJapaneseLongDate(data.latestWeight.date)}
                </p>
              )}
            </div>
          </section>

          {suggestion && (
            <section>
              <div className="flex items-center gap-1.5 px-0.5">
                <Sparkles size={12} strokeWidth={2} className="text-accent" />
                <h2 className="text-xs font-title uppercase tracking-[0.12em] text-muted">
                  今日のおすすめ
                </h2>
              </div>
              <Link
                href="/workouts/edit"
                className="mt-2.5 flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
                  <Dumbbell
                    size={18}
                    strokeWidth={1.5}
                    className="text-primary"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold tracking-tight">
                    {suggestion.suggestion}
                  </p>
                  <p className="mt-0.5 text-xs text-secondary">
                    {suggestion.reason}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  strokeWidth={1.5}
                  className="shrink-0 text-muted"
                />
              </Link>
            </section>
          )}

          {data.recentWorkouts.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-xs font-title uppercase tracking-[0.12em] text-muted">
                  最近のワークアウト
                </h2>
                <Link
                  href="/workouts"
                  className="flex items-center gap-0.5 text-xs font-title text-secondary transition-colors active:text-primary"
                >
                  すべて見る
                  <ChevronRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
              <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
                {data.recentWorkouts.map((workout, i) => (
                  <Link
                    key={workout.id}
                    href={`/workouts/${workout.id}`}
                    className={`flex items-center gap-3.5 px-[18px] py-3.5 transition-colors duration-150 active:bg-surface ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-surface">
                      <TrendingUp
                        size={18}
                        strokeWidth={1.5}
                        className="text-primary"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold tracking-tight">
                        {workout.title}
                      </p>
                      <p className="mt-0.5 text-xs text-secondary">
                        {formatJapaneseLongDate(workout.date)} ·{" "}
                        {workout.durationMin}分 · {workout.totalSets}セット
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      className="shrink-0 text-muted"
                    />
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <section className="space-y-3">
              <h2 className="px-0.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
                はじめよう
              </h2>
              <div className="rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
                <p className="text-sm font-bold tracking-tight">
                  {fetchError
                    ? "データを読み込めませんでした"
                    : "最初のワークアウトを記録しよう 💪"}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-secondary">
                  {fetchError
                    ? "ネットワーク接続を確認して、もう一度お試しください。"
                    : "種目・重量・回数を記録して、トレーニングの成果を見える化できます。"}
                </p>
                <Link
                  href="/workouts/edit"
                  className="mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
                >
                  <Dumbbell size={16} strokeWidth={1.5} />
                  ワークアウトを作成
                </Link>
              </div>
            </section>
          )}
        </>
      )}

      <section className="space-y-3">
        <h2 className="px-0.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
          フォームチェック
        </h2>
        <Link
          href="/capture"
          className="flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
            <Camera size={18} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight">撮影して記録</p>
            <p className="mt-0.5 text-xs text-secondary">
              フォームを撮影してチェック
            </p>
          </div>
          <ChevronRight
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-muted"
          />
        </Link>
        <Link
          href="/videos"
          className="flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-surface">
            <TrendingUp size={18} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight">動画ライブラリ</p>
            <p className="mt-0.5 text-xs text-secondary">
              {data.videoCount > 0
                ? `${data.videoCount}本の撮影動画`
                : "撮影した動画をここで確認"}
            </p>
          </div>
          <ChevronRight
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-muted"
          />
        </Link>
      </section>
    </div>
  );
}
