import { MOVEMENTS } from "./movements";

export const EXERCISE_TYPES = MOVEMENTS.map((m) => m.nameJa);

export type ExerciseType = string;
