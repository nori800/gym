"use client";

import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import type { Movement, MovementConfig, WeightMode, AssistanceType } from "@/types/workout";
import { WEIGHT_MODES, ASSISTANCE_TYPES } from "@/types/workout";
import { Toggle } from "./Toggle";
import { Stepper } from "./Stepper";

type Segment = "overview" | "muscles";

interface MovementDetailViewProps {
  movement: Movement;
  config: MovementConfig;
  onConfigChange: (config: MovementConfig) => void;
  onAdd: () => void;
  onBack: () => void;
}

const MUSCLE_MAP: Record<string, string[]> = {
  "胸": ["大胸筋上部", "大胸筋中部", "大胸筋下部", "三角筋前部"],
  "背中": ["広背筋", "僧帽筋", "脊柱起立筋", "大円筋"],
  "肩": ["三角筋前部", "三角筋中部", "三角筋後部"],
  "腕": ["上腕二頭筋", "上腕三頭筋", "前腕筋群"],
  "脚": ["大腿四頭筋", "ハムストリングス", "大臀筋", "下腿三頭筋"],
};

export function MovementDetailView({
  movement,
  config,
  onConfigChange,
  onAdd,
  onBack,
}: MovementDetailViewProps) {
  const [segment, setSegment] = useState<Segment>("overview");
  const [setsExpanded, setSetsExpanded] = useState(true);
  const [weightSectionExpanded, setWeightSectionExpanded] = useState(false);
  const [assistanceSectionExpanded, setAssistanceSectionExpanded] = useState(false);
  const [weightModeHelpOpen, setWeightModeHelpOpen] = useState(false);
  const [assistanceHelpOpen, setAssistanceHelpOpen] = useState(false);

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

  const muscles = MUSCLE_MAP[movement.categoryJa] ?? [];
  const selectedWeightMode = WEIGHT_MODES.find((m) => m.key === config.weightMode);
  const selectedAssistance = ASSISTANCE_TYPES.find((a) => a.key === config.assistanceType);

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
          <h2 className="flex-1 truncate text-center text-[15px] font-bold">
            {movement.nameJa}
          </h2>
          <div className="h-10 w-10" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Movement info card */}
        <div className="mt-2 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          {/* Thumbnail placeholder */}
          <div className="flex h-40 items-center justify-center bg-neutral-200">
            <span className="text-sm text-muted">{movement.categoryJa}</span>
          </div>

          {/* Segment tabs */}
          <div className="flex border-b border-border" role="tablist" aria-label="種目情報">
            <button
              type="button"
              role="tab"
              aria-selected={segment === "overview"}
              onClick={() => setSegment("overview")}
              className={`flex-1 py-3 text-center text-[13px] font-extrabold tracking-wide transition-colors ${
                segment === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted"
              }`}
            >
              概要
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={segment === "muscles"}
              onClick={() => setSegment("muscles")}
              className={`flex-1 py-3 text-center text-[13px] font-extrabold tracking-wide transition-colors ${
                segment === "muscles"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted"
              }`}
            >
              対象筋
            </button>
          </div>

          {segment === "overview" ? (
            <div className="p-[18px]">
              <span className="inline-block rounded-full bg-chip px-2.5 py-0.5 text-[10px] font-extrabold text-secondary">
                {movement.categoryJa}
              </span>
              <h3 className="mt-2 text-xl font-bold tracking-tight">{movement.nameJa}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">{movement.descJa}</p>
            </div>
          ) : (
            <div className="p-[18px]">
              <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
                主に鍛えられる筋肉
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {muscles.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-chip px-3 py-1.5 text-[12px] font-bold text-primary"
                  >
                    {m}
                  </span>
                ))}
              </div>
              {muscles.length === 0 && (
                <p className="mt-3 text-sm text-secondary">対象筋情報は準備中です</p>
              )}
            </div>
          )}
        </div>

        {/* Warmup toggle */}
        <div className="mt-4 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <div className="flex min-h-[62px] items-center justify-between px-[18px]">
            <div className="min-w-0 flex-1 pr-3">
              <span className="text-lg font-semibold">ウォームアップ</span>
              <p className="mt-0.5 text-[12px] text-secondary">
                最初の1セットを軽めの負荷で行います
              </p>
            </div>
            <Toggle
              enabled={config.warmupEnabled}
              onChange={(v) => onConfigChange({ ...config, warmupEnabled: v })}
            />
          </div>
        </div>

        {/* Weight modes — collapsed by default */}
        <div className="mt-6 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <button
            type="button"
            onClick={() => {
              setWeightSectionExpanded((p) => {
                const next = !p;
                if (!next) {
                  setWeightModeHelpOpen(false);
                }
                return next;
              });
            }}
            className="flex min-h-[52px] w-full items-center justify-between gap-3 px-[18px] py-3 text-left transition-colors active:bg-surface"
            aria-expanded={weightSectionExpanded}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-title uppercase tracking-[0.12em] text-muted">ウェイトモード</p>
              <p className="mt-0.5 truncate text-sm font-bold text-primary">
                {selectedWeightMode?.label ?? "—"}
              </p>
            </div>
            {weightSectionExpanded ? (
              <ChevronUp size={18} strokeWidth={1.5} className="shrink-0 text-secondary" />
            ) : (
              <ChevronDown size={18} strokeWidth={1.5} className="shrink-0 text-secondary" />
            )}
          </button>
          {weightSectionExpanded && (
            <div className="border-t border-border px-[18px] pb-4 pt-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] leading-relaxed text-secondary">
                  セットの実施方法を選べます。迷ったら「ノーマル」でOK。
                </p>
                <button
                  type="button"
                  onClick={() => setWeightModeHelpOpen((p) => !p)}
                  className="shrink-0 rounded-full p-1 text-muted transition-colors active:bg-chip"
                  aria-label="ウェイトモードの説明を開く"
                  aria-expanded={weightModeHelpOpen}
                >
                  <HelpCircle size={15} strokeWidth={1.5} />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {WEIGHT_MODES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onConfigChange({ ...config, weightMode: key as WeightMode })}
                    className={`flex min-h-[44px] items-center justify-center rounded-[14px] text-[13px] font-extrabold tracking-wide transition-all duration-150 active:scale-[0.97] ${
                      config.weightMode === key
                        ? "bg-inverse text-on-inverse shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                        : "bg-chip text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.06)]"
                    }`}
                    aria-pressed={config.weightMode === key}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selectedWeightMode && (
                <p className="mt-2 text-[12px] leading-relaxed text-secondary">{selectedWeightMode.desc}</p>
              )}
              {weightModeHelpOpen && (
                <div className="mt-3 rounded-[14px] bg-chip p-3.5 space-y-2.5">
                  {WEIGHT_MODES.map(({ label, desc }) => (
                    <div key={label}>
                      <p className="text-[12px] font-bold text-primary">{label}</p>
                      <p className="text-[11px] leading-relaxed text-secondary">{desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assistance — collapsed by default */}
        <div className="mt-3 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <button
            type="button"
            onClick={() => {
              setAssistanceSectionExpanded((p) => {
                const next = !p;
                if (!next) {
                  setAssistanceHelpOpen(false);
                }
                return next;
              });
            }}
            className="flex min-h-[52px] w-full items-center justify-between gap-3 px-[18px] py-3 text-left transition-colors active:bg-surface"
            aria-expanded={assistanceSectionExpanded}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-title uppercase tracking-[0.12em] text-muted">アシスタンス</p>
              <p className="mt-0.5 truncate text-sm font-bold text-primary">
                {selectedAssistance?.label ?? "—"}
              </p>
            </div>
            {assistanceSectionExpanded ? (
              <ChevronUp size={18} strokeWidth={1.5} className="shrink-0 text-secondary" />
            ) : (
              <ChevronDown size={18} strokeWidth={1.5} className="shrink-0 text-secondary" />
            )}
          </button>
          {assistanceSectionExpanded && (
            <div className="border-t border-border px-[18px] pb-4 pt-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] leading-relaxed text-secondary">
                  パートナーの補助を使うかどうかの記録です。
                </p>
                <button
                  type="button"
                  onClick={() => setAssistanceHelpOpen((p) => !p)}
                  className="shrink-0 rounded-full p-1 text-muted transition-colors active:bg-chip"
                  aria-label="アシスタンスの説明を開く"
                  aria-expanded={assistanceHelpOpen}
                >
                  <HelpCircle size={15} strokeWidth={1.5} />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {ASSISTANCE_TYPES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onConfigChange({ ...config, assistanceType: key as AssistanceType })}
                    className={`flex min-h-[44px] items-center justify-center rounded-[14px] text-[13px] font-extrabold tracking-wide transition-all duration-150 active:scale-[0.97] ${
                      config.assistanceType === key
                        ? "bg-inverse text-on-inverse shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                        : "bg-chip text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.06)]"
                    }`}
                    aria-pressed={config.assistanceType === key}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selectedAssistance && (
                <p className="mt-2 text-[12px] leading-relaxed text-secondary">{selectedAssistance.desc}</p>
              )}
              {assistanceHelpOpen && (
                <div className="mt-3 rounded-[14px] bg-chip p-3.5 space-y-2.5">
                  {ASSISTANCE_TYPES.map(({ label, desc }) => (
                    <div key={label}>
                      <p className="text-[12px] font-bold text-primary">{label}</p>
                      <p className="text-[11px] leading-relaxed text-secondary">{desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sets & Reps section heading */}
        <div className="mt-6 px-[18px]">
          <h4 className="text-xs font-title uppercase tracking-wider text-primary">
            セット & レップス
          </h4>
          <p className="mt-1 text-[12px] leading-relaxed text-secondary">
            セット＝同じ動作の繰り返しを1まとまりにした単位。レップ（回数）＝1セット内で動作を行う回数です。例: 10回 × 3セット = 合計30回。
          </p>
        </div>

        {/* Set count control */}
        <div className="mt-2 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <div className="flex min-h-[62px] items-center justify-between px-[18px]">
            <span className="text-lg font-semibold">セット数</span>
            <Stepper value={config.sets} onChange={handleSetsChange} min={1} max={10} label="セット数" />
          </div>
        </div>

        {/* Per-set weight & reps with SHOW/HIDE */}
        <div className="mt-3 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          {/* Toggle header */}
          <button
            type="button"
            onClick={() => setSetsExpanded((p) => !p)}
            className="flex min-h-[44px] w-full items-center justify-between px-[18px] py-3 text-left transition-colors active:bg-surface"
          >
            <span className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-secondary">
              {setsExpanded ? "セット詳細を隠す" : "セット詳細を表示"}
            </span>
            {setsExpanded ? (
              <ChevronUp size={16} strokeWidth={2} className="text-secondary" />
            ) : (
              <ChevronDown size={16} strokeWidth={2} className="text-secondary" />
            )}
          </button>

          {setsExpanded && (
            <>
              {/* Column headers */}
              <div className="flex items-center gap-3 border-t border-border px-[18px] pt-3 pb-2.5">
                <span className="w-10 text-[10px] font-extrabold uppercase tracking-[0.12em] text-secondary">
                  セット
                </span>
                <span className="flex-1 text-center text-[10px] font-extrabold uppercase tracking-[0.12em] text-secondary">
                  重量 (kg)
                </span>
                <span className="flex-1 text-center text-[10px] font-extrabold uppercase tracking-[0.12em] text-secondary">
                  回数
                </span>
              </div>

              {config.perSetReps.map((reps, i) => {
                const isWarmup = config.warmupEnabled && i === 0;
                const weight = config.perSetWeight[i] ?? 0;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-t border-border px-[18px] py-3"
                  >
                    <div className="flex w-10 items-center gap-1.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-chip text-[12px] font-bold">
                        {i + 1}
                      </span>
                      {isWarmup && (
                        <span className="text-[9px] font-extrabold tracking-wider text-muted">W</span>
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
                        label={`セット${i + 1}の重量`}
                      />
                    </div>
                    <div className="flex flex-1 justify-center">
                      <Stepper
                        value={reps}
                        onChange={(v) => updateSetReps(i, v)}
                        min={1}
                        max={50}
                        label={`セット${i + 1}の回数`}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <p className="mt-3 px-1 text-xs text-muted">
          数字をタップで直接入力、± で細かく調整できます
        </p>
      </div>

      {/* Fixed CTA */}
      <div className="shrink-0 px-[22px] pb-[max(1.5rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-3">
        <button
          type="button"
          onClick={onAdd}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-inverse text-base font-extrabold tracking-wide text-on-inverse shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 active:scale-[0.98] active:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
        >
          この種目を追加
        </button>
      </div>
    </div>
  );
}
