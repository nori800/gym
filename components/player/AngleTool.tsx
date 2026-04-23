"use client";

import { useCallback, useRef, useState } from "react";

export interface AngleMeasurement {
  id: string;
  points: [number, number][];
  angle: number;
}

interface AngleToolProps {
  active: boolean;
  measurements: AngleMeasurement[];
  onAdd: (m: AngleMeasurement) => void;
  onClear: () => void;
  width: number;
  height: number;
}

let measureId = 0;

function calcAngle(
  p1: [number, number],
  vertex: [number, number],
  p3: [number, number],
): number {
  const v1x = p1[0] - vertex[0];
  const v1y = p1[1] - vertex[1];
  const v2x = p3[0] - vertex[0];
  const v2y = p3[1] - vertex[1];

  const angle1 = Math.atan2(v1y, v1x);
  const angle2 = Math.atan2(v2y, v2x);

  let diff = Math.abs(angle1 - angle2) * (180 / Math.PI);
  if (diff > 180) diff = 360 - diff;
  return Math.round(diff * 10) / 10;
}

function arcPath(
  vertex: [number, number],
  p1: [number, number],
  p3: [number, number],
  radius: number,
): string {
  const angle1 = Math.atan2(p1[1] - vertex[1], p1[0] - vertex[0]);
  const angle2 = Math.atan2(p3[1] - vertex[1], p3[0] - vertex[0]);

  const startX = vertex[0] + radius * Math.cos(angle1);
  const startY = vertex[1] + radius * Math.sin(angle1);
  const endX = vertex[0] + radius * Math.cos(angle2);
  const endY = vertex[1] + radius * Math.sin(angle2);

  let sweep = angle2 - angle1;
  if (sweep < -Math.PI) sweep += 2 * Math.PI;
  if (sweep > Math.PI) sweep -= 2 * Math.PI;

  const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;
  const sweepFlag = sweep > 0 ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${endX} ${endY}`;
}

const ACCENT = "#3eed8d";
const HIT_RADIUS = 22;

export function AngleTool({
  active,
  measurements,
  onAdd,
  onClear,
  width,
  height,
}: AngleToolProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pending, setPending] = useState<[number, number][]>([]);

  const getPoint = useCallback(
    (e: React.PointerEvent): [number, number] => {
      const svg = svgRef.current;
      if (!svg) return [0, 0];
      const rect = svg.getBoundingClientRect();
      return [
        ((e.clientX - rect.left) / rect.width) * width,
        ((e.clientY - rect.top) / rect.height) * height,
      ];
    },
    [width, height],
  );

  const handleTap = useCallback(
    (e: React.PointerEvent) => {
      if (!active) return;
      const pt = getPoint(e);
      const next = [...pending, pt] as [number, number][];

      if (next.length < 3) {
        setPending(next);
        return;
      }

      const angle = calcAngle(next[0], next[1], next[2]);
      onAdd({
        id: `angle-${++measureId}`,
        points: next,
        angle,
      });
      setPending([]);
    },
    [active, pending, getPoint, onAdd],
  );

  const handleClear = useCallback(() => {
    setPending([]);
    onClear();
  }, [onClear]);

  return (
    <>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={`absolute inset-0 h-full w-full ${active ? "cursor-crosshair" : "pointer-events-none"}`}
        onPointerDown={handleTap}
      >
        {/* Completed measurements */}
        {measurements.map((m) => (
          <MeasurementDisplay key={m.id} measurement={m} />
        ))}

        {/* Pending points */}
        {pending.map((pt, i) => (
          <circle
            key={i}
            cx={pt[0]}
            cy={pt[1]}
            r={HIT_RADIUS}
            fill={ACCENT}
            fillOpacity={0.3}
            stroke={ACCENT}
            strokeWidth={2}
          />
        ))}
        {pending.length === 2 && (
          <line
            x1={pending[0][0]}
            y1={pending[0][1]}
            x2={pending[1][0]}
            y2={pending[1][1]}
            stroke={ACCENT}
            strokeWidth={2}
            strokeDasharray="6 3"
            opacity={0.6}
          />
        )}
      </svg>

      {active && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute bottom-2 right-2 rounded bg-red-600/80 px-2 py-1 text-xs text-white hover:bg-red-600"
        >
          クリア
        </button>
      )}
    </>
  );
}

function MeasurementDisplay({ measurement }: { measurement: AngleMeasurement }) {
  const [p1, vertex, p3] = measurement.points;
  const arcR = 30;

  const labelX = vertex[0] + 36 * Math.cos(
    (Math.atan2(p1[1] - vertex[1], p1[0] - vertex[0]) +
      Math.atan2(p3[1] - vertex[1], p3[0] - vertex[0])) /
      2,
  );
  const labelY = vertex[1] + 36 * Math.sin(
    (Math.atan2(p1[1] - vertex[1], p1[0] - vertex[0]) +
      Math.atan2(p3[1] - vertex[1], p3[0] - vertex[0])) /
      2,
  );

  return (
    <g>
      <line
        x1={p1[0]} y1={p1[1]} x2={vertex[0]} y2={vertex[1]}
        stroke={ACCENT} strokeWidth={2} opacity={0.8}
      />
      <line
        x1={vertex[0]} y1={vertex[1]} x2={p3[0]} y2={p3[1]}
        stroke={ACCENT} strokeWidth={2} opacity={0.8}
      />

      <path
        d={arcPath(vertex, p1, p3, arcR)}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        opacity={0.8}
      />

      {[p1, vertex, p3].map((pt, i) => (
        <circle
          key={i}
          cx={pt[0]} cy={pt[1]}
          r={5}
          fill={ACCENT}
          stroke="white"
          strokeWidth={1}
        />
      ))}

      <text
        x={labelX}
        y={labelY}
        fill="white"
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
      >
        {measurement.angle}°
      </text>
    </g>
  );
}
