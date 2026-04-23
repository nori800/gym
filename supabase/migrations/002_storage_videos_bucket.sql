-- =============================================
-- FormCheck — Storage: private `videos` bucket + RLS
-- Run after 001_initial_tables.sql (or in same session)
-- =============================================

-- Private bucket (public = false)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  524288000,
  ARRAY['video/webm', 'video/mp4', 'video/quicktime']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Idempotent policy refresh (safe to re-run)
DROP POLICY IF EXISTS "videos_select_own" ON storage.objects;
DROP POLICY IF EXISTS "videos_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "videos_update_own" ON storage.objects;
DROP POLICY IF EXISTS "videos_delete_own" ON storage.objects;

-- Policies: user_id as first path segment (matches app upload path `{user_id}/{video_id}.webm`)
CREATE POLICY "videos_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "videos_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "videos_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "videos_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
