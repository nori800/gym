"use client";

import { Suspense } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Link2,
  Unlink,
  Grid3X3,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import type { Video } from "@/types";

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

type GridType = "sixteen" | "center_v" | "center_h";

interface VideoPanel {
  video: Video | null;
  src: string | null;
  loading: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  showGrid: boolean;
  activeGrids: Set<GridType>;
}

function initialPanel(): VideoPanel {
  return {
    video: null,
    src: null,
    loading: true,
    playing: false,
    currentTime: 0,
    duration: 0,
    showGrid: false,
    activeGrids: new Set(["sixteen"]),
  };
}

function GridOverlay({ activeGrids }: { activeGrids: Set<GridType> }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      {activeGrids.has("sixteen") && (
        <>
          {[1, 2, 3].map((i) => (
            <line key={`v${i}`} x1={`${(i / 4) * 100}%`} y1="0" x2={`${(i / 4) * 100}%`} y2="100%" stroke="white" strokeOpacity={0.25} strokeWidth={0.5} />
          ))}
          {[1, 2, 3].map((i) => (
            <line key={`h${i}`} x1="0" y1={`${(i / 4) * 100}%`} x2="100%" y2={`${(i / 4) * 100}%`} stroke="white" strokeOpacity={0.25} strokeWidth={0.5} />
          ))}
        </>
      )}
      {activeGrids.has("center_v") && (
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#3eed8d" strokeOpacity={0.5} strokeWidth={1} />
      )}
      {activeGrids.has("center_h") && (
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#3eed8d" strokeOpacity={0.5} strokeWidth={1} />
      )}
    </svg>
  );
}

function fmtTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const idA = searchParams.get("a") ?? "";
  const idB = searchParams.get("b") ?? "";

  const [panelA, setPanelA] = useState<VideoPanel>(initialPanel);
  const [panelB, setPanelB] = useState<VideoPanel>(initialPanel);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  const [synced, setSynced] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);

  const loadVideo = useCallback(
    async (
      videoId: string,
      setPanel: React.Dispatch<React.SetStateAction<VideoPanel>>,
    ) => {
      if (!user || !videoId) {
        setPanel((p) => ({ ...p, loading: false }));
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (!data) {
        setPanel((p) => ({ ...p, loading: false }));
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

      let signedUrl: string | null = null;
      if (data.file_path) {
        const { data: signed } = await supabase.storage
          .from("videos")
          .createSignedUrl(data.file_path, 3600);
        signedUrl = signed?.signedUrl ?? null;
      }

      setPanel((p) => ({
        ...p,
        video: v,
        src: signedUrl,
        loading: false,
        duration: v.duration ?? 0,
      }));
    },
    [user],
  );

  useEffect(() => {
    if (authLoading || !user) return;
    loadVideo(idA, setPanelA);
    loadVideo(idB, setPanelB);
  }, [idA, idB, user, authLoading, loadVideo]);

  useEffect(() => {
    const el = videoRefA.current;
    if (!el || !panelA.src) return;
    el.load();
  }, [panelA.src]);

  useEffect(() => {
    const el = videoRefB.current;
    if (!el || !panelB.src) return;
    el.load();
  }, [panelB.src]);

  // Time update listeners
  useEffect(() => {
    const a = videoRefA.current;
    if (!a) return;
    const onTime = () => setPanelA((p) => ({ ...p, currentTime: a.currentTime }));
    const onLoaded = () => setPanelA((p) => ({ ...p, duration: a.duration }));
    const onEnded = () => setPanelA((p) => ({ ...p, playing: false }));
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const b = videoRefB.current;
    if (!b) return;
    const onTime = () => setPanelB((p) => ({ ...p, currentTime: b.currentTime }));
    const onLoaded = () => setPanelB((p) => ({ ...p, duration: b.duration }));
    const onEnded = () => setPanelB((p) => ({ ...p, playing: false }));
    b.addEventListener("timeupdate", onTime);
    b.addEventListener("loadedmetadata", onLoaded);
    b.addEventListener("ended", onEnded);
    return () => {
      b.removeEventListener("timeupdate", onTime);
      b.removeEventListener("loadedmetadata", onLoaded);
      b.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = useCallback(
    (ref: React.RefObject<HTMLVideoElement | null>, setPanel: React.Dispatch<React.SetStateAction<VideoPanel>>) => {
      const v = ref.current;
      if (!v) return;
      if (v.paused) {
        v.play().then(() => setPanel((p) => ({ ...p, playing: true }))).catch(() => {});
      } else {
        v.pause();
        setPanel((p) => ({ ...p, playing: false }));
      }
    },
    [],
  );

  const handleSeek = useCallback(
    (
      ref: React.RefObject<HTMLVideoElement | null>,
      setPanel: React.Dispatch<React.SetStateAction<VideoPanel>>,
      time: number,
    ) => {
      const v = ref.current;
      if (!v) return;
      v.currentTime = time;
      setPanel((p) => ({ ...p, currentTime: time }));
    },
    [],
  );

  const syncPlay = useCallback(() => {
    const a = videoRefA.current;
    const b = videoRefB.current;
    if (!a || !b) return;
    setSynced(true);
    a.currentTime = 0;
    b.currentTime = 0;
    a.playbackRate = speed;
    b.playbackRate = speed;
    a.play().then(() => setPanelA((p) => ({ ...p, playing: true }))).catch(() => {});
    b.play().then(() => setPanelB((p) => ({ ...p, playing: true }))).catch(() => {});
  }, [speed]);

  const syncStop = useCallback(() => {
    const a = videoRefA.current;
    const b = videoRefB.current;
    setSynced(false);
    if (a) {
      a.pause();
      setPanelA((p) => ({ ...p, playing: false }));
    }
    if (b) {
      b.pause();
      setPanelB((p) => ({ ...p, playing: false }));
    }
  }, []);

  const selectSpeed = useCallback(
    (s: number) => {
      setSpeed(s);
      setSpeedOpen(false);
      if (videoRefA.current) videoRefA.current.playbackRate = s;
      if (videoRefB.current) videoRefB.current.playbackRate = s;
    },
    [],
  );

  const toggleGrid = useCallback(
    (setPanel: React.Dispatch<React.SetStateAction<VideoPanel>>) => {
      setPanel((p) => ({ ...p, showGrid: !p.showGrid }));
    },
    [],
  );

  // Close speed menu
  useEffect(() => {
    if (!speedOpen) return;
    const close = () => setSpeedOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [speedOpen]);

  if (authLoading || panelA.loading || panelB.loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black">
        <Loader2 size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-sm text-white/70">動画を比較するにはログインが必要です</p>
        <Link
          href="/login"
          className="rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-primary transition-all active:scale-[0.98]"
        >
          ログインする
        </Link>
      </div>
    );
  }

  const renderPanel = (
    panel: VideoPanel,
    ref: React.RefObject<HTMLVideoElement | null>,
    setPanel: React.Dispatch<React.SetStateAction<VideoPanel>>,
    label: string,
  ) => (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Video area */}
      <div className="relative min-h-0 flex-1 bg-black">
        {panel.src ? (
          <video
            ref={ref}
            src={panel.src}
            className="absolute inset-0 h-full w-full object-contain"
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-white/40">動画を読み込めません</p>
          </div>
        )}
        {panel.showGrid && <GridOverlay activeGrids={panel.activeGrids} />}

        {/* Info badge */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-title text-white/90 backdrop-blur-sm">
            {label}
          </span>
          {panel.video && (
            <>
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-label text-white/70 backdrop-blur-sm">
                {panel.video.title}
              </span>
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-label text-white/50 backdrop-blur-sm">
                {panel.video.exercise_type}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Per-video controls */}
      <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5">
        <button
          type="button"
          onClick={() => togglePlay(ref, setPanel)}
          disabled={!panel.src || synced}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors active:text-white disabled:opacity-30"
          aria-label={panel.playing ? "一時停止" : "再生"}
        >
          {panel.playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <span className="w-8 text-right text-[9px] font-metric text-white/50 tabular-nums">
          {fmtTime(panel.currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={panel.duration || 1}
          step={0.01}
          value={panel.currentTime}
          onChange={(e) => handleSeek(ref, setPanel, parseFloat(e.target.value))}
          disabled={synced}
          className="h-0.5 flex-1 accent-white disabled:opacity-30"
          aria-label={`${label}の再生位置`}
        />
        <span className="w-8 text-[9px] font-metric text-white/50 tabular-nums">
          {fmtTime(panel.duration)}
        </span>
        <button
          type="button"
          onClick={() => toggleGrid(setPanel)}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            panel.showGrid ? "text-[#3eed8d]" : "text-white/40"
          }`}
          aria-label="グリッド表示"
        >
          <Grid3X3 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Header */}
      <div className="shrink-0 bg-black px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/videos")}
            className="shrink-0 text-white/80 active:text-white"
            aria-label="戻る"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <p className="flex-1 truncate text-sm font-title text-white">動画比較</p>
        </div>
      </div>

      {/* Split screen */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {renderPanel(panelA, videoRefA, setPanelA, "A")}
        <div className="h-px w-full bg-white/10 md:h-full md:w-px" />
        {renderPanel(panelB, videoRefB, setPanelB, "B")}
      </div>

      {/* Shared controls */}
      <div className="shrink-0 bg-[#111] px-4 pb-[max(0.75rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] pt-2">
        <div className="flex items-center justify-center gap-3">
          {/* Sync toggle */}
          {synced ? (
            <button
              type="button"
              onClick={syncStop}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-[11px] font-label text-white/90 transition-all active:bg-white/20"
            >
              <Unlink size={13} strokeWidth={1.5} />
              同期停止
            </button>
          ) : (
            <button
              type="button"
              onClick={syncPlay}
              className="flex items-center gap-1.5 rounded-full bg-[#3eed8d] px-4 py-2 text-[11px] font-title text-primary transition-all active:scale-95"
            >
              <Link2 size={13} strokeWidth={1.5} />
              同期再生
            </button>
          )}

          {/* Speed control */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSpeedOpen((p) => !p);
              }}
              className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-metric text-white/70 transition-colors active:bg-white/20"
              aria-label={`再生速度 ${speed}倍`}
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
              <div className="flex flex-col overflow-hidden rounded-2xl bg-[#222] shadow-lg ring-1 ring-white/10">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectSpeed(s)}
                    className={`whitespace-nowrap px-5 py-2.5 text-[12px] font-label transition-colors ${
                      speed === s
                        ? "bg-white/10 font-title text-white"
                        : "text-white/60 active:bg-white/5"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-black">
          <Loader2 size={24} className="animate-spin text-white/40" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
