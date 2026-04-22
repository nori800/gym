"use client";

import Link from "next/link";
import { Settings, TrendingUp, Camera, ChevronRight, Dumbbell, Sparkles } from "lucide-react";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { MOCK_WORKOUT_HISTORY } from "@/lib/mocks/workoutHistory";
import { MOCK_BODY_LOGS } from "@/lib/mocks/bodyLogs";
import { formatJapaneseLongDate } from "@/lib/utils/formatRecordDate";

function getSuggestedWorkout() {
  if (MOCK_WORKOUT_HISTORY.length === 0) return null;
  const categories = MOCK_WORKOUT_HISTORY.map((w) => w.categories).flat();
  const freq: Record<string, number> = {};
  for (const c of categories) freq[c] = (freq[c] || 0) + 1;
  const sorted = Object.entries(freq).sort((a, b) => a[1] - b[1]);
  const leastTrained = sorted[0]?.[0];
  const suggestions: Record<string, string> = {
    "胸": "プッシュデー（胸・肩・三頭）",
    "背中": "プルデー（背中・二頭）",
    "肩": "ショルダーデー（肩メイン）",
    "腕": "アームデー（腕集中）",
    "脚": "レッグデー（脚メイン）",
  };
  return {
    category: leastTrained,
    suggestion: suggestions[leastTrained ?? ""] ?? "フルボディ",
    reason: `${leastTrained}のトレーニング頻度が低め`,
  };
}

export default function DashboardPage() {
  const weekSessions = MOCK_WORKOUT_HISTORY.length;
  const videoCount = MOCK_VIDEOS.length;
  const latestWeight = MOCK_BODY_LOGS[MOCK_BODY_LOGS.length - 1];
  const recentWorkouts = MOCK_WORKOUT_HISTORY.slice(0, 3);
  const suggestion = getSuggestedWorkout();

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Stats */}
      <section className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col justify-center rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">今週</p>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-metric leading-none">{weekSessions}</span>
            <span className="text-sm font-caption text-muted">セッション</span>
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">体重</p>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-metric leading-none">
              {latestWeight?.weight ?? "—"}
            </span>
            <span className="text-sm font-caption text-muted">kg</span>
          </p>
          {latestWeight && (
            <p className="mt-1 text-[11px] text-secondary">
              {formatJapaneseLongDate(latestWeight.log_date)}
            </p>
          )}
        </div>
      </section>

      {/* Today's workout suggestion */}
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
              <Dumbbell size={18} strokeWidth={1.5} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold tracking-tight">{suggestion.suggestion}</p>
              <p className="mt-0.5 text-[11px] text-secondary">{suggestion.reason}</p>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
          </Link>
        </section>
      )}

      {/* Recent workouts OR getting started guide */}
      {recentWorkouts.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-title uppercase tracking-[0.12em] text-muted">
              最近のワークアウト
            </h2>
            <Link
              href="/workouts"
              className="flex items-center gap-0.5 text-[12px] font-title text-secondary transition-colors active:text-primary"
            >
              すべて見る
              <ChevronRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            {recentWorkouts.map((workout, i) => (
              <Link
                key={workout.id}
                href="/workouts"
                className={`flex items-center gap-3.5 px-[18px] py-3.5 transition-colors duration-150 active:bg-surface ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-surface">
                  <TrendingUp size={18} strokeWidth={1.5} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold tracking-tight">{workout.title}</p>
                  <p className="mt-0.5 text-[11px] text-secondary">
                    {formatJapaneseLongDate(workout.date)} · {workout.durationMin}分 · {workout.totalSets}セット
                  </p>
                </div>
                <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
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
            <p className="text-sm font-bold tracking-tight">ワークアウトを始めよう</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-secondary">
              種目・重量・回数を記録して、トレーニングの成果を見える化できます。
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

      {/* Quick access — FormCheck feature */}
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
            <p className="mt-0.5 text-[11px] text-secondary">
              フォームを撮影してチェック
            </p>
          </div>
          <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
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
            <p className="mt-0.5 text-[11px] text-secondary">
              {videoCount > 0 ? `${videoCount}本の撮影動画` : "撮影した動画をここで確認"}
            </p>
          </div>
          <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
        </Link>
      </section>
    </div>
  );
}
