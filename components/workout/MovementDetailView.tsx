"use client";

import { ArrowLeft } from "lucide-react";
import type { Movement, MovementConfig } from "@/types/workout";
import { Toggle } from "./Toggle";
import { Stepper } from "./Stepper";

interface MovementDetailViewProps {
  movement: Movement;
  config: MovementConfig;
  onConfigChange: (config: MovementConfig) => void;
  onAdd: () => void;
  onBack: () => void;
}

export function MovementDetailView({
  movement,
  config,
  onConfigChange,
  onAdd,
  onBack,
}: MovementDetailViewProps) {
  const updateSetWeight = (i: number, v: number) => {
    const next = [...config.perSetWeight];
    next[i] = Math.max(0, v);
    onConfigChange({ ...config, perSetWeight: next });
  };

  const updateSetReps = (i: number, v: number) => {
    const next = [...config.perSetReps];
    next[i] = Math.max(1, v);
    onConfigChange({ ...config, perSetReps: next });
  };

  const handleSetsChange = (sets: number) => {
    let perSetReps: number[];
    let perSetWeight: number[];
    if (sets > config.perSetReps.length) {
      const lastRep = config.perSetReps[config.perSetReps.length - 1] ?? config.reps;
      const lastWeight =
        config.perSetWeight[config.perSetWeight.length - 1] ?? movement.defaultWeight;
      perSetReps = [
        ...config.perSetReps,
        ...Array.from({ length: sets - config.perSetReps.length }, () => lastRep),
      ];
      perSetWeight = [
        ...config.perSetWeight,
        ...Array.from({ length: sets - config.perSetWeight.length }, () => lastWeight),
      ];
    } else {
      perSetReps = config.perSetReps.slice(0, sets);
      perSetWeight = config.perSetWeight.slice(0, sets);
    }
    onConfigChange({ ...config, sets, perSetReps, perSetWeight });
  };

  return (
    <div className="flex h-dvh flex-col bg-surface">
      {/* Header — アイコンバック + 中央タイトル */}
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
          <h2 className="flex-1 truncate text-center text-[15px] font-bold">
            {movement.nameJa}
          </h2>
          <div className="h-10 w-10" />
        </div>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* 種目情報 */}
        <div className="mt-2 rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <span className="inline-block rounded-full bg-chip px-2.5 py-0.5 text-[10px] font-bold text-secondary">
            {movement.categoryJa}
          </span>
          <h3 className="mt-2 text-[20px] font-bold tracking-tight">{movement.nameJa}</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-secondary">{movement.descJa}</p>
        </div>

        {/* ウォームアップ */}
        <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="min-w-0 flex-1 pr-3">
              <span className="text-[14px] font-bold">ウォームアップ</span>
              <p className="mt-0.5 text-[11px] text-secondary">
                最初の1セットを軽めの負荷で行います
              </p>
            </div>
            <Toggle
              enabled={config.warmupEnabled}
              onChange={(v) => onConfigChange({ ...config, warmupEnabled: v })}
            />
          </div>
        </div>

        {/* セット数コントロール */}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <span className="text-[14px] font-bold">セット数</span>
          <Stepper value={config.sets} onChange={handleSetsChange} min={1} max={10} />
        </div>

        {/* セット一覧: 重量 × 回数 */}
        <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
            <span className="w-10 text-[10px] font-bold tracking-wide text-muted">
              セット
            </span>
            <span className="flex-1 text-center text-[10px] font-bold tracking-wide text-muted">
              重量 (kg)
            </span>
            <span className="flex-1 text-center text-[10px] font-bold tracking-wide text-muted">
              回数
            </span>
          </div>

          {config.perSetReps.map((reps, i) => {
            const isWarmup = config.warmupEnabled && i === 0;
            const weight = config.perSetWeight[i] ?? 0;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex w-10 items-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-chip text-[11px] font-bold">
                    {i + 1}
                  </span>
                  {isWarmup && (
                    <span className="text-[9px] font-bold tracking-wide text-muted">W</span>
                  )}
                </div>
                <div className="flex flex-1 justify-center">
                  <Stepper
                    value={weight}
                    onChange={(v) => updateSetWeight(i, v)}
                    min={0}
                    max={500}
                    step={2.5}
                    allowDecimal
                  />
                </div>
                <div className="flex flex-1 justify-center">
                  <Stepper
                    value={reps}
                    onChange={(v) => updateSetReps(i, v)}
                    min={1}
                    max={50}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-3 px-1 text-[11px] text-muted">
          数字をタップで直接入力、± で細かく調整できます
        </p>
      </div>

      {/* CTA */}
      <div className="shrink-0 bg-surface px-5 pb-8 pt-3">
        <button
          type="button"
          onClick={onAdd}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-inverse text-[15px] font-bold tracking-wide text-on-inverse shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 active:scale-[0.98] active:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
        >
          この種目を追加
        </button>
      </div>
    </div>
  );
}
