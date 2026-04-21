import type { Movement } from "@/types/workout";

export const MOVEMENTS: Movement[] = [
  { id: "bench-press", nameJa: "ベンチプレス", descJa: "仰向けでバーを押し上げ、胸を鍛える", categoryJa: "胸", defaultReps: 8, defaultSets: 3, defaultWeight: 40 },
  { id: "incline-bench-press", nameJa: "インクラインプレス", descJa: "斜めの角度で胸の上部を鍛える", categoryJa: "胸", defaultReps: 8, defaultSets: 3, defaultWeight: 30 },
  { id: "cable-fly", nameJa: "ケーブルフライ", descJa: "ケーブルで胸を広げて絞る動き", categoryJa: "胸", defaultReps: 12, defaultSets: 3, defaultWeight: 10 },
  { id: "lat-pulldown", nameJa: "ラットプルダウン", descJa: "上からバーを引き下げ、背中を広げる", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 40 },
  { id: "seated-row", nameJa: "シーテッドロウ", descJa: "座って前からバーを引き、背中を厚くする", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 35 },
  { id: "bent-over-row", nameJa: "ベントオーバーロウ", descJa: "前かがみでバーを引き上げ、背中全体を鍛える", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 40 },
  { id: "deadlift", nameJa: "デッドリフト", descJa: "床からバーを持ち上げ、背中と脚を鍛える", categoryJa: "背中", defaultReps: 6, defaultSets: 3, defaultWeight: 60 },
  { id: "shoulder-press", nameJa: "ショルダープレス", descJa: "頭上にバーを押し上げ、肩全体を鍛える", categoryJa: "肩", defaultReps: 10, defaultSets: 3, defaultWeight: 20 },
  { id: "lateral-raise", nameJa: "サイドレイズ", descJa: "腕を横に上げて、肩の丸みをつくる", categoryJa: "肩", defaultReps: 15, defaultSets: 3, defaultWeight: 8 },
  { id: "face-pull", nameJa: "フェイスプル", descJa: "ケーブルを顔の方へ引き、肩の後ろを鍛える", categoryJa: "肩", defaultReps: 15, defaultSets: 3, defaultWeight: 12 },
  { id: "biceps-curl", nameJa: "アームカール", descJa: "ダンベルを持ち上げて、力こぶを鍛える", categoryJa: "腕", defaultReps: 12, defaultSets: 3, defaultWeight: 10 },
  { id: "hammer-curl", nameJa: "ハンマーカール", descJa: "縦持ちで腕を曲げ、前腕も一緒に鍛える", categoryJa: "腕", defaultReps: 12, defaultSets: 3, defaultWeight: 10 },
  { id: "triceps-pushdown", nameJa: "トライセプスプッシュダウン", descJa: "ケーブルを押し下げ、二の腕の裏を鍛える", categoryJa: "腕", defaultReps: 12, defaultSets: 3, defaultWeight: 15 },
  { id: "squat", nameJa: "スクワット", descJa: "しゃがんで立ち上がる、脚全体の王道種目", categoryJa: "脚", defaultReps: 8, defaultSets: 3, defaultWeight: 50 },
  { id: "leg-press", nameJa: "レッグプレス", descJa: "マシンで脚を押し出し、太ももとお尻を鍛える", categoryJa: "脚", defaultReps: 10, defaultSets: 3, defaultWeight: 80 },
  { id: "leg-extension", nameJa: "レッグエクステンション", descJa: "膝を伸ばして太ももの前を集中的に鍛える", categoryJa: "脚", defaultReps: 12, defaultSets: 3, defaultWeight: 30 },
  { id: "romanian-deadlift", nameJa: "ルーマニアンデッドリフト", descJa: "膝を軽く曲げてバーを下ろし、太もも裏を鍛える", categoryJa: "脚", defaultReps: 10, defaultSets: 3, defaultWeight: 40 },
  { id: "calf-raise", nameJa: "カーフレイズ", descJa: "つま先立ちを繰り返し、ふくらはぎを鍛える", categoryJa: "脚", defaultReps: 15, defaultSets: 3, defaultWeight: 30 },
];

export function getMovementById(id: string): Movement | undefined {
  return MOVEMENTS.find((m) => m.id === id);
}

export function getMovementsByCategory(): Map<string, Movement[]> {
  const order = ["胸", "背中", "肩", "腕", "脚"];
  const map = new Map<string, Movement[]>();
  for (const cat of order) map.set(cat, []);
  for (const m of MOVEMENTS) {
    map.get(m.categoryJa)?.push(m);
  }
  return map;
}

export function searchMovements(query: string): Movement[] {
  if (!query.trim()) return [...MOVEMENTS];
  const q = query.toLowerCase();
  return MOVEMENTS.filter(
    (m) => m.nameJa.includes(q) || m.descJa.includes(q) || m.categoryJa.includes(q),
  );
}
