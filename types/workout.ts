export type MovementConfig = {
  movementId: string;
  reps: number;
  sets: number;
  warmupEnabled: boolean;
  perSetReps: number[];
  perSetWeight: number[];
};

export type Block = {
  id: string;
  name: string;
  setsLabel: string;
  movements: MovementConfig[];
};

export type WorkoutDraft = {
  title: string;
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
  return parts.join(" · ");
}
