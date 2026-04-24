"use client";

import { Play, Pause, Grid3X3 } from "lucide-react";
import { GridOverlay } from "./GridOverlay";
import type { Video } from "@/types";

type GridType = "sixteen" | "center_v" | "center_h";

export interface VideoPanelState {
  video: Video | null;
  src: string | null;
  loading: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  showGrid: boolean;
  activeGrids: Set<GridType>;
}

export function initialPanel(): VideoPanelState {
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

export function fmtTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface VideoPanelProps {
  panel: VideoPanelState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  label: string;
  synced: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onToggleGrid: () => void;
}

export function VideoPanel({
  panel,
  videoRef,
  label,
  synced,
  onTogglePlay,
  onSeek,
  onToggleGrid,
}: VideoPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 bg-black">
        {panel.src ? (
          <video
            ref={videoRef}
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

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <span className="rounded-md bg-black/60 px-2 py-0.5 text-xs font-title text-white/90 backdrop-blur-sm">
            {label}
          </span>
          {panel.video && (
            <>
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-xs font-label text-white/70 backdrop-blur-sm">
                {panel.video.title}
              </span>
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-xs font-label text-white/50 backdrop-blur-sm">
                {panel.video.exercise_type}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!panel.src || synced}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors active:text-white disabled:opacity-30"
          aria-label={panel.playing ? "一時停止" : "再生"}
        >
          {panel.playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <span className="w-8 text-right text-xs font-metric text-white/50 tabular-nums">
          {fmtTime(panel.currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={panel.duration || 1}
          step={0.01}
          value={panel.currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          disabled={synced}
          className="h-0.5 flex-1 accent-white disabled:opacity-30"
          aria-label={`${label}の再生位置`}
        />
        <span className="w-8 text-xs font-metric text-white/50 tabular-nums">
          {fmtTime(panel.duration)}
        </span>
        <button
          type="button"
          onClick={onToggleGrid}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
            panel.showGrid ? "text-[#3eed8d]" : "text-white/40"
          }`}
          aria-label="グリッド表示"
        >
          <Grid3X3 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
