"use client";

import { Minus, MoveUpRight, Circle, Trash2, X } from "lucide-react";
import type { DrawTool } from "./DrawingCanvas";

const TOOLS: { tool: DrawTool; icon: typeof Minus; label: string }[] = [
  { tool: "line", icon: Minus, label: "直線" },
  { tool: "arrow", icon: MoveUpRight, label: "矢印" },
  { tool: "circle", icon: Circle, label: "円" },
];

const DRAW_COLORS = ["#3eed8d", "#EF4444", "#3B82F6", "#FFFFFF"];

interface Props {
  activeTool: DrawTool;
  onToolChange: (t: DrawTool) => void;
  drawColor: string;
  onDrawColorChange: (c: string) => void;
  canUndo: boolean;
  onUndo: () => void;
  onClearAll: () => void;
}

export function DrawToolbar({
  activeTool, onToolChange,
  drawColor, onDrawColorChange,
  canUndo, onUndo, onClearAll,
}: Props) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface p-2">
      {TOOLS.map(({ tool, icon: Icon, label }) => (
        <button
          key={tool}
          type="button"
          onClick={() => onToolChange(activeTool === tool ? "none" : tool)}
          className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] transition-colors ${
            activeTool === tool ? "bg-white text-primary shadow-sm" : "text-muted"
          }`}
        >
          <Icon size={13} strokeWidth={1.5} />
          {label}
        </button>
      ))}

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex gap-1">
        {DRAW_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onDrawColorChange(c)}
            className={`h-4 w-4 rounded-full border-2 transition-transform ${
              drawColor === c ? "scale-110 border-primary" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="mx-1 h-4 w-px bg-border" />

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded-md p-1.5 text-muted transition-colors hover:text-primary disabled:opacity-30"
      >
        <X size={13} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={onClearAll}
        disabled={!canUndo}
        className="rounded-md p-1.5 text-muted transition-colors hover:text-danger disabled:opacity-30"
      >
        <Trash2 size={13} strokeWidth={1.5} />
      </button>
    </div>
  );
}
