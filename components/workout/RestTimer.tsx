"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, RotateCcw, Minimize2, Maximize2 } from "lucide-react";
import { Stepper } from "@/components/workout/Stepper";

interface RestTimerProps {
  defaultSeconds?: number;
  onComplete?: () => void;
}

const PRESETS = [30, 60, 90, 120, 180];

const ACCENT = "#3eed8d";
const RADIUS = 54;
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = (RADIUS + STROKE) * 2;

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.6);
      setTimeout(() => ctx.close(), 700);
    }, 250);
  } catch {
    // Web Audio not available
  }
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function RestTimer({ defaultSeconds = 90, onComplete }: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [compact, setCompact] = useState(false);
  const [autoStart, setAutoStart] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setRunning(false);
          playBeep();
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [running, clearTimer]);

  const start = useCallback(() => {
    if (remaining <= 0) setRemaining(totalSeconds);
    setRunning(true);
  }, [remaining, totalSeconds]);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  const selectPreset = useCallback(
    (secs: number) => {
      setTotalSeconds(secs);
      setRemaining(secs);
      setRunning(false);
      if (autoStart) {
        setTimeout(() => setRunning(true), 50);
      }
    },
    [autoStart],
  );

  const handleCustomChange = useCallback(
    (val: number) => {
      const clamped = Math.max(5, Math.min(600, val));
      setTotalSeconds(clamped);
      if (!running) setRemaining(clamped);
    },
    [running],
  );

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  // Compact pill mode
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setCompact(false)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-inverse px-4 py-2.5 shadow-lg shadow-black/15 transition-all active:scale-95"
        aria-label={`休憩タイマー 残り${fmtTime(remaining)}`}
      >
        <div className="relative h-5 w-5">
          <svg width={20} height={20} viewBox="0 0 20 20">
            <circle cx={10} cy={10} r={8} fill="none" stroke="white" strokeWidth={2} opacity={0.2} />
            <circle
              cx={10}
              cy={10}
              r={8}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2}
              strokeDasharray={2 * Math.PI * 8}
              strokeDashoffset={2 * Math.PI * 8 * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 10 10)"
            />
          </svg>
        </div>
        <span
          className="text-sm font-metric text-on-inverse tabular-nums"
          aria-live="polite"
        >
          {fmtTime(remaining)}
        </span>
        <Maximize2 size={12} className="text-on-inverse/60" />
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            レストタイマー
          </p>
          <button
            type="button"
            onClick={() => setCompact(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors active:bg-surface"
            aria-label="タイマーを最小化"
          >
            <Minimize2 size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Circular progress */}
      <div className="flex flex-col items-center px-4 py-2">
        <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            role="img"
            aria-label={`残り${fmtTime(remaining)}`}
          >
            {/* Background track */}
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#EBEBEB"
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={remaining === 0 && !running ? "#D4D4D4" : ACCENT}
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${SVG_SIZE / 2} ${SVG_SIZE / 2})`}
              className="transition-[stroke-dashoffset] duration-300 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-title tabular-nums text-primary"
              aria-live="polite"
            >
              {fmtTime(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 pb-2">
        <button
          type="button"
          onClick={reset}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-secondary transition-all active:scale-95 active:bg-chip"
          aria-label="リセット"
        >
          <RotateCcw size={16} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={running ? pause : start}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-inverse text-on-inverse transition-all active:scale-95"
          aria-label={running ? "一時停止" : "開始"}
        >
          {running ? (
            <Pause size={20} />
          ) : (
            <Play size={20} className="ml-0.5" />
          )}
        </button>
        <div className="h-10 w-10" />
      </div>

      {/* Presets */}
      <div className="flex flex-wrap justify-center gap-1.5 px-4 pb-3">
        {PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => selectPreset(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-label transition-colors ${
              totalSeconds === s && !running
                ? "bg-inverse text-on-inverse"
                : "bg-surface text-secondary active:bg-chip"
            }`}
          >
            {fmtTime(s)}
          </button>
        ))}
      </div>

      {/* Custom time + auto-start */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary">カスタム</span>
          <Stepper
            value={totalSeconds}
            onChange={handleCustomChange}
            min={5}
            max={600}
            step={5}
            suffix="s"
            label="秒数"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-secondary">
          <span>自動開始</span>
          <button
            type="button"
            role="switch"
            aria-checked={autoStart}
            onClick={() => setAutoStart((p) => !p)}
            className={`relative h-[26px] w-[44px] rounded-full transition-colors duration-200 ${
              autoStart ? "bg-ios-toggle" : "bg-chip"
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                autoStart ? "translate-x-[18px]" : ""
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
