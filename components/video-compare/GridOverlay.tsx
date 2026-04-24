"use client";

type GridType = "sixteen" | "center_v" | "center_h";

export function GridOverlay({ activeGrids }: { activeGrids: Set<GridType> }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      {activeGrids.has("sixteen") && (
        <>
          {[1, 2, 3].map((i) => (
            <line key={`v${i}`} x1={`${(i / 4) * 100}%`} y1="0" x2={`${(i / 4) * 100}%`} y2="100%" stroke="white" strokeOpacity={0.25} strokeWidth={0.5} />
          ))}
          {[1, 2, 3].map((i) => (
            <line key={`h${i}`} x1="0" y1={`${(i / 4) * 100}%`} x2="100%" y2={`${(i / 4) * 100}%`} stroke="white" strokeOpacity={0.25} strokeWidth={0.5} />
          ))}
        </>
      )}
      {activeGrids.has("center_v") && (
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#3eed8d" strokeOpacity={0.5} strokeWidth={1} />
      )}
      {activeGrids.has("center_h") && (
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#3eed8d" strokeOpacity={0.5} strokeWidth={1} />
      )}
    </svg>
  );
}
