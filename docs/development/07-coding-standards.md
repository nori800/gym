# コーディング規約

3人以上で書いてもコードの見た目・設計が揃うための最小限ルール。

**関連**: [02-directory-structure.md](02-directory-structure.md)、[06-decision-log.md](06-decision-log.md)

---

## 1. 言語・フォーマット

| 項目 | ルール |
|------|--------|
| 言語 | TypeScript strict（`strict: true`） |
| フォーマッタ | Prettier（設定はリポジトリルートの `.prettierrc`） |
| リンター | ESLint + `eslint-config-next` + `@typescript-eslint` |
| 保存時整形 | エディタで format on save を有効にする |

---

## 2. 命名規則

| 対象 | 形式 | 例 |
|------|------|----|
| ファイル（コンポーネント） | PascalCase | `VideoPlayer.tsx` |
| ファイル（ユーティリティ） | camelCase | `formatDate.ts` |
| ファイル（ルート/ページ） | Next.js 規約（`page.tsx`, `layout.tsx`） | — |
| 変数・関数 | camelCase | `uploadVideo()` |
| 型・interface | PascalCase | `WorkoutLog` |
| 定数（環境変数等） | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| CSS クラス | Tailwind ユーティリティ優先。カスタム時は kebab-case | `video-overlay` |
| DB カラム | snake_case | `shot_date` |

---

## 3. コンポーネント設計

- **Server Component をデフォルト**とし、クライアント状態やブラウザ API が必要な箇所だけ `"use client"` をつける。
- 1ファイル1エクスポートを基本とする（barrel `index.ts` は `components/` 配下のみ可）。
- Props の型は同ファイル内で `type Props = { ... }` として定義する。外部共有が必要なら `types/` へ。
- **共通コンポーネント** は `components/common/` に、**機能固有** は `components/<feature>/` に配置する。

---

## 4. 状態管理

- 原則 `useState` / `useContext`。ADR-004 に従いグローバルが必要になったら **Zustand** を最小スコープで導入する。
- サーバーデータのキャッシュは Server Components のフェッチで十分。クライアント側ポーリングが必要なら `useSWR` / React Query を検討するがMVPでは原則不要。

---

## 5. import 順序

ESLint の `import/order` で自動ソート。人間が気にする必要はないが、意図は以下:

1. React / Next.js
2. 外部ライブラリ
3. `@/lib/*`
4. `@/features/*`
5. `@/components/*`
6. 相対パス（`./*`）
7. CSS / スタイル

---

## 6. API・データアクセス

- Supabase クライアントは `lib/supabase/client.ts`（ブラウザ用）と `lib/supabase/server.ts`（Server Component / Route Handler 用）に分離する。
- DB 操作のラッパー関数は `features/<domain>/` に置く（例: `features/videos/queries.ts`）。
- Route Handler は **薄く**保つ（バリデーション → ドメイン関数呼び出し → レスポンス）。

---

## 7. エラーハンドリング

- try/catch で握りつぶさない。最低限 `console.error` + ユーザーへのフィードバック。
- UI には **トースト or インラインメッセージ** で結果を伝える。詳細は [08-validation-and-errors.md](08-validation-and-errors.md)。

---

## 8. コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に従う:

```
feat: 動画アップロード機能を追加
fix: 補助線が横向き時にずれる問題を修正
chore: ESLint 設定を更新
docs: 画面遷移図を追加
```

---

## 9. ブランチ命名

```
feat/<短い説明>     # 新機能
fix/<短い説明>      # バグ修正
chore/<短い説明>    # 設定・依存更新
```

`main` への直接コミット禁止。PR 経由でマージ。
