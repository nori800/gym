import { formatRelativeCalendarDay } from "@/lib/utils/formatRecordDate";

export type WorkoutHistoryEntry = {
  id: string;
  title: string;
  date: string;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  durationMin: number;
  categories: string[];
  movements: { name: string; sets: number; reps: number; weight: number }[];
};

export const MOCK_WORKOUT_HISTORY: WorkoutHistoryEntry[] = [
  {
    id: "w-20260420",
    title: "プッシュデー",
    date: "2026-04-20",
    totalSets: 12,
    totalReps: 102,
    totalVolume: 3_840,
    durationMin: 52,
    categories: ["胸", "肩", "腕"],
    movements: [
      { name: "ベンチプレス", sets: 4, reps: 8, weight: 70 },
      { name: "インクラインプレス", sets: 4, reps: 10, weight: 30 },
      { name: "ショルダープレス", sets: 4, reps: 10, weight: 22 },
    ],
  },
  {
    id: "w-20260418",
    title: "プルデー",
    date: "2026-04-18",
    totalSets: 11,
    totalReps: 96,
    totalVolume: 4_150,
    durationMin: 48,
    categories: ["背中", "腕"],
    movements: [
      { name: "デッドリフト", sets: 3, reps: 6, weight: 90 },
      { name: "ラットプルダウン", sets: 4, reps: 10, weight: 45 },
      { name: "アームカール", sets: 4, reps: 12, weight: 14 },
    ],
  },
  {
    id: "w-20260416",
    title: "レッグデー",
    date: "2026-04-16",
    totalSets: 13,
    totalReps: 108,
    totalVolume: 5_220,
    durationMin: 55,
    categories: ["脚"],
    movements: [
      { name: "スクワット", sets: 5, reps: 8, weight: 80 },
      { name: "レッグプレス", sets: 4, reps: 10, weight: 120 },
      { name: "ルーマニアンデッドリフト", sets: 4, reps: 10, weight: 55 },
    ],
  },
  {
    id: "w-20260413",
    title: "プッシュデー",
    date: "2026-04-13",
    totalSets: 12,
    totalReps: 98,
    totalVolume: 3_720,
    durationMin: 50,
    categories: ["胸", "肩"],
    movements: [
      { name: "ベンチプレス", sets: 4, reps: 8, weight: 67.5 },
      { name: "ケーブルフライ", sets: 4, reps: 12, weight: 12 },
      { name: "サイドレイズ", sets: 4, reps: 15, weight: 9 },
    ],
  },
  {
    id: "w-20260411",
    title: "プルデー",
    date: "2026-04-11",
    totalSets: 10,
    totalReps: 88,
    totalVolume: 3_980,
    durationMin: 46,
    categories: ["背中"],
    movements: [
      { name: "ベントオーバーロウ", sets: 4, reps: 10, weight: 50 },
      { name: "シーテッドロウ", sets: 3, reps: 12, weight: 40 },
      { name: "フェイスプル", sets: 3, reps: 15, weight: 14 },
    ],
  },
];

export function getWorkoutSessionById(id: string | null | undefined) {
  if (!id) return undefined;
  return MOCK_WORKOUT_HISTORY.find((w) => w.id === id);
}

/** カードのサブ行用の相対表現（メインの日付は formatJapaneseLongDate を使う） */
export function formatWorkoutDate(dateStr: string): string {
  return formatRelativeCalendarDay(dateStr);
}
