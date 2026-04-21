"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Camera, Dumbbell } from "lucide-react";
import { EXERCISE_TYPES } from "@/lib/mocks/exercises";
import { MOCK_WORKOUT_HISTORY } from "@/lib/mocks/workoutHistory";
import { PrimaryRecordButton } from "@/components/common/PrimaryRecordButton";

type Phase = "input" | "saved";

export default function CaptureMetaPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
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
      weight: weight ? parseFloat(weight) : null,
      reps: reps ? parseInt(reps, 10) : null,
      sets: sets ? parseInt(sets, 10) : null,
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
        <p className="mt-1.5 text-center text-sm text-secondary">{summary}</p>
        {linkedTitle && (
          <p className="mt-2 text-center text-[12px] text-muted">
            ワークアウト「{linkedTitle}」に紐付けました
          </p>
        )}
        <div className="mt-10 w-full max-w-sm space-y-3">
          <PrimaryRecordButton type="button" onClick={() => router.push("/capture")}>
            <Camera size={16} strokeWidth={1.75} />
            もう1セット撮影
          </PrimaryRecordButton>
          <button
            type="button"
            onClick={() => router.push("/workouts")}
            className="min-h-[40px] w-full rounded-xl text-[12px] font-bold text-secondary transition-colors active:bg-chip"
          >
            完了
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
          aria-label="戻る"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <div>
          <p className="text-[11px] font-caption uppercase tracking-[0.12em] text-muted">
            Capture
          </p>
          <h1 className="text-[18px] font-bold tracking-tight">セットを記録</h1>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video src={videoUrl} className="aspect-[16/9] w-full object-cover" controls playsInline />
        <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-metric text-white/80 backdrop-blur-sm">
          {fmtDuration(duration)}
        </div>
      </div>

      <p className="rounded-xl bg-chip px-3 py-2.5 text-[11px] leading-relaxed text-secondary">
        下で<strong className="text-primary">ワークアウトを選ぶ</strong>
        と、履歴のセッションと動画がひも付きます。未選択の場合は動画ライブラリのみに保存されます。
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <label className="block border-b border-border px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-muted">
          ワークアウトに紐付ける（任意）
        </label>
        <select
          value={linkedWorkoutId}
          onChange={(e) => setLinkedWorkoutId(e.target.value)}
          className="h-12 w-full bg-white px-4 text-[13px] font-semibold text-primary focus:outline-none"
        >
          <option value="">紐付けない</option>
          {MOCK_WORKOUT_HISTORY.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}（{w.date}）
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <select
          value={exercise}
          onChange={(e) => {
            setExercise(e.target.value);
            setExerciseError(false);
          }}
          className={`h-12 w-full bg-white px-4 text-[13px] font-semibold text-primary focus:outline-none ${
            exerciseError ? "ring-2 ring-danger/40 ring-inset" : ""
          }`}
        >
          <option value="">種目を選択</option>
          {EXERCISE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {exerciseError && (
          <p className="px-4 pb-2 text-xs text-danger">種目を選択してください</p>
        )}
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <FormRow label="重量 (kg)">
          <MetaStepper value={weight} onChange={setWeight} step={2.5} decimal />
        </FormRow>
        <FormRow label="回数">
          <MetaStepper value={reps} onChange={setReps} step={1} />
        </FormRow>
        <FormRow label="セット">
          <MetaStepper value={sets} onChange={setSets} step={1} />
        </FormRow>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="メモ"
          className="w-full bg-white px-4 py-3 text-[13px] text-primary placeholder:text-muted focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <PrimaryRecordButton type="button" onClick={handleSave}>
          <Dumbbell size={16} strokeWidth={1.75} />
          記録する
        </PrimaryRecordButton>
        <button
          type="button"
          onClick={handleVideoOnly}
          className="min-h-[40px] w-full rounded-xl text-[12px] font-bold text-secondary transition-colors active:bg-chip"
        >
          動画だけ保存する
        </button>
      </div>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[13px] text-primary">{label}</span>
      {children}
    </div>
  );
}

function MetaStepper({
  value,
  onChange,
  step = 1,
  decimal,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  decimal?: boolean;
}) {
  const num = parseFloat(value) || 0;
  const fmt = (n: number) => (decimal ? String(parseFloat(n.toFixed(1))) : String(Math.round(n)));
  const decr = () => {
    const next = Math.max(0, num - step);
    onChange(next === 0 && !value ? "" : fmt(next));
  };
  const incr = () => onChange(fmt(num + step));

  return (
    <div className="grid h-9 grid-cols-[38px_48px_38px] overflow-hidden rounded-[10px] border border-[#d8d8d8]">
      <button
        type="button"
        onClick={decr}
        className="flex items-center justify-center text-base font-bold text-primary transition-colors active:bg-surface"
      >
        −
      </button>
      <input
        type="number"
        inputMode={decimal ? "decimal" : "numeric"}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className="h-full bg-inverse text-center text-[13px] font-bold text-on-inverse placeholder:text-white/40 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={incr}
        className="flex items-center justify-center text-base font-bold text-primary transition-colors active:bg-surface"
      >
        ＋
      </button>
    </div>
  );
}
