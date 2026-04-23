-- =============================================
-- FormCheck — Extended Tables (003)
-- video_annotations, workout_templates, custom_movements, shared_links
-- + profiles columns (dominant_side, favorite_exercises)
-- =============================================

-- profiles: add dominant_side and favorite_exercises
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dominant_side TEXT DEFAULT 'right',
  ADD COLUMN IF NOT EXISTS favorite_exercises TEXT[] DEFAULT '{}';

-- video_annotations (drawings + overlay settings per video, optionally per frame)
CREATE TABLE IF NOT EXISTS public.video_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frame_time NUMERIC(10,3),
  grid_settings JSONB DEFAULT '{}'::jsonb,
  drawing_shapes JSONB DEFAULT '[]'::jsonb,
  overlay_color TEXT DEFAULT '#FFFFFF',
  overlay_thickness SMALLINT DEFAULT 1,
  overlay_opacity NUMERIC(3,2) DEFAULT 0.30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_video_annotations_video ON public.video_annotations(video_id);
ALTER TABLE public.video_annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_annotations_all" ON public.video_annotations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_video_annotations_updated
  BEFORE UPDATE ON public.video_annotations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- workout_templates
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  blocks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON public.workout_templates(user_id);
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_templates_all" ON public.workout_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_workout_templates_updated
  BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- custom_movements (user-defined exercises)
CREATE TABLE IF NOT EXISTS public.custom_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_ja TEXT NOT NULL,
  desc_ja TEXT DEFAULT '',
  category_ja TEXT NOT NULL DEFAULT '',
  default_reps SMALLINT DEFAULT 10,
  default_sets SMALLINT DEFAULT 3,
  default_weight NUMERIC(6,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_custom_movements_user ON public.custom_movements(user_id);
ALTER TABLE public.custom_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_movements_all" ON public.custom_movements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- shared_links
CREATE TABLE IF NOT EXISTS public.shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shared_links_token ON public.shared_links(token);
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared_links_owner" ON public.shared_links
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shared_links_public_read" ON public.shared_links
  FOR SELECT USING (expires_at IS NULL OR expires_at > now());

-- trainer/member roles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_trainer ON public.profiles(trainer_id);
