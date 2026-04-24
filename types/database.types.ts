export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          address: string | null;
          phone_number: string | null;
          joined_on: string | null;
          trainer_memo: string | null;
          height: number | null;
          weight: number | null;
          goal: string | null;
          dominant_side: string | null;
          favorite_exercises: string[];
          role: string | null;
          trainer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string;
          address?: string | null;
          phone_number?: string | null;
          joined_on?: string | null;
          trainer_memo?: string | null;
          height?: number | null;
          weight?: number | null;
          goal?: string | null;
          dominant_side?: string | null;
          favorite_exercises?: string[];
          role?: string | null;
          trainer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string;
          address?: string | null;
          phone_number?: string | null;
          joined_on?: string | null;
          trainer_memo?: string | null;
          height?: number | null;
          weight?: number | null;
          goal?: string | null;
          dominant_side?: string | null;
          favorite_exercises?: string[];
          role?: string | null;
          trainer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      body_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          weight: number | null;
          body_fat_pct: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date?: string;
          weight?: number | null;
          body_fat_pct?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_date?: string;
          weight?: number | null;
          body_fat_pct?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          workout_date: string;
          description: string | null;
          blocks_json: Json;
          duration_min: number | null;
          total_sets: number | null;
          total_volume: number | null;
          categories: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          workout_date?: string;
          description?: string | null;
          blocks_json?: Json;
          duration_min?: number | null;
          total_sets?: number | null;
          total_volume?: number | null;
          categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          workout_date?: string;
          description?: string | null;
          blocks_json?: Json;
          duration_min?: number | null;
          total_sets?: number | null;
          total_volume?: number | null;
          categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          exercise_type: string;
          shot_date: string | null;
          file_path: string;
          thumbnail_path: string | null;
          duration: number | null;
          memo: string | null;
          workout_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          exercise_type?: string;
          shot_date?: string | null;
          file_path?: string;
          thumbnail_path?: string | null;
          duration?: number | null;
          memo?: string | null;
          workout_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          exercise_type?: string;
          shot_date?: string | null;
          file_path?: string;
          thumbnail_path?: string | null;
          duration?: number | null;
          memo?: string | null;
          workout_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      video_annotations: {
        Row: {
          id: string;
          video_id: string;
          user_id: string;
          frame_time: number | null;
          grid_settings: Json;
          drawing_shapes: Json;
          overlay_color: string | null;
          overlay_thickness: number | null;
          overlay_opacity: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id: string;
          frame_time?: number | null;
          grid_settings?: Json;
          drawing_shapes?: Json;
          overlay_color?: string | null;
          overlay_thickness?: number | null;
          overlay_opacity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          user_id?: string;
          frame_time?: number | null;
          grid_settings?: Json;
          drawing_shapes?: Json;
          overlay_color?: string | null;
          overlay_thickness?: number | null;
          overlay_opacity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_templates: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          blocks_json: Json;
          categories: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          blocks_json?: Json;
          categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          blocks_json?: Json;
          categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      custom_movements: {
        Row: {
          id: string;
          user_id: string;
          name_ja: string;
          desc_ja: string | null;
          category_ja: string;
          default_reps: number | null;
          default_sets: number | null;
          default_weight: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name_ja: string;
          desc_ja?: string | null;
          category_ja: string;
          default_reps?: number | null;
          default_sets?: number | null;
          default_weight?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name_ja?: string;
          desc_ja?: string | null;
          category_ja?: string;
          default_reps?: number | null;
          default_sets?: number | null;
          default_weight?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      shared_links: {
        Row: {
          id: string;
          user_id: string;
          video_id: string | null;
          workout_id: string | null;
          token: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id?: string | null;
          workout_id?: string | null;
          token?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string | null;
          workout_id?: string | null;
          token?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
