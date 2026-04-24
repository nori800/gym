-- Video feedback from trainers to members
CREATE TABLE IF NOT EXISTS video_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  trainer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  frame_time real,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_feedback_video_id ON video_feedback(video_id);
CREATE INDEX IF NOT EXISTS idx_video_feedback_trainer ON video_feedback(trainer_user_id);

-- RLS
ALTER TABLE video_feedback ENABLE ROW LEVEL SECURITY;

-- Trainers can insert feedback on videos of their assigned members
CREATE POLICY "trainer_insert_feedback" ON video_feedback
  FOR INSERT
  WITH CHECK (
    trainer_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM videos v
      JOIN profiles p ON p.user_id = v.user_id
      WHERE v.id = video_feedback.video_id
        AND p.trainer_id = auth.uid()
    )
  );

-- Trainers can read feedback they wrote
CREATE POLICY "trainer_read_own_feedback" ON video_feedback
  FOR SELECT
  USING (trainer_user_id = auth.uid());

-- Members can read feedback on their own videos
CREATE POLICY "member_read_feedback" ON video_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos v
      WHERE v.id = video_feedback.video_id
        AND v.user_id = auth.uid()
    )
  );

-- Trainers can update their own feedback
CREATE POLICY "trainer_update_own_feedback" ON video_feedback
  FOR UPDATE
  USING (trainer_user_id = auth.uid())
  WITH CHECK (trainer_user_id = auth.uid());

-- Trainers can delete their own feedback
CREATE POLICY "trainer_delete_own_feedback" ON video_feedback
  FOR DELETE
  USING (trainer_user_id = auth.uid());

-- Track read status per member
CREATE TABLE IF NOT EXISTS feedback_read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_id uuid NOT NULL REFERENCES video_feedback(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, feedback_id)
);

ALTER TABLE feedback_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_manage_own_read_status" ON feedback_read_status
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
