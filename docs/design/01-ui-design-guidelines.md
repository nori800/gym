# UI デザインガイドライン

本書は FormCheck の**唯一のデザインガイド**である。**見た目のトークン**、**トンマナ**、**判断基準**を 1 ファイルにまとめる。実装は `tailwind.config.ts` を本書に同期する。

**関連**: [requirements/03-nonfunctional.md](../requirements/03-nonfunctional.md)、[development/07-coding-standards.md](../development/07-coding-standards.md)  
**外部参照**: Apple [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)（以下 HIG）  
**Tonal 参照画像**: [Tonal iOS Adding a movement](../Tonal%20iOS%20Adding%20a%20movement/) `0.png`〜`10.png`

> **参照ルール**: Tonal **本体 UI のみ**を参照する。Mobbin フッター・掲載サイト由来の黒帯など**製品外 UI は無視**する。BottomNav は FormCheck 独自ルール（§7）を正とする。

---

## 1. コンセプト・トンマナ

### コンセプト

**モノクロが主役の、静かで上質なフィットネス UI。**

白とごく薄いグレーで情報を整理し、黒を「確定・主操作」のシグナルに使う。ブランドグリーン `#3eed8d` はナビ・フォーカスリング・録画ボタン・チャートなど**限定的なアクセント**にのみ使い、**矩形の CTA ボタンには使わない**。写真や動画を外しても成立するよう、UI 自体をミニマルに保つ。

### デザイン名

| 項目 | 内容 |
|------|------|
| **名前** | **Quiet Premium Fitness** |
| **タグライン** | *Monochrome first, accent minimal.* |

### トンマナ — Tonal から抽出した原則

Tonal（iOS）のムーブメント追加フロー `0.png`〜`10.png` から抽出した**構造と行動設計のルール**。色やピクセルの模倣ではなく、**優先順位・コントラスト・部品の役割**を合わせる。

| 原則 | 内容 |
|------|------|
| **モノクロ中心** | 画面の 95% 以上は白 `#FFFFFF` / 薄灰 `#F5F5F7` / 黒 `#1A1A1A` / グレー `#6B6B6B` `#999999`（`muted`）で構成する。ブランドカラーが面積を取る場面を極力作らない。 |
| **黒＝確定・主操作** | CTA（保存・追加・フィルター・OK）は**全て `bg-inverse text-on-inverse`（黒地＋白字）**。ブランドグリーンを CTA に使わない。 |
| **ブランドグリーンはインジケーター** | BottomNav のアクティブバー、フォーカスリング、録画ボタン、チャート線。矩形ボタンの塗りには使わない。 |
| **iOS グリーンはトグル専用** | ON スイッチの塗りは `#34C759`（iOS システム色）。ブランドグリーンとは別系統。 |
| **余白で高級感** | ページ外側 `px-6`、上部 `pt-12`。カード内 `p-4`〜`p-5`。詰めすぎない。 |
| **テキスト階層は太さ・サイズ・色で** | 装飾やアイコンの過多ではなく、`font-title`(600) / `font-metric`(500) / `font-label`(400) / `font-caption`(300) と `text-primary` / `text-secondary` / `text-muted` の組合せで区別。 |
| **フィードバックは静か** | 成功トーストは黒帯＋白字（`bg-inverse`）。エラーだけ `danger`。バッジや赤の乱用をしない。 |

### HIG を踏まえた補完

| HIG の原則 | FormCheck での適用 |
|------------|-------------------|
| **明瞭さ** | `text-accent`（グリーン文字）は白背景上で使わない。コントラスト比は `text-primary` / `text-secondary` で確保。 |
| **階層（譲り）** | 動画・撮影はコンテンツ優先、コントロールは `bg-black/40 backdrop-blur` 等で補助に留める。一覧は `bg-app` / `bg-surface` の差で区切る。 |
| **一貫性** | 同じ操作は同じコンポーネント。余白リズムを画面間で揃える。 |
| **フィードバック** | `transition-colors duration-150`、タップ `active:scale-[0.98]`、フォーカス `ring-accent/40`。 |
| **アクセシビリティ** | タッチターゲット最低 **44×44pt**（`min-h-[44px]`）。選択状態は色以外（チェック・太字・下線）も併用。 |

### コピー・文言

- ボタン・タイトルは**事実と次の行動**を短く。煽らない。
- 補助説明は `text-secondary` / `caption`。トーストは一言（例:「種目を追加しました」）。

---

## 2. Tonal 参照フロー — ページ別コンポーネント対応

各スクリーンショットから**Tonal 本体 UI のみ**を読み取り、FormCheck に写像する。

| PNG | 役割 | 抽出するコンポーネント |
|-----|------|------------------------|
| `0` | ワークアウト編集（空） | **X** 閉じる、**鉛筆** 編集、大タイトル、メタ情報。**ブロックカード**: 上段黒帯（`BLOCK 1` + セット概要 + `...`）＋ 下段白。空状態: **円形＋** + **ADD MOVE** ラベル |
| `1` | Movements 一覧 | **戻る** / 中央タイトル / **Select**。**下線型検索**。**アルファベット見出し**。**行**: 左サムネ・ラベル・右シェブロン。**黒カプセル FAB**: `FILTER` |
| `2` | 一覧＋選択モード | 行末に**黒丸＋白チェック**で選択表示（色以外の手がかり） |
| `3` | 種目詳細 | **戻る** / タイトル / **About**。メディア領域。**セグメント**: 選択=黒＋白字 / 非選択=灰＋黒字。**SETS & REPS** 大文字見出し。トグル・ステッパー。**下部固定黒 Primary**: `ADD MOVEMENT` |
| `4` | 説明モーダル | **暗転背景**。白カード角丸。本文灰。**OK**=黒ボタン白字 |
| `5-6` | Sets & Reps 展開 | 複数ステッパー（各セット）。**SHOW/HIDE ALL SETS**。トグル ON は **iOS グリーン** |
| `7-8` | Weight Modes / Assistance | 横並びカード: 選択=**黒地＋白アイコン＋白ラベル** / 非選択=白＋灰枠＋黒ラベル。大文字セクション見出し |
| `9` | 追加成功＋トースト | **Save** 右上。追加済み種目行（サムネ＋タイトル＋灰サマリ＋並べ替えハンドル）。**ADD BLOCK** 円形＋。**黒トースト**: `Your movement was added!` |
| `10` | 通常編集状態 | `9` からトースト消去後 |

---

## 3. デザイン・トークン（正）

`tailwind.config.ts` は以下に一致させる。

### カラー

| トークン | HEX | Tailwind | 用途 |
|----------|-----|----------|------|
| `app` | `#FFFFFF` | `bg-app` | 白背景 |
| `surface` | `#F5F5F7` | `bg-surface` | カード・入力・一覧の下敷き |
| `accent` | **`#3eed8d`** | `bg-accent` / `border-accent` / `ring-accent` | **インジケーター専用**: BottomNav バー、フォーカスリング、録画ボタン、チャート線。**矩形 CTA・文字色には使わない** |
| `inverse` | `#000000` | `bg-inverse` | **全ての Primary CTA**・FAB・ブロック黒帯・トースト・モーダル OK |
| `onInverse` | `#FFFFFF` | `text-on-inverse` | `bg-inverse` 上の文字・アイコン |
| `iosToggle` | `#34C759` | `bg-iosToggle` | スイッチ ON（iOS 緑）。accent とは別系統 |
| `primary` | `#1A1A1A` | `text-primary` | 主要テキスト |
| `secondary` | `#6B6B6B` | `text-secondary` | 補助テキスト |
| `muted` | `#999999` | `text-muted` | キャプション・弱い説明（装飾・アイコン寄り。重要文は `secondary` 以上） |
| `border` | `#EBEBEB` | `border-border` | 薄い区切り線 |
| `danger` | `#EF4444` | `text-danger` / `bg-danger` | エラー・削除 |
| `chart.line` | `#3eed8d` | — | グラフ線（accent と同値） |
| `chart.fill` | `rgba(62,237,141,0.12)` | `bg-chart-fill` | グラフ塗り |
| `chart.neutral` | `#D4D4D4` | `bg-chart-neutral` | ニュートラルバー |

### 配色の掟

1. **`text-accent` 禁止** — 白や `surface` 上で読めない。リンク・ラベルは `text-primary` / `text-secondary`。
2. **矩形 CTA は全て `bg-inverse`** — ログイン・保存・追加・フィルター・OK、全て黒地＋白字。ブランドグリーンの塗りボタンは作らない。
3. **accent（`#3eed8d`）の許可用途**: BottomNav アクティブバー、フォーカスリング（`ring-accent/40`）、録画ボタン枠＋塗り、チャート線＋塗り、ダッシュボードの「撮影して記録」カード背景。
4. **1 画面でグリーンを広く使いすぎない**。面積として使えるのは上記 3 のケースのみ。
5. **まず黒・灰で整理**し、指標・ナビまわりだけグリーンを添える。

### タイポグラフィ

| 用途 | weight | Tailwind |
|------|--------|----------|
| title（見出し・セクション） | 600 | `font-title` |
| metric（数値・KPI） | 500 | `font-metric` |
| label（本文・ラベル） | 400 | `font-label` |
| caption（注釈） | 300 | `font-caption` |

フォント: Inter → Helvetica Neue → Arial → sans-serif。ジャンプ率は控えめ。  
セクション見出しは Tonal に倣い `text-xs font-title uppercase tracking-wider text-primary` でよい。

---

## 4. タイポグラフィ（サイズの目安）

| 要素 | サイズ | weight |
|------|--------|--------|
| H1（画面タイトル） | `text-xl` | `font-title` (600) |
| H2（セクション） | `text-xs uppercase tracking-wider` | `font-title` (600) |
| Body | `text-sm` | `font-label` (400) |
| 数値 | `text-lg` | `font-metric` (500) |
| Caption | `text-xs` | `font-caption` (300) |

---

## 5. レイアウト原則

- **ページ背景は `bg-surface`（薄灰 `#F5F5F7`）を基本**とする。カード・入力欄・ブロック本体を **`bg-white`** にすることでコンテンツを浮かせる（Tonal と同じ構造）。ダッシュボード等の概要画面は `bg-app`（白）も可。
- 上部ヘッダーは `pt-12` 以上の余白。
- 検索は **下線型**（`border-b border-border rounded-none bg-transparent`）を優先。
- メイン領域はカードや一覧を縦に積む。
- **外側余白は広め**（`px-6` = 24px）。
- 下部タブバー有りの画面では FAB がタブに被らない位置に。
- **余白リズムは画面間で統一**。

> テキストと枠の距離を近づけすぎない。情報量が多い画面でも圧迫感を出さない。

### 角丸ルール（Tonal プロトタイプ準拠）

Tonal は**要素の役割ごとに角丸を変える階層設計**を使う。一律の値にはしない。

| 対象 | Tailwind | px | 根拠 |
|------|----------|----|----|
| **ブロックカード**（黒帯＋白本体） | `rounded` | 4px | 構造体。シャープで堅実 |
| **設定カード / フォームカード / 種目リスト** | `rounded-[18px]` | 18px | コンテンツ容器。丸くやわらかい |
| **モーダル** | `rounded-[18px]` | 18px | 同上 |
| **CTA ボタン（保存・追加）** | `rounded-xl` | 12px | アクション要素 |
| **選択チップ（Weight Mode 等）** | `rounded-xl` | 12px | 同上 |
| **セグメントコンテナ** | `rounded-[14px]` | 14px | ピル風 |
| **セグメント（個別）** | `rounded-[10px]` | 10px | コンテナ内部 |
| **ステッパー** | `rounded-[10px]` | 10px | コントロール |
| **サムネイル** | `rounded-[10px]` | 10px | メディア |
| **FAB / トースト** | `rounded-full` | ピル | 浮遊要素 |
| **録画ボタン** | `rounded-full` | 円 | 特殊 |
| **BottomNav バー** | `rounded-full` | インジケーター | 装飾 |

### ラベル・文言ルール

- **基本は日本語**。英語を無理に使わない。日本語のほうがユーザーに自然。
- RPE など英語が標準のフィットネス用語はそのまま英語で OK。
- **（任意）表記は削除**。入力が任意であることは placeholder やレイアウトで暗示する。
- **ラベルは短く**。説明文は `text-muted` の caption で必要なときだけ。

### 入力フォーム構造（Tonal 準拠）

入力画面は**カード行レイアウト**を使う。個別ラベル＋入力フィールドを縦に積むのではなく、白カード内にラベル（左）＋コントロール（右）の行を `divide-y` で積む。

- 種目セレクト: 単独の白カード `rounded-md`
- メトリクス（重量・回数・セット・RPE）: 白カードに行を詰め、各行は `px-4 py-3`、行間は `divide-y divide-border`
- 数値入力: **ステッパーコントロール**（`[- | value | +]`）を使い、Tonal のインタラクションに揃える
- メモ: 単独の白カードに `textarea`
- CTA: `bg-inverse rounded-md min-h-[44px]`

---

## 6. スペーシング

| 箇所 | 値 |
|------|----|
| ページ外側余白 | `px-6` (24px) |
| ページ上部余白 | `pt-12` (48px) |
| カード内 | `p-4`〜`p-5` |
| セクション間 | `space-y-8`〜`space-y-10` |
| リスト行間 | `divide-y divide-border` |
| ボタン内 | `px-5 py-3` |

---

## 7. コンポーネント共通ルール（Tonal プロトタイプ準拠）

### ブロックカード

- 外枠: `rounded overflow-hidden`（4px）、`box-shadow: 0 0 0 1px rgba(0,0,0,.02)`
- **ヘッダー**: `bg-inverse text-on-inverse h-[76px] px-7`。左に `BLOCK 1`（font-size 25px, weight 800）＋ `3 Sets`（17px, 500）。右に `...`。
- **ボディ**: `bg-white`。空状態は中央に**円形＋**（78px, `border-2 border-[#bfbfbf]`）＋ 下ラベル `ADD MOVE`（14px, weight 800）。

### 設定カード / フォームカード

- `bg-white rounded-[18px] overflow-hidden`、`box-shadow: 0 0 0 1px rgba(0,0,0,.04)`。
- **ヘッダー行**（省略可）: `px-[18px] pt-4 pb-2.5`、大文字ラベル `text-xs font-extrabold tracking-[.12em] text-secondary`＋右にⓘ。
- **行**: `min-h-[62px] px-[18px] border-t border-border`。左にラベル（`text-lg font-semibold`）、右にコントロール（ステッパー / トグル）。
- **展開ラベル**: `px-[18px] py-3.5`、`text-sm font-extrabold tracking-wide`（例: 全セットを表示 ▼）。

### ボタン

- **Primary CTA（固定型）**: `bg-inverse text-on-inverse rounded-xl h-[52px] text-base font-extrabold tracking-wide`。画面下に `fixed left-[22px] right-[22px] bottom-6`。
- **Primary CTA（インライン）**: 同上だが `relative w-full min-h-[44px]`。`active:scale-[0.98] transition-colors duration-150`。
- **FAB**: `rounded-full bg-inverse px-5 py-3.5 text-on-inverse text-xs font-extrabold tracking-wide`。画面下中央に fixed、`shadow-lg`。
- **Secondary**: ボーダーのみ or テキストのみ。
- **Ghost**: `text-secondary hover:text-primary`。
- **円形＋（種目追加 / ブロック追加）**: `rounded-full w-[78px] h-[78px] border-2 border-[#bfbfbf]`、中央に `+`（46px, weight 300）。下に `text-sm font-extrabold` ラベル。

### ステッパー（Tonal 準拠）

- 外枠: `rounded-[10px] border border-[#d8d8d8] overflow-hidden`。
- グリッド: `grid-cols-[42px_56px_42px] h-10`。
- **−/＋ ボタン**: `text-lg font-bold text-primary`。タップ `active:bg-surface`。
- **値エリア**: **`bg-inverse text-on-inverse text-base font-bold`**。ユーザーが直接入力も可。
- 値が空のときは `—` をプレースホルダーに。

### 入力フィールド

- **カード行内**: ステッパーを使う（上記）。
- **単独セレクト / テキスト**: 白カード `rounded-[18px] overflow-hidden` に包み、`h-12 px-4 text-sm`。
- **検索（下線型）**: `border-0 border-b border-[#cfcfcf] rounded-none bg-transparent`。アイコン `⌕` ＋ プレースホルダー。
- **フォーカス**: `focus:outline-none`。
- **エラー**: `ring-danger ring-inset`。

### 種目リスト

- コンテナ: `bg-white rounded-[18px] overflow-hidden`、`box-shadow: 0 0 0 1px rgba(0,0,0,.04)`。
- **行**: `grid grid-cols-[64px_1fr_auto] min-h-[76px] px-3.5 items-center gap-3.5 border-t border-border`。
- **サムネ**: `w-16 h-12 rounded-[10px] bg-neutral-300`。
- **タイトル**: `text-[17px] font-bold tracking-tight`。
- **シェブロン（未選択）**: `text-[22px] text-muted` → `›`。
- **チェック（選択済）**: `w-6 h-6 rounded-full bg-inverse text-on-inverse` に `✓`。

### セグメント

- コンテナ: `rounded-[14px] bg-[#ececec] p-1 grid grid-cols-2 gap-1`。
- **選択**: `bg-inverse text-on-inverse rounded-[10px] min-h-9 text-sm font-bold`。
- **非選択**: `text-secondary rounded-[10px] min-h-9 text-sm font-bold`。

### 選択チップグリッド（方式選択型）

- コンテナ: `grid grid-cols-2 gap-2.5 px-[18px] pb-[18px]`。
- **選択**: `bg-inverse text-on-inverse rounded-xl min-h-[50px] text-sm font-extrabold`。
- **非選択**: `bg-[#ececec] text-primary rounded-xl min-h-[50px] text-sm font-extrabold`。

### トグル

- iOS 風スイッチ。`w-[52px] h-8 rounded-full`。
- ON: `bg-iosToggle`（`#34C759`）。OFF: `bg-[#d8d8d8]`。
- ツマミ: `w-7 h-7 rounded-full bg-white shadow-sm`。

### モーダル

- 背面: `bg-black/50`。
- 前面: `bg-white rounded-[18px] overflow-hidden shadow-2xl`。
- 本文: `p-[22px]`。タイトル `text-2xl font-bold tracking-tight`、コピー `text-[15px] text-secondary leading-relaxed`。
- **OK ボタン**: `h-[54px] w-full bg-inverse text-on-inverse text-lg font-extrabold`（角丸なし＝カード下部にフィット）。

### トースト

- `bg-inverse text-on-inverse rounded-full px-[18px] py-3.5 text-sm font-bold shadow-lg`。画面下中央に固定。

---

## 8. タブ・ナビゲーション

### 上部カテゴリタブ

- 細く控えめ。選択中のみ下線で差をつける。

### 下部タブバー（BottomNav） — FormCheck 独自ルール

- **白背景** + `border-t border-border`。
- アイコン: Lucide `strokeWidth: 1.5`。
- アクティブ: `text-primary` + ラベル下に **`bg-accent` の細いバー**（`h-0.5 w-5 rounded-full`）。
- 非アクティブ: `text-muted`。
- ラベル: `text-[10px]` 控えめ。

> Tonal スクショ下部の黒帯は Mobbin 由来のため参照しない。

---

## 9. 強調のルール

- 強調は「余白」「サイズ」「位置」で作る。色は最後の手段。
- **全ての画面で黒が主役**。グリーンはインジケーターにのみ。
- **強調箇所は 1 画面に 1〜2 個**。Primary ボタンは 1 つ。

---

## 10. 動画プレーヤー・撮影画面

- 撮影プレビューは画面の大部分（`bg-black`）。
- コントロール: `bg-black/40 backdrop-blur`。
- 録画ボタン: **`border-accent bg-accent`** の円（`h-[68px] w-[68px]`）— **accent を面で使える唯一のボタン**。
- 16 分割グリッド: `stroke-white/30`。

---

## 11. 質感・印象

- スポーティーだがうるさくない。
- 女性にも男性にも寄りすぎない**中性的**設計。
- ジム感はあるが筋肉アプリっぽい圧はない。
- ライフスタイル寄りの上品さ。
- 編集・種目追加では **Tonal のような「道具としての頼れさ」**（高コントラスト・省略のない階層）。

---

## 12. アニメーション・トランジション

- `transition-colors duration-150` をボタン・リンクに。
- `active:scale-[0.98]` をタップ時の軽いフィードバックに。
- ページ遷移アニメは MVP では不要。
