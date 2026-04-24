"use client";

import { Suspense } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import type { Video } from "@/types";
import { VideoPanel, initialPanel, type VideoPanelState } from "@/components/video-compare/VideoPanel";
import { SyncControls } from "@/components/video-compare/SyncControls";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const idA = searchParams.get("a") ?? "";
  const idB = searchParams.get("b") ?? "";

  const [panelA, setPanelA] = useState<VideoPanelState>(initialPanel);
  const [panelB, setPanelB] = useState<VideoPanelState>(initialPanel);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  const [synced, setSynced] = useState(false);
  const [speed, setSpeed] = useState(1);

  const loadVideo = useCallback(
    async (
      videoId: string,
      setPanel: React.Dispatch<React.SetStateAction<VideoPanelState>>,
    ) => {
      if (!user || !videoId) {
        setPanel((p) => ({ ...p, loading: false }));
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (error) {
        console.error("[compare] video fetch error:", error.message);
      }
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
        const { data: signed, error: signErr } = await supabase.storage
          .from("videos")
          .createSignedUrl(data.file_path, 3600);
        if (signErr) {
          console.error("[compare] signed URL error:", signErr.message);
        }
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
    (ref: React.RefObject<HTMLVideoElement | null>, setPanel: React.Dispatch<React.SetStateAction<VideoPanelState>>) => {
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
      setPanel: React.Dispatch<React.SetStateAction<VideoPanelState>>,
      time: number,
    ) => {
      const v = ref.current;
      if (!v) return;
      v.currentTime = time;
      setPanel((p) => ({ ...p, currentTime: time }));
    },
    [],
  );

  const syncPlay = useCallback(async () => {
    const a = videoRefA.current;
    const b = videoRefB.current;
    if (!a || !b) return;
    setSynced(true);
    a.currentTime = 0;
    b.currentTime = 0;
    a.playbackRate = speed;
    b.playbackRate = speed;

    const waitCanPlay = (el: HTMLVideoElement, timeoutMs = 8000) =>
      el.readyState >= 3
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            let settled = false;
            const handler = () => {
              if (settled) return;
              settled = true;
              el.removeEventListener("canplay", handler);
              resolve();
            };
            el.addEventListener("canplay", handler);
            setTimeout(() => {
              if (!settled) {
                settled = true;
                el.removeEventListener("canplay", handler);
                resolve();
              }
            }, timeoutMs);
          });

    try {
      await Promise.all([waitCanPlay(a), waitCanPlay(b)]);
      await Promise.all([a.play(), b.play()]);
      setPanelA((p) => ({ ...p, playing: true }));
      setPanelB((p) => ({ ...p, playing: true }));
    } catch (err) {
      console.error("[compare] sync play failed:", err);
      setSynced(false);
    }
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
      if (videoRefA.current) videoRefA.current.playbackRate = s;
      if (videoRefB.current) videoRefB.current.playbackRate = s;
    },
    [],
  );

  const toggleGrid = useCallback(
    (setPanel: React.Dispatch<React.SetStateAction<VideoPanelState>>) => {
      setPanel((p) => ({ ...p, showGrid: !p.showGrid }));
    },
    [],
  );

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

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
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

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <VideoPanel
          panel={panelA}
          videoRef={videoRefA}
          label="A"
          synced={synced}
          onTogglePlay={() => togglePlay(videoRefA, setPanelA)}
          onSeek={(t) => handleSeek(videoRefA, setPanelA, t)}
          onToggleGrid={() => toggleGrid(setPanelA)}
        />
        <div className="h-px w-full bg-white/10 md:h-full md:w-px" />
        <VideoPanel
          panel={panelB}
          videoRef={videoRefB}
          label="B"
          synced={synced}
          onTogglePlay={() => togglePlay(videoRefB, setPanelB)}
          onSeek={(t) => handleSeek(videoRefB, setPanelB, t)}
          onToggleGrid={() => toggleGrid(setPanelB)}
        />
      </div>

      <SyncControls
        synced={synced}
        speed={speed}
        onSyncPlay={syncPlay}
        onSyncStop={syncStop}
        onSelectSpeed={selectSpeed}
      />
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
