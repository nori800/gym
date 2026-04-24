"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Layers, ChevronDown, ChevronUp,
  Loader2, Link2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { useVideoDetail } from "@/lib/hooks/useVideoDetail";
import { usePlayback } from "@/lib/hooks/usePlayback";
import { AppToast } from "@/components/common/AppToast";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { VideoOverlay } from "@/components/player/VideoOverlay";
import { DrawingCanvas, type DrawTool } from "@/components/player/DrawingCanvas";
import { OverlayControls } from "@/components/player/OverlayControls";
import { DrawToolbar } from "@/components/player/DrawToolbar";
import { VideoDetailHeader } from "@/components/video-detail/VideoDetailHeader";
import { PlaybackControls } from "@/components/video-detail/PlaybackControls";
import { MemoPanel } from "@/components/video-detail/MemoPanel";
import { WorkoutLinkPanel } from "@/components/video-detail/WorkoutLinkPanel";

type Panel = "overlay" | "draw" | null;

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  const detail = useVideoDetail(id, user?.id, authLoading, showToast);
  const playback = usePlayback(detail.videoSrc);

  const [drawTool, setDrawTool] = useState<DrawTool>("none");
  const [drawColor, setDrawColor] = useState("#3eed8d");
  const [panel, setPanel] = useState<Panel>(null);
  const [memoOpen, setMemoOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  const handleVideoError = useCallback(() => {
    if (!detail.videoSrc) return;
    playback.setPlaying(false);
    const isWebm = detail.video?.file_path?.endsWith(".webm");
    detail.setPlaybackError(
      isWebm
        ? "この動画は WebM 形式のため、Safari では再生できません。Chrome で開くか、撮り直すと MP4 で保存されます。"
        : "動画を読み込めませんでした。ネットワークを確認してリロードしてください。",
    );
  }, [detail, playback]);

  const handleAnnotationSave = useCallback(() => {
    detail.handleAnnotationSave(playback.currentTime);
  }, [detail, playback.currentTime]);

  if (detail.dataLoading || authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

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

  if (!detail.video) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/videos" className="text-secondary"><ArrowLeft size={20} strokeWidth={1.5} /></Link>
          <h1 className="text-xl font-title">動画が見つかりません</h1>
        </div>
      </div>
    );
  }

  const { video, overlay } = detail;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <AppToast toast={toast} onDismiss={dismissToast} />
      <ConfirmModal
        open={detail.deleteConfirmOpen}
        title="動画を削除"
        description="この操作は取り消せません。"
        confirmLabel="削除"
        danger
        onConfirm={detail.executeDelete}
        onCancel={() => detail.setDeleteConfirmOpen(false)}
      />

      <VideoDetailHeader
        video={video}
        linkedWorkoutTitle={detail.linkedWorkoutTitle}
        deleting={detail.deleting}
        onBack={() => router.back()}
        onDelete={detail.handleDelete}
      />

      {/* Video area */}
      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={playback.videoRef}
          key={detail.videoSrc ?? "no-src"}
          src={detail.videoSrc ?? undefined}
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          preload="metadata"
          onError={handleVideoError}
        />

        {!detail.videoSrc && !detail.playbackError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white/40" />
          </div>
        )}

        {detail.playbackError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center">
            <p className="text-sm leading-relaxed text-white/90">{detail.playbackError}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {detail.videoSrc && (
                <a
                  href={detail.videoSrc}
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
          activeGrids={overlay.activeGrids}
          color={overlay.overlayColor}
          thickness={overlay.overlayThickness}
          opacity={overlay.overlayOpacity}
        />

        <DrawingCanvas
          tool={drawTool}
          color={drawColor}
          shapes={detail.shapes}
          onAdd={detail.addShape}
          width={1920}
          height={1080}
        />
      </div>

      {/* Controls area */}
      <div className="shrink-0 bg-white px-4 pb-[max(1.25rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-3">
        <PlaybackControls
          currentTime={playback.currentTime}
          duration={playback.duration}
          playing={playback.playing}
          speed={playback.speed}
          speedOpen={playback.speedOpen}
          onTogglePlay={playback.togglePlay}
          onSkip={playback.skip}
          onStepFrame={playback.stepFrame}
          onSeek={playback.handleSeek}
          onSeekStart={() => playback.setSeeking(true)}
          onSeekEnd={() => playback.setSeeking(false)}
          onSelectSpeed={playback.selectSpeed}
          onSpeedToggle={() => playback.setSpeedOpen((p) => !p)}
        />

        {/* Tool tabs */}
        <div className="mt-2 flex justify-center gap-1">
          <button
            type="button"
            onClick={() => { setPanel(panel === "overlay" ? null : "overlay"); setDrawTool("none"); }}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs transition-colors ${
              panel === "overlay" ? "bg-surface text-primary" : "text-muted"
            }`}
          >
            <Layers size={13} strokeWidth={1.5} /> 補助線
          </button>
          <button
            type="button"
            onClick={() => setPanel(panel === "draw" ? null : "draw")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs transition-colors ${
              panel === "draw" ? "bg-surface text-primary" : "text-muted"
            }`}
          >
            <Pencil size={13} strokeWidth={1.5} /> 描画
          </button>
          <button
            type="button"
            onClick={() => setMemoOpen(!memoOpen)}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs transition-colors ${
              memoOpen ? "bg-surface text-primary" : "text-muted"
            }`}
          >
            {memoOpen ? <ChevronUp size={13} strokeWidth={1.5} /> : <ChevronDown size={13} strokeWidth={1.5} />}
            メモ
          </button>
          <button
            type="button"
            onClick={() => setLinkOpen(!linkOpen)}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs transition-colors ${
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
              activeGrids={overlay.activeGrids}
              onToggleGrid={detail.toggleGrid}
              color={overlay.overlayColor}
              onColorChange={detail.setOverlayColor}
              thickness={overlay.overlayThickness}
              onThicknessChange={detail.setOverlayThickness}
              opacity={overlay.overlayOpacity}
              onOpacityChange={detail.setOverlayOpacity}
            />
            <button
              type="button"
              onClick={handleAnnotationSave}
              disabled={detail.annotationSaving}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
            >
              {detail.annotationSaving && <Loader2 size={16} className="animate-spin" />}
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
              canUndo={detail.shapes.length > 0}
              onUndo={detail.undoShape}
              onClearAll={detail.clearShapes}
            />
            <button
              type="button"
              onClick={handleAnnotationSave}
              disabled={detail.annotationSaving}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
            >
              {detail.annotationSaving && <Loader2 size={16} className="animate-spin" />}
              描画を保存
            </button>
          </div>
        )}

        {memoOpen && (
          <MemoPanel
            memo={detail.memo}
            saving={detail.memoSaving}
            onMemoChange={detail.setMemo}
            onSave={detail.handleMemoSave}
          />
        )}

        {linkOpen && (
          <WorkoutLinkPanel
            linkedWorkoutTitle={detail.linkedWorkoutTitle}
            recentWorkouts={detail.recentWorkouts}
            pendingWorkoutId={detail.pendingWorkoutId}
            currentWorkoutId={video.workout_session_id}
            saving={detail.linkSaving}
            onPendingChange={detail.setPendingWorkoutId}
            onSave={detail.handleLinkWorkout}
          />
        )}
      </div>
    </div>
  );
}
