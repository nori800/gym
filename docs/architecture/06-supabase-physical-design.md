# Supabase 物理設計（DDL / RLS / Storage）

**関連**: [requirements/04-data-model.md](../requirements/04-data-model.md)、[requirements/05-permissions.md](../requirements/05-permissions.md)

---

## 1. テーブル定義（MVP）

```sql
-- ========================================
-- profiles
-- ========================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  height      NUMERIC(5,1),           -- cm
  weight      NUMERIC(5,1),           -- kg
  goal        TEXT DEFAULT '',
  dominant_side TEXT CHECK (dominant_side IN ('left','right','both')) DEFAULT 'right',
  favorite_exercises JSONB DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ========================================
-- videos
-- ========================================
CREATE TABLE public.videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  exercise_type TEXT NOT NULL DEFAULT '',
  shot_date     DATE,
  file_path     TEXT NOT NULL,          -- Storage object path
  thumbnail_path TEXT,
  duration      NUMERIC(7,2),           -- 秒
  memo          TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_exercise_type ON public.videos(exercise_type);

-- ========================================
-- video_annotations
-- ========================================
CREATE TABLE public.video_annotations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id         UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grid_type        TEXT DEFAULT 'nine',  -- nine | center_v | center_h | custom
  line_color       TEXT DEFAULT '#ffffff',
  line_width       SMALLINT DEFAULT 1,
  opacity          NUMERIC(3,2) DEFAULT 0.80,
  drawing_data_json JSONB DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_annotations_video ON public.video_annotations(video_id);

-- ========================================
-- workout_logs
-- ========================================
CREATE TABLE public.workout_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_type TEXT NOT NULL DEFAULT '',
  weight        NUMERIC(6,2),           -- kg
  reps          SMALLINT,
  sets          SMALLINT,
  rpe           NUMERIC(3,1),           -- 1.0 ~ 10.0
  note          TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workout_logs_user_date ON public.workout_logs(user_id, log_date DESC);

-- ========================================
-- workout_log_videos（中間テーブル）
-- ========================================
CREATE TABLE public.workout_log_videos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  video_id       UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  UNIQUE (workout_log_id, video_id)
);
```

---

## 2. Row Level Security（RLS）

すべてのテーブルで RLS を有効にし、デフォルト DENY。

```sql
-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own videos"
  ON public.videos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- video_annotations
ALTER TABLE public.video_annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own annotations"
  ON public.video_annotations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- workout_logs
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own logs"
  ON public.workout_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- workout_log_videos
ALTER TABLE public.workout_log_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own log-video links"
  ON public.workout_log_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_logs
      WHERE id = workout_log_videos.workout_log_id
        AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_logs
      WHERE id = workout_log_videos.workout_log_id
        AND user_id = auth.uid()
    )
  );
```

---

## 3. Storage 設計

### バケット

| バケット名 | 公開 | 用途 |
|-----------|------|------|
| `videos` | Private | ユーザー動画ファイル |
| `thumbnails` | Private | サムネイル画像 |

### オブジェクトパス規則

```
videos/{user_id}/{video_id}.mp4
thumbnails/{user_id}/{video_id}.jpg
```

### Storage ポリシー（例: videos バケット）

```sql
-- アップロード: 自分のフォルダにのみ
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 閲覧: 自分のフォルダのみ
CREATE POLICY "Users can read own videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 削除: 自分のフォルダのみ
CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

thumbnails バケットも同様のポリシーを設定する。

---

## 4. Trigger（補助）

```sql
-- updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルに適用
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_annotations_updated_at
  BEFORE UPDATE ON public.video_annotations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_workout_logs_updated_at
  BEFORE UPDATE ON public.workout_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## 5. 新規ユーザー作成時の profile 自動生成（推奨）

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
