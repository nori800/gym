# 開発優先順位・フェーズ

**関連**: [requirements/06-acceptance-and-out-of-scope.md](../requirements/06-acceptance-and-out-of-scope.md)、[02-directory-structure.md](02-directory-structure.md)、[09-implementation-plan.md](09-implementation-plan.md)、[06-decision-log.md](06-decision-log.md)（ADR-006）

---

## 17. 開発優先順位

プロダクトの **画面ステップ** は撮影ファースト（[requirements/08-user-flow-and-steps.md](../requirements/08-user-flow-and-steps.md)）。

**実装順（現行）**: **UI/UX とモックデータを先に完成させ、Supabase・永続化は後段**とする。詳細は [09-implementation-plan.md](09-implementation-plan.md)。

### 優先度A（フロント先行）

- **デザイントークン・ナビ・画面遷移**の完成
- **モックデータ**による動画一覧・詳細・履歴・記録・設定の UI
- **アプリ内動画撮影**（プレビュー、撮影時 **16分割 ON/OFF・初期 ON**）※保存は Blob／state で可
- **動画再生・補助線・描画・メモ**の UI（データソースはモック or 直近の Blob）
- **記録入力フロー**の UI（ダミー連携で可）
- **PWA・静的デプロイ**（バックエンドなしでも可）

### 優先度B（データ層・仕上げ）

- **Supabase**（スキーマ・RLS・Storage）
- **認証**・実データへの置換・アップロード永続化
- サムネイル生成（サーバー補助含む）

### 優先度C（Phase2 以降でよいもの）

- 比較機能、共有、お気に入り、グラフ、通知

### 優先度D

- AI、骨格推定、トレーナー権限
