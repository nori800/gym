# 設計バックログ・次タスク

**関連**: [requirements/04-data-model.md](../requirements/04-data-model.md)、[architecture/04-deployment.md](../architecture/04-deployment.md)、[09-implementation-plan.md](09-implementation-plan.md)

**実装順**: DB・RLS の詳細詰めは **UI・モックが一通り動いた後** でよい（[06-decision-log.md](06-decision-log.md) ADR-006）。

---

## 19. 今後の設計タスク（既存）

1. 画面遷移図作成
2. DBテーブル定義確定
3. RLS設計
4. Storageパス設計
5. MVPのUIワイヤー作成
6. コンポーネント分割方針決定
7. 実装タスク分解

---

## 追加で推奨する設計タスク

8. **動画制約の確定**: 最大ファイルサイズ、推奨解像度・長さ、クライアント側バリデーション文言
9. **注釈データ**: `drawing_data_json` のスキーマ（フィールド名・座標系・動画リサイズ時の扱い）
10. **種目マスタ**: 固定リストかフリー入力か、タグの正規化方法
11. **オフライン時の振る舞い**: PWA でキャッシュする画面範囲と、書き込み不可時のメッセージ
12. **個人情報・削除**: アカウント削除時の Storage / DB の削除順序と Supabase 側の運用手順メモ
13. **カメラ権限・フォールバック**: iOS Safari / Chrome での権限文言、拒否時のガイド、ライブラリ選択への誘導
14. **撮影時オーバーレイ**: プレビュー解像度・オブジェクトフィット変更時でもグリッドが破綻しない座標系（正規化座標の検討）
