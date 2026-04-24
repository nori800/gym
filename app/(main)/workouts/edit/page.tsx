"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Pencil, HelpCircle, Camera, Loader2, BookmarkPlus, BookOpen } from "lucide-react";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import Link from "next/link";
import { DatePickerField } from "@/components/common/DatePickerField";
import { AppToast } from "@/components/common/AppToast";
import type { MovementConfig, WorkoutDraft, Block } from "@/types/workout";
import { createDefaultConfig, createEmptyBlock } from "@/types/workout";
import { getMovementById } from "@/lib/data/movements";
import { BlockCard } from "@/components/workout/BlockCard";
import { MovementListView } from "@/components/workout/MovementListView";
import { MovementDetailView } from "@/components/workout/MovementDetailView";
import { Toast } from "@/components/workout/Toast";
import { BlockExplainerModal } from "@/components/workout/BlockExplainerModal";
import { TemplatePickerSheet } from "@/components/workout/TemplatePickerSheet";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { useWorkoutPersistence } from "@/lib/hooks/useWorkoutPersistence";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/types/database.types";

type View =
  | { screen: "editor" }
  | { screen: "list" }
  | { screen: "detail"; movementId: string };

type TransitionDir = "forward" | "back" | "none";

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
  const [loadingExisting, setLoadingExisting] = useState(!!editId);

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

  const persistence = useWorkoutPersistence(draft, editId, user?.id, showToast);

  // ── Navigation state ──
  const transitionRef = useRef<TransitionDir>("none");
  const [view, setView] = useState<View>({ screen: "editor" });
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<MovementConfig | null>(null);
  const [showAddToast, setShowAddToast] = useState(false);
  const [hasAddedMovement, setHasAddedMovement] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const [blockExplainerOpen, setBlockExplainerOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  // ── Load existing workout ──
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

  // ── Screen navigation helpers ──
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

  // ── Movement handlers ──
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

  const addMovementToDraft = useCallback(() => {
    if (!currentConfig) return;
    setDraft((prev) => {
      const blocks = [...prev.blocks];
      const block = { ...blocks[activeBlockIndex] };
      block.movements = [...block.movements, currentConfig];
      blocks[activeBlockIndex] = block;
      return { ...prev, blocks };
    });
    setHasAddedMovement(true);
  }, [currentConfig, activeBlockIndex]);

  const handleAddMovement = useCallback(() => {
    addMovementToDraft();
    navigate({ screen: "editor" }, "back");
    setSelectedMovementId(null);
    setCurrentConfig(null);
    setTimeout(() => setShowAddToast(true), 300);
  }, [addMovementToDraft, navigate]);

  const handleAddAndSave = useCallback(async () => {
    if (!currentConfig) return;

    const updatedBlocks = [...draft.blocks];
    const block = { ...updatedBlocks[activeBlockIndex] };
    block.movements = [...block.movements, currentConfig];
    updatedBlocks[activeBlockIndex] = block;

    setDraft((prev) => ({ ...prev, blocks: updatedBlocks }));
    setHasAddedMovement(true);
    setSelectedMovementId(null);
    setCurrentConfig(null);

    if (!user) {
      showToast("ログインするとワークアウトを保存できます", "info");
      navigate({ screen: "editor" }, "back");
      return;
    }

    // Delegate save to persistence hook via handleSave
    // (draft state is updated above, so next render will use it)
    navigate({ screen: "editor" }, "back");
    await persistence.handleSave();
  }, [currentConfig, activeBlockIndex, draft, user, navigate, showToast, persistence]);

  const handleAddBlock = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      blocks: [...prev.blocks, createEmptyBlock(prev.blocks.length)],
    }));
  }, []);

  const handleClose = useCallback(() => {
    if (hasAddedMovement) {
      setDiscardConfirmOpen(true);
      return;
    }
    router.push("/workouts");
  }, [router, hasAddedMovement]);

  const loadTemplate = useCallback(
    (tpl: { title: string; blocks_json: Json }) => {
      const blocks = blocksJsonToDraft(tpl.blocks_json);
      setDraft((prev) => ({
        ...prev,
        title: tpl.title,
        blocks: blocks.length > 0 ? blocks : [createEmptyBlock(0)],
      }));
      if (blocks.some((b) => b.movements.length > 0)) {
        setHasAddedMovement(true);
      }
      persistence.setTemplatePickerOpen(false);
      showToast("テンプレートを読み込みました", "success");
    },
    [showToast, persistence],
  );

  // ── Loading state ──
  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  // ── Movement List screen ──
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

  // ── Movement Detail screen ──
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
          onAddAndSave={handleAddAndSave}
          saving={persistence.saving}
        />
      </div>
    );
  }

  // ── Editor screen ──
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
          <div className="h-10 w-10" />
        </div>

        {/* Title */}
        <div className="mt-6">
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            {editId ? "Edit Workout" : "Workout"}
          </p>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 shadow-[0_0_0_1px_rgba(0,0,0,.03)] transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              onFocus={(e) => {
                if (e.target.value === "マイワークアウト") e.target.select();
              }}
              placeholder="ワークアウト名を入力"
              className="min-w-0 flex-1 bg-transparent text-[22px] font-bold tracking-tight text-primary placeholder:text-muted/40 outline-none"
            />
            <Pencil size={14} strokeWidth={2} className="shrink-0 text-muted/50" />
          </div>
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
            onClick={persistence.openTemplatePicker}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.97]"
          >
            <BookOpen size={13} strokeWidth={2} />
            テンプレートから作成
          </button>
          {hasAddedMovement && (
            <button
              type="button"
              onClick={persistence.handleSaveAsTemplate}
              disabled={persistence.savingTemplate}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.97] disabled:opacity-60"
            >
              {persistence.savingTemplate ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <BookmarkPlus size={13} strokeWidth={2} />
              )}
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
            <BlockCard
              key={block.id}
              block={block}
              onAddMove={() => handleAddMove(i)}
              onCapture={persistence.handleCapture}
            />
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
                <p className="mt-0.5 text-xs text-secondary">
                  このワークアウトのセットを動画で記録
                </p>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Template picker modal */}
      {persistence.templatePickerOpen && (
        <TemplatePickerSheet
          templates={persistence.templates}
          loading={persistence.loadingTemplates}
          onSelect={loadTemplate}
          onClose={() => persistence.setTemplatePickerOpen(false)}
        />
      )}

      <Toast
        message="種目を追加しました"
        visible={showAddToast}
        onDismiss={() => setShowAddToast(false)}
      />
      <AppToast toast={toast} onDismiss={dismissToast} />
      <BlockExplainerModal
        open={blockExplainerOpen}
        onClose={() => setBlockExplainerOpen(false)}
      />
      <ConfirmModal
        open={discardConfirmOpen}
        title="編集内容を破棄"
        description="入力した内容が失われます。よろしいですか？"
        confirmLabel="破棄する"
        danger
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          router.push("/workouts");
        }}
        onCancel={() => setDiscardConfirmOpen(false)}
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
