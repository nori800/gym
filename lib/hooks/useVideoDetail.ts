"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Video } from "@/types";
import type { Json } from "@/types/database.types";
import type { DrawShape } from "@/components/player/DrawingCanvas";

type GridType = "sixteen" | "center_v" | "center_h";
type RecentWorkout = { id: string; title: string; workout_date: string };

type AnnotationRow = {
  id: string;
  video_id: string;
  user_id: string;
  frame_time: number;
  grid_settings: GridType[] | null;
  drawing_shapes: DrawShape[] | null;
  overlay_color: string | null;
  overlay_thickness: number | null;
  overlay_opacity: number | null;
};

export interface OverlayState {
  activeGrids: Set<GridType>;
  overlayColor: string;
  overlayThickness: number;
  overlayOpacity: number;
}

export interface VideoDetailState {
  video: Video | null;
  videoSrc: string | null;
  dataLoading: boolean;
  playbackError: string | null;

  memo: string;
  memoSaving: boolean;
  linkedWorkoutTitle: string | null;
  recentWorkouts: RecentWorkout[];
  pendingWorkoutId: string;
  linkSaving: boolean;
  deleting: boolean;
  annotationId: string | null;
  annotationSaving: boolean;
  deleteConfirmOpen: boolean;

  overlay: OverlayState;
  shapes: DrawShape[];
}

export interface VideoDetailActions {
  setMemo: (v: string) => void;
  setPendingWorkoutId: (v: string) => void;
  setPlaybackError: (v: string | null) => void;
  setDeleteConfirmOpen: (v: boolean) => void;

  setActiveGrids: React.Dispatch<React.SetStateAction<Set<GridType>>>;
  setOverlayColor: (v: string) => void;
  setOverlayThickness: (v: number) => void;
  setOverlayOpacity: (v: number) => void;
  toggleGrid: (type: GridType) => void;

  setShapes: React.Dispatch<React.SetStateAction<DrawShape[]>>;
  addShape: (s: DrawShape) => void;
  undoShape: () => void;
  clearShapes: () => void;

  handleMemoSave: () => Promise<void>;
  handleLinkWorkout: () => Promise<void>;
  handleAnnotationSave: (currentTime: number) => Promise<void>;
  handleDelete: () => void;
  executeDelete: () => Promise<void>;
}

export function useVideoDetail(
  id: string,
  userId: string | undefined,
  authLoading: boolean,
  showToast: (msg: string, type: "success" | "error") => void,
): VideoDetailState & VideoDetailActions {
  const router = useRouter();

  const [video, setVideo] = useState<Video | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const [activeGrids, setActiveGrids] = useState<Set<GridType>>(() => new Set(["sixteen"]));
  const [overlayColor, setOverlayColor] = useState("#FFFFFF");
  const [overlayThickness, setOverlayThickness] = useState(1);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);

  const [shapes, setShapes] = useState<DrawShape[]>([]);

  const [memo, setMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);

  const [linkedWorkoutTitle, setLinkedWorkoutTitle] = useState<string | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [pendingWorkoutId, setPendingWorkoutId] = useState("");
  const [linkSaving, setLinkSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [annotationId, setAnnotationId] = useState<string | null>(null);
  const [annotationSaving, setAnnotationSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // ── Data loading ──
  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setDataLoading(false);
      return;
    }

    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        setDataLoading(false);
        return;
      }

      const v: Video = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        exercise_type: data.exercise_type,
        shot_date: data.shot_date ?? "",
        file_path: data.file_path,
        thumbnail_path: data.thumbnail_path,
        duration: data.duration,
        memo: data.memo ?? "",
        workout_session_id: data.workout_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setVideo(v);
      setMemo(v.memo);

      if (data.file_path) {
        const { data: signed, error: signErr } = await supabase.storage
          .from("videos")
          .createSignedUrl(data.file_path, 3600);

        if (signed?.signedUrl) {
          setVideoSrc(signed.signedUrl);
        } else if (signErr) {
          setPlaybackError("動画の読み込みURLを取得できませんでした。Storage の権限を確認してください。");
        }
      }

      if (data.workout_id) {
        const { data: wo } = await supabase
          .from("workouts")
          .select("title")
          .eq("id", data.workout_id)
          .single();
        if (wo?.title) setLinkedWorkoutTitle(wo.title);
      } else {
        setLinkedWorkoutTitle(null);
      }

      const { data: list } = await supabase
        .from("workouts")
        .select("id, title, workout_date")
        .eq("user_id", userId)
        .order("workout_date", { ascending: false })
        .limit(20);
      if (list) setRecentWorkouts(list as RecentWorkout[]);

      const { data: ann } = await supabase
        .from("video_annotations")
        .select("*")
        .eq("video_id", data.id)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ann) {
        const row = ann as unknown as AnnotationRow;
        setAnnotationId(row.id);
        if (row.grid_settings) setActiveGrids(new Set(row.grid_settings));
        if (row.drawing_shapes) setShapes(row.drawing_shapes);
        if (row.overlay_color) setOverlayColor(row.overlay_color);
        if (row.overlay_thickness != null) setOverlayThickness(row.overlay_thickness);
        if (row.overlay_opacity != null) setOverlayOpacity(row.overlay_opacity);
      }

      setDataLoading(false);
    })();
  }, [id, userId, authLoading]);

  useEffect(() => {
    if (!video) return;
    setPendingWorkoutId(video.workout_session_id ?? "");
  }, [video?.id, video?.workout_session_id]);

  useEffect(() => {
    if (videoSrc) setPlaybackError(null);
  }, [videoSrc]);

  // ── Grid toggle ──
  const toggleGrid = useCallback((type: GridType) => {
    setActiveGrids((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }, []);

  // ── Shapes ──
  const addShape = useCallback((s: DrawShape) => setShapes((prev) => [...prev, s]), []);
  const undoShape = useCallback(() => setShapes((prev) => prev.slice(0, -1)), []);
  const clearShapes = useCallback(() => setShapes([]), []);

  // ── Memo save ──
  const handleMemoSave = useCallback(async () => {
    if (!userId || !video) return;
    setMemoSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("videos")
      .update({ memo })
      .eq("id", video.id)
      .eq("user_id", userId);

    if (error) {
      showToast("メモの保存に失敗しました", "error");
    } else {
      showToast("メモを保存しました", "success");
    }
    setMemoSaving(false);
  }, [userId, video, memo, showToast]);

  // ── Link workout ──
  const handleLinkWorkout = useCallback(async () => {
    if (!userId || !video) return;
    setLinkSaving(true);
    const supabase = createClient();
    const nextId = pendingWorkoutId || null;
    const { error } = await supabase
      .from("videos")
      .update({ workout_id: nextId })
      .eq("id", video.id)
      .eq("user_id", userId);

    if (error) {
      showToast("ワークアウトの紐付けに失敗しました", "error");
      setLinkSaving(false);
      return;
    }

    setVideo((prev) => (prev ? { ...prev, workout_session_id: nextId } : null));

    if (!nextId) {
      setLinkedWorkoutTitle(null);
    } else {
      const hit = recentWorkouts.find((w) => w.id === nextId);
      if (hit?.title) {
        setLinkedWorkoutTitle(hit.title);
      } else {
        const { data: wo } = await supabase
          .from("workouts")
          .select("title")
          .eq("id", nextId)
          .single();
        setLinkedWorkoutTitle(wo?.title ?? null);
      }
    }

    showToast("ワークアウトを紐付けました", "success");
    setLinkSaving(false);
  }, [userId, video, pendingWorkoutId, recentWorkouts, showToast]);

  // ── Annotation save ──
  const handleAnnotationSave = useCallback(async (currentTime: number) => {
    if (!userId || !video) return;
    setAnnotationSaving(true);
    const supabase = createClient();

    const payload = {
      video_id: video.id,
      user_id: userId,
      frame_time: currentTime,
      grid_settings: Array.from(activeGrids) as unknown as Json,
      drawing_shapes: shapes as unknown as Json,
      overlay_color: overlayColor,
      overlay_thickness: overlayThickness,
      overlay_opacity: overlayOpacity,
    };

    let err;
    if (annotationId) {
      const res = await supabase
        .from("video_annotations")
        .update(payload)
        .eq("id", annotationId);
      err = res.error;
    } else {
      const res = await supabase
        .from("video_annotations")
        .insert(payload)
        .select("id")
        .single();
      err = res.error;
      if (res.data) setAnnotationId(res.data.id);
    }

    if (err) {
      showToast("アノテーションの保存に失敗しました", "error");
    } else {
      showToast("アノテーションを保存しました", "success");
    }
    setAnnotationSaving(false);
  }, [userId, video, activeGrids, shapes, overlayColor, overlayThickness, overlayOpacity, annotationId, showToast]);

  // ── Delete ──
  const handleDelete = useCallback(() => {
    setDeleteConfirmOpen(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (!userId || !video) return;
    setDeleteConfirmOpen(false);
    setDeleting(true);
    const supabase = createClient();

    if (video.file_path) {
      const { error: storageErr } = await supabase.storage
        .from("videos")
        .remove([video.file_path]);
      if (storageErr) {
        showToast("ストレージからの削除に失敗しました", "error");
        setDeleting(false);
        return;
      }
    }

    if (video.thumbnail_path) {
      await supabase.storage.from("videos").remove([video.thumbnail_path]);
    }

    await supabase
      .from("video_annotations")
      .delete()
      .eq("video_id", video.id)
      .eq("user_id", userId);

    const { error: dbErr } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id)
      .eq("user_id", userId);

    if (dbErr) {
      showToast("動画の削除に失敗しました", "error");
      setDeleting(false);
      return;
    }

    showToast("動画を削除しました", "success");
    router.replace("/videos");
  }, [userId, video, showToast, router]);

  return {
    video,
    videoSrc,
    dataLoading,
    playbackError,
    memo,
    memoSaving,
    linkedWorkoutTitle,
    recentWorkouts,
    pendingWorkoutId,
    linkSaving,
    deleting,
    annotationId,
    annotationSaving,
    deleteConfirmOpen,
    overlay: { activeGrids, overlayColor, overlayThickness, overlayOpacity },
    shapes,

    setMemo,
    setPendingWorkoutId,
    setPlaybackError,
    setDeleteConfirmOpen,
    setActiveGrids,
    setOverlayColor,
    setOverlayThickness,
    setOverlayOpacity,
    toggleGrid,
    setShapes,
    addShape,
    undoShape,
    clearShapes,
    handleMemoSave,
    handleLinkWorkout,
    handleAnnotationSave,
    handleDelete,
    executeDelete,
  };
}
