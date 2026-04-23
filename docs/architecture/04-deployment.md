# デプロイ・環境・運用

**関連**: [02-api-and-processing.md](02-api-and-processing.md)、[requirements/07-assumptions-and-constraints.md](../requirements/07-assumptions-and-constraints.md)

---

## 14. デプロイ要件

### 14-1. 環境
- local
- preview
- production

### 14-2. デプロイ先
- Vercel

### 14-3. 環境変数
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

### 14-4. 運用
- GitHub連携で自動デプロイ
- PRごとにPreview Deploy確認
- mainマージで本番反映

### 14-5. ブランチ・レビュー（追補）
- `main` は本番相当。機能開発は別ブランチから PR 経由でマージする
- PR ではビルド成功と主要フローを目視確認する（詳細は [development/04-testing-and-quality.md](../development/04-testing-and-quality.md)）
