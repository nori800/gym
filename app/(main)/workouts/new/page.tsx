"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Video, X } from "lucide-react";
import { EXERCISE_TYPES } from "@/lib/mocks/exercises";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";

type Errors = Record<string, string>;
type Phase = "input" | "saved";

function validate(vals: {
  exercise: string; weight: string; reps: string; sets: string; rpe: string;
}): Errors {
  const e: Errors = {};
  if (!vals.exercise) e.exercise = "種目を選択してください";
  if (vals.weight && (isNaN(+vals.weight) || +vals.weight < 0 || +vals.weight > 999))
    e.weight = "0〜999の範囲で入力してください";
  if (vals.reps && (isNaN(+vals.reps) || +vals.reps < 1 || +vals.reps > 999))
    e.reps = "1〜999の範囲で入力してください";
  if (vals.sets && (isNaN(+vals.sets) || +vals.sets < 1 || +vals.sets > 99))
    e.sets = "1〜99の範囲で入力してください";
  if (vals.rpe && (isNaN(+vals.rpe) || +vals.rpe < 1 || +vals.rpe > 10))
    e.rpe = "1〜10の範囲で入力してください";
  return e;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [rpe, setRpe] = useState("");
  const [note, setNote] = useState("");
  const [logDate, setLogDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [linkedVideoIds, setLinkedVideoIds] = useState<string[]>([]);
  const [showVideoSelect, setShowVideoSelect] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [phase, setPhase] = useState<Phase>("input");

  const blur = useCallback((field: string) => {
    setTouched((p) => new Set(p).add(field));
    setErrors(validate({ exercise, weight, reps, sets, rpe }));
  }, [exercise, weight, reps, sets, rpe]);

  const toggleVideo = useCallback((id: string) => {
    setLinkedVideoIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const errs = validate({ exercise, weight, reps, sets, rpe });
    setErrors(errs);
    setTouched(new Set(["exercise", "weight", "reps", "sets", "rpe"]));
    if (Object.keys(errs).length > 0) return;

    console.log("save set", {
      exercise, weight, reps, sets, rpe, note, logDate, linkedVideoIds,
    });
    setPhase("saved");
  }, [exercise, weight, reps, sets, rpe, note, logDate, linkedVideoIds]);

  const showErr = (field: string) => touched.has(field) && errors[field];

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
        <p className="mt-2 text-base font-title text-secondary">{summary}</p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setPhase("input");
              setReps("");
              setSets("");
              setRpe("");
              setNote("");
              setLinkedVideoIds([]);
              setShowVideoSelect(false);
              setTouched(new Set());
              setErrors({});
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-title text-primary transition-all active:scale-[0.98]"
          >
            もう1セット記録
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
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/workouts" className="text-secondary transition-colors active:text-primary">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-xl font-title">セットを記録</h1>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Field label="日付">
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="h-12 w-full rounded-xl border-0 bg-surface px-4 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </Field>

        <Field label="種目" error={showErr("exercise") || undefined}>
          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            onBlur={() => blur("exercise")}
            className={`h-12 w-full rounded-xl border-0 bg-surface px-4 text-sm font-title text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 ${
              showErr("exercise") ? "ring-2 ring-danger/40" : ""
            }`}
          >
            <option value="">種目を選択</option>
            {EXERCISE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <NumField
            label="重量" unit="kg" value={weight} onChange={setWeight}
            onBlur={() => blur("weight")} placeholder="80" decimal
            error={showErr("weight") || undefined}
          />
          <NumField
            label="回数" unit="回" value={reps} onChange={setReps}
            onBlur={() => blur("reps")} placeholder="8"
            error={showErr("reps") || undefined}
          />
          <NumField
            label="セット" unit="set" value={sets} onChange={setSets}
            onBlur={() => blur("sets")} placeholder="3"
            error={showErr("sets") || undefined}
          />
        </div>

        <Field label="きつさ (RPE)（任意）" error={showErr("rpe") || undefined}>
          <input
            type="number"
            step="0.5"
            inputMode="decimal"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            onBlur={() => blur("rpe")}
            placeholder="8"
            className={`h-12 w-full rounded-xl border-0 bg-surface px-4 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
              showErr("rpe") ? "ring-2 ring-danger/40" : ""
            }`}
          />
        </Field>

        <Field label="メモ（任意）">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="気づいたことを書く"
            className="w-full rounded-xl border-0 bg-surface px-4 py-3 text-sm text-primary placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </Field>
      </div>

      {/* Video linking card */}
      <section className="space-y-3 rounded-xl bg-surface p-4">
        <button
          type="button"
          onClick={() => setShowVideoSelect(!showVideoSelect)}
          className="flex w-full items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
            <Video size={16} strokeWidth={1.5} className="text-secondary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-title">動画を紐付ける</p>
            {linkedVideoIds.length === 0 && (
              <p className="text-[11px] text-muted">撮影した動画をここに紐付けられます</p>
            )}
          </div>
          {showVideoSelect ? (
            <ChevronUp size={16} strokeWidth={1.5} className="text-muted" />
          ) : (
            <ChevronDown size={16} strokeWidth={1.5} className="text-muted" />
          )}
        </button>

        {linkedVideoIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {linkedVideoIds.map((vid) => {
              const v = MOCK_VIDEOS.find((m) => m.id === vid);
              if (!v) return null;
              return (
                <span key={vid} className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-secondary">
                  <Video size={11} strokeWidth={1.5} />
                  {v.title}
                  <button type="button" onClick={() => toggleVideo(vid)} className="ml-0.5 text-muted">
                    <X size={11} strokeWidth={1.5} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {showVideoSelect && (
          <div className="max-h-48 divide-y divide-border overflow-y-auto rounded-xl bg-white">
            {MOCK_VIDEOS.map((v) => {
              const selected = linkedVideoIds.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleVideo(v.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-surface"
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                    selected ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {selected && <Check size={12} strokeWidth={2} className="text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-label">{v.title}</p>
                    <p className="text-[10px] text-muted">{v.exercise_type} · {v.duration}秒</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        className="h-12 w-full rounded-xl bg-accent text-sm font-title text-primary transition-all active:scale-[0.98]"
      >
        保存
      </button>
    </div>
  );
}

function Field({
  label, children, error,
}: {
  label: string; children: React.ReactNode; error?: string | false;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-label text-secondary">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function NumField({
  label, unit, value, onChange, onBlur, placeholder, decimal, error,
}: {
  label: string; unit: string; value: string;
  onChange: (v: string) => void; onBlur: () => void;
  placeholder: string; decimal?: boolean; error?: string | false;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-label text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode={decimal ? "decimal" : "numeric"}
          step={decimal ? "0.5" : "1"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border-0 bg-surface pr-10 text-center text-base font-metric text-primary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
            error ? "ring-2 ring-danger/40" : ""
          }`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted">
          {unit}
        </span>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
