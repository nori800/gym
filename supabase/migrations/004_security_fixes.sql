-- =============================================
-- FormCheck — Security Fixes (004)
-- P0-1: shared_links token-based access
-- P0-2: Trainer RLS policies
-- P0-3: video_annotations owner check
-- P3-26: body_logs UNIQUE constraint
-- P3-27: profiles CHECK constraints
-- =============================================

-- ─── P0-1: Fix shared_links_public_read ──────────────────────────
-- The old policy allowed ANY client to SELECT all shared_links rows.
-- Replace with: owner can CRUD their own rows; nobody else can list.
-- API route handles token lookup via service role or RPC.

DROP POLICY IF EXISTS "shared_links_public_read" ON public.shared_links;

-- Token-based read: only the specific row matching the token can be read.
-- Uses a custom GUC set by the API route or a direct .eq('token', ...) filter.
-- Since anon/authenticated users should only access via the API route,
-- we restrict public reads entirely and use a security-definer function instead.

CREATE OR REPLACE FUNCTION public.get_shared_link_by_token(p_token TEXT)
RETURNS SETOF public.shared_links
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.shared_links
  WHERE token = p_token
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
$$;

-- ─── P0-2: Trainer RLS policies ─────────────────────────────────
-- Trainers need to read profiles/workouts/videos of their assigned members.

-- profiles: trainer can read members assigned to them
CREATE POLICY "trainer_read_members" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id
    OR trainer_id = auth.uid()
  );

-- Drop the old overly-restrictive select policy and keep the new combined one
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- workouts: trainer can read member workouts
CREATE POLICY "trainer_read_member_workouts" ON public.workouts
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT p.user_id FROM public.profiles p WHERE p.trainer_id = auth.uid()
    )
  );

-- Need to drop the old "workouts_all" SELECT portion and recreate
-- Actually workouts_all is FOR ALL, so we need to be careful.
-- Drop and recreate with separated policies for better granularity.
DROP POLICY IF EXISTS "workouts_all" ON public.workouts;

CREATE POLICY "workouts_owner_all" ON public.workouts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- videos: trainer can read member videos
CREATE POLICY "trainer_read_member_videos" ON public.videos
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT p.user_id FROM public.profiles p WHERE p.trainer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "videos_all" ON public.videos;

CREATE POLICY "videos_owner_all" ON public.videos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- video_annotations: trainer can read annotations on member videos
CREATE POLICY "trainer_read_member_annotations" ON public.video_annotations
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT p.user_id FROM public.profiles p WHERE p.trainer_id = auth.uid()
    )
  );

-- Storage: trainer can view member video files
DROP POLICY IF EXISTS "videos_select_own" ON storage.objects;
CREATE POLICY "videos_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'videos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (storage.foldername(name))[1] IN (
        SELECT p.user_id::text FROM public.profiles p WHERE p.trainer_id = auth.uid()
      )
    )
  );

-- ─── P0-3: video_annotations — verify video ownership on INSERT ──
-- Prevent users from inserting annotations on videos they don't own
-- (unless they are the trainer of the video owner)
DROP POLICY IF EXISTS "video_annotations_all" ON public.video_annotations;

CREATE POLICY "video_annotations_owner_all" ON public.video_annotations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.user_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.videos v
        JOIN public.profiles p ON p.user_id = v.user_id
        WHERE v.id = video_id AND p.trainer_id = auth.uid()
      )
    )
  );

-- ─── P3-26: body_logs UNIQUE constraint ─────────────────────────
ALTER TABLE public.body_logs
  DROP CONSTRAINT IF EXISTS body_logs_user_date_unique;
ALTER TABLE public.body_logs
  ADD CONSTRAINT body_logs_user_date_unique UNIQUE (user_id, log_date);

-- ─── P3-27: profiles CHECK constraints ──────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('member', 'trainer', 'admin'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_dominant_side_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_dominant_side_check CHECK (dominant_side IN ('left', 'right', 'both'));
