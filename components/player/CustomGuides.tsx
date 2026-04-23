"use client";

import { useCallback, useRef } from "react";

export interface Guide {
  id: string;
  type: "horizontal" | "vertical";
  position: number;
  color: string;
}

interface CustomGuidesProps {
  guides: Guide[];
  onUpdate: (guides: Guide[]) => void;
  containerWidth: number;
  containerHeight: number;
}

let guideIdCounter = 0;

export function CustomGuides({
  guides,
  onUpdate,
  containerWidth,
  containerHeight,
}: CustomGuidesProps) {
  const draggingRef = useRef<string | null>(null);

  const addGuide = useCallback(
    (type: "horizontal" | "vertical") => {
      const newGuide: Guide = {
        id: `guide-${++guideIdCounter}`,
        type,
        position: 50,
        color: "#3eed8d",
      };
      onUpdate([...guides, newGuide]);
    },
    [guides, onUpdate],
  );

  const removeGuide = useCallback(
    (id: string) => {
      onUpdate(guides.filter((g) => g.id !== id));
    },
    [guides, onUpdate],
  );

  const updateColor = useCallback(
    (id: string, color: string) => {
      onUpdate(guides.map((g) => (g.id === id ? { ...g, color } : g)));
    },
    [guides, onUpdate],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      draggingRef.current = id;
      (e.target as SVGElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const svg = (e.currentTarget as SVGSVGElement);
      const rect = svg.getBoundingClientRect();

      const guide = guides.find((g) => g.id === draggingRef.current);
      if (!guide) return;

      let position: number;
      if (guide.type === "horizontal") {
        position = ((e.clientY - rect.top) / rect.height) * 100;
      } else {
        position = ((e.clientX - rect.left) / rect.width) * 100;
      }
      position = Math.max(0, Math.min(100, position));

      onUpdate(
        guides.map((g) =>
          g.id === draggingRef.current ? { ...g, position } : g,
        ),
      );
    },
    [guides, onUpdate],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  return (
    <>
      {/* SVG overlay for guide lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ pointerEvents: draggingRef.current ? "auto" : "none" }}
      >
        {guides.map((guide) => {
          const isH = guide.type === "horizontal";
          const px = isH
            ? 0
            : (guide.position / 100) * containerWidth;
          const py = isH
            ? (guide.position / 100) * containerHeight
            : 0;

          return (
            <line
              key={guide.id}
              x1={isH ? 0 : px}
              y1={isH ? py : 0}
              x2={isH ? containerWidth : px}
              y2={isH ? py : containerHeight}
              stroke={guide.color}
              strokeWidth={2}
              opacity={0.6}
              className="pointer-events-auto cursor-grab active:cursor-grabbing"
              style={{ pointerEvents: "auto" }}
              strokeLinecap="round"
              onPointerDown={(e) => handlePointerDown(e, guide.id)}
            />
          );
        })}
      </svg>

      {/* Controls panel */}
      <div className="flex flex-col gap-2 rounded-lg bg-black/60 p-2 backdrop-blur-sm">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => addGuide("horizontal")}
            className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
          >
            ＋ 水平線
          </button>
          <button
            type="button"
            onClick={() => addGuide("vertical")}
            className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
          >
            ＋ 垂直線
          </button>
        </div>

        {guides.map((guide) => (
          <div key={guide.id} className="flex items-center gap-1.5">
            <span className="min-w-[16px] text-[10px] text-white/60">
              {guide.type === "horizontal" ? "H" : "V"}
            </span>
            <input
              type="color"
              value={guide.color}
              onChange={(e) => updateColor(guide.id, e.target.value)}
              className="h-5 w-5 cursor-pointer rounded border-none bg-transparent"
            />
            <span className="text-[10px] text-white/60 tabular-nums">
              {Math.round(guide.position)}%
            </span>
            <button
              type="button"
              onClick={() => removeGuide(guide.id)}
              className="ml-auto flex h-5 w-5 items-center justify-center rounded text-xs text-white/60 hover:bg-white/20 hover:text-white"
              aria-label={`ガイド${guide.id}を削除`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
