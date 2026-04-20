"use client";

export function GridOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      {/* 16-division: 4×4 grid */}
      {/* Outer lines (25%, 75%) — thinner */}
      <line x1="25%" y1="0" x2="25%" y2="100%" stroke="white" strokeOpacity={0.2} strokeWidth={0.5} />
      <line x1="75%" y1="0" x2="75%" y2="100%" stroke="white" strokeOpacity={0.2} strokeWidth={0.5} />
      <line x1="0" y1="25%" x2="100%" y2="25%" stroke="white" strokeOpacity={0.2} strokeWidth={0.5} />
      <line x1="0" y1="75%" x2="100%" y2="75%" stroke="white" strokeOpacity={0.2} strokeWidth={0.5} />
      {/* Center lines (50%) — more prominent */}
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeOpacity={0.4} strokeWidth={1} />
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeOpacity={0.4} strokeWidth={1} />
    </svg>
  );
}
