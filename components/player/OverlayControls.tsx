"use client";

import { Grid3x3, Minus, MoveVertical, MoveHorizontal } from "lucide-react";

type GridType = "sixteen" | "center_v" | "center_h";

const GRID_OPTIONS: { type: GridType; icon: typeof Grid3x3; label: string }[] = [
  { type: "sixteen", icon: Grid3x3, label: "16分割" },
  { type: "center_v", icon: MoveVertical, label: "縦中心" },
  { type: "center_h", icon: MoveHorizontal, label: "横中心" },
];

const COLORS = ["#FFFFFF", "#3eed8d", "#EF4444", "#3B82F6"];

interface Props {
  activeGrids: Set<GridType>;
  onToggleGrid: (type: GridType) => void;
  color: string;
  onColorChange: (c: string) => void;
  thickness: number;
  onThicknessChange: (t: number) => void;
  opacity: number;
  onOpacityChange: (o: number) => void;
}

export function OverlayControls({
  activeGrids, onToggleGrid,
  color, onColorChange,
  thickness, onThicknessChange,
  opacity, onOpacityChange,
}: Props) {
  return (
    <div className="space-y-3 rounded-lg bg-surface p-3">
      <div className="flex items-center gap-1">
        {GRID_OPTIONS.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onToggleGrid(type)}
            className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] transition-colors ${
              activeGrids.has(type) ? "bg-white text-primary shadow-sm" : "text-muted"
            }`}
          >
            <Icon size={13} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(c)}
              className={`h-5 w-5 rounded-full border-2 transition-transform ${
                color === c ? "scale-110 border-primary" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="mx-2 h-4 w-px bg-border" />

        <div className="flex items-center gap-1.5">
          <Minus size={10} className="text-muted" />
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.5}
            value={thickness}
            onChange={(e) => onThicknessChange(parseFloat(e.target.value))}
            className="h-1 w-16 accent-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-muted">
          <span>透明度</span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="h-1 w-14 accent-primary"
          />
        </div>
      </div>
    </div>
  );
}
