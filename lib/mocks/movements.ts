import type { Movement } from "@/types/workout";

export const MOVEMENTS: Movement[] = [
  // ── 胸 ──
  { id: "bench-press", nameJa: "ベンチプレス", descJa: "仰向けでバーを押し上げ、胸を鍛える", categoryJa: "胸", defaultReps: 8, defaultSets: 3, defaultWeight: 40 },
  { id: "incline-bench-press", nameJa: "インクラインプレス", descJa: "斜めの角度で胸の上部を鍛える", categoryJa: "胸", defaultReps: 8, defaultSets: 3, defaultWeight: 30 },
  { id: "cable-fly", nameJa: "ケーブルフライ", descJa: "ケーブルで胸を広げて絞る動き", categoryJa: "胸", defaultReps: 12, defaultSets: 3, defaultWeight: 10 },
  { id: "dumbbell-fly", nameJa: "ダンベルフライ", descJa: "ダンベルを左右に開いて胸をストレッチさせる", categoryJa: "胸", defaultReps: 10, defaultSets: 3, defaultWeight: 12 },
  { id: "dips-chest", nameJa: "ディップス(胸)", descJa: "前傾姿勢で体を沈め、胸の下部を狙う", categoryJa: "胸", defaultReps: 10, defaultSets: 3, defaultWeight: 0 },
  { id: "machine-chest-press", nameJa: "チェストプレス(マシン)", descJa: "マシンで安定した軌道で胸を押す", categoryJa: "胸", defaultReps: 10, defaultSets: 3, defaultWeight: 30 },
  { id: "push-up", nameJa: "プッシュアップ", descJa: "自重で胸・肩・三頭を鍛える基本種目", categoryJa: "胸", defaultReps: 15, defaultSets: 3, defaultWeight: 0 },

  // ── 背中 ──
  { id: "lat-pulldown", nameJa: "ラットプルダウン", descJa: "上からバーを引き下げ、背中を広げる", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 40 },
  { id: "seated-row", nameJa: "シーテッドロウ", descJa: "座って前からバーを引き、背中を厚くする", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 35 },
  { id: "bent-over-row", nameJa: "ベントオーバーロウ", descJa: "前かがみでバーを引き上げ、背中全体を鍛える", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 40 },
  { id: "deadlift", nameJa: "デッドリフト", descJa: "床からバーを持ち上げ、背中と脚を鍛える", categoryJa: "背中", defaultReps: 6, defaultSets: 3, defaultWeight: 60 },
  { id: "chin-up", nameJa: "チンニング(懸垂)", descJa: "バーにぶら下がり体を引き上げ、広背筋を鍛える", categoryJa: "背中", defaultReps: 8, defaultSets: 3, defaultWeight: 0 },
  { id: "one-arm-row", nameJa: "ワンハンドロウ", descJa: "片手でダンベルを引き、背中の左右差を補う", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 20 },
  { id: "cable-row", nameJa: "ケーブルロウ", descJa: "ケーブルを引いて背中の厚みをつくる", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 30 },
  { id: "t-bar-row", nameJa: "Tバーロウ", descJa: "Tバーを引き上げ、背中の中央を厚くする", categoryJa: "背中", defaultReps: 8, defaultSets: 3, defaultWeight: 30 },
  { id: "pullover", nameJa: "プルオーバー", descJa: "頭上からダンベルを引き下ろし、広背筋と胸を伸ばす", categoryJa: "背中", defaultReps: 10, defaultSets: 3, defaultWeight: 15 },

  // ── 肩 ──
  { id: "shoulder-press", nameJa: "ショルダープレス", descJa: "頭上にバーを押し上げ、肩全体を鍛える", categoryJa: "肩", defaultReps: 10, defaultSets: 3, defaultWeight: 20 },
  { id: "lateral-raise", nameJa: "サイドレイズ", descJa: "腕を横に上げて、肩の丸みをつくる", categoryJa: "肩", defaultReps: 15, defaultSets: 3, defaultWeight: 8 },
  { id: "face-pull", nameJa: "フェイスプル", descJa: "ケーブルを顔の方へ引き、肩の後ろを鍛える", categoryJa: "肩", defaultReps: 15, defaultSets: 3, defaultWeight: 12 },
  { id: "arnold-press", nameJa: "アーノルドプレス", descJa: "回旋しながら押し上げ、肩を全方向から刺激する", categoryJa: "肩", defaultReps: 10, defaultSets: 3, defaultWeight: 14 },
  { id: "rear-delt-fly", nameJa: "リアデルトフライ", descJa: "前傾で腕を開き、肩の後部を集中的に鍛える", categoryJa: "肩", defaultReps: 12, defaultSets: 3, defaultWeight: 8 },
  { id: "upright-row", nameJa: "アップライトロウ", descJa: "バーを体に沿って引き上げ、僧帽筋と三角筋を刺激する", categoryJa: "肩", defaultReps: 10, defaultSets: 3, defaultWeight: 20 },
  { id: "front-raise", nameJa: "フロントレイズ", descJa: "腕を前方に上げて、肩の前部を鍛える", categoryJa: "肩", defaultReps: 12, defaultSets: 3, defaultWeight: 8 },

  // ── 腕 ──
  { id: "biceps-curl", nameJa: "アームカール", descJa: "ダンベルを持ち上げて、力こぶを鍛える", categoryJa: "腕", defaultReps: 12, defaultSets: 3, defaultWeight: 10 },
  { id: "hammer-curl", nameJa: "ハンマーカール", descJa: "縦持ちで腕を曲げ、前腕も一緒に鍛える", categoryJa: "腕", defaultReps: 12, defaultSets: 3, defaultWeight: 10 },
  { id: "triceps-pushdown", nameJa: "トライセプスプッシュダウン", descJa: "ケーブルを押し下げ、二の腕の裏を鍛える", categoryJa: "腕", defaultReps: 12, defaultSets: 3, defaultWeight: 15 },
  { id: "preacher-curl", nameJa: "プリーチャーカール", descJa: "台に肘を固定しカールし、上腕二頭筋を集中して鍛える", categoryJa: "腕", defaultReps: 10, defaultSets: 3, defaultWeight: 10 },
  { id: "concentration-curl", nameJa: "コンセントレーションカール", descJa: "座って片腕ずつカールし、ピークを追い込む", categoryJa: "腕", defaultReps: 10, defaultSets: 3, defaultWeight: 8 },
  { id: "overhead-extension", nameJa: "オーバーヘッドエクステンション", descJa: "頭上でダンベルを下ろし、三頭筋の長頭を伸ばす", categoryJa: "腕", defaultReps: 10, defaultSets: 3, defaultWeight: 12 },
  { id: "dips-triceps", nameJa: "ディップス(三頭)", descJa: "体を垂直に沈めて三頭筋を鍛える", categoryJa: "腕", defaultReps: 10, defaultSets: 3, defaultWeight: 0 },
  { id: "skull-crusher", nameJa: "スカルクラッシャー", descJa: "仰向けで額方向にバーを下ろし、三頭筋を伸展させる", categoryJa: "腕", defaultReps: 10, defaultSets: 3, defaultWeight: 15 },
  { id: "wrist-curl", nameJa: "リストカール", descJa: "手首を巻き上げて前腕屈筋群を鍛える", categoryJa: "腕", defaultReps: 15, defaultSets: 3, defaultWeight: 8 },

  // ── 脚 ──
  { id: "squat", nameJa: "スクワット", descJa: "しゃがんで立ち上がる、脚全体の王道種目", categoryJa: "脚", defaultReps: 8, defaultSets: 3, defaultWeight: 50 },
  { id: "leg-press", nameJa: "レッグプレス", descJa: "マシンで脚を押し出し、太ももとお尻を鍛える", categoryJa: "脚", defaultReps: 10, defaultSets: 3, defaultWeight: 80 },
  { id: "leg-extension", nameJa: "レッグエクステンション", descJa: "膝を伸ばして太ももの前を集中的に鍛える", categoryJa: "脚", defaultReps: 12, defaultSets: 3, defaultWeight: 30 },
  { id: "romanian-deadlift", nameJa: "ルーマニアンデッドリフト", descJa: "膝を軽く曲げてバーを下ろし、太もも裏を鍛える", categoryJa: "脚", defaultReps: 10, defaultSets: 3, defaultWeight: 40 },
  { id: "calf-raise", nameJa: "カーフレイズ", descJa: "つま先立ちを繰り返し、ふくらはぎを鍛える", categoryJa: "脚", defaultReps: 15, defaultSets: 3, defaultWeight: 30 },
  { id: "leg-curl", nameJa: "レッグカール", descJa: "膝を曲げてハムストリングスを集中的に鍛える", categoryJa: "脚", defaultReps: 12, defaultSets: 3, defaultWeight: 25 },
  { id: "bulgarian-split-squat", nameJa: "ブルガリアンスクワット", descJa: "後ろ足を台に乗せ、片脚ずつ深くしゃがむ", categoryJa: "脚", defaultReps: 10, defaultSets: 3, defaultWeight: 16 },
  { id: "hip-thrust", nameJa: "ヒップスラスト", descJa: "背中をベンチに預け、お尻を突き上げて大臀筋を鍛える", categoryJa: "脚", defaultReps: 10, defaultSets: 3, defaultWeight: 40 },
  { id: "goblet-squat", nameJa: "ゴブレットスクワット", descJa: "ダンベルを胸の前で持ちスクワット、フォーム習得にも最適", categoryJa: "脚", defaultReps: 12, defaultSets: 3, defaultWeight: 16 },
  { id: "sissy-squat", nameJa: "シシースクワット", descJa: "体を後方に倒しながら膝を曲げ、大腿四頭筋を強烈に伸ばす", categoryJa: "脚", defaultReps: 10, defaultSets: 3, defaultWeight: 0 },

  // ── 腹 ──
  { id: "crunch", nameJa: "クランチ", descJa: "仰向けで上体を丸め、腹直筋の上部を鍛える", categoryJa: "腹", defaultReps: 15, defaultSets: 3, defaultWeight: 0 },
  { id: "leg-raise", nameJa: "レッグレイズ", descJa: "仰向けで脚を上げ、腹直筋の下部を鍛える", categoryJa: "腹", defaultReps: 12, defaultSets: 3, defaultWeight: 0 },
  { id: "plank", nameJa: "プランク", descJa: "肘で体を支え体幹をキープ、腹筋群を等尺性収縮で鍛える", categoryJa: "腹", defaultReps: 1, defaultSets: 3, defaultWeight: 0 },
  { id: "ab-roller", nameJa: "アブローラー", descJa: "ローラーを転がし体を伸ばして腹筋全体を高負荷で鍛える", categoryJa: "腹", defaultReps: 10, defaultSets: 3, defaultWeight: 0 },
  { id: "cable-crunch", nameJa: "ケーブルクランチ", descJa: "ケーブルを使って膝立ちで体を丸め、腹筋に負荷をかける", categoryJa: "腹", defaultReps: 12, defaultSets: 3, defaultWeight: 20 },
  { id: "hanging-leg-raise", nameJa: "ハンギングレッグレイズ", descJa: "バーにぶら下がって脚を上げ、腹直筋下部を強く刺激する", categoryJa: "腹", defaultReps: 10, defaultSets: 3, defaultWeight: 0 },

  // ── 全身 ──
  { id: "clean", nameJa: "クリーン", descJa: "床からバーを一気に肩まで引き上げる爆発的な全身種目", categoryJa: "全身", defaultReps: 5, defaultSets: 3, defaultWeight: 40 },
  { id: "snatch", nameJa: "スナッチ", descJa: "床から頭上まで一動作でバーを挙上する高度な全身種目", categoryJa: "全身", defaultReps: 3, defaultSets: 5, defaultWeight: 30 },
  { id: "kettlebell-swing", nameJa: "ケトルベルスイング", descJa: "ケトルベルを股下から前方に振り上げ、ヒップヒンジを鍛える", categoryJa: "全身", defaultReps: 15, defaultSets: 3, defaultWeight: 16 },
  { id: "burpee", nameJa: "バーピー", descJa: "しゃがみ→腕立て→ジャンプを連続で行う全身コンディショニング", categoryJa: "全身", defaultReps: 10, defaultSets: 3, defaultWeight: 0 },
  { id: "farmers-walk", nameJa: "ファーマーズウォーク", descJa: "重いダンベルを両手に持ち歩くことで握力・体幹・全身を鍛える", categoryJa: "全身", defaultReps: 1, defaultSets: 3, defaultWeight: 24 },
];

export function getMovementById(id: string): Movement | undefined {
  return MOVEMENTS.find((m) => m.id === id);
}

export function getMovementsByCategory(): Map<string, Movement[]> {
  const order = ["胸", "背中", "肩", "腕", "脚", "腹", "全身"];
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
