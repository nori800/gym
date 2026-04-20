"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Camera, Dumbbell } from "lucide-react";
import { EXERCISE_TYPES } from "@/lib/mocks/exercises";

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
    setDuration(dur ? parseInt(dur) : 0);
  }, [router]);

  const handleSave = useCallback(() => {
    if (!exercise) {
      setExerciseError(true);
      return;
    }

    const record = {
      exercise,
      weight: weight ? parseFloat(weight) : null,
      reps: reps ? parseInt(reps) : null,
      sets: sets ? parseInt(sets) : null,
      memo: memo || null,
      videoUrl,
      duration,
    };
    console.log("save set with video", record);

    sessionStorage.removeItem("capturedVideoUrl");
    sessionStorage.removeItem("capturedDuration");
    setPhase("saved");
  }, [exercise, weight, reps, sets, memo, videoUrl, duration]);

  const handleVideoOnly = useCallback(() => {
    console.log("save video only", { exercise: exercise || null, videoUrl, duration });
    sessionStorage.removeItem("capturedVideoUrl");
    sessionStorage.removeItem("capturedDuration");
    router.push("/videos");
  }, [exercise, videoUrl, duration, router]);

  const fmtDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!videoUrl) return null;

  /* ── Saved state ── */
  if (phase === "saved") {
    const summary = [
      exercise,
      weight ? `${weight}kg` : null,
      reps ? `${reps}回` : null,
      sets ? `${sets}セット` : null,
    ].filter(Boolean).join(" · ");

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <Check size={28} strokeWidth={2} className="text-primary" />
        </div>
        <p className="mt-5 text-lg font-title">保存しました</p>
        <p className="mt-1.5 text-sm text-secondary">{summary}</p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/capture")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-title text-primary transition-all active:scale-[0.98]"
          >
            <Camera size={16} strokeWidth={1.5} />
            もう1セット撮影
          </button>
          <button
            type="button"
            onClick={() => router.push("/workouts")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface text-sm font-title text-secondary transition-all active:scale-[0.98]"
          >
            完了
          </button>
        </div>
      </div>
    );
  }

  /* ── Input state ── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-secondary transition-colors active:text-primary"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-title">セットを記録</h1>
      </div>

      {/* Video preview — compact */}
      <div className="relative overflow-hidden rounded-xl bg-black">
        <video
          src={videoUrl}
          className="aspect-[16/9] w-full object-cover"
          controls
          playsInline
        />
        <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-metric text-white/70 backdrop-blur-sm">
          {fmtDuration(duration)}
        </div>
      </div>

      {/* Exercise type — prominent */}
      <div>
        <select
          value={exercise}
          onChange={(e) => { setExercise(e.target.value); setExerciseError(false); }}
          className={`h-14 w-full rounded-xl border-0 bg-surface px-4 text-base font-title text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 ${
            exerciseError ? "ring-2 ring-danger/40" : ""
          }`}
        >
          <option value="">種目を選択</option>
          {EXERCISE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {exerciseError && (
          <p className="mt-1 text-xs text-danger">種目を選択してください</p>
        )}
      </div>

      {/* Metrics — large, gym-friendly */}
      <div className="grid grid-cols-3 gap-3">
        <NumField label="重量" unit="kg" value={weight} onChange={setWeight} placeholder="80" decimal />
        <NumField label="回数" unit="回" value={reps} onChange={setReps} placeholder="8" />
        <NumField label="セット" unit="set" value={sets} onChange={setSets} placeholder="3" />
      </div>

      {/* Memo */}
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="フォームの気づきなど（任意）"
        className="w-full rounded-xl border-0 bg-surface px-4 py-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
      />

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-title text-primary transition-all active:scale-[0.98]"
        >
          <Dumbbell size={16} strokeWidth={1.5} />
          セットを保存
        </button>
        <button
          type="button"
          onClick={handleVideoOnly}
          className="h-10 w-full rounded-xl text-xs font-label text-muted transition-colors active:text-secondary"
        >
          動画だけ保存する
        </button>
      </div>
    </div>
  );
}

function NumField({
  label, unit, value, onChange, placeholder, decimal,
}: {
  label: string; unit: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  decimal?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-caption uppercase tracking-wider text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode={decimal ? "decimal" : "numeric"}
          step={decimal ? "0.5" : "1"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-14 w-full rounded-xl border-0 bg-surface pr-10 text-center text-lg font-metric text-primary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted">
          {unit}
        </span>
      </div>
    </div>
  );
}
