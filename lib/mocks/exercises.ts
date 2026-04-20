export const EXERCISE_TYPES = [
  "ベンチプレス",
  "スクワット",
  "デッドリフト",
  "オーバーヘッドプレス",
  "バーベルロウ",
  "懸垂",
  "ダンベルカール",
  "レッグプレス",
  "ラットプルダウン",
  "その他",
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];
