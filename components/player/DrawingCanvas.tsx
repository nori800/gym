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
    const p = getPoint(e);
    setDrawing({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [tool, getPoint]);

  const handleMove = useCallback((e: React.PointerEvent) => {
    if (!drawing) return;
    const p = getPoint(e);
    setDrawing((d) => d ? { ...d, x2: p.x, y2: p.y } : null);
  }, [drawing, getPoint]);

  const handleUp = useCallback(() => {
    if (!drawing || tool === "none") { setDrawing(null); return; }
    const dx = drawing.x2 - drawing.x1;
    const dy = drawing.y2 - drawing.y1;
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      onAdd({ id: `s${++shapeId}`, tool: tool as "line" | "arrow" | "circle", ...drawing, color });
    }
    setDrawing(null);
  }, [drawing, tool, color, onAdd]);

  useEffect(() => {
    if (tool === "none") setDrawing(null);
  }, [tool]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`absolute inset-0 h-full w-full ${tool !== "none" ? "cursor-crosshair" : "pointer-events-none"}`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
    >
      <defs>
        <marker id="arrowMarker" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="currentColor" />
        </marker>
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
  if (shape.tool === "circle") {
    const cx = (shape.x1 + shape.x2) / 2;
    const cy = (shape.y1 + shape.y2) / 2;
    const rx = Math.abs(shape.x2 - shape.x1) / 2;
    const ry = Math.abs(shape.y2 - shape.y1) / 2;
    return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={shape.color} strokeWidth={2} opacity={o} />;
  }
  return (
    <line
      x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
      stroke={shape.color}
      strokeWidth={2}
      opacity={o}
      markerEnd={shape.tool === "arrow" ? "url(#arrowMarker)" : undefined}
      style={{ color: shape.color }}
    />
  );
}
