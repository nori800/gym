"use client";

import Link from "next/link";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import type { Video } from "@/types";

interface Props {
  video: Video;
  linkedWorkoutTitle: string | null;
  deleting: boolean;
  onBack: () => void;
  onDelete: () => void;
}

export function VideoDetailHeader({ video, linkedWorkoutTitle, deleting, onBack, onDelete }: Props) {
  return (
    <div className="shrink-0 bg-black px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="shrink-0 text-white/80 active:text-white" aria-label="戻る">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-title text-white">{video.title}</p>
          {video.workout_session_id && (
            <Link
              href={`/videos?session=${video.workout_session_id}`}
              className="mt-1 inline-block truncate text-xs font-semibold text-white/55 underline-offset-2 hover:text-white/90"
            >
              ワークアウト: {linkedWorkoutTitle ?? "セッション"}
            </Link>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-label text-white/60">
          {video.exercise_type}
        </span>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="shrink-0 rounded-full bg-white/10 p-2 text-white/60 transition-colors active:bg-white/20 disabled:opacity-40"
          aria-label="動画を削除"
        >
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}
