# UI デザインガイドライン

**コンセプト**: 静かで上質なフィットネス UI

白をベースに、黒とグレーで情報を整理し、黄緑を最小限の強調色として使う。派手さではなく、整った余白と写真の見え方で世界観を作る。写真を外しても成立するよう、UI 自体はミニマルに保つ。

**関連**: [requirements/03-nonfunctional.md](../requirements/03-nonfunctional.md)、[development/07-coding-standards.md](../development/07-coding-standards.md)

---

## 0. デザイン・トークン（正）

`tailwind.config.ts` は以下に一致させる。

### カラー

| トークン | 値 | Tailwind | 用途 |
|----------|-----|----------|------|
| `background.primary` | `#FFFFFF` | `bg-app` | 画面全体の白背景 |
| `background.secondary` | `#F5F5F7` | `bg-surface` | カード・入力・BottomNav の底上げ |
| `accent` | `#DCFC67` | `bg-accent` / `border-accent` / `ring-accent` | **塗り・枠・細いインジケーター**のみ。白／薄グレー上の **文字色には使わない**（コントラスト不足） |
| `text.primary` | `#1A1A1A` | `text-primary` | 黒に近い濃いグレー。主要文字 |
| `text.secondary` | `#6B6B6B` | `text-secondary` | 補助文字 |
| `text.muted` | `#B0B0B0` | `text-muted` | さらに弱い説明・キャプション |
| `border` | `#EBEBEB` | `border-border` | かなり薄い区切り線 |
| `danger` | `#EF4444` | `text-danger` / `bg-danger` | エラー・削除系 |
| `chart.line` | `#DCFC67` | — | グラフの線（accent と同値） |
| `chart.fill` | `rgba(220,252,103,0.12)` | `bg-chart-fill` | グラフの塗り |
| `chart.neutral` | `#D4D4D4` | `bg-chart-neutral` | ニュートラルバー |

### 配色の掟

- **`text-accent`（黄緑の文字）は禁止**。白や `surface` の上ではほぼ読めない。**リンク・ラベル・選択中テキストは必ず `text-primary`（または `text-secondary`）**。
- ブランドの黄緑は **`bg-accent` のボタン／帯**、**下線インジケーター**（`bg-accent` の細いバー）、**フォーカスリング**、**チャート線**などに限定する。
- **1 画面の中で黄緑を広く使いすぎない**。強調箇所は 1〜2 個まで。
- まず黒で整理し、最後に黄緑を置く。

### タイポグラフィ

| 用途 | weight | Tailwind | 備考 |
|------|--------|----------|------|
| title（画面見出し・セクション） | 600 | `font-title` | 中太。シンプル |
| metric（数値・KPI） | 500 | `font-metric` | 少しだけ強め、見やすく |
| label（本文・ラベル） | 400 | `font-label` | 細め・控えめ |
| caption（キャプション・小注釈） | 300 | `font-caption` | ごく細い |

フォント: Inter → Helvetica Neue → Arial → sans-serif。  
文字サイズ差は大きくしすぎず、落ち着いて見せる。**強いジャンプ率より整った階層感を優先。**

---

## 1. レイアウト原則

- 画面全体は白背景。
- 上部に **余白をしっかり取った** ヘッダー（`pt-12` 以上）。
- 検索欄やフィルターは主張を抑えた `bg-surface`。
- メイン領域はカードや一覧を縦に積む。
- **外側余白は広め**（`px-6` = 24px）。
- カード同士の余白は中程度（詰めすぎない、空けすぎない）。
- 下部に常設タブバー。
- 画面ごとの構成が違っても、**余白リズムは揃える**。

> **余白の考え方**: テキストと枠の距離を近づけすぎない。情報量が多い画面でも圧迫感を出さない。余白で「高級感」と「見やすさ」を出す。

---

## 2. タイポグラフィ（サイズの目安）

| 要素 | サイズ | weight |
|------|--------|--------|
| H1（画面タイトル） | `text-xl` | `font-title` (600) |
| H2（セクション） | `text-xs uppercase tracking-wider` | `font-title` (600) |
| Body | `text-sm` | `font-label` (400) |
| 数値 | `text-lg` | `font-metric` (500) |
| Caption | `text-xs` | `font-caption` (300) |

---

## 3. スペーシング

| 箇所 | 値 |
|------|----|
| ページ外側余白 | `px-6` (24px) |
| ページ上部余白 | `pt-12` (48px) |
| カード内パディング | `p-4`〜`p-5` |
| セクション間 | `space-y-8`〜`space-y-10` |
| リスト行間 | `divide-y divide-border` |
| ボタン内 | `px-5 py-3` |

---

## 4. コンポーネント共通ルール

### カード

- `bg-surface rounded-xl p-4`。ボーダーなし（背景色だけで分離）。
- 角丸は強すぎず、やわらかい印象が出る程度（`rounded-xl` = 12px）。

### ボタン

- **Primary CTA**: `bg-accent text-primary rounded-lg`。画面に 1 つだけ。
- **Secondary**: ボーダーのみ or テキストのみ。ベタ塗りを多用しない。
- **Ghost**: `text-secondary hover:text-primary`。
- タッチターゲット: `min-h-[44px]`。

### 入力フィールド

- `h-12 bg-surface rounded-xl px-4 text-sm text-primary placeholder:text-muted/60 border-0`
- フォーカス: `ring-2 ring-accent/40`
- エラー: `ring-danger`

### リスト

- 1 行ずつ `divide-y divide-border` で区切る。
- テキストは短く、詰め込みすぎない。

---

## 5. タブ・ナビゲーション

### 上部カテゴリタブ

- 細く控えめ。選択中のみ色 or 下線で差をつける。

### 下部タブバー（BottomNav）

- **白背景** に薄い境界線（`border-t border-border`）。
- アイコンは **線的でシンプル**（Lucide `strokeWidth: 1.5`）。
- アクティブ: **`text-primary`** + ラベル下に **細い `bg-accent` のバー**（`h-0.5 w-5 rounded-full`）。非アクティブ: `text-muted`。
- ラベルは `text-[10px]`。**主張は弱め**。

---

## 6. 強調のルール

- 強調は「色」だけでなく「余白」「サイズ」「位置」で作る。
- まず黒で整理し、最後に黄緑を置く。
- **強調箇所は 1 画面に 1〜2 個まで**。
- 全部目立たせないことで、目立たせたい場所が生きる。

---

## 7. 動画プレーヤー・撮影画面

- 撮影プレビューは画面の大部分を占める（`bg-black`）。
- コントロールは最小限。操作ピル: `bg-black/40 backdrop-blur`。
- 録画ボタン: アクセント色の円（`h-[68px] w-[68px]`）。枠 + 内部塗り。
- **16 分割グリッド**: `stroke-white/30`。ON/OFF ピルは撮影画面右上。

---

## 8. 質感・印象

- スポーティーだがうるさくない。
- 女性向けにも男性向けにも寄りすぎない **中性的設計**。
- ジム感はあるが、筋肉アプリっぽい圧は強くない。
- ライフスタイル寄りの上品なフィットネス感。
- 写真なしでも成立するよう、UI パーツ自体を **静かに美しく整える**。

---

## 9. アニメーション・トランジション

- `transition-colors duration-150` をボタン・リンクに。
- `active:scale-[0.98]` をタップ時の軽いフィードバックに。
- ページ遷移アニメは MVP では不要。
