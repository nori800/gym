# システム構成・技術スタック

**関連**: [02-api-and-processing.md](02-api-and-processing.md)、[03-pwa.md](03-pwa.md)、[04-deployment.md](04-deployment.md)

**技術前提**: Next.js / Supabase / Vercel

---

## 5. システム構成

### 5-1. フロントエンド
- Next.js（App Router前提）
- TypeScript
- Tailwind CSS
- PWA対応

### 5-2. バックエンド
- Supabase
  - Auth
  - Postgres
  - Storage
  - Row Level Security
  - Realtime（将来利用）

### 5-3. インフラ
- Vercel
  - フロント配信
  - Preview Deploy
  - 本番デプロイ
  - 環境変数管理

### 5-4. 動画関連
- **撮影**：ブラウザの **getUserMedia** と **MediaRecorder API**（またはプラットフォーム対応する手段）。**HTTPS（localhost 含む）** が前提。マイク不要な場合は映像のみ取得
- 撮影／プレビュー時の **16分割オーバーレイ**：Canvas または SVG でカメラプレビュー上に重ね、ON/OFF・初期 ON は要件どおり
- 動画再生：HTML5 video
- 補助線表示（再生時）：Canvas または SVG Overlay
- 描画機能：Canvas
- サムネイル：クライアント生成 or サーバー補助
