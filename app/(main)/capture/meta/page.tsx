"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Camera, Dumbbell, Loader2 } from "lucide-react";
import { MOVEMENTS } from "@/lib/mocks/movements";
import { PrimaryRecordButton } from "@/components/common/PrimaryRecordButton";
import { Stepper } from "@/components/workout/Stepper";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { inferVideoUploadMeta } from "@/lib/capture/recorderMime";

type Phase = "input" | "saving" | "saved";

type RecentWorkout = { id: string; title: string; workout_date: string };

export default function CaptureMetaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [memo, setMemo] = useState("");
  const [linkedWorkoutId, setLinkedWorkoutId] = useState("");

  const [exerciseError, setExerciseError] = useState(false);
  const [phase, setPhase] = useState<Phase>("input");
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);

  const [blobError, setBlobError] = useState(false);

  useEffect(() => {
    const url = sessionStorage.getItem("capturedVideoUrl");
    const dur = sessionStorage.getItem("capturedDuration");
    if (!url) {
      router.replace("/capture");
      return;
    }
    setVideoUrl(url);
    setDuration(dur ? parseInt(dur, 10) : 0);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("blob fetch failed");
        return r.blob();
      })
      .then((blob) => {
        if (blob.size === 0) throw new Error("empty blob");
        setVideoBlob(blob);
      })
      .catch(() => {
        setBlobError(true);
      });

    return () => {
      // メタページ離脱時に blob URL を解放
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("workouts")
      .select("id, title, workout_date")
      .eq("user_id", user.id)
      .order("workout_date", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setRecentWorkouts(data as RecentWorkout[]);
      });
  }, [user]);

  const uploadAndSave = useCallback(
    async (videoOnly: boolean) => {
      if (!user || !videoBlob) return false;

      const supabase = createClient();
      const videoId = crypto.randomUUID();
      const { fileExt, contentType } = inferVideoUploadMeta(videoBlob);
      const filePath = `${user.id}/${videoId}${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, videoBlob, { contentType });

      if (uploadError) {
        console.error("video upload error:", uploadError.message);
        return false;
      }

      const today = new Date().toISOString().split("T")[0];

      const { error: insertError } = await supabase.from("videos").insert({
        id: videoId,
        user_id: user.id,
        title: videoOnly ? (exercise || "無題の動画") : `${exercise} ${weight ? weight + "kg" : ""}`.trim(),
        exercise_type: exercise || "",
        shot_date: today,
        file_path: filePath,
        duration,
        memo: memo || null,
        workout_id: linkedWorkoutId || null,
      });

      if (insertError) {
        console.error("video insert error:", insertError.message);
        return false;
      }
      return true;
    },
    [user, videoBlob, exercise, weight, duration, memo, linkedWorkoutId],
  );

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    if (!exercise) {
      setExerciseError(true);
      return;
    }

    if (user && !videoBlob) {
      setSaveError("動画データを取得できませんでした。撮影画面に戻ってやり直してください。");
      return;
    }

    setPhase("saving");
    setSaveError(null);

    if (user && videoBlob) {
      const ok = await uploadAndSave(false);
      if (!ok) {
        setSaveError("動画のアップロードに失敗しました。もう一度お試しください。");
        setPhase("input");
        return;
      }
    }

    sessionStorage.removeItem("capturedVideoUrl");
    sessionStorage.removeItem("capturedDuration");
    setPhase("saved");
  }, [exercise, user, videoBlob, uploadAndSave]);

  const handleVideoOnly = useCallback(async () => {
    if (user && !videoBlob) {
      setSaveError("動画データを取得できませんでした。撮影画面に戻ってやり直してください。");
      return;
    }

    setPhase("saving");
    setSaveError(null);

    if (user && videoBlob) {
      const ok = await uploadAndSave(true);
      if (!ok) {
        setSaveError("動画のアップロードに失敗しました。もう一度お試しください。");
        setPhase("input");
        return;
      }
    }

    sessionStorage.removeItem("capturedVideoUrl");
    sessionStorage.removeItem("capturedDuration");
    router.push("/videos");
  }, [user, videoBlob, uploadAndSave, router]);

  const fmtDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!videoUrl) return null;

  if (phase === "saving") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <Loader2 size={32} className="animate-spin text-muted" />
        <p className="mt-4 text-sm text-secondary">保存中…</p>
      </div>
    );
  }

  if (phase === "saved") {
    const summary = [
      exercise,
      weight ? `${weight}kg` : null,
      reps ? `${reps}回` : null,
      sets ? `${sets}セット` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const linkedTitle = recentWorkouts.find((w) => w.id === linkedWorkoutId)?.title;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-inverse">
          <Check size={28} strokeWidth={2} className="text-on-inverse" />
        </div>
        <p className="mt-5 text-lg font-title">保存しました</p>
        <p className="mt-2 text-center text-sm text-secondary">{summary}</p>
        {linkedTitle && (
          <p className="mt-2 text-center text-[12px] text-muted">
            ワークアウト「{linkedTitle}」に紐付けました
          </p>
        )}
        <div className="mt-10 w-full max-w-sm space-y-3">
          <PrimaryRecordButton type="button" onClick={() => router.push("/capture")}>
            <Camera size={16} strokeWidth={1.5} />
            もう1セット撮影
          </PrimaryRecordButton>
          <button
            type="button"
            onClick={() => router.push("/workouts")}
            className="min-h-[44px] w-full rounded-xl text-sm font-bold text-secondary transition-colors active:bg-chip"
          >
            完了
          </button>
        </div>
      </div>
    );
  }

  const categorizedMovements = new Map<string, typeof MOVEMENTS>();
  for (const m of MOVEMENTS) {
    if (!categorizedMovements.has(m.categoryJa)) {
      categorizedMovements.set(m.categoryJa, []);
    }
    categorizedMovements.get(m.categoryJa)!.push(m);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
          aria-label="戻る"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div>
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">Capture</p>
          <h1 className="text-lg font-bold tracking-tight">セットを記録</h1>
        </div>
      </div>

      {/* Video preview */}
      <div className="relative overflow-hidden rounded-[18px] bg-black">
        <video src={videoUrl} className="aspect-[16/9] w-full object-cover" controls playsInline />
        <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-metric text-white/80 backdrop-blur-sm">
          {fmtDuration(duration)}
        </div>
      </div>

      {/* EXERCISE */}
      <div className="px-[18px]">
        <h4 className="text-xs font-title uppercase tracking-wider text-primary">種目</h4>
        <p className="mt-1 text-[12px] leading-relaxed text-secondary">
          撮影したフォームの種目を選んでください
        </p>
      </div>

      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex min-h-[62px] items-center px-[18px]">
          <select
            value={exercise}
            onChange={(e) => { setExercise(e.target.value); setExerciseError(false); }}
            className={`min-h-[50px] w-full bg-transparent text-sm font-semibold text-primary focus:outline-none ${exerciseError ? "text-danger" : ""}`}
          >
            <option value="">種目を選択</option>
            {Array.from(categorizedMovements.entries()).map(([cat, movements]) => (
              <optgroup key={cat} label={cat}>
                {movements.map((m) => (
                  <option key={m.id} value={m.nameJa}>{m.nameJa}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {exerciseError && (
          <div className="border-t border-danger/20 px-[18px] py-2">
            <p className="text-xs text-danger">種目を選択してください</p>
          </div>
        )}
      </div>

      {/* SETS & REPS */}
      <div className="px-[18px]">
        <h4 className="text-xs font-title uppercase tracking-wider text-primary">
          セット & レップス
        </h4>
        <p className="mt-1 text-[12px] leading-relaxed text-secondary">
          セット＝同じ動作の繰り返しを1まとまりにした単位。レップ（回数）＝1セット内で動作を行う回数です。
        </p>
      </div>

      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex min-h-[62px] items-center justify-between px-[18px]">
          <span className="text-lg font-semibold">重量</span>
          <div className="flex items-center gap-2">
            <Stepper value={weight} onChange={setWeight} min={0} max={500} step={2.5} allowDecimal label="重量" />
            <span className="text-sm text-muted">kg</span>
          </div>
        </div>
        <div className="flex min-h-[62px] items-center justify-between border-t border-border px-[18px]">
          <span className="text-lg font-semibold">回数</span>
          <Stepper value={reps} onChange={setReps} min={0} max={50} label="回数" />
        </div>
        <div className="flex min-h-[62px] items-center justify-between border-t border-border px-[18px]">
          <span className="text-lg font-semibold">セット</span>
          <Stepper value={sets} onChange={setSets} min={0} max={20} label="セット" />
        </div>
      </div>

      <p className="px-1 text-xs text-muted">
        数字をタップで直接入力、± で細かく調整できます
      </p>

      {/* MEMO */}
      <div className="px-[18px]">
        <h4 className="text-xs font-title uppercase tracking-wider text-primary">メモ</h4>
      </div>

      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="フォームの気づきなど"
          className="w-full bg-white px-[18px] py-3.5 text-sm text-primary placeholder:text-muted focus:outline-none"
        />
      </div>

      {/* LINK WORKOUT */}
      <div className="px-[18px]">
        <h4 className="text-xs font-title uppercase tracking-wider text-primary">
          ワークアウトに紐付ける
        </h4>
        <p className="mt-1 text-[12px] leading-relaxed text-secondary">
          履歴のセッションと動画がひも付きます。未選択の場合は動画ライブラリのみに保存されます。
        </p>
      </div>

      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex min-h-[62px] items-center px-[18px]">
          <select
            value={linkedWorkoutId}
            onChange={(e) => setLinkedWorkoutId(e.target.value)}
            className="min-h-[50px] w-full bg-transparent text-sm font-semibold text-primary focus:outline-none"
          >
            <option value="">紐付けない</option>
            {recentWorkouts.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}（{w.workout_date}）
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error messages */}
      {(blobError || saveError) && (
        <div className="rounded-xl bg-danger/10 px-4 py-3">
          <p className="text-sm font-bold text-danger">
            {blobError
              ? "動画データの読み込みに失敗しました。撮影画面に戻ってやり直してください。"
              : saveError}
          </p>
          {blobError && (
            <button
              type="button"
              onClick={() => router.replace("/capture")}
              className="mt-2 text-sm font-bold text-danger underline underline-offset-2"
            >
              撮影画面に戻る
            </button>
          )}
        </div>
      )}

      {/* Save buttons */}
      <div className="space-y-2.5">
        <PrimaryRecordButton type="button" onClick={handleSave} disabled={blobError}>
          <Dumbbell size={16} strokeWidth={1.5} />
          記録する
        </PrimaryRecordButton>
        <button
          type="button"
          onClick={handleVideoOnly}
          disabled={blobError}
          className="min-h-[44px] w-full rounded-xl text-sm font-bold text-secondary transition-colors active:bg-chip disabled:opacity-40"
        >
          動画だけ保存する
        </button>
      </div>
    </div>
  );
}
