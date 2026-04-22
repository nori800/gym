"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Pencil, HelpCircle, Camera } from "lucide-react";
import Link from "next/link";
import { DatePickerField } from "@/components/common/DatePickerField";
import type { MovementConfig, WorkoutDraft } from "@/types/workout";
import { createDefaultConfig, createEmptyBlock } from "@/types/workout";
import { getMovementById } from "@/lib/mocks/movements";
import { BlockCard } from "@/components/workout/BlockCard";
import { MovementListView } from "@/components/workout/MovementListView";
import { MovementDetailView } from "@/components/workout/MovementDetailView";
import { Toast } from "@/components/workout/Toast";
import { BlockExplainerModal } from "@/components/workout/BlockExplainerModal";

type View =
  | { screen: "editor" }
  | { screen: "list" }
  | { screen: "detail"; movementId: string };

type TransitionDir = "forward" | "back" | "none";

export default function WorkoutEditPage() {
  const router = useRouter();
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
  const [showToast, setShowToast] = useState(false);
  const [hasAddedMovement, setHasAddedMovement] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const [titleEditing, setTitleEditing] = useState(false);
  const [blockExplainerOpen, setBlockExplainerOpen] = useState(false);

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
    setTimeout(() => setShowToast(true), 300);
  }, [currentConfig, activeBlockIndex, navigate]);

  const handleAddBlock = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      blocks: [...prev.blocks, createEmptyBlock(prev.blocks.length)],
    }));
  }, []);

  const handleClose = useCallback(() => {
    router.push("/workouts");
  }, [router]);

  const handleSave = useCallback(() => {
    console.log("save workout", draft);
    router.push("/workouts");
  }, [draft, router]);

  const dismissToast = useCallback(() => setShowToast(false), []);

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
          {hasAddedMovement && (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.97]"
            >
              保存
            </button>
          )}
        </div>

        {/* Title — editable on tap */}
        <div className="mt-6">
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            Workout
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

        {/* Date — custom picker (no native calendar UI) */}
        <div className="mt-4">
          <DatePickerField
            value={draft.date}
            onChange={(iso) => setDraft((d) => ({ ...d, date: iso }))}
            aria-label="ワークアウトの日付を選択"
          />
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

        {/* Add block */}
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

            {/* Capture CTA — bridges workout and form-check */}
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
          </>
        )}
      </div>

      <Toast message="種目を追加しました" visible={showToast} onDismiss={dismissToast} />
      <BlockExplainerModal
        open={blockExplainerOpen}
        onClose={() => setBlockExplainerOpen(false)}
      />
    </div>
  );
}
