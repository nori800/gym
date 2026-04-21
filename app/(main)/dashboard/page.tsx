import Link from "next/link";
import { Settings, Video, TrendingUp } from "lucide-react";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { MOCK_WORKOUT_HISTORY } from "@/lib/mocks/workoutHistory";
import { MOCK_BODY_LOGS } from "@/lib/mocks/bodyLogs";
import { formatJapaneseLongDate } from "@/lib/utils/formatRecordDate";

export default function DashboardPage() {
  const weekSessions = MOCK_WORKOUT_HISTORY.length;
  const videoCount = MOCK_VIDEOS.length;
  const latestWeight = MOCK_BODY_LOGS[MOCK_BODY_LOGS.length - 1];
  const latestWorkout = MOCK_WORKOUT_HISTORY[0];

  return (
    <div className="space-y-8">
      {/* Top bar: 小さめの「FormCheck」+ 右上に設定アイコン */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-caption uppercase tracking-[0.12em] text-muted">
            FormCheck
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-tight">今日もいこう</h1>
        </div>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-all duration-150 active:bg-chip active:scale-95"
          aria-label="設定"
        >
          <Settings size={20} strokeWidth={1.75} />
        </Link>
      </header>

      {/* 概況サマリー */}
      <section className="grid grid-cols-3 gap-2.5">
        <StatCard value={weekSessions} unit="回" label="今週のセッション" />
        <StatCard value={videoCount} unit="本" label="撮影した動画" />
        <StatCard
          value={latestWeight?.weight ?? "—"}
          unit="kg"
          label="最新の体重"
          sub={latestWeight ? formatJapaneseLongDate(latestWeight.log_date) : undefined}
        />
      </section>

      {/* 最近のワークアウト */}
      {latestWorkout && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[13px] font-bold tracking-tight text-secondary">
              最近のワークアウト
            </h2>
            <Link
              href="/workouts"
              className="text-[12px] font-semibold text-muted transition-colors active:text-primary"
            >
              すべて見る →
            </Link>
          </div>
          <Link
            href="/workouts"
            className="block overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chip">
                <TrendingUp size={18} strokeWidth={1.75} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold">{latestWorkout.title}</p>
                <p className="mt-0.5 text-[11px] text-secondary">
                  {formatJapaneseLongDate(latestWorkout.date)} · {latestWorkout.durationMin}分 ·{" "}
                  {latestWorkout.totalSets}セット
                </p>
              </div>
              <span className="text-muted">›</span>
            </div>
          </Link>
        </section>
      )}

      {/* クイックアクセス（フッターで賄えない導線） */}
      <section className="space-y-3">
        <h2 className="px-0.5 text-[13px] font-bold tracking-tight text-secondary">
          動画
        </h2>
        <Link
          href="/videos"
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chip">
            <Video size={18} strokeWidth={1.75} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold">動画ライブラリ</p>
            <p className="mt-0.5 text-[11px] text-secondary">
              撮影したフォームチェック動画
            </p>
          </div>
          <span className="text-muted">›</span>
        </Link>
      </section>
    </div>
  );
}

function StatCard({
  value,
  unit,
  label,
  sub,
}: {
  value: number | string;
  unit: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-2 py-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
      <p className="flex items-baseline gap-0.5">
        <span className="text-[22px] font-metric leading-none">{value}</span>
        <span className="text-[10px] font-caption text-muted">{unit}</span>
      </p>
      <p className="mt-1.5 text-center text-[10px] font-caption leading-tight text-secondary">
        {label}
      </p>
      {sub && (
        <p className="mt-1 line-clamp-2 text-center text-[9px] leading-tight text-muted">{sub}</p>
      )}
    </div>
  );
}
