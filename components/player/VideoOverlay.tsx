"use client";

type GridType = "sixteen" | "center_v" | "center_h";

interface Props {
  activeGrids: Set<GridType>;
  color: string;
  thickness: number;
  opacity: number;
}

export function VideoOverlay({ activeGrids, color, thickness, opacity }: Props) {
  if (activeGrids.size === 0) return null;

  const outer = { stroke: color, strokeWidth: thickness * 0.6, strokeOpacity: opacity * 0.6 };
  const center = { stroke: color, strokeWidth: thickness, strokeOpacity: opacity };

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      {activeGrids.has("sixteen") && (
        <>
          {/* Outer lines (25%, 75%) */}
          <line x1="25%" y1="0" x2="25%" y2="100%" {...outer} />
          <line x1="75%" y1="0" x2="75%" y2="100%" {...outer} />
          <line x1="0" y1="25%" x2="100%" y2="25%" {...outer} />
          <line x1="0" y1="75%" x2="100%" y2="75%" {...outer} />
          {/* Center lines (50%) */}
          <line x1="50%" y1="0" x2="50%" y2="100%" {...center} />
          <line x1="0" y1="50%" x2="100%" y2="50%" {...center} />
        </>
      )}
      {activeGrids.has("center_v") && !activeGrids.has("sixteen") && (
        <line x1="50%" y1="0" x2="50%" y2="100%" {...center} />
      )}
      {activeGrids.has("center_h") && !activeGrids.has("sixteen") && (
        <line x1="0" y1="50%" x2="100%" y2="50%" {...center} />
      )}
    </svg>
  );
}
