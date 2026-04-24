"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, Upload, X, Camera, CircleStop, Play, Pause, ArrowLeft } from "lucide-react";
import { GridOverlay } from "@/components/capture/GridOverlay";
import { PrimaryRecordButton } from "@/components/common/PrimaryRecordButton";
import { pickRecorderMimeType } from "@/lib/capture/recorderMime";

type CaptureState = "idle" | "previewing" | "recording" | "recorded";

export default function CapturePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedUrlRef = useRef<string | null>(null);

  const [state, setState] = useState<CaptureState>("idle");
  const [gridOn, setGridOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const setRecordedUrlTracked = useCallback((url: string | null) => {
    recordedUrlRef.current = url;
    setRecordedUrl(url);
  }, []);

  const revokeRecordedUrl = useCallback(() => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("previewing");
      setError(null);
    } catch {
      setError("camera");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      // メタページへ遷移中は blob URL を破棄しない（メタページで blob を取得するため）
      if (!proceedingRef.current && recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const { mimeType } = pickRecorderMimeType();
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 5_000_000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedUrlTracked(url);
      setState("recorded");
      setIsPlaying(false);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    recorder.start(200);
    recorderRef.current = recorder;
    setState("recording");
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  }, [setRecordedUrlTracked]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const retake = useCallback(() => {
    revokeRecordedUrl();
    setRecordedUrlTracked(null);
    setElapsed(0);
    setIsPlaying(false);
    startCamera();
  }, [revokeRecordedUrl, setRecordedUrlTracked, startCamera]);

  const proceedingRef = useRef(false);

  const proceed = useCallback(() => {
    if (recordedUrl) {
      proceedingRef.current = true;
      sessionStorage.setItem("capturedVideoUrl", recordedUrl);
      sessionStorage.setItem("capturedDuration", String(elapsed));
      router.push("/capture/meta");
    }
  }, [recordedUrl, elapsed, router]);

  const handleLibrary = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      revokeRecordedUrl();
      const url = URL.createObjectURL(file);
      setRecordedUrlTracked(url);
      setState("recorded");
      setIsPlaying(false);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    input.click();
  }, [revokeRecordedUrl, setRecordedUrlTracked]);

  const togglePlayback = useCallback(() => {
    const video = previewRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (error === "camera") {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
          aria-label="戻る"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <Camera size={40} strokeWidth={1} className="mb-4 text-muted" />
        <p className="text-sm font-title">カメラにアクセスできません</p>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          ブラウザの設定でカメラへのアクセスを許可するか、
          ライブラリから動画を選択してください。
        </p>
        <div className="mt-6 w-full max-w-xs px-2">
          <PrimaryRecordButton type="button" onClick={handleLibrary}>
            ライブラリから選択
          </PrimaryRecordButton>
        </div>
        <button
          type="button"
          onClick={startCamera}
          className="mt-3 text-sm text-secondary underline underline-offset-2"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Viewfinder */}
      <div className="relative flex-1">
        {state === "recorded" && recordedUrl ? (
          <>
            <video
              ref={previewRef}
              src={recordedUrl}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
              onEnded={() => setIsPlaying(false)}
            />
            <button
              type="button"
              onClick={togglePlayback}
              className="absolute inset-0 z-10 flex items-center justify-center"
              aria-label={isPlaying ? "一時停止" : "再生"}
            >
              {!isPlaying && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-transform active:scale-95">
                  <Play size={28} strokeWidth={2} className="ml-1 text-white" fill="white" />
                </div>
              )}
            </button>
            {isPlaying && (
              <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Pause size={12} strokeWidth={2} className="text-white" />
                  <span className="text-xs font-metric text-white/80">再生中</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
          />
        )}

        <GridOverlay visible={gridOn} />

        {/* Top controls */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top,16px))]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:bg-white/20"
              aria-label="戻る"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
            {state !== "recorded" && (
              <button
                type="button"
                onClick={handleLibrary}
                aria-label="ライブラリから動画を選択"
                className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                <Upload size={13} strokeWidth={1.5} />
                ライブラリ
              </button>
            )}
          </div>

          {state !== "recorded" && (
            <button
              type="button"
              onClick={() => setGridOn((p) => !p)}
              aria-label="グリッド表示の切り替え"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
                gridOn ? "bg-white/25 text-white" : "bg-black/50 text-white/70"
              }`}
            >
              <Grid3x3 size={13} strokeWidth={1.5} />
              {gridOn ? "ON" : "OFF"}
            </button>
          )}
        </div>

        {state === "recording" && (
          <div className="absolute left-1/2 top-[env(safe-area-inset-top,16px)] z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-metric text-white">{formatTime(elapsed)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="shrink-0 border-t border-white/10 bg-zinc-950 px-5 pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-3">
        {state === "recorded" ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={retake}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/5 px-3 text-sm font-bold text-white transition-all duration-150 active:scale-[0.98] active:bg-white/10"
            >
              <X size={16} strokeWidth={1.5} />
              撮り直す
            </button>
            <div className="flex-[1.2]">
              <PrimaryRecordButton type="button" surface="dark" onClick={proceed}>
                記録する
              </PrimaryRecordButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <p className="text-xs font-medium text-white/50">
              {state === "recording" ? "タップで停止" : "タップで録画開始"}
            </p>
            <button
              type="button"
              onClick={state === "recording" ? stopRecording : startRecording}
              disabled={state === "idle"}
              aria-label={state === "recording" ? "録画を停止" : "録画を開始"}
              className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3px] border-accent bg-zinc-950 shadow-[0_0_0_6px_rgba(62,237,141,0.12)] transition-all duration-150 active:scale-95 disabled:opacity-40"
            >
              {state === "recording" ? (
                <CircleStop size={28} strokeWidth={2} className="text-red-500" fill="currentColor" />
              ) : (
                <span className="block h-[52px] w-[52px] rounded-full bg-accent" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
