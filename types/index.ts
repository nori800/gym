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
  created_at: string;
  updated_at: string;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  log_date: string;
  exercise_type: string;
  weight: number | null;
  reps: number | null;
  sets: number | null;
  rpe: number | null;
  note: string;
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
  grid_type: "nine" | "center_v" | "center_h" | "custom";
  line_color: string;
  line_width: number;
  opacity: number;
  drawing_data_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
