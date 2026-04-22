"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Video as VideoIcon } from "lucide-react";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { EXERCISE_TYPES } from "@/lib/mocks/exercises";
import { formatDate } from "@/lib/utils/formatDate";
import { getWorkoutSessionById } from "@/lib/mocks/workoutHistory";

type SortKey = "newest" | "oldest";

function VideosPageInner() {
  const searchParams = useSearchParams();
  const sessionFilter = searchParams.get("session");

  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const sessionTitle = sessionFilter ? getWorkoutSessionById(sessionFilter)?.title : null;

  const filtered = useMemo(() => {
    let list = [...MOCK_VIDEOS];
    if (sessionFilter) {
      list = list.filter((v) => v.workout_session_id === sessionFilter);
    }
    if (filter !== "all") list = list.filter((v) => v.exercise_type === filter);
    list.sort((a, b) =>
      sort === "newest"
        ? b.shot_date.localeCompare(a.shot_date)
        : a.shot_date.localeCompare(b.shot_date),
    );
    return list;
  }, [filter, sort, sessionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-caption uppercase tracking-[0.12em] text-muted">
          Library
        </p>
        <h1 className="mt-0.5 text-[22px] font-bold tracking-tight">動画ライブラリ</h1>
      </div>

      {sessionFilter && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-chip px-3 py-2.5">
          <p className="min-w-0 text-[12px] text-secondary">
            <span className="font-bold text-primary">{sessionTitle ?? "このセッション"}</span>
            に紐付いた動画
          </p>
          <Link
            href="/videos"
            className="shrink-0 text-[11px] font-bold text-muted underline-offset-2 hover:text-primary"
          >
            解除
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-8 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="all">すべて</option>
            {EXERCISE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-muted" />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 appearance-none rounded-lg border border-border bg-white px-3 pr-8 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-muted" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <VideoIcon size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">動画がありません</p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            {sessionFilter
              ? "このセッションに紐付いた動画はまだありません。撮影タブからフォームを録画してみましょう。"
              : "撮影タブからフォームを録画して、動画ライブラリに追加しましょう。"}
          </p>
          <Link
            href="/capture"
            className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
          >
            撮影する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <Link
              key={v.id}
              href={`/videos/${v.id}`}
              className="flex gap-4 rounded-[18px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-colors active:bg-surface"
            >
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-neutral-200">
                <VideoIcon size={20} strokeWidth={1.5} className="text-muted" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="truncate text-sm font-title">{v.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                  <span>{v.exercise_type}</span>
                  <span>·</span>
                  <span>{formatDate(v.shot_date)}</span>
                  {v.duration != null && (
                    <>
                      <span>·</span>
                      <span>{v.duration}秒</span>
                    </>
                  )}
                  {v.workout_session_id && (
                    <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-bold text-secondary">
                      ワークアウト紐付け
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VideosPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted">読み込み中…</div>}>
      <VideosPageInner />
    </Suspense>
  );
}
