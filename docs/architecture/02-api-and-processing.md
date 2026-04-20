# API / 処理方針

**関連**: [01-system.md](01-system.md)、[requirements/05-permissions.md](../requirements/05-permissions.md)

---

## 12. API / 処理方針

### 12-1. 基本方針
- 認証はSupabase Authを使う
- DBアクセスはSupabase経由
- StorageもSupabaseを使う
- フロントはNext.jsで構築する
- サーバー処理が必要な場合はNext.js Route Handlerを使う

### 12-2. 想定処理
- サインアップ
- ログイン
- プロフィール取得・更新
- 動画メタ情報登録
- 動画一覧取得
- 動画詳細取得
- 注釈保存
- トレーニング記録保存
- 履歴一覧取得
- 比較対象取得（Phase2）

### 12-3. エラー・レスポンス（追補）
- クライアントからはユーザ向けに意味のあるメッセージを返す（内部詳細はログのみ）
- Auth / Storage / DB の失敗はリトライ可能かどうかを区別し、UI で「再試行」を提示できるようにする
