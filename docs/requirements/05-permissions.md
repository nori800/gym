# 5. 権限設計

**関連**: [04-data-model.md](04-data-model.md)、[architecture/02-api-and-processing.md](../architecture/02-api-and-processing.md)

---

## 11. ロールと権限

### 11-1. 一般ユーザー
- 自分のプロフィール閲覧・編集
- 自分の動画閲覧・登録・削除
- 自分の記録閲覧・登録・編集・削除

### 11-2. 管理者（必要なら）
- 全ユーザー管理
- 違反データの削除

### 11-3. 将来のトレーナー権限
- 共有されたユーザーのデータ閲覧
- コメント追加

---

## Supabase における実装方針（要約）
- 認可は **Postgres の Row Level Security（RLS）** でユーザー単位に限定する
- Storage のオブジェクトキー／ポリシーもユーザーと整合させる
- `service_role` キーはサーバー専用とし、クライアントに埋め込まない
