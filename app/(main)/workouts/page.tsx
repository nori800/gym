"use client";

import Link from "next/link";
import { PenSquare, Dumbbell, Video } from "lucide-react";
import { MOCK_WORKOUT_HISTORY, type WorkoutHistoryEntry } from "@/lib/mocks/workoutHistory";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { RecordDateBlock } from "@/components/common/RecordDateBlock";

export default function WorkoutsPage() {
  const history = MOCK_WORKOUT_HISTORY;
  const isEmpty = history.length === 0;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)]">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-caption uppercase tracking-[0.12em] text-muted">
            Workouts
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-tight">ワークアウト履歴</h1>
        </div>
        <p className="pb-1 text-[11px] font-caption text-muted">全 {history.length} 件</p>
      </header>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="mt-6 space-y-3">
          {history.map((entry) => (
            <HistoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* FAB — 鉛筆アイコンから新規作成へ直接遷移 */}
      <Link
        href="/workouts/edit"
        aria-label="新しいワークアウトを作成"
        className="fixed bottom-20 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-inverse text-on-inverse shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-200 active:scale-95"
      >
        <PenSquare size={20} strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <Dumbbell size={26} strokeWidth={1.5} className="text-muted" />
      </div>
      <p className="mt-4 text-[15px] font-bold">まだ記録がありません</p>
      <p className="mt-1.5 text-center text-[12px] text-secondary">
        右下の
        <span className="mx-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-inverse align-middle">
          <PenSquare size={10} className="text-on-inverse" strokeWidth={2} />
        </span>
        ボタンから作成しよう
      </p>
    </div>
  );
}

function HistoryCard({ entry }: { entry: WorkoutHistoryEntry }) {
  const videoCount = MOCK_VIDEOS.filter((v) => v.workout_session_id === entry.id).length;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99]">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <RecordDateBlock iso={entry.date} />
            <h3 className="mt-3 truncate text-[16px] font-bold tracking-tight">
              {entry.title}
            </h3>
            {videoCount > 0 && (
              <Link
                href={`/videos?session=${entry.id}`}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-[10px] font-bold text-secondary transition-colors active:bg-border"
              >
                <Video size={11} strokeWidth={2} className="shrink-0" />
                動画 {videoCount}
              </Link>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {entry.categories.map((c) => (
              <span
                key={c}
                className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-bold text-secondary"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 border-t border-border pt-3">
          <Metric value={entry.durationMin} unit="分" label="時間" />
          <Metric value={entry.totalSets} unit="セット" label="合計" />
          <Metric
            value={entry.totalVolume.toLocaleString()}
            unit="kg"
            label="総重量"
          />
        </div>

        <div className="mt-3 space-y-1">
          {entry.movements.slice(0, 3).map((m, i) => (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="truncate text-primary">{m.name}</span>
              <span className="shrink-0 pl-2 font-metric text-secondary">
                {m.weight}kg × {m.reps} × {m.sets}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function Metric({
  value,
  unit,
  label,
}: {
  value: number | string;
  unit: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <p className="flex items-baseline justify-center gap-0.5">
        <span className="text-[15px] font-metric leading-none">{value}</span>
        <span className="text-[9px] font-caption text-muted">{unit}</span>
      </p>
      <p className="mt-1 text-[9px] font-caption text-muted">{label}</p>
    </div>
  );
}
