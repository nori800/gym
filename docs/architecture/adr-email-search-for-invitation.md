# ADR: トレーナー招待時のメール検索方式

**日付**: 2026-04-25  
**状態**: 承認済み  
**関連**: BL-P2-05, E0-T1

---

## コンテキスト

トレーナーが会員を招待する際、現状は `profiles.display_name` の `ilike` 検索のみで対象を特定している。  
ユーザーが表示名を設定していない場合や、同名のユーザーがいる場合に特定が困難。

## 検討した選択肢

### A. Supabase RPC（`security definer` 関数）
- `auth.users.email` を直接結合する RPC を DB に定義
- **利点**: 単一クエリ、高速
- **欠点**: マイグレーションが増える、RLS の外で動くため注意が必要

### B. Service Role API（`admin.auth.admin.listUsers`）
- サーバーサイド API Route で service role クライアントを使い `auth.users` を検索
- **利点**: DB マイグレーション不要、Supabase Admin API の標準機能
- **欠点**: `listUsers` は全件取得→クライアント側フィルタ（大規模には不向き）

### C. `profiles` にメール列を追加
- サインアップ時のトリガで `profiles.email` を同期
- **利点**: RLS 内で完結、単純
- **欠点**: メール変更時の同期、PII の二重保持

## 決定

**選択肢 B** を採用する。

理由:
1. 現時点でのユーザー数は少数（マンツーマンジム想定）のため、`listUsers` のスケーラビリティ制限は問題にならない
2. DB マイグレーション不要で即実装可能
3. トレーナーには**マスクされたメール**（`ab***@example.com`）のみ表示し、完全なメールは返さない
4. 将来スケールする場合は選択肢 A または C に移行可能

## 実装詳細

- **エンドポイント**: `GET /api/trainer/search-member?q=<query>`
- **認証**: ログイン必須 + `profiles.role === "trainer"` チェック
- **検索ロジック**:
  - `@` を含む場合 → `admin.auth.admin.listUsers` でメール検索 → `profiles` で詳細取得
  - `@` を含まない場合 → `profiles.display_name` の `ilike` 検索（従来方式）
- **レスポンス**: `email_hint`（マスク済み）、`has_trainer`、`is_self` フラグを含む

## セキュリティ考慮事項

- メールの完全な値はレスポンスに含めない
- トレーナーロールでないユーザーは 403 で拒否
- 検索キーワードは 2 文字以上を要求（ブルートフォース緩和）
