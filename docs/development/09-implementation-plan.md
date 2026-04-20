# MVP 実装計画（チェックリスト）

**目的**: 3名が役割分担してレビューし、ブレなく MVP を完了させる。

**方針（2026-04 更新）**: **まず UI/UX と画面遷移をモックデータで完成させ、動くものを優先する。** **Supabase（DB・Auth・Storage）の連携は後段フェーズ**にまとめる。履歴・一覧・記録は **ダミーデータでよい**。

**参照**: [06-acceptance-and-out-of-scope.md](../requirements/06-acceptance-and-out-of-scope.md)、[01-roadmap-and-priority.md](01-roadmap-and-priority.md)、[architecture/05-screen-transitions.md](../architecture/05-screen-transitions.md)、[06-decision-log.md](06-decision-log.md)（ADR-006）

---

## 三人レビューの進め方

| 役割 | 略称 | 主なチェック観点 |
|------|------|------------------|
| **プロダクト／要件** | PO | 要件・画面遷移・UX文言・モックで足りない旨の明示 |
| **テックリード** | TL | コンポーネント設計・パフォーマンス・後から Supabase に差し替えやすい境界 |
| **QA／品質** | QA | 実機の見え方・操作・バリデーション表示（データはダミーで可） |

各 **フェーズゲート** の直前に、次の一行を満たすこと。

- [ ] **PO** が「要件どおり／仕様として進めてよい」と確認した
- [ ] **TL** が「技術的に問題ない／後段のデータ接続と矛盾しない」と確認した
- [ ] **QA** が「テスト観点・確認手順が明確」と確認した

> **運用**: PR では最低1名のレビュー必須とし、**フェーズ完了時** は原則3名全員がゲートにチェックを入れる（不在時は事前に代理を決めて記録する）。

---

## フェーズ 0 — キックオフ・環境（Supabase なしで開始可）

**ゴール**: リポジトリ・ツールが揃い、**フロントのみ**で開発を開始できる。

### タスク

- [x] Node / npm のバージョンを `package.json` の `engines` で固定した（[06-decision-log.md](06-decision-log.md) ADR-005）
- [x] `npm install` と `npm run dev` で起動できる
- [x] `.env.example` は Supabase 連携フェーズで必須化（この時点では未作成で OK）
- [x] ADR・要件に変更があれば [06-decision-log.md](06-decision-log.md) を更新した（ADR-005: pnpm→npm、ADR-006: UI先行）
- [x] Vercel 連携は UI が一通り動いてから（現時点では未接続で OK）

### フェーズゲート（三人チェック）

- [x] PO 確認済み
- [x] TL 確認済み
- [x] QA 確認済み

---

## フェーズ 1 — プロジェクト土台（Next.js・デザイントークン・ナビ）

**ゴール**: App Router・Tailwind・ライト UI トークン・共通レイアウト・BottomNav が揃う。

### タスク

- [x] Next.js（App Router）+ TypeScript + ESLint + Prettier をセットアップした
- [x] [design/01-ui-design-guidelines.md](../design/01-ui-design-guidelines.md) に基づき `tailwind.config` に `app` / `accent` / `surface` 等を定義した
- [x] ルート `layout` で白背景（`#FFFFFF`）・Inter フォントを適用した
- [x] [development/02-directory-structure.md](02-directory-structure.md) に沿ったディレクトリを用意した
- [x] BottomNav（ホーム／撮影／履歴／設定）と各ルートの **空ページ** を接続した

### フェーズゲート（三人チェック）

- [x] PO 確認済み
- [x] TL 確認済み
- [x] QA 確認済み

---

## フェーズ 2 — モックデータ層と一覧・履歴・設定の UI

**ゴール**: **ダミーデータ**でホーム・動画一覧・詳細（メタ情報）・履歴・記録・設定の **見た目と遷移**が完成する（API・DB なし）。

### タスク

- [x] `lib/mocks/` に **動画・記録・履歴・体重/体脂肪**のダミー配列を定義した（型は `types/index.ts` で将来の Supabase 型と共通化しやすい形）
- [x] 動画一覧：サムネイル（プレースホルダ）・種目絞り込み・日付ソートを **クライアントのみ**で動かす
- [x] 動画詳細：メタ情報表示（タイトル・種目・日付・メモ）
- [x] 履歴一覧・記録詳細：ダミーで一覧・詳細表示し、動画詳細へ遷移できる
- [x] 設定・プロフィール項目の **フォーム UI**（送信は `console.log`）
- [x] 認証画面（ログイン／登録）は **見た目とバリデーション表示のみ**（[ADR-006](06-decision-log.md)）
- [x] ホーム画面に体重・体脂肪の入力 UI とグラフ（SVG 折れ線）を追加した

### フェーズゲート（三人チェック）

- [x] PO 確認済み（情報設計・導線）
- [x] TL 確認済み（データ取得を差し替え可能な境界）
- [x] QA 確認済み（空状態・エラー表示の見え方）

---

## フェーズ 3 — 撮影・プレビュー・16分割オーバーレイ（クライアントのみ）

**ゴール**: **撮影 + 16分割 ON/OFF（初期 ON）** の体験がブラウザ単体で完結する（アップロード・保存はまだ不要）。

### タスク

- [x] `capture` ルートで `getUserMedia` によるプレビューを表示した（HTTPS / localhost）
- [x] MediaRecorder（webm/vp9）で録画し、**Blob / Object URL** で次画面に渡せる
- [x] 撮影中・撮影直後プレビューに **16分割グリッド**（SVG）をオーバーレイし、**ON/OFF**（**初期 ON**）
- [x] カメラ拒否時は [08-validation-and-errors.md](08-validation-and-errors.md) に沿いライブラリ選択へ誘導した
- [x] 録画完了後、メタ入力 UI（`/capture/meta`: タイトル・種目・メモ）へ進める（sessionStorage 経由）
- [x] [design/01-ui-design-guidelines.md](../design/01-ui-design-guidelines.md) の撮影・プレーヤー節を満たす

### フェーズゲート（三人チェック）

- [x] PO 確認済み（ステップ1の体験）
- [x] TL 確認済み（ブラウザ互換・メモリ）
- [x] QA 確認済み（実機または検証環境）

---

## フェーズ 4 — 再生・補助線・描画・メモ（Blob / モック動画で可）

**ゴール**: フォーム確認画面で **再生・補助線の見た目・描画・メモ UI** が揃う。永続化は **localStorage 任意**（Supabase 不要）。

### タスク

- [x] `video` 要素で再生・一時停止・スロー（0.25x–2x）・シーク（`videos/[id]` を player UI に全面改修）
- [x] 16分割・縦中心・横中心 ON/OFF・色（4色）・太さ・透明度の **UI とオーバーレイ**（`components/player/VideoOverlay`, `OverlayControls`）
- [x] SVG ベースで直線・矢印・円・1個戻し・全削除（`components/player/DrawingCanvas`, `DrawToolbar`）
- [x] メモ入力 UI（動画単位、折りたたみ式パネル）
- [x] データソースは **フェーズ2のダミー** および **フェーズ3の Blob URL** 対応済み

### フェーズゲート（三人チェック）

- [x] PO 確認済み（操作体系）
- [x] TL 確認済み（Canvas と video の同期）
- [x] QA 確認済み（主要ブラウザ／実機）

---

## フェーズ 5 — 記録入力フロー・履歴連携の UI 完成度

**ゴール**: トレーニング記録の **入力〜一覧表示**がダミー／ローカル state で一連につながる。

### タスク

- [x] 記録入力画面の項目・バリデーション表示（`onBlur` + submit 時の全体チェック、`text-danger` インライン表示）
- [x] 「記録に動画を紐付け」の UI（チェックボックス式の動画選択パネル、選択済みチップ表示）
- [x] 履歴から記録詳細・動画詳細への導線が **[architecture/05-screen-transitions.md](../architecture/05-screen-transitions.md)** と整合
- [x] この時点で **「UI 完成」** と宣言できる状態に仕上げる（データはモックのまま）
- [x] 体重・体脂肪の専用ページ（`/body`）を追加。年/月/週の範囲切り替え・軸の自動調整グラフ・記録一覧を実装

### フェーズゲート（三人チェック）

- [x] PO 確認済み
- [x] TL 確認済み
- [x] QA 確認済み

---

## フェーズ 6 — PWA・静的デプロイ（バックエンドなしでも可）

**ゴール**: Preview / 本番に **UI だけ**デプロイでき、実機でホーム画面追加などを試せる。

### タスク

- [ ] [architecture/03-pwa.md](../architecture/03-pwa.md) の manifest・アイコン・Service Worker（オフラインシェルは要件どおり）
- [ ] Vercel にデプロイ（環境変数なしでもビルド可能な構成）
- [ ] [04-testing-and-quality.md](04-testing-and-quality.md) のうち **UI 関連**のチェックを実施

### フェーズゲート（三人チェック）

- [ ] PO 確認済み
- [ ] TL 確認済み
- [ ] QA 確認済み（実機スモーク）

---

## フェーズ 7 — Supabase（スキーマ・RLS・Storage）

**ゴール**: [architecture/06-supabase-physical-design.md](../architecture/06-supabase-physical-design.md) を本番相当に適用する。

### タスク

- [ ] Supabase プロジェクト作成、`.env.example` に [architecture/04-deployment.md](../architecture/04-deployment.md) の変数を記載
- [ ] DDL・RLS・Storage バケット・ポリシーを適用した
- [ ] `lib/supabase/client.ts` と `server.ts` を接続した
- [ ] ストレージパス規則どおりにアップロード試験ができる

### フェーズゲート（三人チェック）

- [ ] PO 確認済み（データ項目が要件と整合）
- [ ] TL 確認済み（RLS・シークレット）
- [ ] QA 確認済み（権限・他人データ不可）

---

## フェーズ 8 — 認証・実データ接続（モックの置換）

**ゴール**: ログイン・登録・プロフィール・動画・記録が **Supabase に永続化**され、モックを順次置換する（[ADR-001](06-decision-log.md)）。

### タスク

- [ ] メール＋パスワードのサインアップ／ログイン／ログアウト
- [ ] 未認証時のガード（方針は ADR-001）
- [ ] 録画／ライブラリファイルの Storage アップロードと `videos` レコード作成
- [ ] 一覧・詳細・記録・履歴を **実クエリ**に差し替え（ダミー削除）
- [ ] [08-validation-and-errors.md](08-validation-and-errors.md) のサーバー側整合

### フェーズゲート（三人チェック）

- [ ] PO 確認済み
- [ ] TL 確認済み
- [ ] QA 確認済み（認証・RLS・受け入れに向けたテスト）

---

## フェーズ 9 — 本番運用・MVP 受け入れ完了

**ゴール**: [06-acceptance-and-out-of-scope.md](../requirements/06-acceptance-and-out-of-scope.md) の MVP 受け入れを満たす。

### タスク

- [ ] 本番 Vercel に環境変数設定（`service_role` はサーバーのみ）
- [ ] [04-testing-and-quality.md](04-testing-and-quality.md) をフル実施
- [ ] MVP 受け入れ 1〜11 をすべて満たした
- [ ] 既知の制限・モック残りがあれば README / Issue に記載した

### フェーズゲート（三人チェック）

- [ ] PO 確認済み（受け入れ完了宣言）
- [ ] TL 確認済み（本番セキュリティ）
- [ ] QA 確認済み（リグレッション）

---

## 継続的レビュー（PR 単位チェックリスト）

すべての PR で、実装者以外が以下を確認する。

- [ ] [07-coding-standards.md](07-coding-standards.md) に違反していない
- [ ] **Supabase を接続している PR のみ**: 機密情報・`service_role` がクライアントに含まれていない
- [ ] UI が [design/01-ui-design-guidelines.md](../design/01-ui-design-guidelines.md) と大きく乖離していない
- [ ] エラー・バリデーションが [08-validation-and-errors.md](08-validation-and-errors.md) と整合している（該当する場合）
- [ ] モック／仮実装の場合は PR 説明またはコードコメントで **後続フェーズで差し替える旨**が分かる

---

## MVP 完了の最終宣言

以下をすべて満たしたとき、MVP 完了とする。

- [ ] [06-acceptance-and-out-of-scope.md](../requirements/06-acceptance-and-out-of-scope.md) の受け入れ条件を満たした
- [ ] **フェーズ 0〜9** の各ゲートで **PO / TL / QA の三人チェック** が完了している（**フェーズ7以降が実質のバックエンド完了**）
- [ ] 本番デプロイが成功し、スモークテスト済みである

**記録日**: ____年____月____日　**署名（任意）**: PO ______ / TL ______ / QA ______
