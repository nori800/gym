"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PenSquare, Dumbbell, Video, X, Camera } from "lucide-react";
import { MOCK_WORKOUT_HISTORY, type WorkoutHistoryEntry } from "@/lib/mocks/workoutHistory";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { RecordDateBlock } from "@/components/common/RecordDateBlock";
import { FocusTrap } from "@/components/common/FocusTrap";

export default function WorkoutsPage() {
  const history = MOCK_WORKOUT_HISTORY;
  const isEmpty = history.length === 0;
  const [detailEntry, setDetailEntry] = useState<WorkoutHistoryEntry | null>(null);

  return (
    <div className="relative min-h-[calc(100dvh-6rem)]">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            Workouts
          </p>
          <h1 className="mt-1 text-xl font-title tracking-tight">ワークアウト履歴</h1>
        </div>
        <p className="pb-1 text-xs font-caption text-muted">全 {history.length} 件</p>
      </header>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="mt-6 space-y-3">
          {history.map((entry, i) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              isLatest={i === 0}
              onTap={() => setDetailEntry(entry)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/workouts/edit"
        aria-label="新しいワークアウトを作成"
        className="fixed bottom-20 right-5 z-40 flex items-center gap-2 rounded-full bg-inverse px-5 py-3.5 text-xs font-extrabold tracking-wide text-on-inverse shadow-lg transition-all duration-200 active:scale-95"
      >
        <PenSquare size={14} strokeWidth={2} />
        新規作成
      </Link>

      {/* Detail bottom sheet */}
      {detailEntry && (
        <WorkoutDetailSheet
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <Dumbbell size={26} strokeWidth={1.5} className="text-muted" />
      </div>
      <p className="mt-5 text-[15px] font-bold">まだ記録がありません</p>
      <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
        右下の「新規作成」からワークアウトを作成しましょう。種目・重量・回数をセットごとに記録できます。
      </p>
      <Link
        href="/workouts/edit"
        className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
      >
        <PenSquare size={14} strokeWidth={2} />
        最初のワークアウトを作成
      </Link>
    </div>
  );
}

function HistoryCard({
  entry,
  isLatest,
  onTap,
}: {
  entry: WorkoutHistoryEntry;
  isLatest: boolean;
  onTap: () => void;
}) {
  const videoCount = MOCK_VIDEOS.filter((v) => v.workout_session_id === entry.id).length;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onTap(); }}
      className={`cursor-pointer overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99] ${
        isLatest ? "ring-1 ring-primary/10" : ""
      }`}
    >
      <div className="p-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <RecordDateBlock iso={entry.date} />
            <h3 className="mt-3 truncate text-lg font-bold tracking-tight">
              {entry.title}
            </h3>
            {videoCount > 0 && (
              <Link
                href={`/videos?session=${entry.id}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-[10px] font-extrabold text-secondary transition-colors active:bg-border"
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
                className="rounded-full bg-chip px-2.5 py-1 text-[10px] font-extrabold text-secondary"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1 border-t border-border pt-4">
          <Metric value={entry.durationMin} unit="分" label="時間" />
          <Metric value={entry.totalSets} unit="セット" label="合計" />
          <Metric
            value={entry.totalVolume.toLocaleString()}
            unit="kg"
            label="総重量"
          />
        </div>

        <div className="mt-3.5 space-y-1.5">
          {entry.movements.slice(0, 3).map((m, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="truncate text-primary">{m.name}</span>
              <span className="shrink-0 pl-3 font-metric text-secondary">
                {m.weight}kg × {m.reps} × {m.sets}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function WorkoutDetailSheet({
  entry,
  onClose,
}: {
  entry: WorkoutHistoryEntry;
  onClose: () => void;
}) {
  const videoCount = MOCK_VIDEOS.filter((v) => v.workout_session_id === entry.id).length;
  const handleBackdropClick = useCallback(() => onClose(), [onClose]);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
        onClick={handleBackdropClick}
        aria-label="閉じる"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md"
        role="dialog"
        aria-modal="true"
        aria-label={`${entry.title} の詳細`}
      >
        <FocusTrap>
          <div className="max-h-[85dvh] overflow-y-auto rounded-t-[18px] bg-white pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-fade-in">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />

            <div className="px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <RecordDateBlock iso={entry.date} />
                  <h3 className="mt-2 text-xl font-bold tracking-tight">{entry.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
                  aria-label="閉じる"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Metrics */}
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-[14px] bg-surface p-4">
                <Metric value={entry.durationMin} unit="分" label="時間" />
                <Metric value={entry.totalSets} unit="セット" label="合計" />
                <Metric
                  value={entry.totalVolume.toLocaleString()}
                  unit="kg"
                  label="総重量"
                />
              </div>

              {/* All movements */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-title uppercase tracking-[0.12em] text-muted">
                  種目
                </p>
                <div className="space-y-2">
                  {entry.movements.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-[14px] bg-surface px-4 py-3"
                    >
                      <span className="text-sm font-bold">{m.name}</span>
                      <span className="font-metric text-sm text-secondary">
                        {m.weight}kg × {m.reps} × {m.sets}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video link */}
              {videoCount > 0 && (
                <Link
                  href={`/videos?session=${entry.id}`}
                  className="mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-chip text-sm font-extrabold text-secondary transition-all active:scale-[0.98]"
                >
                  <Camera size={14} strokeWidth={2} />
                  撮影動画を見る ({videoCount}本)
                </Link>
              )}

              {/* Category chips */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {entry.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-chip px-3 py-1.5 text-[11px] font-extrabold text-secondary"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FocusTrap>
      </div>
    </>
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
        <span className="text-lg font-metric leading-none">{value}</span>
        <span className="text-[10px] font-caption text-muted">{unit}</span>
      </p>
      <p className="mt-1 text-[10px] font-caption text-muted">{label}</p>
    </div>
  );
}
