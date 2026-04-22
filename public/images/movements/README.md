# 種目サムネイル画像

ここに種目ごとのサムネイル画像を配置してください。

## ファイル命名規則

`{movement-id}.webp` （推奨）または `.png` / `.jpg`

| movement-id | 種目名 |
|---|---|
| `bench-press` | ベンチプレス |
| `incline-bench-press` | インクラインプレス |
| `cable-fly` | ケーブルフライ |
| `lat-pulldown` | ラットプルダウン |
| `seated-row` | シーテッドロウ |
| `bent-over-row` | ベントオーバーロウ |
| `deadlift` | デッドリフト |
| `shoulder-press` | ショルダープレス |
| `lateral-raise` | サイドレイズ |
| `face-pull` | フェイスプル |
| `biceps-curl` | アームカール |
| `hammer-curl` | ハンマーカール |
| `triceps-pushdown` | トライセプスプッシュダウン |
| `squat` | スクワット |
| `leg-press` | レッグプレス |
| `leg-extension` | レッグエクステンション |
| `romanian-deadlift` | ルーマニアンデッドリフト |
| `calf-raise` | カーフレイズ |

## 推奨仕様

- サイズ: 320×240px 以上
- 形式: WebP（推奨）、PNG、JPG
- アスペクト比: 4:3
- 背景: 白 or 薄グレー（`#F5F5F7`）

## 使用箇所

画像が配置されると、以下のコンポーネントのプレースホルダが自動で差し替わります:
- `MovementListView` の行サムネイル
- `MovementDetailView` のヒーロー画像
- `BlockCard` の種目行サムネイル
