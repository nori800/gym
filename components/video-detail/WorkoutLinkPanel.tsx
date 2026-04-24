"use client";

import { Loader2 } from "lucide-react";

type RecentWorkout = { id: string; title: string; workout_date: string };

interface Props {
  linkedWorkoutTitle: string | null;
  recentWorkouts: RecentWorkout[];
  pendingWorkoutId: string;
  currentWorkoutId: string | null;
  saving: boolean;
  onPendingChange: (v: string) => void;
  onSave: () => void;
}

export function WorkoutLinkPanel({
  linkedWorkoutTitle,
  recentWorkouts,
  pendingWorkoutId,
  currentWorkoutId,
  saving,
  onPendingChange,
  onSave,
}: Props) {
  return (
    <div className="mt-2 overflow-hidden rounded-[14px] border border-border bg-surface px-3 py-3">
      <p className="text-xs leading-relaxed text-secondary">
        {linkedWorkoutTitle
          ? `現在「${linkedWorkoutTitle}」に紐付け中`
          : "履歴のセッションにこの動画を紐付けます"}
      </p>
      <select
        value={pendingWorkoutId}
        onChange={(e) => onPendingChange(e.target.value)}
        aria-label="紐付けるワークアウト"
        className="mt-2 min-h-[40px] w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
      >
        <option value="">紐付けなし</option>
        {recentWorkouts.map((w) => (
          <option key={w.id} value={w.id}>
            {w.title}（{w.workout_date}）
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onSave}
        disabled={saving || pendingWorkoutId === (currentWorkoutId ?? "")}
        className="mt-2 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        ワークアウトに登録
      </button>
    </div>
  );
}
