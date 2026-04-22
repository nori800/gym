"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Camera, Dumbbell } from "lucide-react";
import { MOVEMENTS } from "@/lib/mocks/movements";
import { MOCK_WORKOUT_HISTORY } from "@/lib/mocks/workoutHistory";
import { PrimaryRecordButton } from "@/components/common/PrimaryRecordButton";
import { Stepper } from "@/components/workout/Stepper";

type Phase = "input" | "saved";

export default function CaptureMetaPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [memo, setMemo] = useState("");
  const [linkedWorkoutId, setLinkedWorkoutId] = useState("");

  const [exerciseError, setExerciseError] = useState(false);
  const [phase, setPhase] = useState<Phase>("input");

  useEffect(() => {
    const url = sessionStorage.getItem("capturedVideoUrl");
    const dur = sessionStorage.getItem("capturedDuration");
    if (!url) {
      router.replace("/capture");
      return;
    }
    setVideoUrl(url);
    setDuration(dur ? parseInt(dur, 10) : 0);
  }, [router]);

  const handleSave = useCallback(() => {
    if (!exercise) {
      setExerciseError(true);
      return;
    }

    const record = {
      exercise,
      weight: weight || null,
      reps: reps || null,
      sets: sets || null,
      memo: memo || null,
      videoUrl,
      duration,
      workout_session_id: linkedWorkoutId || null,
    };
    console.log("save set with video", record);
    if (linkedWorkoutId) {
      sessionStorage.setItem("captureLinkedWorkoutId", linkedWorkoutId);
    } else {
      sessionStorage.removeItem("captureLinkedWorkoutId");
    }

    sessionStorage.removeItem("capturedVideoUrl");
    sessionStorage.removeItem("capturedDuration");
    setPhase("saved");
  }, [exercise, weight, reps, sets, memo, videoUrl, duration, linkedWorkoutId]);

  const handleVideoOnly = useCallback(() => {
    console.log("save video only", {
      exercise: exercise || null,
      videoUrl,
      duration,
      workout_session_id: linkedWorkoutId || null,
    });
    sessionStorage.removeItem("capturedVideoUrl");
    sessionStorage.removeItem("capturedDuration");
    router.push("/videos");
  }, [exercise, videoUrl, duration, router, linkedWorkoutId]);

  const fmtDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!videoUrl) return null;

  if (phase === "saved") {
    const summary = [
      exercise,
      weight ? `${weight}kg` : null,
      reps ? `${reps}回` : null,
      sets ? `${sets}セット` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const linkedTitle = MOCK_WORKOUT_HISTORY.find((w) => w.id === linkedWorkoutId)?.title;

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
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            Capture
          </p>
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

      {/* Info callout */}
      <p className="rounded-[18px] bg-white px-[18px] py-3 text-[12px] leading-relaxed text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        下で<strong className="text-primary">ワークアウトを選ぶ</strong>
        と、履歴のセッションと動画がひも付きます。未選択の場合は動画ライブラリのみに保存されます。
      </p>

      {/* Workout link selector */}
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <label className="block border-b border-border px-[18px] pt-4 pb-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-secondary">
          ワークアウトに紐付ける
        </label>
        <select
          value={linkedWorkoutId}
          onChange={(e) => setLinkedWorkoutId(e.target.value)}
          className="min-h-[50px] w-full bg-white px-[18px] text-sm font-semibold text-primary focus:outline-none"
        >
          <option value="">紐付けない</option>
          {MOCK_WORKOUT_HISTORY.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}（{w.date}）
            </option>
          ))}
        </select>
      </div>

      {/* Exercise selector — unified with MOVEMENTS */}
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <select
          value={exercise}
          onChange={(e) => {
            setExercise(e.target.value);
            setExerciseError(false);
          }}
          className={`min-h-[50px] w-full bg-white px-[18px] text-sm font-semibold text-primary focus:outline-none ${
            exerciseError ? "ring-2 ring-danger/40 ring-inset" : ""
          }`}
        >
          <option value="">種目を選択</option>
          {Array.from(categorizedMovements.entries()).map(([cat, movements]) => (
            <optgroup key={cat} label={cat}>
              {movements.map((m) => (
                <option key={m.id} value={m.nameJa}>
                  {m.nameJa}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {exerciseError && (
          <p className="px-[18px] pb-2.5 text-xs text-danger">種目を選択してください</p>
        )}
      </div>

      {/* Metrics */}
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

      {/* Memo */}
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="メモ"
          className="w-full bg-white px-[18px] py-3.5 text-sm text-primary placeholder:text-muted focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        <PrimaryRecordButton type="button" onClick={handleSave}>
          <Dumbbell size={16} strokeWidth={1.5} />
          記録する
        </PrimaryRecordButton>
        <button
          type="button"
          onClick={handleVideoOnly}
          className="min-h-[44px] w-full rounded-xl text-sm font-bold text-secondary transition-colors active:bg-chip"
        >
          動画だけ保存する
        </button>
      </div>
    </div>
  );
}
