"use client";

import { useState, useMemo } from "react";
import { MOCK_BODY_LOGS } from "@/lib/mocks/bodyLogs";
import type { BodyLog } from "@/types";
import { BodyInput } from "@/components/dashboard/BodyInput";

type Range = "week" | "month" | "year";

const RANGE_LABELS: Record<Range, string> = { week: "1W", month: "1M", year: "1Y" };

function filterByRange(data: BodyLog[], range: Range): BodyLog[] {
  const now = new Date("2026-04-20");
  const cutoff = new Date(now);
  if (range === "week") cutoff.setDate(cutoff.getDate() - 7);
  else if (range === "month") cutoff.setMonth(cutoff.getMonth() - 1);
  else cutoff.setFullYear(cutoff.getFullYear() - 1);
  return data.filter((d) => new Date(d.log_date) >= cutoff);
}

function niceAxis(min: number, max: number, ticks: number) {
  const range = max - min || 1;
  const rawStep = range / (ticks - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const nice = [1, 2, 2.5, 5, 10].find((s) => s * mag >= rawStep)! * mag;
  const lo = Math.floor(min / nice) * nice;
  const hi = Math.ceil(max / nice) * nice;
  const steps: number[] = [];
  for (let v = lo; v <= hi + nice * 0.01; v += nice) steps.push(parseFloat(v.toFixed(2)));
  return { lo, hi, steps };
}

function formatXLabel(d: string, range: Range) {
  const date = new Date(d);
  if (range === "year") return `${date.getFullYear()}/${date.getMonth() + 1}`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function BodyDetail() {
  const [range, setRange] = useState<Range>("month");
  const data = useMemo(() => filterByRange(MOCK_BODY_LOGS, range), [range]);

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <BodyInput />
        <p className="py-16 text-center text-sm text-muted">データがありません</p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const first = data[0];
  const totalDiff = latest.weight - first.weight;
  const totalDiffStr = totalDiff > 0 ? `+${totalDiff.toFixed(1)}` : totalDiff.toFixed(1);

  const weights = data.map((d) => d.weight);
  const fats = data.filter((d) => d.body_fat != null).map((d) => d.body_fat!);

  const wAxis = niceAxis(Math.min(...weights) - 0.5, Math.max(...weights) + 0.5, 5);
  const fAxis = fats.length >= 2 ? niceAxis(Math.min(...fats) - 0.5, Math.max(...fats) + 0.5, 5) : null;

  const W = 340;
  const H = 180;
  const PL = 36;
  const PR = fAxis ? 36 : 16;
  const PT = 10;
  const PB = 22;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  const toX = (i: number) => PL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
  const toYw = (v: number) => PT + ((wAxis.hi - v) / (wAxis.hi - wAxis.lo)) * chartH;
  const toYf = (v: number) => fAxis ? PT + ((fAxis.hi - v) / (fAxis.hi - fAxis.lo)) * chartH : 0;

  const weightPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toYw(d.weight).toFixed(1)}`).join(" ");
  const fillPath = `${weightPath} L${toX(data.length - 1).toFixed(1)},${PT + chartH} L${PL},${PT + chartH} Z`;

  const fatPath = fAxis && fats.length >= 2
    ? data.filter((d) => d.body_fat != null).map((d, i) => `${i === 0 ? "M" : "L"}${toX(data.indexOf(d)).toFixed(1)},${toYf(d.body_fat!).toFixed(1)}`).join(" ")
    : null;

  const xLabelCount = range === "week" ? data.length : range === "month" ? 4 : 5;
  const xLabelIndices: number[] = [];
  if (data.length <= xLabelCount) {
    data.forEach((_, i) => xLabelIndices.push(i));
  } else {
    for (let i = 0; i < xLabelCount; i++) xLabelIndices.push(Math.round((i / (xLabelCount - 1)) * (data.length - 1)));
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-end gap-6">
        <div>
          <p className="text-3xl font-metric">{latest.weight}<span className="text-sm font-caption text-muted"> kg</span></p>
          <p className="mt-0.5 text-[11px] text-muted">
            期間内 <span className={totalDiff <= 0 ? "text-primary" : "text-secondary"}>{totalDiffStr} kg</span>
          </p>
        </div>
        {latest.body_fat != null && (
          <div>
            <p className="text-xl font-metric">{latest.body_fat}<span className="text-sm font-caption text-muted"> %</span></p>
            <p className="mt-0.5 text-[11px] text-muted">体脂肪率</p>
          </div>
        )}
      </div>

      {/* Range tabs */}
      <div className="flex gap-1 rounded-lg bg-surface p-1">
        {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`flex-1 rounded-md py-1.5 text-xs font-title transition-all ${
              range === r ? "bg-white text-primary shadow-sm" : "text-muted"
            }`}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-surface p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          <path d={fillPath} fill="#DCFC67" fillOpacity={0.10} />

          {wAxis.steps.map((v) => (
            <line key={`g${v}`} x1={PL} y1={toYw(v)} x2={W - PR} y2={toYw(v)} stroke="#EBEBEB" strokeWidth={0.5} />
          ))}

          <path d={weightPath} fill="none" stroke="#1A1A1A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

          {fatPath && (
            <path d={fatPath} fill="none" stroke="#B0B0B0" strokeWidth={1} strokeDasharray="3 3" strokeLinecap="round" />
          )}

          {data.map((d, i) => (
            <circle key={d.id} cx={toX(i)} cy={toYw(d.weight)} r={data.length > 20 ? 1.5 : 2.5} fill="#1A1A1A" />
          ))}

          {xLabelIndices.map((i) => (
            <text key={`x${i}`} x={toX(i)} y={H - 4} textAnchor="middle" className="fill-muted text-[8px]">
              {formatXLabel(data[i].log_date, range)}
            </text>
          ))}

          {wAxis.steps.map((v) => (
            <text key={`yw${v}`} x={PL - 4} y={toYw(v) + 3} textAnchor="end" className="fill-muted text-[7px]">
              {v.toFixed(v % 1 === 0 ? 0 : 1)}
            </text>
          ))}

          {fAxis && fAxis.steps.map((v) => (
            <text key={`yf${v}`} x={W - PR + 4} y={toYf(v) + 3} textAnchor="start" className="fill-secondary text-[7px]">
              {v.toFixed(v % 1 === 0 ? 0 : 1)}%
            </text>
          ))}
        </svg>

        <div className="mt-2 flex gap-4 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 rounded-full bg-primary" /> 体重 (kg)
          </span>
          {fats.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-[1px] w-3 border-t border-dashed border-muted" /> 体脂肪 (%)
            </span>
          )}
        </div>
      </div>

      {/* Log list */}
      <section className="space-y-3">
        <h2 className="text-xs font-title uppercase tracking-wider text-muted">記録一覧</h2>
        <div className="divide-y divide-border rounded-xl bg-surface">
          {[...data].reverse().slice(0, 10).map((d) => {
            const date = new Date(d.log_date);
            return (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-muted">
                  {date.getMonth() + 1}/{date.getDate()}
                </span>
                <div className="flex gap-4 text-sm">
                  <span className="font-metric">{d.weight} kg</span>
                  {d.body_fat != null && <span className="text-secondary">{d.body_fat}%</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <BodyInput />
    </div>
  );
}
