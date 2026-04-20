# 画面遷移図

**関連**: [requirements/02-functional.md](../requirements/02-functional.md)、[requirements/08-user-flow-and-steps.md](../requirements/08-user-flow-and-steps.md)

---

## MVP 画面遷移（Mermaid）

```mermaid
flowchart TD
    START([アプリ起動]) --> AUTH_CHECK{認証済み?}

    %% 未ログイン時の分岐（Decision Log参照）
    AUTH_CHECK -- Yes --> HOME
    AUTH_CHECK -- No / ゲスト撮影許可 --> CAPTURE
    AUTH_CHECK -- No / ログイン必須 --> LOGIN

    %% ステップ1: 撮影
    HOME[ホーム] --> CAPTURE[動画撮影]
    CAPTURE -->|撮影完了| PREVIEW[プレビュー\n16分割ON/OFF]
    PREVIEW -->|保存| VIDEO_LIST
    PREVIEW -->|撮り直し| CAPTURE

    %% 主要フロー
    HOME --> VIDEO_LIST[動画一覧]
    HOME --> HISTORY[履歴一覧]
    HOME --> SETTINGS[設定]

    VIDEO_LIST --> VIDEO_DETAIL[動画詳細]
    VIDEO_DETAIL --> FORM_CHECK[フォーム確認\n再生・補助線・描画]
    VIDEO_DETAIL --> RECORD_INPUT[記録入力]

    HISTORY --> RECORD_DETAIL[記録詳細]
    RECORD_DETAIL --> VIDEO_DETAIL

    %% 次のステップ群（認証）
    HOME -->|アカウント連携| LOGIN[ログイン]
    LOGIN --> SIGNUP[新規登録]
    SIGNUP --> ONBOARDING[初期設定\nプロフィール]
    LOGIN --> HOME
    ONBOARDING --> HOME

    %% 設定
    SETTINGS --> LOGIN
    SETTINGS --> PROFILE_EDIT[プロフィール編集]

    %% ライブラリアップロード
    HOME --> UPLOAD[ライブラリ選択\nアップロード]
    UPLOAD --> VIDEO_LIST
```

---

## 補足

- **CAPTURE → PREVIEW**: 撮影中は常に **16分割グリッドの ON/OFF ボタン**が表示される。初期は ON。
- **AUTH_CHECK の分岐**: [decision-log.md](../development/06-decision-log.md) の ADR-001 に従う。
- Phase2 の **比較画面** は動画詳細から遷移予定（MVPでは未実装）。
- 各画面の戻る遷移（Back）は省略しているが、基本的にブラウザバック／ナビゲーションで戻れる。
