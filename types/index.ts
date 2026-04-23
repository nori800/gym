export type Video = {
  id: string;
  user_id: string;
  title: string;
  exercise_type: string;
  shot_date: string;
  file_path: string;
  thumbnail_path: string | null;
  duration: number | null;
  memo: string;
  workout_session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  height: number | null;
  weight: number | null;
  goal: string;
  dominant_side: "left" | "right" | "both";
  favorite_exercises: string[];
  role: "member" | "trainer" | "admin";
  trainer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BodyLog = {
  id: string;
  user_id: string;
  log_date: string;
  weight: number;
  body_fat: number | null;
  created_at: string;
};

export type VideoAnnotation = {
  id: string;
  video_id: string;
  user_id: string;
  frame_time: number | null;
  grid_settings: Record<string, unknown>;
  drawing_shapes: Record<string, unknown>[];
  overlay_color: string;
  overlay_thickness: number;
  overlay_opacity: number;
  created_at: string;
  updated_at: string;
};

export type WorkoutTemplate = {
  id: string;
  user_id: string;
  title: string;
  blocks_json: unknown;
  categories: string[];
  created_at: string;
  updated_at: string;
};

export type CustomMovement = {
  id: string;
  user_id: string;
  name_ja: string;
  desc_ja: string;
  category_ja: string;
  default_reps: number;
  default_sets: number;
  default_weight: number;
  created_at: string;
};

export type SharedLink = {
  id: string;
  user_id: string;
  video_id: string | null;
  workout_id: string | null;
  token: string;
  expires_at: string | null;
  created_at: string;
};
