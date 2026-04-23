"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { BodyLog } from "@/types";
import { RecordDateBlock } from "@/components/common/RecordDateBlock";

type Range = "week" | "month" | "year";

const RANGE_OPTIONS: { key: Range; label: string }[] = [
  { key: "week", label: "1週間" },
  { key: "month", label: "1ヶ月" },
  { key: "year", label: "1年" },
];

function getTodayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function filterByRange(data: BodyLog[], range: Range): BodyLog[] {
  const today = getTodayIso();
  const cutoff = new Date(`${today}T12:00:00`);
  if (range === "week") cutoff.setDate(cutoff.getDate() - 7);
  else if (range === "month") cutoff.setMonth(cutoff.getMonth() - 1);
  else cutoff.setFullYear(cutoff.getFullYear() - 1);
  return data.filter((d) => new Date(`${d.log_date}T12:00:00`) >= cutoff);
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
  const date = new Date(`${d}T12:00:00`);
  if (range === "year") return `${date.getFullYear()}/${date.getMonth() + 1}`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

type BodyDetailProps = {
  logs: BodyLog[];
  onEdit?: (log: BodyLog) => void;
  onDelete?: (log: BodyLog) => void;
};

export function BodyDetail({ logs, onEdit, onDelete }: BodyDetailProps) {
  const [range, setRange] = useState<Range>("month");
  const data = useMemo(() => filterByRange(logs, range), [logs, range]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <span className="text-2xl font-light text-muted">∿</span>
        </div>
        <p className="mt-5 text-[15px] font-bold">この期間のデータがありません</p>
        <p className="mt-2 text-center text-sm text-secondary">
          右下のボタンから記録を追加できます
        </p>
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
  const toYf = (v: number) =>
    fAxis ? PT + ((fAxis.hi - v) / (fAxis.hi - fAxis.lo)) * chartH : 0;

  const weightPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toYw(d.weight).toFixed(1)}`)
    .join(" ");
  const fillPath = `${weightPath} L${toX(data.length - 1).toFixed(1)},${PT + chartH} L${PL},${PT + chartH} Z`;

  const fatPath =
    fAxis && fats.length >= 2
      ? data
          .filter((d) => d.body_fat != null)
          .map((d, i) => {
            const idx = data.indexOf(d);
            return `${i === 0 ? "M" : "L"}${toX(idx).toFixed(1)},${toYf(d.body_fat!).toFixed(1)}`;
          })
          .join(" ")
      : null;

  const xLabelCount = range === "week" ? data.length : range === "month" ? 4 : 5;
  const xLabelIndices: number[] = [];
  if (data.length <= xLabelCount) {
    data.forEach((_, i) => xLabelIndices.push(i));
  } else {
    for (let i = 0; i < xLabelCount; i++)
      xLabelIndices.push(Math.round((i / (xLabelCount - 1)) * (data.length - 1)));
  }

  return (
    <div className="space-y-6">
      {/* Latest summary */}
      <article className="overflow-hidden rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
          最新の記録
        </p>
        <div className="mt-2">
          <RecordDateBlock iso={latest.log_date} />
        </div>
        <div className="mt-4 flex items-end gap-8 border-t border-border pt-4">
          <div>
            <p className="text-2xl font-metric leading-none">
              {latest.weight}
              <span className="text-sm font-caption text-muted"> kg</span>
            </p>
            <p className="mt-1.5 text-[12px] text-secondary">
              表示期間の変化{" "}
              <span className={totalDiff <= 0 ? "font-semibold text-primary" : "font-semibold text-secondary"}>
                {totalDiffStr} kg
              </span>
            </p>
          </div>
          {latest.body_fat != null && (
            <div>
              <p className="text-xl font-metric leading-none">
                {latest.body_fat}
                <span className="text-sm font-caption text-muted"> %</span>
              </p>
              <p className="mt-1.5 text-[12px] text-muted">体脂肪率</p>
            </div>
          )}
        </div>
      </article>

      {/* Range selector */}
      <div>
        <p className="mb-2 px-0.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
          表示期間
        </p>
        <div className="flex flex-wrap gap-1.5">
          {RANGE_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide transition-all duration-150 active:scale-95 ${
                range === key
                  ? "bg-inverse text-on-inverse"
                  : "bg-white text-secondary shadow-[0_0_0_1px_rgba(0,0,0,.08)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
          推移
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`体重推移グラフ: ${data[0].weight}kg から ${latest.weight}kg`}>
          <path d={fillPath} fill="rgba(62,237,141,0.12)" />

          {wAxis.steps.map((v) => (
            <line
              key={`g${v}`}
              x1={PL}
              y1={toYw(v)}
              x2={W - PR}
              y2={toYw(v)}
              stroke="#EBEBEB"
              strokeWidth={0.5}
            />
          ))}

          <path
            d={weightPath}
            fill="none"
            stroke="#3eed8d"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {fatPath && (
            <path
              d={fatPath}
              fill="none"
              stroke="#999999"
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          )}

          {data.map((d, i) => (
            <circle
              key={d.id}
              cx={toX(i)}
              cy={toYw(d.weight)}
              r={data.length > 20 ? 1.5 : 2.5}
              fill="#3eed8d"
            />
          ))}

          {xLabelIndices.map((i) => (
            <text
              key={`x${i}`}
              x={toX(i)}
              y={H - 4}
              textAnchor="middle"
              className="fill-muted text-[8px]"
            >
              {formatXLabel(data[i].log_date, range)}
            </text>
          ))}

          {wAxis.steps.map((v) => (
            <text
              key={`yw${v}`}
              x={PL - 4}
              y={toYw(v) + 3}
              textAnchor="end"
              className="fill-secondary text-[7px]"
            >
              {v.toFixed(v % 1 === 0 ? 0 : 1)}
            </text>
          ))}

          {fAxis &&
            fAxis.steps.map((v) => (
              <text
                key={`yf${v}`}
                x={W - PR + 4}
                y={toYf(v) + 3}
                textAnchor="start"
                className="fill-secondary text-[7px]"
              >
                {v.toFixed(v % 1 === 0 ? 0 : 1)}%
              </text>
            ))}
        </svg>

        <div className="mt-3 flex gap-4 text-[10px] text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 rounded-full bg-accent" /> 体重 (kg)
          </span>
          {fats.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-[1px] w-3 border-t border-dashed border-muted" />{" "}
              体脂肪 (%)
            </span>
          )}
        </div>
      </div>

      {/* History list */}
      <section>
        <p className="mb-2 px-0.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
          記録一覧
        </p>
        <div className="space-y-2.5">
          {[...data].reverse().slice(0, 12).map((d) => (
            <article
              key={d.id}
              className="overflow-hidden rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]"
            >
              <div className="flex items-start justify-between">
                <RecordDateBlock iso={d.log_date} />
                {(onEdit || onDelete) && (
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(d)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
                        aria-label={`${d.log_date} の記録を編集`}
                      >
                        <Pencil size={14} strokeWidth={1.5} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(d)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-danger/70 transition-all active:bg-danger/10 active:scale-95"
                        aria-label={`${d.log_date} の記録を削除`}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-xl font-metric leading-none">
                  {d.weight}
                  <span className="text-xs font-caption text-muted"> kg</span>
                </span>
                {d.body_fat != null && (
                  <span className="text-[15px] font-metric text-secondary">
                    {d.body_fat}
                    <span className="text-xs font-caption text-muted"> %</span>
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
