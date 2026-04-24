"use client";

import { useState, useCallback, useEffect } from "react";
import { Link2, Unlink } from "lucide-react";

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

interface SyncControlsProps {
  synced: boolean;
  speed: number;
  onSyncPlay: () => void;
  onSyncStop: () => void;
  onSelectSpeed: (s: number) => void;
}

export function SyncControls({
  synced,
  speed,
  onSyncPlay,
  onSyncStop,
  onSelectSpeed,
}: SyncControlsProps) {
  const [speedOpen, setSpeedOpen] = useState(false);

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

  const handleSelectSpeed = useCallback(
    (s: number) => {
      onSelectSpeed(s);
      setSpeedOpen(false);
    },
    [onSelectSpeed],
  );

  return (
    <div className="shrink-0 bg-[#111] px-4 pb-[max(0.75rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] pt-2">
      <div className="flex items-center justify-center gap-3">
        {synced ? (
          <button
            type="button"
            onClick={onSyncStop}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-label text-white/90 transition-all active:bg-white/20"
          >
            <Unlink size={13} strokeWidth={1.5} />
            同期停止
          </button>
        ) : (
          <button
            type="button"
            onClick={onSyncPlay}
            className="flex items-center gap-1.5 rounded-full bg-[#3eed8d] px-4 py-2 text-xs font-title text-primary transition-all active:scale-95"
          >
            <Link2 size={13} strokeWidth={1.5} />
            同期再生
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSpeedOpen((p) => !p);
            }}
            className="rounded-full bg-white/10 px-3 py-2 text-xs font-metric text-white/70 transition-colors active:bg-white/20"
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
                  onClick={() => handleSelectSpeed(s)}
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
  );
}
