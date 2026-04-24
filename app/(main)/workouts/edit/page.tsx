"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Pencil, HelpCircle, Camera, Loader2, BookmarkPlus, BookOpen } from "lucide-react";
import Link from "next/link";
import { DatePickerField } from "@/components/common/DatePickerField";
import { AppToast } from "@/components/common/AppToast";
import type { MovementConfig, WorkoutDraft, Block } from "@/types/workout";
import { createDefaultConfig, createEmptyBlock } from "@/types/workout";
import { getMovementById } from "@/lib/mocks/movements";
import { BlockCard } from "@/components/workout/BlockCard";
import { MovementListView } from "@/components/workout/MovementListView";
import { MovementDetailView } from "@/components/workout/MovementDetailView";
import { Toast } from "@/components/workout/Toast";
import { BlockExplainerModal } from "@/components/workout/BlockExplainerModal";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/types/database.types";

type View =
  | { screen: "editor" }
  | { screen: "list" }
  | { screen: "detail"; movementId: string };

type TransitionDir = "forward" | "back" | "none";

type TemplateRow = {
  id: string;
  title: string;
  blocks_json: Json;
  categories: string[];
};

function blocksJsonToDraft(blocksJson: Json): Block[] {
  const arr = Array.isArray(blocksJson) ? blocksJson : [];
  return arr.map((raw, i) => {
    const b = raw as { name?: string; movements?: Array<Record<string, Json>> };
    const movements: MovementConfig[] = (b.movements ?? []).map((m) => ({
      movementId: (m.movementId as string) ?? "",
      reps: (m.reps as number) ?? 8,
      sets: (m.sets as number) ?? 3,
      warmupEnabled: false,
      perSetWeight: Array.isArray(m.perSetWeight) ? (m.perSetWeight as number[]) : [(m.weight as number) ?? 0],
      perSetReps: Array.isArray(m.perSetReps) ? (m.perSetReps as number[]) : Array.from({ length: (m.sets as number) ?? 3 }, () => (m.reps as number) ?? 8),
      weightMode: (m.weightMode as MovementConfig["weightMode"]) ?? "normal",
      assistanceType: ((m.assistance ?? m.assistanceType) as MovementConfig["assistanceType"]) ?? "none",
    }));
    return {
      id: crypto.randomUUID(),
      name: (b.name as string) ?? `ブロック ${i + 1}`,
      setsLabel: movements.length > 0 ? `${movements[0].sets}セット` : "0セット",
      movements,
    };
  });
}

function WorkoutEditInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const { user } = useAuth();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(!!editId);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const transitionRef = useRef<TransitionDir>("none");

  const [draft, setDraft] = useState<WorkoutDraft>(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      title: "マイワークアウト",
      date: today,
      description: "",
      blocks: [createEmptyBlock(0)],
    };
  });

  const [view, setView] = useState<View>({ screen: "editor" });
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<MovementConfig | null>(null);
  const [showAddToast, setShowAddToast] = useState(false);
  const [hasAddedMovement, setHasAddedMovement] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const [titleEditing, setTitleEditing] = useState(false);
  const [blockExplainerOpen, setBlockExplainerOpen] = useState(false);

  useEffect(() => {
    if (!editId) return;
    const supabase = createClient();
    supabase
      .from("workouts")
      .select("*")
      .eq("id", editId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          showToast("ワークアウトが見つかりません", "error");
          setLoadingExisting(false);
          return;
        }
        const blocks = blocksJsonToDraft(data.blocks_json);
        setDraft({
          title: data.title,
          date: data.workout_date,
          description: data.description ?? "",
          blocks: blocks.length > 0 ? blocks : [createEmptyBlock(0)],
        });
        if (blocks.some((b) => b.movements.length > 0)) {
          setHasAddedMovement(true);
        }
        setLoadingExisting(false);
      });
  }, [editId, showToast]);

  const navigate = useCallback((next: View, dir: TransitionDir) => {
    transitionRef.current = dir;
    setTransitionKey((k) => k + 1);
    setView(next);
  }, []);

  const animClass =
    transitionRef.current === "forward"
      ? "animate-slide-in"
      : transitionRef.current === "back"
        ? "animate-slide-back"
        : "animate-fade-in";

  const handleAddMove = useCallback(
    (blockIndex: number) => {
      setActiveBlockIndex(blockIndex);
      setSelectedMovementId(null);
      navigate({ screen: "list" }, "forward");
    },
    [navigate],
  );

  const handleSelectMovement = useCallback(
    (movement: { id: string }) => {
      setSelectedMovementId(movement.id);
      const m = getMovementById(movement.id);
      if (!m) return;
      setCurrentConfig(createDefaultConfig(m));
      setTimeout(() => {
        navigate({ screen: "detail", movementId: movement.id }, "forward");
      }, 150);
    },
    [navigate],
  );

  const handleAddMovement = useCallback(() => {
    if (!currentConfig) return;
    setDraft((prev) => {
      const blocks = [...prev.blocks];
      const block = { ...blocks[activeBlockIndex] };
      block.movements = [...block.movements, currentConfig];
      blocks[activeBlockIndex] = block;
      return { ...prev, blocks };
    });
    setHasAddedMovement(true);
    navigate({ screen: "editor" }, "back");
    setSelectedMovementId(null);
    setCurrentConfig(null);
    setTimeout(() => setShowAddToast(true), 300);
  }, [currentConfig, activeBlockIndex, navigate]);

  const handleAddBlock = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      blocks: [...prev.blocks, createEmptyBlock(prev.blocks.length)],
    }));
  }, []);

  const handleClose = useCallback(() => {
    if (hasAddedMovement) {
      const ok = window.confirm("編集中の内容が破棄されます。よろしいですか？");
      if (!ok) return;
    }
    router.push("/workouts");
  }, [router, hasAddedMovement]);

  const buildPayload = useCallback(() => {
    const allMovements = draft.blocks.flatMap((b) => b.movements);
    const totalSets = allMovements.reduce((s, m) => s + m.sets, 0);
    const totalVolume = allMovements.reduce((s, m) => {
      const avgWeight = m.perSetWeight.length > 0
        ? m.perSetWeight.reduce((a, w) => a + w, 0) / m.perSetWeight.length
        : 0;
      return s + avgWeight * m.reps * m.sets;
    }, 0);
    const categories = [...new Set(
      allMovements
        .map((m) => getMovementById(m.movementId)?.categoryJa)
        .filter((c): c is string => !!c),
    )];

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
  }, [draft]);

  const handleSave = useCallback(async () => {
    if (!user) {
      showToast("ログインするとワークアウトを保存できます", "info");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { totalSets, totalVolume, categories, blocksJson } = buildPayload();

    const payload = {
      user_id: user.id,
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
      ({ error } = await supabase.from("workouts").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("workouts").insert(payload));
    }

    setSaving(false);

    if (error) {
      showToast("保存に失敗しました: " + error.message, "error");
      return;
    }

    showToast(editId ? "ワークアウトを更新しました" : "ワークアウトを保存しました", "success");
    setTimeout(() => router.push("/workouts"), 600);
  }, [draft, router, user, editId, buildPayload, showToast]);

  const handleSaveAsTemplate = useCallback(async () => {
    if (!user) {
      showToast("ログインするとテンプレートを保存できます", "info");
      return;
    }

    setSavingTemplate(true);
    const supabase = createClient();
    const { categories, blocksJson } = buildPayload();

    const { error } = await supabase.from("workout_templates").insert({
      user_id: user.id,
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
  }, [user, draft, buildPayload, showToast]);

  const openTemplatePicker = useCallback(async () => {
    if (!user) {
      showToast("ログインするとテンプレートを利用できます", "info");
      return;
    }

    setLoadingTemplates(true);
    setTemplatePickerOpen(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("workout_templates")
      .select("id, title, blocks_json, categories")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    setTemplates((data as TemplateRow[] | null) ?? []);
    setLoadingTemplates(false);
  }, [user, showToast]);

  const loadTemplate = useCallback((tpl: TemplateRow) => {
    const blocks = blocksJsonToDraft(tpl.blocks_json);
    setDraft((prev) => ({
      ...prev,
      title: tpl.title,
      blocks: blocks.length > 0 ? blocks : [createEmptyBlock(0)],
    }));
    if (blocks.some((b) => b.movements.length > 0)) {
      setHasAddedMovement(true);
    }
    setTemplatePickerOpen(false);
    showToast("テンプレートを読み込みました", "success");
  }, [showToast]);

  const dismissAddToast = useCallback(() => setShowAddToast(false), []);

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  /* ── Render: Movement List ── */
  if (view.screen === "list") {
    return (
      <div key={transitionKey} className={`fixed inset-0 z-40 ${animClass}`}>
        <MovementListView
          selectedId={selectedMovementId}
          onSelect={handleSelectMovement}
          onBack={() => navigate({ screen: "editor" }, "back")}
        />
      </div>
    );
  }

  /* ── Render: Movement Detail ── */
  if (view.screen === "detail" && currentConfig) {
    const movement = getMovementById(view.movementId);
    if (!movement) return null;
    return (
      <div key={transitionKey} className={`fixed inset-0 z-40 ${animClass}`}>
        <MovementDetailView
          movement={movement}
          config={currentConfig}
          onConfigChange={setCurrentConfig}
          onAdd={handleAddMovement}
          onBack={() => navigate({ screen: "list" }, "back")}
        />
      </div>
    );
  }

  /* ── Render: Editor ── */
  const totalMovements = draft.blocks.reduce((acc, b) => acc + b.movements.length, 0);

  return (
    <div key={transitionKey} className={`bg-surface ${animClass}`}>
      <div className="px-5 pb-10 pt-3">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-all duration-150 active:bg-chip active:scale-95"
            aria-label="閉じる"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2">
            {hasAddedMovement && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.97] disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? "更新" : "保存"}
              </button>
            )}
          </div>
        </div>

        {/* Title — editable on tap */}
        <div className="mt-6">
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            {editId ? "Edit Workout" : "Workout"}
          </p>
          {titleEditing ? (
            <input
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              onBlur={() => setTitleEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setTitleEditing(false);
              }}
              className="mt-1.5 w-full border-b border-primary/20 bg-transparent pb-1 text-[26px] font-bold tracking-tight text-primary outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setTitleEditing(true)}
              className="mt-1.5 flex w-full items-center gap-2 text-left"
            >
              <h1 className="text-[26px] font-bold tracking-tight">{draft.title}</h1>
              <Pencil size={14} strokeWidth={2} className="shrink-0 text-muted" />
            </button>
          )}
          <p className="mt-2 text-sm text-secondary">
            {totalMovements > 0
              ? `${draft.blocks.length}ブロック · ${totalMovements}種目`
              : "種目を追加してワークアウトを組みましょう"}
          </p>
        </div>

        {/* Date */}
        <div className="mt-4">
          <DatePickerField
            value={draft.date}
            onChange={(iso) => setDraft((d) => ({ ...d, date: iso }))}
            aria-label="ワークアウトの日付を選択"
          />
        </div>

        {/* Template actions */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={openTemplatePicker}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.97]"
          >
            <BookOpen size={13} strokeWidth={2} />
            テンプレートから作成
          </button>
          {hasAddedMovement && (
            <button
              type="button"
              onClick={handleSaveAsTemplate}
              disabled={savingTemplate}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.97] disabled:opacity-60"
            >
              {savingTemplate ? <Loader2 size={13} className="animate-spin" /> : <BookmarkPlus size={13} strokeWidth={2} />}
              テンプレートとして保存
            </button>
          )}
        </div>

        {/* Blocks heading */}
        <div className="mt-6 px-[18px]">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-title uppercase tracking-wider text-primary">
              ブロック
            </h4>
            <button
              type="button"
              onClick={() => setBlockExplainerOpen(true)}
              aria-label="ブロックの説明を見る"
            >
              <HelpCircle size={13} strokeWidth={1.5} className="text-muted" />
            </button>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-secondary">
            種目をグループ化する単位です。1ブロック1種目でもOK。
          </p>
        </div>

        {/* Blocks */}
        <div className="mt-3 space-y-5">
          {draft.blocks.map((block, i) => (
            <BlockCard key={block.id} block={block} onAddMove={() => handleAddMove(i)} />
          ))}
        </div>

        {/* Add block + Capture CTA */}
        {hasAddedMovement && (
          <>
            <button
              type="button"
              onClick={handleAddBlock}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded border-2 border-dashed border-[#d0d0d0] bg-white py-5 text-sm font-extrabold text-secondary transition-all duration-150 active:scale-[0.99] active:bg-surface"
            >
              <span className="text-lg leading-none">+</span>
              ブロックを追加
            </button>

            <Link
              href="/capture"
              className="mt-4 flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
                <Camera size={18} strokeWidth={1.5} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold tracking-tight">フォームを撮影する</p>
                <p className="mt-0.5 text-[11px] text-secondary">
                  このワークアウトのセットを動画で記録
                </p>
              </div>
            </Link>

            {/* Bottom save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-base font-extrabold tracking-wide text-on-inverse shadow-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editId ? "ワークアウトを更新" : "ワークアウトを保存"}
            </button>
          </>
        )}
      </div>

      {/* Template picker modal */}
      {templatePickerOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setTemplatePickerOpen(false)}
            aria-label="閉じる"
          />
          <div className="fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md" role="dialog" aria-modal="true" aria-label="テンプレート一覧">
            <div className="max-h-[70dvh] overflow-y-auto rounded-t-[18px] bg-white pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-fade-in">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
              <div className="px-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold tracking-tight">テンプレートから作成</h3>
                  <button
                    type="button"
                    onClick={() => setTemplatePickerOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
                    aria-label="閉じる"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                {loadingTemplates ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={20} className="animate-spin text-muted" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-secondary">テンプレートがありません</p>
                    <p className="mt-1 text-xs text-muted">ワークアウト作成後に「テンプレートとして保存」できます</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => loadTemplate(tpl)}
                        className="w-full rounded-[14px] bg-surface px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.99]"
                      >
                        <p className="text-sm font-bold tracking-tight">{tpl.title}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {tpl.categories.map((c) => (
                            <span key={c} className="rounded-full bg-chip px-2.5 py-0.5 text-[10px] font-extrabold text-secondary">{c}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <Toast message="種目を追加しました" visible={showAddToast} onDismiss={dismissAddToast} />
      <AppToast toast={toast} onDismiss={dismissToast} />
      <BlockExplainerModal
        open={blockExplainerOpen}
        onClose={() => setBlockExplainerOpen(false)}
      />
    </div>
  );
}

export default function WorkoutEditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-muted" />
        </div>
      }
    >
      <WorkoutEditInner />
    </Suspense>
  );
}
