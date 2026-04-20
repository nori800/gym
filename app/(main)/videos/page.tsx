"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, Video as VideoIcon } from "lucide-react";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { EXERCISE_TYPES } from "@/lib/mocks/exercises";
import { formatDate } from "@/lib/utils/formatDate";

type SortKey = "newest" | "oldest";

export default function VideosPage() {
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    let list = [...MOCK_VIDEOS];
    if (filter !== "all") list = list.filter((v) => v.exercise_type === filter);
    list.sort((a, b) =>
      sort === "newest"
        ? b.shot_date.localeCompare(a.shot_date)
        : a.shot_date.localeCompare(b.shot_date),
    );
    return list;
  }, [filter, sort]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-title">動画一覧</h1>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 w-full appearance-none rounded-lg bg-surface px-3 pr-8 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
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
            className="h-9 appearance-none rounded-lg bg-surface px-3 pr-8 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-muted" />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <VideoIcon size={24} strokeWidth={1.5} className="text-muted" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <Link
              key={v.id}
              href={`/videos/${v.id}`}
              className="flex gap-4 rounded-xl bg-surface p-3 transition-colors active:bg-surface/80"
            >
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-neutral-200">
                <VideoIcon size={20} strokeWidth={1.5} className="text-muted" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="truncate text-sm font-title">{v.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                  <span>{v.exercise_type}</span>
                  <span>·</span>
                  <span>{formatDate(v.shot_date)}</span>
                  {v.duration && (
                    <>
                      <span>·</span>
                      <span>{v.duration}秒</span>
                    </>
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
