# テスト・品質（追補）

**関連**: [requirements/03-nonfunctional.md](../requirements/03-nonfunctional.md)、[architecture/04-deployment.md](../architecture/04-deployment.md)、[09-implementation-plan.md](09-implementation-plan.md)、[06-decision-log.md](06-decision-log.md)（ADR-006）

**実装順のメモ**: UI 先行フェーズでは **モックデータ**で画面・操作を検証する。**RLS・他人データ不可**のチェックは Supabase 接続後（実装計画フェーズ7以降）に必須とする。

---

## 方針
- **単体テスト**: ユーティリティ、バリデーション、注釈JSONの変換などロジック中心に導入する
- **結合テスト**: Supabase を使う処理はステージング／Preview 環境で主要フローを確認する（接続後）
- **E2E（任意・MVP後でも可）**: 撮影またはログイン〜アップロード〜再生のクリティカルパスを Playwright 等で自動化を検討（HTTPS／権限モックの都合に注意）

## チェックリスト（リリース前の目安）
- **[requirements/08-user-flow-and-steps.md](../requirements/08-user-flow-and-steps.md)** の認証方針に合わせ、未許可で他人データやクラウド保護リソースにアクセスできないこと
- 他ユーザーの `video` / `workout` が取得できないこと（RLS）
- **撮影画面**: 16分割表示の ON/OFF が動作し、**初期状態が ON** であること（要件どおり）
- **HTTPS／localhost** 以外でカメラが無効になる場合、ユーザーに理由または代替操作が伝わること
- 大きい動画・非対応形式で適切なエラー表示があること
- 主要画面がモバイル幅で崩れないこと（iOS Safari を実機で確認できるとよい）

## コード品質
- ESLint / TypeScript の strict を維持する
- 機密情報（`service_role`）がクライアントバンドルに含まれないことをレビューで確認する
