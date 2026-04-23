"use client";

import { useState, useMemo, useRef, useEffect } from "react";

interface ProgressGraphProps {
  data: { date: string; maxWeight: number; totalVolume: number }[];
  mode: "weight" | "volume";
}

type Period = "1M" | "3M" | "6M" | "ALL";

const PERIODS: { key: Period; label: string; months: number | null }[] = [
  { key: "1M", label: "1M", months: 1 },
  { key: "3M", label: "3M", months: 3 },
  { key: "6M", label: "6M", months: 6 },
  { key: "ALL", label: "ALL", months: null },
];

const ACCENT = "#3eed8d";
const FILL = "rgba(62,237,141,0.12)";

const PADDING = { top: 28, right: 16, bottom: 32, left: 42 };
const VIEW_HEIGHT = 200;

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function niceStep(range: number, targetTicks: number): number {
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  if (residual <= 1.5) return mag;
  if (residual <= 3) return 2 * mag;
  if (residual <= 7) return 5 * mag;
  return 10 * mag;
}

export function ProgressGraph({ data, mode }: ProgressGraphProps) {
  const [period, setPeriod] = useState<Period>("3M");
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  const filtered = useMemo(() => {
    if (!data.length) return [];
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const pCfg = PERIODS.find((p) => p.key === period)!;
    if (!pCfg.months) return sorted;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - pCfg.months);
    return sorted.filter((d) => new Date(d.date) >= cutoff);
  }, [data, period]);

  const values = filtered.map((d) => (mode === "weight" ? d.maxWeight : d.totalVolume));
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const range = maxVal - minVal || 1;
  const yPad = range * 0.1;
  const yMin = Math.max(0, minVal - yPad);
  const yMax = maxVal + yPad;
  const yRange = yMax - yMin || 1;

  const chartW = width - PADDING.left - PADDING.right;
  const chartH = VIEW_HEIGHT - PADDING.top - PADDING.bottom;

  const points = filtered.map((d, i) => {
    const val = mode === "weight" ? d.maxWeight : d.totalVolume;
    const x = PADDING.left + (filtered.length > 1 ? (i / (filtered.length - 1)) * chartW : chartW / 2);
    const y = PADDING.top + chartH - ((val - yMin) / yRange) * chartH;
    return { x, y, val, date: d.date };
  });

  const step = niceStep(yRange, 4);
  const gridStart = Math.ceil(yMin / step) * step;
  const gridLines: number[] = [];
  for (let v = gridStart; v <= yMax; v += step) gridLines.push(v);

  const xLabels = useMemo(() => {
    if (filtered.length <= 1) return filtered.map((_, i) => i);
    const maxLabels = Math.max(2, Math.floor(chartW / 48));
    if (filtered.length <= maxLabels) return filtered.map((_, i) => i);
    const spacing = Math.ceil(filtered.length / maxLabels);
    const result: number[] = [];
    for (let i = 0; i < filtered.length; i += spacing) result.push(i);
    if (result[result.length - 1] !== filtered.length - 1) result.push(filtered.length - 1);
    return result;
  }, [filtered.length, chartW]);

  const linePath =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
      : "";

  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].x},${PADDING.top + chartH} L${points[0].x},${PADDING.top + chartH} Z`
      : "";

  const unit = mode === "weight" ? "kg" : "kg";
  const ariaLabel = `${mode === "weight" ? "最大重量" : "総ボリューム"}の推移グラフ。${
    filtered.length
      ? `${fmtDate(filtered[0].date)}〜${fmtDate(filtered[filtered.length - 1].date)}、${filtered.length}件のデータ`
      : "データなし"
  }`;

  return (
    <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]">
      {/* Period tabs */}
      <div className="flex gap-1 px-4 pt-4">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={`rounded-full px-3 py-1 text-[11px] font-label transition-colors ${
              period === p.key
                ? "bg-inverse text-on-inverse"
                : "bg-surface text-secondary active:bg-chip"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2 pb-3 pt-1">
        {filtered.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted">データがありません</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width || 300} ${VIEW_HEIGHT}`}
            width="100%"
            height={VIEW_HEIGHT}
            role="img"
            aria-label={ariaLabel}
            className="overflow-visible"
          >
            {width > 0 && (
              <>
                {/* Grid lines */}
                {gridLines.map((v) => {
                  const y = PADDING.top + chartH - ((v - yMin) / yRange) * chartH;
                  return (
                    <g key={v}>
                      <line
                        x1={PADDING.left}
                        x2={PADDING.left + chartW}
                        y1={y}
                        y2={y}
                        stroke="#EBEBEB"
                        strokeWidth={1}
                        strokeDasharray="3,3"
                      />
                      <text
                        x={PADDING.left - 6}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-muted text-[9px]"
                      >
                        {v % 1 === 0 ? v : v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {xLabels.map((idx) => {
                  const p = points[idx];
                  if (!p) return null;
                  return (
                    <text
                      key={idx}
                      x={p.x}
                      y={PADDING.top + chartH + 16}
                      textAnchor="middle"
                      className="fill-muted text-[9px]"
                    >
                      {fmtDate(filtered[idx].date)}
                    </text>
                  );
                })}

                {/* Area fill */}
                {areaPath && <path d={areaPath} fill={FILL} />}

                {/* Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={i === points.length - 1 ? 4.5 : 3}
                    fill={i === points.length - 1 ? ACCENT : "white"}
                    stroke={ACCENT}
                    strokeWidth={2}
                  />
                ))}

                {/* Latest value label */}
                {points.length > 0 && (() => {
                  const last = points[points.length - 1];
                  return (
                    <text
                      x={last.x}
                      y={last.y - 10}
                      textAnchor="middle"
                      className="fill-primary text-[11px] font-metric"
                    >
                      {last.val}{unit}
                    </text>
                  );
                })()}
              </>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
