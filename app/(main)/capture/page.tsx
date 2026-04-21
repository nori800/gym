"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, Upload, X, Camera, CircleStop } from "lucide-react";
import { GridOverlay } from "@/components/capture/GridOverlay";
import { PrimaryRecordButton } from "@/components/common/PrimaryRecordButton";

type CaptureState = "idle" | "previewing" | "recording" | "recorded";

export default function CapturePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [state, setState] = useState<CaptureState>("idle");
  const [gridOn, setGridOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1080 }, height: { ideal: 1920 } },
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
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setState("recorded");
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    recorder.start(200);
    recorderRef.current = recorder;
    setState("recording");
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const retake = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setElapsed(0);
    startCamera();
  }, [recordedUrl, startCamera]);

  const proceed = useCallback(() => {
    if (recordedUrl) {
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
      const url = URL.createObjectURL(file);
      setRecordedUrl(url);
      setState("recorded");
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    input.click();
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (error === "camera") {
    return (
      <div
        className="-mx-6 -mt-12 flex flex-col items-center justify-center px-8 text-center"
        style={{ height: "calc(100dvh - 56px)" }}
      >
        <Camera size={40} strokeWidth={1} className="mb-4 text-muted" />
        <p className="text-sm font-title">カメラにアクセスできません</p>
        <p className="mt-2 text-xs text-secondary">
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
          className="mt-3 text-xs text-secondary underline underline-offset-2"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="-mx-6 -mt-12 flex flex-col" style={{ height: "calc(100dvh - 56px)" }}>
      {/* Viewfinder */}
      <div className="relative flex-1 bg-black">
        {state === "recorded" && recordedUrl ? (
          <video
            src={recordedUrl}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            loop
            autoPlay
            muted
          />
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
        {state !== "recorded" && (
          <>
            <div className="absolute left-4 top-4 z-10">
              <button
                type="button"
                onClick={handleLibrary}
                className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm"
              >
                <Upload size={13} strokeWidth={1.5} />
                ライブラリ
              </button>
            </div>
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={() => setGridOn((p) => !p)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm ${
                  gridOn ? "bg-white/25 text-white" : "bg-black/50 text-white/70"
                }`}
              >
                <Grid3x3 size={13} strokeWidth={1.5} />
                {gridOn ? "ON" : "OFF"}
              </button>
            </div>
          </>
        )}

        {state === "recording" && (
          <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-metric text-white">{formatTime(elapsed)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls — 暗いバー上に録画ボタンを置き、白背景に白ボタン問題を解消 */}
      <div className="shrink-0 border-t border-white/10 bg-zinc-950 px-5 py-4">
        {state === "recorded" ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={retake}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/5 px-3 text-[12px] font-bold text-white transition-all duration-150 active:scale-[0.98] active:bg-white/10"
            >
              <X size={16} strokeWidth={1.75} />
              撮り直す
            </button>
            <div className="flex-[1.2]">
              <PrimaryRecordButton type="button" surface="dark" onClick={proceed}>
                記録する
              </PrimaryRecordButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] font-medium text-white/50">
              {state === "recording" ? "タップで停止" : "タップで録画開始"}
            </p>
            <button
              type="button"
              onClick={state === "recording" ? stopRecording : startRecording}
              disabled={state === "idle"}
              aria-label={state === "recording" ? "録画を停止" : "録画を開始"}
              className="flex h-[56px] w-[56px] items-center justify-center rounded-full border-[3px] border-white/90 bg-zinc-950 shadow-[0_0_0_6px_rgba(255,255,255,0.08)] transition-all duration-150 active:scale-95 disabled:opacity-40"
            >
              {state === "recording" ? (
                <CircleStop size={26} strokeWidth={2} className="text-red-500" fill="currentColor" />
              ) : (
                <span className="block h-[42px] w-[42px] rounded-full bg-red-500 ring-2 ring-white/90" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
