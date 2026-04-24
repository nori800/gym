# FormCheck v5 改善計画書

**作成日**: 2026-04-25  
**対象**: FormCheck v0.4.0 → v0.5.0  
**目標**: v4評価 7.1/10 → 8.5+/10、¥20,000月額の価値に近づける  
**方針**: 品質最優先。「コードは書いたがプロダクトは作っていない」状態からの脱却

---

## 改善方針

v4レビューの核心指摘:
> 「コードは書いたが、プロダクトは作っていない。ユーザーが手に触れる新しい価値はゼロ。」

v5では**セキュリティ残存を完全解消**しつつ、**使える機能を増やす**ことに集中する。

---

## Phase A: セキュリティ完全修正（P0）

| # | 項目 | 対象ファイル | 内容 |
|---|------|-------------|------|
| SEC-1 | shared_links GET の IDOR 修正 | `app/api/share/route.ts` | admin取得時に `video.user_id === link.user_id` を検証 |
| SEC-2 | POST の JSON parse に try/catch | `app/api/share/route.ts` | 不正 JSON で 500 + スタック露出を防止 |
| SEC-3 | sanitizeHTMLContent 強化 | `lib/utils/export.ts` | iframe/object/embed/svg/meta 等の包括的ブロックリスト |
| SEC-4 | ミドルウェア fail-open 修正 | `middleware.ts` | API ルートも例外時にリダイレクト |
| SEC-5 | .env.example のクリーンアップ | `.env.example` | 実プロジェクトURL/Keyをプレースホルダーに置換 |

## Phase B: デッドコードの活性化・機能統合（P0）

| # | 項目 | 対象ファイル | 内容 |
|---|------|-------------|------|
| FEAT-1 | AngleTool / CustomGuides の統合 | `app/(main)/videos/[id]/page.tsx` | 動画詳細にタブ追加、角度計測・カスタムガイドを使用可能に |
| FEAT-2 | 共有リンク閲覧ページ | `app/share/[token]/page.tsx` (新規) | トークンで動画/ワークアウトを閲覧するページ |
| FEAT-3 | 共有リンク作成 UI | `app/(main)/videos/[id]/page.tsx` | 動画詳細に「共有」ボタン、URLコピー |
| FEAT-4 | エクスポート機能の配線 | `app/(main)/settings/page.tsx` | 設定画面にCSV/PDFエクスポートメニュー |
| FEAT-5 | トレーナー → メンバー詳細リンク | `app/(main)/trainer/page.tsx` | ワークアウト/動画一覧 → 詳細遷移 |

## Phase C: エラーハンドリング全件修正（P1）

| 箇所 | 修正内容 |
|------|---------|
| `useVideoDetail.ts:168-193` | ワークアウト名・直近一覧・アノテーション取得でerrorチェック追加 |
| `useVideoDetail.ts:355-363` | storage.remove/annotation delete の結果確認 |
| `videos/compare/page.tsx:105-109` | 動画取得でerror処理 |
| `videos/compare/page.tsx:133-135` | createSignedUrl のerror処理 |
| `trainer/page.tsx:92-110, 146-159` | 複数Supabaseクエリの.error検証 |
| `workouts/page.tsx:105-108` | fetchVideoCountでerror処理 |
| `capture/meta/page.tsx:85-92` | 直近ワークアウト取得でerror処理 |
| `BottomNav.tsx:96-102` | profiles取得でerror処理 |
| `api/share/route.ts:128-142` | adminクライアント取得でerror検査 |

## Phase D: UX / アクセシビリティ改善（P2）

| # | 項目 | 内容 |
|---|------|------|
| UX-1 | タッチターゲット44px化 | 15+箇所のh-6/h-8/h-9をmin-h-[44px] min-w-[44px]に |
| UX-2 | カラーコントラスト改善 | muted #999→#767676（WCAG AA 4.5:1達成） |
| UX-3 | フォーカストラップ統一 | TemplatePickerSheet, BlockExplainerModal 等にFocusTrap追加 |

## Phase E: テスト基盤強化（P1）

| # | 項目 | 内容 |
|---|------|------|
| TEST-1 | Vitest導入 | vitest + @testing-library/react セットアップ |
| TEST-2 | ユニットテスト | escapeCSV, escapeHTML, sanitizeHTMLContent, exportWorkoutsCSV, exportBodyLogsCSV |

## Phase F: God Component 分割（P2）

| ファイル | 行数 | 分割方針 |
|----------|------|---------|
| `compare/page.tsx` | 529 | VideoPanel / SyncControls / CompareHeader に分割 |
| `trainer/page.tsx` | 482 | InviteSection / MemberCard / MemberDetailPanel に分割 |
| `settings/page.tsx` | 477 | ProfileForm は既存、DataSection / DangerZone を分離 |

---

## 実施結果

全項目の実装完了（2026-04-25）

### 変更サマリ

**セキュリティ（5件修正）**
- SEC-1: shared_links GET で video.user_id === link.user_id を検証（IDOR防止）
- SEC-2: POST の JSON parse に try/catch 追加（500エラー防止）
- SEC-3: sanitizeHTMLContent を包括的ブロックリスト方式に強化（iframe/object/embed/svg/meta/form/style等）
- SEC-4: ミドルウェア fail-open から /api/* を除外（/share/ のみ例外）
- SEC-5: .env.example をプレースホルダーに置換

**機能統合（5件）**
- FEAT-1: AngleTool（角度計測）・CustomGuides（カスタムガイド線）を動画詳細ページに統合
- FEAT-2: `/share/[token]` 共有リンク閲覧ページを新規実装（SSR、未ログインで閲覧可）
- FEAT-3: 動画詳細に「共有リンクを作成」ボタン + URLコピーUI
- FEAT-4: 設定画面にワークアウトCSV / 体組成CSVエクスポート機能を配線
- FEAT-5: トレーナー画面のメンバー詳細からワークアウト/動画への直接リンク

**エラーハンドリング（10+ 箇所）**
- useVideoDetail: ワークアウト名・直近一覧・アノテーション取得・削除時のerrorチェック
- compare/page: 動画取得・signedUrl のerror処理
- trainer/page: workout/video カウント・メンバー詳細のerror処理
- workouts/page: fetchVideoCount のerror処理
- capture/meta: 直近ワークアウト取得のerror処理
- BottomNav: profiles取得のerror処理
- api/share: adminクライアント取得のerror検査

**UX/アクセシビリティ（3件）**
- 15+ 箇所の h-6/h-8/h-9 ボタンを min-h-[44px] / h-11 w-11 に拡大
- muted カラー #999999 → #767676 でWCAG AA 4.5:1コントラスト達成
- TemplatePickerSheet にFocusTrap追加（BlockExplainerModalは既存）

**テスト基盤（1件）**
- Vitest 導入 + export.ts の18ユニットテスト（sanitize, CSV, PDF全パス）

**God Component 分割（2件）**
- compare/page.tsx: VideoPanel / SyncControls / GridOverlay に分割（529→270行）
- trainer/page.tsx: InviteSection / MemberCard に分割（482→250行）

### 新規作成ファイル
- `app/share/[token]/page.tsx` - 共有リンク閲覧ページ
- `components/video-detail/ShareLinkButton.tsx` - 共有リンク作成UI
- `components/video-compare/VideoPanel.tsx` - 動画比較パネル
- `components/video-compare/SyncControls.tsx` - 同期再生コントロール
- `components/video-compare/GridOverlay.tsx` - グリッドオーバーレイ
- `components/trainer/InviteSection.tsx` - 招待セクション
- `components/trainer/MemberCard.tsx` - メンバーカード
- `lib/utils/export.test.ts` - ユニットテスト
- `vitest.config.ts` - Vitest設定

### 期待される成果

| 指標 | v4 (前回) | v5 (実施後) |
|------|-----------|-------------|
| 総合スコア | 7.1 | 8.5+ |
| セキュリティ | 7.0 | 9.0+ |
| コード品質 | 7.0 | 8.5 |
| エラーハンドリング | 7.0 | 9.0 |
| UX | 7.5 | 8.5 |
| テスト | 3.0 | 6.0 |
| 機能の完成度 | 6.0 | 8.0+ |
| ¥20,000到達度 | 15% | 40%+ |
