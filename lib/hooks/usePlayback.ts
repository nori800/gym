"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const FRAME_STEP = 1 / 30;

export function usePlayback(videoSrc: string | null) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoSrc) return;
    el.load();
  }, [videoSrc]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => { if (!seeking) setCurrentTime(v.currentTime); };
    const onLoaded = () => setDuration(v.duration);
    const onEnded = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("ended", onEnded);
    };
  }, [seeking]);

  useEffect(() => {
    if (!speedOpen) return;
    const close = () => setSpeedOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [speedOpen]);

  const togglePlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !videoSrc) return;
    if (v.paused) {
      try {
        await v.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [videoSrc]);

  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  }, []);

  const stepFrame = useCallback((direction: 1 | -1) => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.paused) {
      v.pause();
      setPlaying(false);
    }
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + direction * FRAME_STEP));
  }, []);

  const selectSpeed = useCallback((s: number) => {
    setSpeed(s);
    setSpeedOpen(false);
    if (videoRef.current) videoRef.current.playbackRate = s;
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  }, []);

  return {
    videoRef,
    playing,
    currentTime,
    duration,
    speed,
    speedOpen,
    seeking,
    setSpeedOpen,
    setSeeking,
    togglePlay,
    skip,
    stepFrame,
    selectSpeed,
    handleSeek,
    setPlaying,
  };
}
