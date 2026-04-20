"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MOCK_BODY_LOGS } from "@/lib/mocks/bodyLogs";

export function BodyChart() {
  const data = MOCK_BODY_LOGS.slice(-8);
  if (data.length < 2) return null;

  const weights = data.map((d) => d.weight);
  const wMin = Math.min(...weights) - 0.5;
  const wMax = Math.max(...weights) + 0.5;

  const W = 280;
  const H = 80;
  const PX = 4;
  const PY = 4;
  const chartW = W - PX * 2;
  const chartH = H - PY * 2;

  const toX = (i: number) => PX + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PY + ((wMax - v) / (wMax - wMin)) * chartH;

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.weight).toFixed(1)}`).join(" ");
  const fill = `${path} L${toX(data.length - 1).toFixed(1)},${PY + chartH} L${PX},${PY + chartH} Z`;

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const diff = latest.weight - prev.weight;
  const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

  return (
    <Link href="/body" className="block">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-title uppercase tracking-wider text-muted">体重 · 体脂肪</h2>
          <ChevronRight size={14} className="text-muted" />
        </div>

        <div className="rounded-xl bg-surface p-4">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div>
                <p className="text-2xl font-metric">{latest.weight}<span className="text-sm font-caption text-muted"> kg</span></p>
                <p className="text-[11px] text-muted">
                  前回比 <span className={diff <= 0 ? "text-primary" : "text-secondary"}>{diffStr}</span>
                </p>
              </div>
              {latest.body_fat != null && (
                <div>
                  <p className="text-lg font-metric">{latest.body_fat}<span className="text-sm font-caption text-muted"> %</span></p>
                </div>
              )}
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" preserveAspectRatio="xMidYMid meet">
            <path d={fill} fill="#DCFC67" fillOpacity={0.10} />
            <path d={path} fill="none" stroke="#1A1A1A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={toX(data.length - 1)} cy={toY(latest.weight)} r={3} fill="#1A1A1A" />
          </svg>
        </div>
      </section>
    </Link>
  );
}
