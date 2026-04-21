"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search } from "lucide-react";
import type { Movement } from "@/types/workout";
import { searchMovements, getMovementsByCategory } from "@/lib/mocks/movements";

interface MovementListViewProps {
  selectedId: string | null;
  onSelect: (movement: Movement) => void;
  onBack: () => void;
}

const CATEGORIES = ["すべて", "胸", "背中", "肩", "腕", "脚"];

export function MovementListView({ selectedId, onSelect, onBack }: MovementListViewProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("すべて");

  const results = useMemo(() => {
    const searched = searchMovements(query);
    if (activeCategory === "すべて") return searched;
    return searched.filter((m) => m.categoryJa === activeCategory);
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    if (query || activeCategory !== "すべて") return null;
    return getMovementsByCategory();
  }, [query, activeCategory]);

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
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <h2 className="flex-1 text-center text-[15px] font-bold">種目を選ぶ</h2>
          <div className="h-10 w-10" />
        </div>

        {/* Search */}
        <div className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-white px-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.06)] transition-shadow focus-within:shadow-[0_0_0_2px_rgba(0,0,0,.15)]">
          <Search size={16} strokeWidth={1.75} className="text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="種目名や部位で検索"
            className="flex-1 bg-transparent text-[13px] text-primary placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[11px] text-secondary transition-colors active:text-primary"
            >
              クリア
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="-mx-5 mt-2.5 overflow-x-auto px-5 pb-2">
          <div className="flex gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all duration-150 active:scale-95 ${
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
        {grouped ? (
          Array.from(grouped.entries()).map(([category, movements]) => {
            if (movements.length === 0) return null;
            return (
              <div key={category} className="mt-4 first:mt-2">
                <div className="mb-1.5 px-1 text-[11px] font-bold tracking-wide text-muted">
                  {category}
                </div>
                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
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
          <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
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
              <div className="flex h-32 items-center justify-center text-[13px] text-secondary">
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
}: {
  movement: Movement;
  isSelected: boolean;
  hasBorder: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-all duration-100 active:bg-surface ${
        hasBorder ? "border-t border-border" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold tracking-tight">{movement.nameJa}</span>
        <span className="mt-0.5 block truncate text-[11px] text-secondary">
          {movement.descJa}
        </span>
      </div>
      {isSelected ? (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-inverse text-[11px] text-on-inverse">
          ✓
        </div>
      ) : (
        <span className="shrink-0 text-[15px] text-muted transition-transform duration-150 group-active:translate-x-0.5">
          ›
        </span>
      )}
    </button>
  );
}
