"use client";

import { useRef, useCallback, useEffect, useState } from "react";

export type DrawTool = "line" | "arrow" | "circle" | "none";

export interface DrawShape {
  id: string;
  tool: "line" | "arrow" | "circle";
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;
}

interface Props {
  tool: DrawTool;
  color: string;
  shapes: DrawShape[];
  onAdd: (shape: DrawShape) => void;
  width: number;
  height: number;
}

const STROKE_W = 5;
const MIN_DRAG = 8;

let shapeId = 0;

export function DrawingCanvas({ tool, color, shapes, onAdd, width, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const getPoint = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * width,
      y: ((e.clientY - rect.top) / rect.height) * height,
    };
  }, [width, height]);

  const handleDown = useCallback((e: React.PointerEvent) => {
    if (tool === "none") return;
    e.preventDefault();
    const p = getPoint(e);
    setDrawing({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [tool, getPoint]);

  const handleMove = useCallback((e: React.PointerEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const p = getPoint(e);
    setDrawing((d) => d ? { ...d, x2: p.x, y2: p.y } : null);
  }, [drawing, getPoint]);

  const handleUp = useCallback(() => {
    if (!drawing || tool === "none") { setDrawing(null); return; }
    const dx = drawing.x2 - drawing.x1;
    const dy = drawing.y2 - drawing.y1;
    if (Math.sqrt(dx * dx + dy * dy) > MIN_DRAG) {
      onAdd({ id: `s${++shapeId}`, tool: tool as "line" | "arrow" | "circle", ...drawing, color });
    }
    setDrawing(null);
  }, [drawing, tool, color, onAdd]);

  useEffect(() => {
    if (tool === "none") setDrawing(null);
  }, [tool]);

  const isActive = tool !== "none";

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`absolute inset-0 h-full w-full ${isActive ? "cursor-crosshair" : "pointer-events-none"}`}
      style={isActive ? { touchAction: "none" } : undefined}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
    >
      <defs>
        {/* Per-color arrow markers so the arrowhead matches the stroke color */}
        {["#3eed8d", "#EF4444", "#3B82F6", "#FFFFFF"].map((c) => (
          <marker
            key={c}
            id={`arrow-${c.replace("#", "")}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <path d="M0,0 L10,3.5 L0,7 Z" fill={c} />
          </marker>
        ))}
      </defs>

      {shapes.map((s) => <ShapeEl key={s.id} shape={s} />)}
      {drawing && tool !== "none" && (
        <ShapeEl shape={{ id: "preview", tool: tool as "line" | "arrow" | "circle", ...drawing, color }} preview />
      )}
    </svg>
  );
}

function ShapeEl({ shape, preview }: { shape: DrawShape; preview?: boolean }) {
  const o = preview ? 0.5 : 1;
  const sw = STROKE_W;

  if (shape.tool === "circle") {
    // Center = drag start, radius = distance to drag end
    const cx = shape.x1;
    const cy = shape.y1;
    const r = Math.sqrt(
      (shape.x2 - shape.x1) ** 2 + (shape.y2 - shape.y1) ** 2,
    );
    return (
      <circle
        cx={cx}
        cy={cy}
        r={Math.max(r, 1)}
        fill="none"
        stroke={shape.color}
        strokeWidth={sw}
        opacity={o}
      />
    );
  }

  const markerId = `arrow-${shape.color.replace("#", "")}`;

  return (
    <line
      x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
      stroke={shape.color}
      strokeWidth={sw}
      strokeLinecap="round"
      opacity={o}
      markerEnd={shape.tool === "arrow" ? `url(#${markerId})` : undefined}
    />
  );
}
