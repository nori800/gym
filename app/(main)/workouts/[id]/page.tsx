import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";
import { MOCK_WORKOUTS, MOCK_WORKOUT_VIDEOS } from "@/lib/mocks/workouts";
import { MOCK_VIDEOS } from "@/lib/mocks/videos";
import { formatDate } from "@/lib/utils/formatDate";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workout = MOCK_WORKOUTS.find((w) => w.id === id);
  if (!workout) notFound();

  const videoIds = MOCK_WORKOUT_VIDEOS[workout.id] ?? [];
  const linkedVideos = MOCK_VIDEOS.filter((v) => videoIds.includes(v.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/workouts" className="text-secondary transition-colors active:text-primary">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-xl font-title">記録詳細</h1>
      </div>

      <div className="rounded-xl bg-surface p-4">
        <p className="font-title">{workout.exercise_type}</p>
        <p className="mt-1 text-xs text-muted">{formatDate(workout.log_date)}</p>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <Stat label="重量" value={workout.weight != null ? `${workout.weight}kg` : "—"} />
          <Stat label="回数" value={workout.reps != null ? `${workout.reps}` : "—"} />
          <Stat label="セット" value={workout.sets != null ? `${workout.sets}` : "—"} />
          <Stat label="RPE" value={workout.rpe != null ? `${workout.rpe}` : "—"} />
        </div>

        {workout.note && (
          <p className="mt-4 border-t border-border pt-3 text-sm text-secondary">{workout.note}</p>
        )}
      </div>

      {linkedVideos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-title uppercase tracking-wider text-muted">関連動画</h2>
          {linkedVideos.map((v) => (
            <Link
              key={v.id}
              href={`/videos/${v.id}`}
              className="flex items-center gap-3 rounded-xl bg-surface p-3 transition-colors active:bg-surface/80"
            >
              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-200">
                <Video size={16} strokeWidth={1.5} className="text-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-title">{v.title}</p>
                <p className="text-[11px] text-muted">{formatDate(v.shot_date)}</p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-metric">{value}</p>
      <p className="text-[10px] font-caption text-muted">{label}</p>
    </div>
  );
}
