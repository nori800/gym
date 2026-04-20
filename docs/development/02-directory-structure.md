# 想定ディレクトリ構成（参考）

**関連**: [01-roadmap-and-priority.md](01-roadmap-and-priority.md)

---

## 18. 想定ディレクトリ構成（参考）

```
app/
  (auth)/
    login/
    signup/
  capture/          # アプリ内撮影（カメラプレビュー・16分割オーバーレイ）
  dashboard/
  videos/
  workouts/
  settings/
  api/

components/
  camera/           # プレビュー・録画制御（必要に応じて）
  video/
  grid/
  drawing/
  workout/
  common/

lib/
  supabase/
  utils/
  validations/

features/
  auth/
  profile/
  videos/
  annotations/
  workouts/
```

実装時はNext.jsのバージョンとチーム規約に合わせて調整する。
