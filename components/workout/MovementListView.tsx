"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search, X, Plus } from "lucide-react";
import type { Movement } from "@/types/workout";
import { searchMovements, getMovementsByCategory } from "@/lib/data/movements";

interface MovementListViewProps {
  selectedId: string | null;
  onSelect: (movement: Movement) => void;
  onBack: () => void;
  customMovements?: Movement[];
  onAddCustomMovement?: (m: { nameJa: string; categoryJa: string; descJa: string }) => void;
}

const CATEGORIES = ["すべて", "胸", "背中", "肩", "腕", "脚", "腹", "全身"];
const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c !== "すべて");

export function MovementListView({
  selectedId,
  onSelect,
  onBack,
  customMovements,
  onAddCustomMovement,
}: MovementListViewProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("胸");
  const [customDesc, setCustomDesc] = useState("");

  const results = useMemo(() => {
    const searched = searchMovements(query);
    if (activeCategory === "すべて") return searched;
    return searched.filter((m) => m.categoryJa === activeCategory);
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    if (query || activeCategory !== "すべて") return null;
    return getMovementsByCategory();
  }, [query, activeCategory]);

  const filteredCustom = useMemo(() => {
    if (!customMovements?.length) return [];
    let list = customMovements;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) => m.nameJa.includes(q) || m.descJa.includes(q) || m.categoryJa.includes(q),
      );
    }
    if (activeCategory !== "すべて") {
      list = list.filter((m) => m.categoryJa === activeCategory);
    }
    return list;
  }, [customMovements, query, activeCategory]);

  function handleAddCustom() {
    const name = customName.trim();
    if (!name || !onAddCustomMovement) return;
    onAddCustomMovement({ nameJa: name, categoryJa: customCategory, descJa: customDesc.trim() });
    setCustomName("");
    setCustomDesc("");
    setCustomCategory("胸");
    setShowCustomForm(false);
  }

  return (
    <div className="flex h-dvh flex-col bg-surface">
      {/* Header */}
      <div className="shrink-0 px-5 pt-3">
        <div className="flex h-11 items-center">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-all duration-150 active:bg-chip active:scale-95"
            aria-label="戻る"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h2 className="flex-1 text-center text-[15px] font-bold">種目を選ぶ</h2>
          <div className="h-10 w-10" />
        </div>

        {/* Underline search — Tonal style */}
        <div className="mt-3 flex h-11 items-center gap-2.5 border-b border-[#cfcfcf] px-1">
          <Search size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="種目名や部位で検索"
            aria-label="種目を検索"
            className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-colors active:text-primary"
              aria-label="検索をクリア"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="-mx-5 mt-3 overflow-x-auto px-5 pb-2">
          <div className="flex gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold tracking-wide transition-all duration-150 active:scale-95 ${
                  activeCategory === cat
                    ? "bg-inverse text-on-inverse"
                    : "bg-white text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.08)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movement list */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-1">
        {/* Custom movement section */}
        {onAddCustomMovement && (
          <div className="mt-2">
            {!showCustomForm ? (
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="flex w-full items-center gap-2.5 rounded-[18px] bg-white px-4 py-3 text-left shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-100 active:bg-surface"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-inverse/5">
                  <Plus size={16} strokeWidth={2} className="text-primary" />
                </div>
                <span className="text-[15px] font-bold tracking-tight">カスタム種目を追加</span>
              </button>
            ) : (
              <div className="overflow-hidden rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                  カスタム種目を追加
                </div>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="種目名"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-inverse/20"
                  />
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-inverse/20"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="説明（任意）"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-inverse/20"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="flex-1 rounded-xl bg-surface py-2 text-sm font-bold text-secondary transition-colors active:bg-chip"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      disabled={!customName.trim()}
                      className="flex-1 rounded-xl bg-inverse py-2 text-sm font-bold text-on-inverse transition-all active:scale-[0.98] disabled:opacity-40"
                    >
                      追加
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom movements list */}
        {filteredCustom.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 px-1 text-xs font-title uppercase tracking-wider text-primary">
              カスタム種目
            </div>
            <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
              {filteredCustom.map((m, i) => (
                <MovementRow
                  key={m.id}
                  movement={m}
                  isSelected={m.id === selectedId}
                  hasBorder={i > 0}
                  onSelect={() => onSelect(m)}
                  isCustom
                />
              ))}
            </div>
          </div>
        )}

        {/* Built-in movements */}
        {grouped ? (
          Array.from(grouped.entries()).map(([category, movements]) => {
            if (movements.length === 0) return null;
            return (
              <div key={category} className="mt-4 first:mt-2">
                <div className="mb-1.5 px-1 text-xs font-title uppercase tracking-wider text-primary">
                  {category}
                </div>
                <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
                  {movements.map((m, i) => (
                    <MovementRow
                      key={m.id}
                      movement={m}
                      isSelected={m.id === selectedId}
                      hasBorder={i > 0}
                      onSelect={() => onSelect(m)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="mt-2 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            {results.length > 0 ? (
              results.map((m, i) => (
                <MovementRow
                  key={m.id}
                  movement={m}
                  isSelected={m.id === selectedId}
                  hasBorder={i > 0}
                  onSelect={() => onSelect(m)}
                />
              ))
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-secondary">
                該当する種目がありません
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MovementRow({
  movement,
  isSelected,
  hasBorder,
  onSelect,
  isCustom,
}: {
  movement: Movement;
  isSelected: boolean;
  hasBorder: boolean;
  onSelect: () => void;
  isCustom?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group grid w-full grid-cols-[64px_1fr_auto] min-h-[76px] items-center gap-3.5 px-3.5 text-left transition-all duration-100 active:bg-surface ${
        hasBorder ? "border-t border-border" : ""
      }`}
    >
      {/* Thumbnail placeholder */}
      <div className="flex h-12 w-16 items-center justify-center rounded-[10px] bg-neutral-200">
        <span className="text-xs font-bold text-muted">{movement.categoryJa}</span>
      </div>

      <div className="min-w-0 py-2">
        <span className="block text-[17px] font-bold tracking-tight">
          {movement.nameJa}
          {isCustom && (
            <span className="ml-1.5 inline-block rounded-full bg-inverse/10 px-1.5 py-0.5 align-middle text-xs font-extrabold text-secondary">
              カスタム
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-secondary">
          {movement.descJa}
        </span>
      </div>

      {isSelected ? (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-inverse text-xs text-on-inverse">
          ✓
        </div>
      ) : (
        <span className="shrink-0 text-[22px] text-muted transition-transform duration-150 group-active:translate-x-0.5">
          ›
        </span>
      )}
    </button>
  );
}
