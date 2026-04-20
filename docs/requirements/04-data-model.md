# 4. データ設計（論理）

**関連**: [05-permissions.md](05-permissions.md)、設計バックログ [development/03-design-backlog.md](../development/03-design-backlog.md)

---

## 10. エンティティ一覧

### 10-1. users
- id
- email
- created_at

### 10-2. profiles
- id
- user_id
- display_name
- height
- weight
- goal
- dominant_side
- favorite_exercises
- created_at
- updated_at

### 10-3. videos
- id
- user_id
- title
- exercise_type
- shot_date
- file_path
- thumbnail_path
- duration
- memo
- created_at
- updated_at

### 10-4. video_annotations
- id
- video_id
- user_id
- grid_type
- line_color
- line_width
- opacity
- drawing_data_json
- created_at
- updated_at

### 10-5. workout_logs
- id
- user_id
- log_date
- exercise_type
- weight
- reps
- sets
- rpe
- note
- created_at
- updated_at

### 10-6. workout_log_videos
- id
- workout_log_id
- video_id

### 10-7. favorites（Phase2）
- id
- user_id
- video_id
- created_at

### 10-8. shared_links（Phase2）
- id
- user_id
- target_type
- target_id
- token
- expires_at
- created_at

---

## メモ（物理設計で詰める項目）
- `favorite_exercises` の型（JSON配列 vs 正規化テーブル）
- `drawing_data_json` のスキーマ（バージョン付きJSON推奨）
- 種目マスタをMVPで固定リストにするか、ユーザーカスタムを許すか
