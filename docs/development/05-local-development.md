# ローカル開発

**関連**: [architecture/04-deployment.md](../architecture/04-deployment.md)、[requirements/07-assumptions-and-constraints.md](../requirements/07-assumptions-and-constraints.md)

---

## 前提ツール（想定）

- **Node.js**（LTS 推奨。プロジェクトで `.nvmrc` / `package.json` の `engines` を定義するとよい）
- **パッケージマネージャ**（npm / pnpm / yarn。リポジトリで統一する）
- **Git**

---

## 初期セットアップ（目安）

1. リポジトリを clone する
2. 依存関係をインストールする（例: `npm install`）
3. 環境変数ファイルを用意する  
   - [architecture/04-deployment.md](../architecture/04-deployment.md) に記載の `NEXT_PUBLIC_*` / `SUPABASE_*` を、**Supabase ダッシュボードの開発用プロジェクト**から取得して `.env.local` に設定する
4. 開発サーバを起動する（例: `npm run dev`）

---

## 撮影機能を試すときの注意

- **カメラ API** は **HTTPS** または **`http://localhost`** で動作する（[requirements/07-assumptions-and-constraints.md](../requirements/07-assumptions-and-constraints.md)）
- 同一ネットワークの LAN IP でスマホ実機テストする場合は、開発ツールに応じて HTTPS トンネル（ngrok 等）や `localhost` トンネルを検討する

---

## Supabase をローカルで動かす場合（任意）

- Supabase CLI の `supabase start` でローカルスタックを立ち上げ、接続先 URL／キーを `.env.local` に向ける運用も可能。チームで方針を決めたら本節を具体コマンドに差し替える。
