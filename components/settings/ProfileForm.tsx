"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DOMINANT_SIDE_OPTIONS = [
  { value: "left", label: "左" },
  { value: "right", label: "右" },
  { value: "both", label: "両方" },
] as const;

const ROLE_LABELS: Record<string, string> = {
  member: "メンバー",
  trainer: "トレーナー",
  admin: "管理者",
};

interface ProfileFormProps {
  userId: string;
  onToast: (msg: string, type: "success" | "error") => void;
}

export function ProfileForm({ userId, onToast }: ProfileFormProps) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [dominantSide, setDominantSide] = useState<"left" | "right" | "both">("right");
  const [favoriteExercises, setFavoriteExercises] = useState("");
  const [role, setRole] = useState<string>("member");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name, height, weight, goal, dominant_side, favorite_exercises, role")
      .eq("user_id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("[settings] profile fetch error:", error.message);
          onToast("プロフィールの取得に失敗しました", "error");
        }
        if (data) {
          setName(data.display_name || "");
          setHeight(data.height != null ? String(data.height) : "");
          setWeight(data.weight != null ? String(data.weight) : "");
          setGoal(data.goal || "");
          setDominantSide((data.dominant_side || "right") as "left" | "right" | "both");
          setFavoriteExercises(
            Array.isArray(data.favorite_exercises) ? data.favorite_exercises.join(", ") : "",
          );
          setRole(data.role || "member");
        }
        setLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    const favArray = favoriteExercises
      .split(/[,、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        goal: goal || null,
        dominant_side: dominantSide,
        favorite_exercises: favArray,
      })
      .eq("user_id", userId);
    setSaving(false);

    if (error) {
      onToast("保存に失敗しました", "error");
    } else {
      onToast("プロフィールを保存しました", "success");
    }
  };

  if (!loaded) {
    return (
      <section className="flex justify-center py-6">
        <Loader2 size={20} className="animate-spin text-muted" />
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 px-1 text-xs font-title uppercase tracking-[0.12em] text-muted">
        プロフィール
      </h2>
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="divide-y divide-border">
          <FieldRow label="表示名">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              aria-label="表示名"
              className="w-full bg-transparent text-right text-sm font-metric text-primary focus:outline-none"
            />
          </FieldRow>
          <FieldRow label="ロール">
            <span className="text-sm text-secondary">{ROLE_LABELS[role] ?? role}</span>
          </FieldRow>
          <FieldRow label="身長">
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                aria-label="身長（cm）"
                className="w-16 bg-transparent text-right text-sm font-metric text-primary placeholder:text-muted/50 focus:outline-none"
              />
              <span className="text-xs text-muted">cm</span>
            </div>
          </FieldRow>
          <FieldRow label="体重">
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
                aria-label="体重（kg）"
                className="w-16 bg-transparent text-right text-sm font-metric text-primary placeholder:text-muted/50 focus:outline-none"
              />
              <span className="text-xs text-muted">kg</span>
            </div>
          </FieldRow>
          <FieldRow label="利き手/側">
            <div className="flex gap-1.5">
              {DOMINANT_SIDE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDominantSide(value)}
                  className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-wide transition-all duration-150 active:scale-95 ${
                    dominantSide === value
                      ? "bg-inverse text-on-inverse"
                      : "bg-chip text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="目標">
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              maxLength={200}
              placeholder="ベンチプレス 100kg"
              aria-label="目標"
              className="w-full bg-transparent text-right text-sm text-primary placeholder:text-muted/50 focus:outline-none"
            />
          </FieldRow>
          <FieldRow label="好きな種目">
            <input
              value={favoriteExercises}
              onChange={(e) => setFavoriteExercises(e.target.value)}
              maxLength={300}
              placeholder="スクワット, ベンチプレス"
              aria-label="好きな種目（カンマ区切り）"
              className="w-full bg-transparent text-right text-sm text-primary placeholder:text-muted/50 focus:outline-none"
            />
          </FieldRow>
        </div>
        <div className="px-[18px] py-3.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            保存
          </button>
        </div>
      </div>
    </section>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[62px] items-center justify-between gap-4 px-[18px]">
      <label className="shrink-0 text-lg font-semibold">{label}</label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
