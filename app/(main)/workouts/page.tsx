"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MOCK_WORKOUTS } from "@/lib/mocks/workouts";
import { formatDate } from "@/lib/utils/formatDate";
import { BodyDetail } from "@/components/body/BodyDetail";

type Tab = "training" | "body";

export default function WorkoutsPage() {
  const [tab, setTab] = useState<Tab>("training");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-title">履歴</h1>
        {tab === "training" && (
          <Link
            href="/workouts/new"
            className="flex items-center gap-1 text-xs font-title text-primary"
          >
            <Plus size={14} strokeWidth={2} />
            記録
          </Link>
        )}
      </div>

      {/* Segmented control */}
      <div className="flex gap-1 rounded-lg bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab("training")}
          className={`flex-1 rounded-md py-2 text-xs font-title transition-all duration-200 ${
            tab === "training" ? "bg-white text-primary shadow-sm" : "text-muted"
          }`}
        >
          トレーニング
        </button>
        <button
          type="button"
          onClick={() => setTab("body")}
          className={`flex-1 rounded-md py-2 text-xs font-title transition-all duration-200 ${
            tab === "body" ? "bg-white text-primary shadow-sm" : "text-muted"
          }`}
        >
          カラダ
        </button>
      </div>

      {tab === "training" ? <TrainingList /> : <BodyDetail />}
    </div>
  );
}

function TrainingList() {
  if (MOCK_WORKOUTS.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">記録がありません</p>;
  }

  return (
    <div className="divide-y divide-border">
      {MOCK_WORKOUTS.map((w) => (
        <Link
          key={w.id}
          href={`/workouts/${w.id}`}
          className="flex items-center justify-between py-3.5 transition-colors active:bg-surface"
        >
          <div>
            <p className="text-sm font-title">{w.exercise_type}</p>
            <p className="mt-0.5 text-[11px] text-muted">
              {w.weight != null && `${w.weight}kg`}
              {w.reps != null && ` × ${w.reps}回`}
              {w.sets != null && ` × ${w.sets}セット`}
            </p>
          </div>
          <span className="text-[11px] text-muted">{formatDate(w.log_date)}</span>
        </Link>
      ))}
    </div>
  );
}
