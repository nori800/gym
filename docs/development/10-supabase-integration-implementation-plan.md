# Supabase 連携 実装計画（プロジェクト接続済み前提）

**作成日**: 2026年4月22日  
**前提**: Supabase プロジェクトは作成済み（ダッシュボード・MCP 等で接続可能）。本書は **アプリ側の実装順序・スキーマ差分・検証** にフォーカスする。  
**参照**: [architecture/06-supabase-physical-design.md](../architecture/06-supabase-physical-design.md)、[requirements/04-data-model.md](../requirements/04-data-model.md)、[development/07-coding-standards.md](07-coding-standards.md)

---

## 1. 目的とゴール

| ゴール | 完了の定義 |
|--------|------------|
| **認証** | メール（または OAuth）でサインアップ／ログインし、`auth.uid()` と `profiles` が連動する。 |
| **永続化** | モックの `console.log` を廃止し、主要エンティティが Supabase に CRUD される。 |
| **Storage** | 撮影動画を `videos` バケットにアップロードし、`videos.file_path` と整合する。 |
| **セキュリティ** | RLS により他ユーザーの行・オブジェクトにアクセスできない（手動・自動テストで確認）。 |

---

## 2. 環境変数とクライアント初期化

### 2.1 `.env.local`（コミット禁止）

| 変数 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ブラウザ・サーバー共通のプロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | クライアント用 anon キー（RLS の下で利用） |
| `SUPABASE_SERVICE_ROLE_KEY` | **サーバーのみ**（管理タスク・バッチ用。クライアントに載せない） |

リポジトリには `.env.example` にキー名のみ記載する。

### 2.2 コード配置（規約どおり分離）

| ファイル | 役割 |
|----------|------|
| `lib/supabase/client.ts` | ブラウザ用 `createBrowserClient`（Cookie 同期は `@supabase/ssr` 推奨） |
| `lib/supabase/server.ts` | Server Components / Route Handlers 用 |
| `middleware.ts`（必要なら） | セッションリフレッシュ・保護ルート |

**タスク**

- [ ] `@supabase/supabase-js` および推奨なら `@supabase/ssr` を依存に追加
- [ ] `client.ts` / `server.ts` を実装し、型付きの `Database` を `supabase gen types` で生成した `types/database.types.ts` に向ける
- [ ] Vercel（またはホスト先）に環境変数を登録

---

## 3. スキーマとアプリ UI のギャップ

現在の UI は **ブロック＋種目（MovementConfig）** 中心のドラフトがある一方、[06-supabase-physical-design.md](../architecture/06-supabase-physical-design.md) の `workout_logs` は **フラットな1行＝メタ寄り** の例示になっている。

### 3.1 推奨方針（いずれかを ADR に残す）

| 案 | 内容 | メリット | デメリット |
|----|------|----------|------------|
| **A. 正規化テーブル追加** | `workouts`（親）→ `workout_blocks` → `workout_block_movements`（sets/reps/weight JSON 等） | UI と一致、拡張しやすい | マイグレーション・API が増える |
| **B. JSONB 一本** | `workouts` に `draft_json` を保存し、検索は最小限 | 実装が速い | 部分更新・集計が難しい |
| **C. 既存 `workout_logs` のみ** | 画面をフラット記録に寄せる | DDL 変更が小さい | 現在のワークアウト編集 UI を縮小／変更 |

**推奨**: MVP 後半でも **案 A または B** で「ワークアウト単位の保存」を明示する。計画フェーズで PO/TL が一案に決定し、[06-decision-log.md](06-decision-log.md) に ADR を追記する。

### 3.2 ボディログ

物理設計に **体重ログ専用テーブル** が無い場合は、`body_logs`（`user_id`, `log_date`, `weight`, `body_fat_pct`, `created_at`）を新規 DDL で追加し、RLS を `profiles` と同様に `auth.uid()` で縛る。

---

## 4. 実装フェーズ（推奨順序）

### フェーズ S0 — 基盤（1〜2 日）

- [ ] Supabase CLI または Dashboard で **本番／ステージング** のマイグレーション手順を文書化
- [ ] `types/database.types.ts` を CI で再生成する手順（npm script）
- [ ] `lib/supabase/*` 接続確認用のデバッグページまたは Server Action で `select 1` 相当を実行

### フェーズ S1 — 認証とプロフィール（2〜4 日）

- [ ] `/login` `/signup` から Supabase Auth を呼び出し、成功時に `/dashboard` へ
- [ ] サインアップ後に `profiles` 行が存在すること（トリガ `handle_new_user` が [06](../architecture/06-supabase-physical-design.md) 通りなら自動）
- [ ] 設定画面のプロフィール保存を `profiles` の `upsert` に差し替え
- [ ] 未ログイン時のリダイレクト方針（`(main)` を保護するか、ゲスト閲覧を許すかを要件に合わせて固定）

### フェーズ S2 — 動画メタ＋Storage（3〜6 日）

- [ ] `videos` 行を INSERT（`user_id`, `title`, `exercise_type`, `shot_date`, `file_path` プレースホルダ）
- [ ] クライアントから **Signed Upload** または **upload with service role 経由の Route Handler** で `videos/{user_id}/{video_id}.webm` をアップロード
- [ ] アップロード完了後に `file_path` を更新し、`/videos` 一覧は Supabase から取得（サムネは後続で `thumbnail_path`）
- [ ] `capture/meta` の種目・日付を DB カラムにマッピング（`EXERCISE_TYPES` と `movements` の ID 統一は別タスクで解消）

### フェーズ S3 — アノテーション（2〜4 日）

- [ ] 動画詳細の描画・グリッド設定を `video_annotations` に `upsert`
- [ ] 読み込み時に JSON を復元し、未保存時はローカルドラフト戦略（競合・オフラインは後続）

### フェーズ S4 — ワークアウト記録（規模依存: 5〜15 日）

- [ ] セクション 3 の方針決定後、DDL を適用
- [ ] `workouts/edit` の保存で DB に永続化、履歴 `/workouts` は `select`＋並び順
- [ ] 必要なら **ワークアウト実行中 → 撮影** の `workout_log_videos` 相当のリンクを同一トランザクションまたは連続 API で作成

### フェーズ S5 — ボディログ（2〜3 日）

- [ ] `body_logs` テーブル作成（未存在の場合）
- [ ] `BodyLogForm` の保存・一覧・グラフデータを DB 参照に変更

### フェーズ S6 — 品質・運用（継続）

- [ ] RLS: 「別ユーザー ID で read できない」テストケースを E2E または手動チェックリスト化
- [ ] Storage ポリシー: パス先頭が `auth.uid()` と一致しないオブジェクトを拒否できること
- [ ] レート制限・ファイルサイズ上限のエラーメッセージ（[08-validation-and-errors.md](08-validation-and-errors.md) に追記）
- [ ] バックアップ・PITR（Supabase プラン）の確認

---

## 5. 画面 ↔ テーブル対応（クイックリファレンス）

| 画面 / 機能 | テーブル（主） | メモ |
|-------------|----------------|------|
| 設定・プロフィール | `profiles` | `user_id` = `auth.uid()` |
| 動画一覧・詳細 | `videos`, `video_annotations` | Storage とパス一致 |
| 撮影メタ | `videos` | `sessionStorage` 依存を廃止し、`video_id` で遷移 |
| ワークアウト履歴・編集 | 要設計（3.1） | 現行モックを置換 |
| ボディ | `body_logs`（新規想定） | 日付は既存 `DatePickerField` の ISO |

---

## 6. リスクと緩和

| リスク | 緩和 |
|--------|------|
| RLS ミスによるデータ漏えい | ステージングで「ユーザー A で insert → ユーザー B のクライアントで select」を必須確認 |
| 大容量動画のアップロード失敗 | クライアント側で長さ・サイズ制限、再試行 UI、TUS 等は将来検討 |
| スキーマと UI の乖離 | 型生成を CI に組み込み、フロントの Row 型を `Database['public']['Tables']['videos']['Row']` に寄せる |

---

## 7. 完了定義（本計画の「Done」）

- [ ] 上記フェーズ S1〜S5 のチェックボックスが、ステージング環境で満たされている
- [ ] [09-implementation-plan.md](09-implementation-plan.md) の「Supabase 連携フェーズ」記述と矛盾がないよう相互リンク・更新済み
- [ ] ADR に「ワークアウト永続化のスキーマ案（3.1）」が記録されている

---

*プロジェクト参照 ID や URL はリポジトリに直書きせず、環境変数とダッシュボードで管理すること。*
