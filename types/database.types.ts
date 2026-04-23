export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          height: number | null;
          weight: number | null;
          goal: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string;
          height?: number | null;
          weight?: number | null;
          goal?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string;
          height?: number | null;
          weight?: number | null;
          goal?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
