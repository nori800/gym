# FormCheck（仮）ドキュメント索引

筋トレフォーム確認PWAの要件・設計・開発情報へのアクセスです。

---

## 要件定義

| ドキュメント | 内容 |
|--------------|------|
| [requirements/01-overview.md](requirements/01-overview.md) | 概要、ユーザー、スコープ、利用環境 |
| [requirements/02-functional.md](requirements/02-functional.md) | ユースケース、画面一覧、機能要件 |
| [requirements/03-nonfunctional.md](requirements/03-nonfunctional.md) | 非機能要件 |
| [requirements/04-data-model.md](requirements/04-data-model.md) | 論理データ設計 |
| [requirements/05-permissions.md](requirements/05-permissions.md) | 権限設計 |
| [requirements/06-acceptance-and-out-of-scope.md](requirements/06-acceptance-and-out-of-scope.md) | MVP受け入れ条件、意図的に外すもの |
| [requirements/07-assumptions-and-constraints.md](requirements/07-assumptions-and-constraints.md) | 前提、制約、リスク |
| [requirements/08-user-flow-and-steps.md](requirements/08-user-flow-and-steps.md) | 利用ステップ・ログインの位置づけ |

---

## アーキテクチャ・設計

| ドキュメント | 内容 |
|--------------|------|
| [architecture/01-system.md](architecture/01-system.md) | システム構成・技術スタック |
| [architecture/02-api-and-processing.md](architecture/02-api-and-processing.md) | API / 処理方針 |
| [architecture/03-pwa.md](architecture/03-pwa.md) | PWA要件 |
| [architecture/04-deployment.md](architecture/04-deployment.md) | デプロイ・環境変数・運用 |
| [architecture/05-screen-transitions.md](architecture/05-screen-transitions.md) | 画面遷移図（Mermaid） |
| [architecture/06-supabase-physical-design.md](architecture/06-supabase-physical-design.md) | Supabase物理設計（DDL/RLS/Storage） |

---

## デザイン

| ドキュメント | 内容 |
|--------------|------|
| [design/01-ui-design-guidelines.md](design/01-ui-design-guidelines.md) | UIデザインガイドライン（色・フォント・コンポーネント） |

---

## 開発

| ドキュメント | 内容 |
|--------------|------|
| [development/01-roadmap-and-priority.md](development/01-roadmap-and-priority.md) | 開発優先順位、フェーズ |
| [development/02-directory-structure.md](development/02-directory-structure.md) | 想定ディレクトリ構成 |
| [development/03-design-backlog.md](development/03-design-backlog.md) | 設計バックログ・次タスク |
| [development/04-testing-and-quality.md](development/04-testing-and-quality.md) | テスト・品質 |
| [development/05-local-development.md](development/05-local-development.md) | ローカル開発・環境の注意 |
| [development/06-decision-log.md](development/06-decision-log.md) | Decision Log（ADR） |
| [development/07-coding-standards.md](development/07-coding-standards.md) | コーディング規約 |
| [development/08-validation-and-errors.md](development/08-validation-and-errors.md) | バリデーション・エラーハンドリング一覧 |
| [development/09-implementation-plan.md](development/09-implementation-plan.md) | MVP実装計画（チェックリスト・三人レビュー） |

---

## 共通

| ドキュメント | 内容 |
|--------------|------|
| [glossary.md](glossary.md) | 用語集 |

---

**技術前提**: Next.js / Supabase / Vercel — 詳細は [architecture/01-system.md](architecture/01-system.md)。

旧ファイル `chatGPT.md` は本索引へ移行済みです。
