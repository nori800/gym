"use client";

import { Camera } from "lucide-react";
import type { Block } from "@/types/workout";
import { formatBlockSetsLabel, formatMovementMeta } from "@/types/workout";
import { getMovementById } from "@/lib/data/movements";

interface BlockCardProps {
  block: Block;
  onAddMove: () => void;
  onCapture?: (movementId: string) => void;
}

export function BlockCard({ block, onAddMove, onCapture }: BlockCardProps) {
  const setsLabel = formatBlockSetsLabel(block);
  const isEmpty = block.movements.length === 0;

  return (
    <div className="overflow-hidden rounded shadow-[0_0_0_1px_rgba(0,0,0,.02)]">
      {/* Tonal-style header: tall black band */}
      <div className="flex h-[76px] items-center justify-between bg-inverse px-7">
        <div className="flex items-baseline gap-3">
          <span className="text-[25px] font-extrabold leading-none text-on-inverse">
            {block.name.toUpperCase()}
          </span>
          <span className="text-[17px] font-metric text-on-inverse/50">{setsLabel}</span>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-on-inverse/50 transition-colors active:text-on-inverse"
          aria-label="ブロックオプション（準備中）"
          aria-disabled="true"
        >
          ···
        </button>
      </div>

      {/* Body */}
      <div className="bg-white">
        {isEmpty ? (
          <button
            type="button"
            onClick={onAddMove}
            className="flex min-h-[180px] w-full flex-col items-center justify-center gap-3 transition-colors active:bg-surface"
          >
            <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full border-2 border-[#bfbfbf]">
              <span className="text-[46px] font-light leading-none text-[#bfbfbf]">+</span>
            </div>
            <span className="text-sm font-extrabold tracking-wide text-secondary">種目を追加</span>
          </button>
        ) : (
          <>
            {block.movements.map((config) => {
              const movement = getMovementById(config.movementId);
              if (!movement) return null;
              return (
                <div
                  key={config.movementId}
                  className="grid min-h-[76px] grid-cols-[64px_1fr_auto] items-center gap-3.5 border-t border-border px-3.5"
                >
                  <div className="flex h-12 w-16 items-center justify-center rounded-[10px] bg-neutral-200">
                    <span className="text-xs text-muted">{movement.categoryJa}</span>
                  </div>
                  <div className="min-w-0 py-3">
                    <p className="text-[17px] font-bold tracking-tight">{movement.nameJa}</p>
                    <p className="mt-0.5 text-[12px] text-secondary">
                      {formatMovementMeta(config)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onCapture && (
                      <button
                        type="button"
                        onClick={() => onCapture(config.movementId)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all active:bg-surface active:scale-95"
                        aria-label={`${movement.nameJa}を撮影`}
                      >
                        <Camera size={15} strokeWidth={1.5} />
                      </button>
                    )}
                    <div className="flex h-5 w-5 items-center justify-center text-muted">⠿</div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={onAddMove}
              className="flex w-full items-center justify-center gap-2 border-t border-border py-4 text-sm font-extrabold text-secondary transition-colors active:bg-surface"
            >
              <span className="text-lg leading-none">+</span>
              種目を追加
            </button>
          </>
        )}
      </div>
    </div>
  );
}
