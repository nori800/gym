"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Pencil, Layers, ChevronDown, ChevronUp,
} from "lucide-react";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { getWorkoutSessionById } from "@/lib/mocks/workoutHistory";
import { VideoOverlay } from "@/components/player/VideoOverlay";
import { DrawingCanvas, type DrawTool, type DrawShape } from "@/components/player/DrawingCanvas";
import { OverlayControls } from "@/components/player/OverlayControls";
import { DrawToolbar } from "@/components/player/DrawToolbar";

type GridType = "sixteen" | "center_v" | "center_h";
type Panel = "overlay" | "draw" | null;

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const video = MOCK_VIDEOS.find((v) => v.id === id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration ?? 0);
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

  const [memo, setMemo] = useState(video?.memo ?? "");
  const [memoOpen, setMemoOpen] = useState(false);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  }, []);

  const selectSpeed = useCallback((s: number) => {
    setSpeed(s);
    setSpeedOpen(false);
    if (videoRef.current) videoRef.current.playbackRate = s;
  }, []);

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

  useEffect(() => {
    if (!speedOpen) return;
    const close = () => setSpeedOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
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

  const handleMemoSave = useCallback(() => {
    console.log("save memo", { videoId: id, memo });
    setMemoOpen(false);
  }, [id, memo]);

  const fmtTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

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

  const linkedSession = getWorkoutSessionById(video.workout_session_id);

  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      {/* Header — 動画の外に独立配置 */}
      <div className="shrink-0 bg-black px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="shrink-0 text-white/80 active:text-white" aria-label="戻る">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-title text-white">{video.title}</p>
            {linkedSession && (
              <Link
                href={`/videos?session=${video.workout_session_id}`}
                className="mt-1 inline-block truncate text-[11px] font-semibold text-white/55 underline-offset-2 hover:text-white/90"
              >
                ワークアウト: {linkedSession.title}
              </Link>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-label text-white/60">
            {video.exercise_type}
          </span>
        </div>
      </div>

      {/* Video area */}
      <div className="relative flex-1 bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          preload="metadata"
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-white/40">ダミー動画プレビュー</p>
        </div>

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
      <div className="shrink-0 bg-white px-4 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-3">
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

        {/* Playback */}
        <div className="flex items-center justify-center gap-4">
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

          {/* Speed selector */}
          <div className="relative ml-2">
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
              className="min-h-[44px] w-full rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-colors duration-150 active:scale-[0.98]"
            >
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
