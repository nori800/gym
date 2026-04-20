"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, Upload, X, Camera, CircleStop } from "lucide-react";
import { GridOverlay } from "@/components/capture/GridOverlay";

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
      <div className="-mx-6 -mt-12 flex flex-col items-center justify-center px-8 text-center" style={{ height: "calc(100dvh - 56px)" }}>
        <Camera size={40} strokeWidth={1} className="mb-4 text-muted" />
        <p className="text-sm font-title">カメラにアクセスできません</p>
        <p className="mt-2 text-xs text-secondary">
          ブラウザの設定でカメラへのアクセスを許可するか、
          ライブラリから動画を選択してください。
        </p>
        <button
          type="button"
          onClick={handleLibrary}
          className="mt-6 h-10 rounded-lg bg-accent px-5 text-sm font-title text-primary transition-all active:scale-[0.98]"
        >
          ライブラリから選択
        </button>
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
                className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-label text-white/80 backdrop-blur-sm"
              >
                <Upload size={13} strokeWidth={1.5} />
                ライブラリ
              </button>
            </div>
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={() => setGridOn((p) => !p)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-label backdrop-blur-sm ${
                  gridOn ? "bg-white/20 text-white" : "bg-black/40 text-white/60"
                }`}
              >
                <Grid3x3 size={13} strokeWidth={1.5} />
                {gridOn ? "ON" : "OFF"}
              </button>
            </div>
          </>
        )}

        {/* Recording indicator */}
        {state === "recording" && (
          <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-metric text-white">{formatTime(elapsed)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 bg-white px-6 py-5">
        {state === "recorded" ? (
          <>
            <button
              type="button"
              onClick={retake}
              className="flex h-10 items-center gap-1.5 rounded-lg px-4 text-xs font-title text-secondary transition-colors active:text-primary"
            >
              <X size={16} strokeWidth={1.5} />
              撮り直す
            </button>
            <button
              type="button"
              onClick={proceed}
              className="h-10 rounded-lg bg-accent px-6 text-sm font-title text-primary transition-all active:scale-[0.98]"
            >
              記録する
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={state === "recording" ? stopRecording : startRecording}
            disabled={state === "idle"}
            className="group flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3px] border-accent transition-all active:scale-95 disabled:opacity-40"
          >
            {state === "recording" ? (
              <CircleStop size={28} className="text-red-500" />
            ) : (
              <div className="h-[54px] w-[54px] rounded-full bg-accent" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
