export type WeightMode = "normal" | "eccentric" | "pause-rep" | "drop-set";
export type AssistanceType = "none" | "spotter" | "forced-rep";

export const WEIGHT_MODES: { key: WeightMode; label: string; desc: string }[] = [
  { key: "normal", label: "ノーマル", desc: "一定の重量でセットを行う基本スタイル。迷ったらこれ。" },
  { key: "pause-rep", label: "ポーズレップ", desc: "ボトムで2〜3秒静止してから挙上。フォーム改善とスティッキングポイントの強化に。" },
  { key: "eccentric", label: "スロー\u30CD\u30AC\u30C6\u30A3\u30D6", desc: "下ろす動作を3〜5秒かけてゆっくり行う。筋肥大・コントロール力アップに効果的。" },
  { key: "drop-set", label: "ドロップセット", desc: "限界が来たら重量を下げてすぐ続行。短時間で追い込みたいときに。" },
];

export const ASSISTANCE_TYPES: { key: AssistanceType; label: string; desc: string }[] = [
  { key: "none", label: "なし", desc: "補助なし。自力で全レップを完遂する通常のトレーニング。" },
  { key: "spotter", label: "補助あり", desc: "トレーニングパートナーに補助してもらう前提の記録。限界を超えたい高重量セットに。" },
  { key: "forced-rep", label: "フォーストレップ", desc: "自力の限界後に補助を受けて追加レップ。筋力の壁を破るテクニック。" },
];

export type MovementConfig = {
  movementId: string;
  reps: number;
  sets: number;
  warmupEnabled: boolean;
  perSetReps: number[];
  perSetWeight: number[];
  weightMode: WeightMode;
  assistanceType: AssistanceType;
};

export type Block = {
  id: string;
  name: string;
  setsLabel: string;
  movements: MovementConfig[];
};

export type WorkoutDraft = {
  title: string;
  date: string;
  description: string;
  blocks: Block[];
};

export type Movement = {
  id: string;
  nameJa: string;
  descJa: string;
  categoryJa: string;
  defaultReps: number;
  defaultSets: number;
  defaultWeight: number;
};

export function createDefaultConfig(movement: Movement): MovementConfig {
  const perSetReps = Array.from({ length: movement.defaultSets }, () => movement.defaultReps);
  const perSetWeight = Array.from({ length: movement.defaultSets }, () => movement.defaultWeight);
  return {
    movementId: movement.id,
    reps: movement.defaultReps,
    sets: movement.defaultSets,
    warmupEnabled: false,
    perSetReps,
    perSetWeight,
    weightMode: "normal",
    assistanceType: "none",
  };
}

export function createEmptyBlock(index: number): Block {
  return {
    id: crypto.randomUUID(),
    name: `ブロック ${index + 1}`,
    setsLabel: "3セット",
    movements: [],
  };
}

export function formatBlockSetsLabel(block: Block): string {
  if (block.movements.length === 0) return "0セット";
  const first = block.movements[0];
  const warmup = first.warmupEnabled ? "W/U + " : "";
  return `${warmup}${first.sets}セット`;
}

export function formatMovementMeta(config: MovementConfig): string {
  const maxWeight = Math.max(...config.perSetWeight);
  const totalReps = config.perSetReps.reduce((a, b) => a + b, 0);
  const parts: string[] = [];
  if (maxWeight > 0) parts.push(`${maxWeight}kg`);
  parts.push(`${config.sets}セット`);
  parts.push(`計${totalReps}回`);
  if (config.warmupEnabled) parts.push("W/U");
  if (config.weightMode !== "normal") {
    const mode = WEIGHT_MODES.find((m) => m.key === config.weightMode);
    if (mode) parts.push(mode.label);
  }
  if (config.assistanceType !== "none") {
    const assist = ASSISTANCE_TYPES.find((a) => a.key === config.assistanceType);
    if (assist) parts.push(assist.label);
  }
  return parts.join(" · ");
}
