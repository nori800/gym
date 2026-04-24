"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getMovementById } from "@/lib/data/movements";
import type { WorkoutDraft } from "@/types/workout";
import type { Json } from "@/types/database.types";

type TemplateRow = {
  id: string;
  title: string;
  blocks_json: Json;
  categories: string[];
};

function buildPayload(draft: WorkoutDraft) {
  const allMovements = draft.blocks.flatMap((b) => b.movements);
  const totalSets = allMovements.reduce((s, m) => s + m.sets, 0);
  const totalVolume = allMovements.reduce((s, m) => {
    const avgWeight =
      m.perSetWeight.length > 0
        ? m.perSetWeight.reduce((a, w) => a + w, 0) / m.perSetWeight.length
        : 0;
    return s + avgWeight * m.reps * m.sets;
  }, 0);
  const categories = [
    ...new Set(
      allMovements
        .map((m) => getMovementById(m.movementId)?.categoryJa)
        .filter((c): c is string => !!c),
    ),
  ];

  const blocksJson = draft.blocks.map((b) => ({
    name: b.name,
    movements: b.movements.map((m) => {
      const mv = getMovementById(m.movementId);
      return {
        movementId: m.movementId,
        nameJa: mv?.nameJa ?? "",
        categoryJa: mv?.categoryJa ?? "",
        sets: m.sets,
        reps: m.reps,
        weight: m.perSetWeight[0] ?? 0,
        perSetWeight: m.perSetWeight,
        perSetReps: m.perSetReps,
        weightMode: m.weightMode,
        assistance: m.assistanceType,
      };
    }),
  }));

  return { totalSets, totalVolume, categories, blocksJson };
}

export function useWorkoutPersistence(
  draft: WorkoutDraft,
  editId: string | null,
  userId: string | undefined,
  showToast: (msg: string, type: "success" | "error" | "info") => void,
) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const handleSave = useCallback(async () => {
    if (!userId) {
      showToast("ログインするとワークアウトを保存できます", "info");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { totalSets, totalVolume, categories, blocksJson } = buildPayload(draft);

    const payload = {
      user_id: userId,
      title: draft.title,
      workout_date: draft.date,
      description: draft.description,
      blocks_json: blocksJson as Json,
      total_sets: totalSets,
      total_volume: totalVolume,
      categories,
      duration_min: null,
    };

    let error;
    if (editId) {
      ({ error } = await supabase
        .from("workouts")
        .update(payload)
        .eq("id", editId)
        .eq("user_id", userId));
    } else {
      ({ error } = await supabase.from("workouts").insert(payload));
    }

    setSaving(false);

    if (error) {
      console.error("[useWorkoutPersistence] save error:", error.message);
      showToast("保存に失敗しました: " + error.message, "error");
      return;
    }

    showToast(
      editId ? "ワークアウトを更新しました" : "ワークアウトを保存しました",
      "success",
    );
    setTimeout(() => router.push("/workouts"), 600);
  }, [draft, router, userId, editId, showToast]);

  const handleCapture = useCallback(
    async (movementId: string) => {
      const movement = getMovementById(movementId);
      if (!movement) return;

      let workoutId = editId;

      if (!workoutId && userId) {
        setSaving(true);
        const supabase = createClient();
        const { totalSets, totalVolume, categories, blocksJson } = buildPayload(draft);
        const { data, error } = await supabase
          .from("workouts")
          .insert({
            user_id: userId,
            title: draft.title,
            workout_date: draft.date,
            description: draft.description,
            blocks_json: blocksJson as Json,
            total_sets: totalSets,
            total_volume: totalVolume,
            categories,
            duration_min: null,
          })
          .select("id")
          .single();
        setSaving(false);

        if (error || !data) {
          showToast("保存に失敗しました", "error");
          return;
        }
        workoutId = data.id;
      }

      sessionStorage.setItem(
        "captureContext",
        JSON.stringify({ workoutId, exerciseName: movement.nameJa }),
      );
      router.push("/capture");
    },
    [editId, userId, draft, router, showToast],
  );

  const handleSaveAsTemplate = useCallback(async () => {
    if (!userId) {
      showToast("ログインするとテンプレートを保存できます", "info");
      return;
    }

    setSavingTemplate(true);
    const supabase = createClient();
    const { categories, blocksJson } = buildPayload(draft);

    const { error } = await supabase.from("workout_templates").insert({
      user_id: userId,
      title: draft.title,
      blocks_json: blocksJson as Json,
      categories,
    });

    setSavingTemplate(false);

    if (error) {
      showToast("テンプレート保存に失敗しました", "error");
      return;
    }

    showToast("テンプレートとして保存しました", "success");
  }, [userId, draft, showToast]);

  const openTemplatePicker = useCallback(async () => {
    if (!userId) {
      showToast("ログインするとテンプレートを利用できます", "info");
      return;
    }

    setLoadingTemplates(true);
    setTemplatePickerOpen(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("workout_templates")
      .select("id, title, blocks_json, categories")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    setTemplates((data as TemplateRow[] | null) ?? []);
    setLoadingTemplates(false);
  }, [userId, showToast]);

  return {
    saving,
    savingTemplate,
    templatePickerOpen,
    setTemplatePickerOpen,
    templates,
    loadingTemplates,
    handleSave,
    handleCapture,
    handleSaveAsTemplate,
    openTemplatePicker,
    buildPayload: () => buildPayload(draft),
  };
}
