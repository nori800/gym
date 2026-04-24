"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Video as VideoIcon, Loader2, LogIn, GitCompare } from "lucide-react";
import { EXERCISE_TYPES } from "@/lib/data/exercises";
import { formatDate } from "@/lib/utils/formatDate";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { validateMemberForTrainer } from "@/lib/trainer/validateMemberForTrainer";
import { MemberContextNav } from "@/components/trainer/MemberContextNav";
import type { Video } from "@/types";

type SortKey = "newest" | "oldest";

function VideosPageInner() {
  const searchParams = useSearchParams();
  const sessionFilter = searchParams.get("session");
  const memberParam = searchParams.get("member");
  const { user, loading: authLoading } = useAuth();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [trainerMemberLabel, setTrainerMemberLabel] = useState<string | null>(null);
  const [trainerMemberUserId, setTrainerMemberUserId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setVideos([]);
      setTrainerMemberLabel(null);
      setTrainerMemberUserId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const trainerUser = user;
      if (!trainerUser) return;
      setLoading(true);
      setFetchError(null);
      const supabase = createClient();
      let targetUserId = trainerUser.id;
      setTrainerMemberLabel(null);
      setTrainerMemberUserId(null);

      if (memberParam) {
        const access = await validateMemberForTrainer(supabase, trainerUser.id, memberParam);
        if (cancelled) return;
        if (!access.ok) {
          const msg =
            access.reason === "not_trainer"
              ? "メンバーの動画を表示するには、トレーナーアカウントでログインしてください。"
              : "このメンバーの動画を表示する権限がありません。";
          setFetchError(msg);
          setVideos([]);
          setLoading(false);
          return;
        }
        targetUserId = access.memberUserId;
        setTrainerMemberLabel(access.displayName);
        setTrainerMemberUserId(access.memberUserId);
      }

      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        setFetchError("動画の取得に失敗しました。再読み込みしてください。");
        setVideos([]);
        setLoading(false);
        return;
      }
      setVideos(
        (data ?? []).map((v) => ({
          id: v.id,
          user_id: v.user_id,
          title: v.title,
          exercise_type: v.exercise_type,
          shot_date: v.shot_date ?? "",
          file_path: v.file_path,
          thumbnail_path: v.thumbnail_path,
          duration: v.duration,
          memo: v.memo ?? "",
          workout_session_id: v.workout_id,
          created_at: v.created_at,
          updated_at: v.updated_at,
        })),
      );
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, memberParam]);

  useEffect(() => {
    if (!sessionFilter || !user) {
      setSessionTitle(null);
      return;
    }
    const supabase = createClient();
    supabase
      .from("workouts")
      .select("title")
      .eq("id", sessionFilter)
      .single()
      .then(({ data, error }) => {
        if (error) setSessionTitle(null);
        else setSessionTitle(data?.title ?? null);
      });
  }, [sessionFilter, user]);

  const filtered = useMemo(() => {
    let list = [...videos];
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
  }, [videos, filter, sort, sessionFilter]);

  const toggleCompare = (id: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-label="読み込み中">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-caption uppercase tracking-[0.12em] text-muted">Library</p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-tight">動画ライブラリ</h1>
        </div>
        <div className="flex flex-col items-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <LogIn size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">ログインして始めよう</p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            ログインすると動画を保存・管理できます。
          </p>
          <Link
            href="/login"
            className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-caption uppercase tracking-[0.12em] text-muted">Library</p>
        <h1 className="mt-0.5 text-[22px] font-bold tracking-tight">動画ライブラリ</h1>
      </div>

      {trainerMemberLabel && trainerMemberUserId && (
        <MemberContextNav
          memberLabel={trainerMemberLabel}
          memberUserId={trainerMemberUserId}
        />
      )}

      {fetchError && (
        <div className="rounded-xl bg-danger/10 px-4 py-3">
          <p className="text-sm font-bold text-danger">{fetchError}</p>
        </div>
      )}

      {sessionFilter && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-chip px-3 py-2.5">
          <p className="min-w-0 text-xs text-secondary">
            <span className="font-bold text-primary">{sessionTitle ?? "このセッション"}</span>
            に紐付いた動画
          </p>
          <Link
            href={trainerMemberUserId ? `/videos?member=${encodeURIComponent(trainerMemberUserId)}` : "/videos"}
            className="shrink-0 text-xs font-bold text-muted underline-offset-2 hover:text-primary"
          >
            解除
          </Link>
        </div>
      )}

      {compareSelection.length === 2 && (
        <Link
          href={`/videos/compare?a=${compareSelection[0]}&b=${compareSelection[1]}`}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold tracking-wide text-primary transition-all active:scale-[0.98]"
        >
          <GitCompare size={16} strokeWidth={2} />
          2本を比較する
        </Link>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="種目でフィルター"
            className="h-9 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-8 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="all">すべて</option>
            {EXERCISE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-muted" />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="並び替え"
            className="h-9 appearance-none rounded-lg border border-border bg-white px-3 pr-8 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-muted" />
        </div>
      </div>

      {compareSelection.length > 0 && (
        <p className="text-xs text-secondary">
          比較する動画を{2 - compareSelection.length}本選択してください
          <button
            type="button"
            onClick={() => setCompareSelection([])}
            className="ml-2 text-xs font-bold text-muted underline-offset-2 hover:text-primary"
          >
            選択解除
          </button>
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <VideoIcon size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">
            {trainerMemberUserId ? "このメンバーの動画はまだありません" : "フォームを撮影しよう"}
          </p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            {trainerMemberUserId
              ? sessionFilter
                ? "このセッションに紐づく動画はまだありません。"
                : "メンバーが撮影すると、ここから一覧・再生できます。"
              : sessionFilter
                ? "このセッションの撮影動画はまだありません。"
                : "トレーニング中のフォームを録画して、自分の動きを客観的にチェックできます。"}
          </p>
          {!trainerMemberUserId && (
            <Link
              href="/capture"
              className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
            >
              撮影する
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => {
            const isSelected = compareSelection.includes(v.id);
            return (
              <div key={v.id} className="relative">
                <Link
                  href={`/videos/${v.id}`}
                  className={`flex gap-4 rounded-[18px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-colors active:bg-surface ${
                    isSelected ? "ring-2 ring-accent" : ""
                  }`}
                >
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-neutral-200">
                    <VideoIcon size={20} strokeWidth={1.5} className="text-muted" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="truncate text-sm font-title">{v.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
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
                        <span className="rounded-full bg-chip px-2 py-0.5 text-xs font-bold text-secondary">
                          ワークアウト紐付け
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); toggleCompare(v.id); }}
                  className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-accent text-primary"
                      : "bg-chip text-muted"
                  }`}
                  aria-label={isSelected ? "比較から外す" : "比較に追加"}
                  aria-pressed={isSelected}
                >
                  {isSelected ? "✓" : "⇆"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function VideosPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted" role="status">読み込み中…</div>}>
      <VideosPageInner />
    </Suspense>
  );
}
