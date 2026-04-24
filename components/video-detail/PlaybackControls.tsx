"use client";

import {
  Play, Pause, SkipBack, SkipForward,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

function fmtTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface Props {
  currentTime: number;
  duration: number;
  playing: boolean;
  speed: number;
  speedOpen: boolean;
  onTogglePlay: () => void;
  onSkip: (delta: number) => void;
  onStepFrame: (direction: 1 | -1) => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  onSelectSpeed: (s: number) => void;
  onSpeedToggle: () => void;
}

export function PlaybackControls({
  currentTime,
  duration,
  playing,
  speed,
  speedOpen,
  onTogglePlay,
  onSkip,
  onStepFrame,
  onSeek,
  onSeekStart,
  onSeekEnd,
  onSelectSpeed,
  onSpeedToggle,
}: Props) {
  return (
    <>
      {/* Seek bar */}
      <div className="mb-2 flex items-center gap-2">
        <span className="w-9 text-right text-xs font-metric text-muted">{fmtTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onChange={onSeek}
          onPointerDown={onSeekStart}
          onPointerUp={onSeekEnd}
          aria-label="再生位置"
          className="h-1 flex-1 accent-primary"
        />
        <span className="w-9 text-xs font-metric text-muted">{fmtTime(duration)}</span>
      </div>

      {/* Playback buttons */}
      <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={() => onStepFrame(-1)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted transition-colors active:text-primary" aria-label="1フレーム戻す">
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => onSkip(-5)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-secondary transition-colors active:text-primary" aria-label="5秒戻す">
          <SkipBack size={18} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={playing ? "一時停止" : "再生"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-inverse transition-all active:scale-95"
        >
          {playing ? <Pause size={18} className="text-on-inverse" /> : <Play size={18} className="ml-0.5 text-on-inverse" />}
        </button>
        <button type="button" onClick={() => onSkip(5)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-secondary transition-colors active:text-primary" aria-label="5秒進める">
          <SkipForward size={18} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => onStepFrame(1)} className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted transition-colors active:text-primary" aria-label="1フレーム進める">
          <ChevronRight size={16} strokeWidth={2} />
        </button>

        {/* Speed selector */}
        <div className="relative ml-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSpeedToggle(); }}
            aria-label={`再生速度 ${speed}倍`}
            className="rounded-full bg-surface px-3 py-1.5 text-xs font-metric text-secondary transition-colors active:bg-border"
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
                  onClick={() => onSelectSpeed(s)}
                  className={`whitespace-nowrap px-5 py-2.5 text-xs font-label transition-colors ${
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
    </>
  );
}
