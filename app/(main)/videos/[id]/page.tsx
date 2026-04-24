"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Pencil, Layers, ChevronDown, ChevronUp, Loader2,
  Trash2, ChevronLeft, ChevronRight, Link2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { AppToast } from "@/components/common/AppToast";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { createClient } from "@/lib/supabase/client";
import type { Video } from "@/types";
import type { Json } from "@/types/database.types";
import { VideoOverlay } from "@/components/player/VideoOverlay";
import { DrawingCanvas, type DrawTool, type DrawShape } from "@/components/player/DrawingCanvas";
import { OverlayControls } from "@/components/player/OverlayControls";
import { DrawToolbar } from "@/components/player/DrawToolbar";

type GridType = "sixteen" | "center_v" | "center_h";
type Panel = "overlay" | "draw" | null;

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const FRAME_STEP = 1 / 30;

type RecentWorkout = { id: string; title: string; workout_date: string };

type AnnotationRow = {
  id: string;
  video_id: string;
  user_id: string;
  frame_time: number;
  grid_settings: GridType[] | null;
  drawing_shapes: DrawShape[] | null;
  overlay_color: string | null;
  overlay_thickness: number | null;
  overlay_opacity: number | null;
};

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  const [video, setVideo] = useState<Video | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const [activeGrids, setActiveGrids] = useState<Set<GridType>>(() => new Set(["sixteen"]));
  const [overlayColor, setOverlayColor] = useState("#FFFFFF");
  const [overlayThickness, setOverlayThickness] = useState(1);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);

  const [drawTool, setDrawTool] = useState<DrawTool>("none");
  const [drawColor, setDrawColor] = useState("#3eed8d");
  const [shapes, setShapes] = useState<DrawShape[]>([]);

  const [panel, setPanel] = useState<Panel>(null);

  const [memo, setMemo] = useState("");
  const [memoOpen, setMemoOpen] = useState(false);
  const [memoSaving, setMemoSaving] = useState(false);

  const [linkedWorkoutTitle, setLinkedWorkoutTitle] = useState<string | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [pendingWorkoutId, setPendingWorkoutId] = useState("");
  const [linkSaving, setLinkSaving] = useState(false);

  const [linkOpen, setLinkOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [annotationId, setAnnotationId] = useState<string | null>(null);
  const [annotationSaving, setAnnotationSaving] = useState(false);

  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // ── Data loading ──────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setDataLoading(false);
      return;
    }

    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        setDataLoading(false);
        return;
      }

      const v: Video = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        exercise_type: data.exercise_type,
        shot_date: data.shot_date ?? "",
        file_path: data.file_path,
        thumbnail_path: data.thumbnail_path,
        duration: data.duration,
        memo: data.memo ?? "",
        workout_session_id: data.workout_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setVideo(v);
      setDuration(v.duration ?? 0);
      setMemo(v.memo);

      if (data.file_path) {
        const { data: signed, error: signErr } = await supabase.storage
          .from("videos")
          .createSignedUrl(data.file_path, 3600);

        if (signed?.signedUrl) {
          setVideoSrc(signed.signedUrl);
        } else if (signErr) {
          setPlaybackError("動画の読み込みURLを取得できませんでした。Storage の権限を確認してください。");
        }
      }

      if (data.workout_id) {
        const { data: wo } = await supabase
          .from("workouts")
          .select("title")
          .eq("id", data.workout_id)
          .single();
        if (wo?.title) setLinkedWorkoutTitle(wo.title);
      } else {
        setLinkedWorkoutTitle(null);
      }

      const { data: list } = await supabase
        .from("workouts")
        .select("id, title, workout_date")
        .eq("user_id", user.id)
        .order("workout_date", { ascending: false })
        .limit(20);
      if (list) setRecentWorkouts(list as RecentWorkout[]);

      // Load saved annotation
      const { data: ann } = await supabase
        .from("video_annotations")
        .select("*")
        .eq("video_id", data.id)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ann) {
        const row = ann as unknown as AnnotationRow;
        setAnnotationId(row.id);
        if (row.grid_settings) setActiveGrids(new Set(row.grid_settings));
        if (row.drawing_shapes) setShapes(row.drawing_shapes);
        if (row.overlay_color) setOverlayColor(row.overlay_color);
        if (row.overlay_thickness != null) setOverlayThickness(row.overlay_thickness);
        if (row.overlay_opacity != null) setOverlayOpacity(row.overlay_opacity);
      }

      setDataLoading(false);
    })();
  }, [id, user, authLoading]);

  useEffect(() => {
    if (!video) return;
    setPendingWorkoutId(video.workout_session_id ?? "");
  }, [video?.id, video?.workout_session_id]);

  useEffect(() => {
    if (videoSrc) setPlaybackError(null);
  }, [videoSrc]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoSrc) return;
    el.load();
  }, [videoSrc]);

  // ── Link workout ──────────────────────────────────────────────
  const handleLinkWorkout = useCallback(async () => {
    if (!user || !video) return;
    setLinkSaving(true);
    const supabase = createClient();
    const nextId = pendingWorkoutId || null;
    const { error } = await supabase
      .from("videos")
      .update({ workout_id: nextId })
      .eq("id", video.id)
      .eq("user_id", user.id);

    if (error) {
      showToast("ワークアウトの紐付けに失敗しました", "error");
      setLinkSaving(false);
      return;
    }

    setVideo((prev) => (prev ? { ...prev, workout_session_id: nextId } : null));

    if (!nextId) {
      setLinkedWorkoutTitle(null);
    } else {
      const hit = recentWorkouts.find((w) => w.id === nextId);
      if (hit?.title) {
        setLinkedWorkoutTitle(hit.title);
      } else {
        const { data: wo } = await supabase
          .from("workouts")
          .select("title")
          .eq("id", nextId)
          .single();
        setLinkedWorkoutTitle(wo?.title ?? null);
      }
    }

    showToast("ワークアウトを紐付けました", "success");
    setLinkSaving(false);
  }, [user, video, pendingWorkoutId, recentWorkouts, showToast]);

  // ── Memo save ─────────────────────────────────────────────────
  const handleMemoSave = useCallback(async () => {
    if (!user || !video) return;
    setMemoSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("videos")
      .update({ memo })
      .eq("id", video.id)
      .eq("user_id", user.id);

    if (error) {
      showToast("メモの保存に失敗しました", "error");
    } else {
      showToast("メモを保存しました", "success");
      setMemoOpen(false);
    }
    setMemoSaving(false);
  }, [user, video, memo, showToast]);

  // ── Annotation save ───────────────────────────────────────────
  const handleAnnotationSave = useCallback(async () => {
    if (!user || !video) return;
    setAnnotationSaving(true);
    const supabase = createClient();

    const payload = {
      video_id: video.id,
      user_id: user.id,
      frame_time: currentTime,
      grid_settings: Array.from(activeGrids) as unknown as Json,
      drawing_shapes: shapes as unknown as Json,
      overlay_color: overlayColor,
      overlay_thickness: overlayThickness,
      overlay_opacity: overlayOpacity,
    };

    let err;
    if (annotationId) {
      const res = await supabase
        .from("video_annotations")
        .update(payload)
        .eq("id", annotationId);
      err = res.error;
    } else {
      const res = await supabase
        .from("video_annotations")
        .insert(payload)
        .select("id")
        .single();
      err = res.error;
      if (res.data) setAnnotationId(res.data.id);
    }

    if (err) {
      showToast("アノテーションの保存に失敗しました", "error");
    } else {
      showToast("アノテーションを保存しました", "success");
    }
    setAnnotationSaving(false);
  }, [
    user, video, currentTime, activeGrids, shapes,
    overlayColor, overlayThickness, overlayOpacity,
    annotationId, showToast,
  ]);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const executeDelete = useCallback(async () => {
    if (!user || !video) return;
    setDeleteConfirmOpen(false);
    setDeleting(true);
    const supabase = createClient();

    if (video.file_path) {
      const { error: storageErr } = await supabase.storage
        .from("videos")
        .remove([video.file_path]);
      if (storageErr) {
        showToast("ストレージからの削除に失敗しました", "error");
        setDeleting(false);
        return;
      }
    }

    if (video.thumbnail_path) {
      await supabase.storage.from("videos").remove([video.thumbnail_path]);
    }

    await supabase
      .from("video_annotations")
      .delete()
      .eq("video_id", video.id)
      .eq("user_id", user.id);

    const { error: dbErr } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id)
      .eq("user_id", user.id);

    if (dbErr) {
      showToast("動画の削除に失敗しました", "error");
      setDeleting(false);
      return;
    }

    showToast("動画を削除しました", "success");
    router.replace("/videos");
  }, [user, video, showToast, router]);

  const handleDelete = useCallback(() => {
    setDeleteConfirmOpen(true);
  }, []);

  // ── Playback ──────────────────────────────────────────────────
  const togglePlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !videoSrc) return;
    if (v.paused) {
      try {
        await v.play();
        setPlaying(true);
        setPlaybackError(null);
      } catch {
        setPlaying(false);
      }
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [videoSrc]);

  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  }, []);

  const stepFrame = useCallback((direction: 1 | -1) => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.paused) {
      v.pause();
      setPlaying(false);
    }
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + direction * FRAME_STEP));
  }, []);

  const selectSpeed = useCallback((s: number) => {
    setSpeed(s);
    setSpeedOpen(false);
    if (videoRef.current) videoRef.current.playbackRate = s;
  }, []);

  // ── Video event listeners ─────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => { if (!seeking) setCurrentTime(v.currentTime); };
    const onLoaded = () => setDuration(v.duration);
    const onEnded = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("ended", onEnded);
    };
  }, [seeking]);

  // ── Speed menu: close on pointerdown + Escape ─────────────────
  useEffect(() => {
    if (!speedOpen) return;
    const close = () => setSpeedOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [speedOpen]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  }, []);

  const toggleGrid = useCallback((type: GridType) => {
    setActiveGrids((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }, []);

  const addShape = useCallback((s: DrawShape) => setShapes((prev) => [...prev, s]), []);
  const undoShape = useCallback(() => setShapes((prev) => prev.slice(0, -1)), []);
  const clearShapes = useCallback(() => setShapes([]), []);

  const fmtTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // ── Loading state ─────────────────────────────────────────────
  if (dataLoading || authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-secondary">動画を閲覧するにはログインが必要です</p>
        <Link
          href="/login"
          className="rounded-xl bg-inverse px-6 py-3 text-sm font-extrabold text-on-inverse transition-all active:scale-[0.98]"
        >
          ログインする
        </Link>
      </div>
    );
  }

  // ── Video not found ───────────────────────────────────────────
  if (!video) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/videos" className="text-secondary"><ArrowLeft size={20} strokeWidth={1.5} /></Link>
          <h1 className="text-xl font-title">動画が見つかりません</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <AppToast toast={toast} onDismiss={dismissToast} />
      <ConfirmModal
        open={deleteConfirmOpen}
        title="動画を削除"
        description="この操作は取り消せません。"
        confirmLabel="削除"
        danger
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Header */}
      <div className="shrink-0 bg-black px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="shrink-0 text-white/80 active:text-white" aria-label="戻る">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-title text-white">{video.title}</p>
            {video.workout_session_id && (
              <Link
                href={`/videos?session=${video.workout_session_id}`}
                className="mt-1 inline-block truncate text-[11px] font-semibold text-white/55 underline-offset-2 hover:text-white/90"
              >
                ワークアウト: {linkedWorkoutTitle ?? "セッション"}
              </Link>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-label text-white/60">
            {video.exercise_type}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 rounded-full bg-white/10 p-2 text-white/60 transition-colors active:bg-white/20 disabled:opacity-40"
            aria-label="動画を削除"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Video area */}
      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={videoRef}
          key={videoSrc ?? "no-src"}
          src={videoSrc ?? undefined}
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          preload="metadata"
          onError={() => {
            if (!videoSrc) return;
            setPlaying(false);
            const isWebm = video.file_path?.endsWith(".webm");
            setPlaybackError(
              isWebm
                ? "この動画は WebM 形式のため、Safari では再生できません。Chrome で開くか、撮り直すと MP4 で保存されます。"
                : "動画を読み込めませんでした。ネットワークを確認してリロードしてください。",
            );
          }}
        />

        {!videoSrc && !playbackError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white/40" />
          </div>
        )}

        {playbackError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center">
            <p className="text-sm leading-relaxed text-white/90">{playbackError}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {videoSrc && (
                <a
                  href={videoSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition-colors active:bg-white/25"
                >
                  新しいタブで開く
                </a>
              )}
              <button
                type="button"
                onClick={() => router.push("/capture")}
                className="rounded-full bg-accent/80 px-4 py-2 text-xs font-bold text-primary backdrop-blur-sm transition-colors active:bg-accent"
              >
                撮り直す
              </button>
            </div>
          </div>
        )}

        <VideoOverlay
          activeGrids={activeGrids}
          color={overlayColor}
          thickness={overlayThickness}
          opacity={overlayOpacity}
        />

        <DrawingCanvas
          tool={drawTool}
          color={drawColor}
          shapes={shapes}
          onAdd={addShape}
          width={1920}
          height={1080}
        />
      </div>

      {/* Controls area */}
      <div className="shrink-0 bg-white px-4 pb-[max(1.25rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-3">
        {/* Seek bar */}
        <div className="mb-2 flex items-center gap-2">
          <span className="w-9 text-right text-[10px] font-metric text-muted">{fmtTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            onPointerDown={() => setSeeking(true)}
            onPointerUp={() => setSeeking(false)}
            aria-label="再生位置"
            className="h-1 flex-1 accent-primary"
          />
          <span className="w-9 text-[10px] font-metric text-muted">{fmtTime(duration)}</span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2">
          <button type="button" onClick={() => stepFrame(-1)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted transition-colors active:text-primary" aria-label="1フレーム戻す">
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button type="button" onClick={() => skip(-5)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-secondary transition-colors active:text-primary" aria-label="5秒戻す">
            <SkipBack size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "一時停止" : "再生"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-inverse transition-all active:scale-95"
          >
            {playing ? <Pause size={18} className="text-on-inverse" /> : <Play size={18} className="ml-0.5 text-on-inverse" />}
          </button>
          <button type="button" onClick={() => skip(5)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-secondary transition-colors active:text-primary" aria-label="5秒進める">
            <SkipForward size={18} strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => stepFrame(1)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted transition-colors active:text-primary" aria-label="1フレーム進める">
            <ChevronRight size={16} strokeWidth={2} />
          </button>

          {/* Speed selector */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSpeedOpen((p) => !p); }}
              aria-label={`再生速度 ${speed}倍`}
              className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-metric text-secondary transition-colors active:bg-border"
            >
              {speed}x
            </button>

            <div
              onPointerDown={(e) => e.stopPropagation()}
              className={`absolute bottom-full right-0 mb-2 origin-bottom-right transition-all duration-200 ease-out ${
                speedOpen
                  ? "pointer-events-auto scale-100 opacity-100"
                  : "pointer-events-none scale-90 opacity-0"
              }`}
            >
              <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/10 ring-1 ring-black/[0.04]">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectSpeed(s)}
                    className={`whitespace-nowrap px-5 py-2.5 text-[12px] font-label transition-colors ${
                      speed === s
                        ? "bg-surface font-title text-primary"
                        : "text-secondary active:bg-surface/60"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tool tabs */}
        <div className="mt-2 flex justify-center gap-1">
          <button
            type="button"
            onClick={() => { setPanel(panel === "overlay" ? null : "overlay"); setDrawTool("none"); }}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] transition-colors ${
              panel === "overlay" ? "bg-surface text-primary" : "text-muted"
            }`}
          >
            <Layers size={13} strokeWidth={1.5} /> 補助線
          </button>
          <button
            type="button"
            onClick={() => setPanel(panel === "draw" ? null : "draw")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] transition-colors ${
              panel === "draw" ? "bg-surface text-primary" : "text-muted"
            }`}
          >
            <Pencil size={13} strokeWidth={1.5} /> 描画
          </button>
          <button
            type="button"
            onClick={() => setMemoOpen(!memoOpen)}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] transition-colors ${
              memoOpen ? "bg-surface text-primary" : "text-muted"
            }`}
          >
            {memoOpen ? <ChevronUp size={13} strokeWidth={1.5} /> : <ChevronDown size={13} strokeWidth={1.5} />}
            メモ
          </button>
          <button
            type="button"
            onClick={() => setLinkOpen(!linkOpen)}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] transition-colors ${
              linkOpen ? "bg-surface text-primary" : "text-muted"
            }`}
          >
            <Link2 size={13} strokeWidth={1.5} />
            紐付け
          </button>
        </div>

        {panel === "overlay" && (
          <div className="mt-2">
            <OverlayControls
              activeGrids={activeGrids}
              onToggleGrid={toggleGrid}
              color={overlayColor}
              onColorChange={setOverlayColor}
              thickness={overlayThickness}
              onThicknessChange={setOverlayThickness}
              opacity={overlayOpacity}
              onOpacityChange={setOverlayOpacity}
            />
            <button
              type="button"
              onClick={handleAnnotationSave}
              disabled={annotationSaving}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
            >
              {annotationSaving && <Loader2 size={16} className="animate-spin" />}
              オーバーレイを保存
            </button>
          </div>
        )}

        {panel === "draw" && (
          <div className="mt-2">
            <DrawToolbar
              activeTool={drawTool}
              onToolChange={setDrawTool}
              drawColor={drawColor}
              onDrawColorChange={setDrawColor}
              canUndo={shapes.length > 0}
              onUndo={undoShape}
              onClearAll={clearShapes}
            />
            <button
              type="button"
              onClick={handleAnnotationSave}
              disabled={annotationSaving}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
            >
              {annotationSaving && <Loader2 size={16} className="animate-spin" />}
              描画を保存
            </button>
          </div>
        )}

        {memoOpen && (
          <div className="mt-2 space-y-2">
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              placeholder="フォームの気づきなど"
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="button"
              onClick={handleMemoSave}
              disabled={memoSaving}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-colors duration-150 active:scale-[0.98] disabled:opacity-40"
            >
              {memoSaving && <Loader2 size={16} className="animate-spin" />}
              保存
            </button>
          </div>
        )}

        {linkOpen && (
          <div className="mt-2 overflow-hidden rounded-[14px] border border-border bg-surface px-3 py-3">
            <p className="text-[12px] leading-relaxed text-secondary">
              {linkedWorkoutTitle
                ? `現在「${linkedWorkoutTitle}」に紐付け中`
                : "履歴のセッションにこの動画を紐付けます"}
            </p>
            <select
              value={pendingWorkoutId}
              onChange={(e) => setPendingWorkoutId(e.target.value)}
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
              onClick={handleLinkWorkout}
              disabled={linkSaving || pendingWorkoutId === (video.workout_session_id ?? "")}
              className="mt-2 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
            >
              {linkSaving && <Loader2 size={16} className="animate-spin" />}
              ワークアウトに登録
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
