"use client";

import type { Block } from "@/types/workout";
import { formatBlockSetsLabel, formatMovementMeta } from "@/types/workout";
import { getMovementById } from "@/lib/mocks/movements";

interface BlockCardProps {
  block: Block;
  onAddMove: () => void;
}

export function BlockCard({ block, onAddMove }: BlockCardProps) {
  const setsLabel = formatBlockSetsLabel(block);
  const isEmpty = block.movements.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
      {/* Header */}
      <div className="flex h-12 items-center justify-between bg-inverse px-4">
        <span className="text-sm font-bold text-on-inverse">{block.name}</span>
        <span className="text-xs text-on-inverse/50">{setsLabel}</span>
      </div>

      {/* Body */}
      {isEmpty ? (
        <button
          type="button"
          onClick={onAddMove}
          className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 transition-colors active:bg-surface"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#d0d0d0]">
            <span className="text-2xl font-light leading-none text-secondary">+</span>
          </div>
          <span className="text-[13px] font-bold text-secondary">種目を追加</span>
        </button>
      ) : (
        <div>
          {block.movements.map((config) => {
            const movement = getMovementById(config.movementId);
            if (!movement) return null;
            return (
              <div
                key={config.movementId}
                className="flex min-h-[60px] items-center gap-3 border-t border-border px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold">{movement.nameJa}</p>
                  <p className="mt-0.5 text-[11px] text-secondary">
                    {formatMovementMeta(config)}
                  </p>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onAddMove}
            className="flex w-full items-center justify-center gap-1.5 border-t border-border py-3.5 text-[13px] font-bold text-secondary transition-colors active:bg-surface"
          >
            <span className="text-base leading-none">+</span>
            種目を追加
          </button>
        </div>
      )}
    </div>
  );
}
