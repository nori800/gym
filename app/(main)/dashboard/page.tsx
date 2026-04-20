import Link from "next/link";
import { ChevronRight, Camera, Plus, Video } from "lucide-react";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { MOCK_WORKOUTS, MOCK_WORKOUT_VIDEOS } from "@/lib/mocks/workouts";
import { formatDate } from "@/lib/utils/formatDate";
import { BodyChart } from "@/components/dashboard/BodyChart";
import { BodyInput } from "@/components/dashboard/BodyInput";

export default function DashboardPage() {
  const thisWeek = MOCK_WORKOUTS.filter((w) => {
    const d = new Date(w.log_date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const latest = MOCK_WORKOUTS[0];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-title">FormCheck</h1>
      </header>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/capture"
          className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3.5 transition-all active:scale-[0.98]"
        >
          <Camera size={18} strokeWidth={1.5} className="text-primary" />
          <div>
            <p className="text-sm font-title text-primary">撮影して記録</p>
            <p className="text-[10px] text-primary/60">フォームチェック</p>
          </div>
        </Link>
        <Link
          href="/workouts/new"
          className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3.5 transition-all active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={1.5} className="text-secondary" />
          <div>
            <p className="text-sm font-title">さっと記録</p>
            <p className="text-[10px] text-muted">動画なし</p>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-surface px-3 py-4">
          <p className="text-lg font-metric">{thisWeek.length}</p>
          <p className="mt-1 text-[10px] font-caption text-muted">今週の記録</p>
        </div>
        <div className="rounded-xl bg-surface px-3 py-4">
          <p className="truncate text-lg font-metric">{latest?.exercise_type ?? "—"}</p>
          <p className="mt-1 text-[10px] font-caption text-muted">直近の種目</p>
        </div>
        <div className="rounded-xl bg-surface px-3 py-4">
          <p className="text-lg font-metric">{MOCK_VIDEOS.length}</p>
          <p className="mt-1 text-[10px] font-caption text-muted">動画本数</p>
        </div>
      </section>

      <BodyInput />

      <BodyChart />

      {/* Recent activity — unified */}
      {MOCK_WORKOUTS.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-title uppercase tracking-wider text-muted">最近のセッション</h2>
            <Link href="/workouts" className="text-[11px] font-label text-secondary">
              すべて見る
            </Link>
          </div>
          <div className="divide-y divide-border rounded-xl bg-surface">
            {MOCK_WORKOUTS.slice(0, 4).map((w) => {
              const videoIds = MOCK_WORKOUT_VIDEOS[w.id] ?? [];
              const hasVideo = videoIds.length > 0;
              return (
                <Link
                  key={w.id}
                  href={`/workouts/${w.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors active:bg-white/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-title">{w.exercise_type}</p>
                      {hasVideo && <Video size={11} strokeWidth={1.5} className="shrink-0 text-muted" />}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {w.weight != null && `${w.weight}kg`}
                      {w.reps != null && ` × ${w.reps}回`}
                      {w.sets != null && ` × ${w.sets}セット`}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted">{formatDate(w.log_date)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="divide-y divide-border">
        <Link
          href="/videos"
          className="flex items-center justify-between py-3.5 transition-colors active:bg-surface"
        >
          <span className="text-sm font-label">動画一覧</span>
          <ChevronRight size={16} className="text-muted" />
        </Link>
      </section>
    </div>
  );
}
