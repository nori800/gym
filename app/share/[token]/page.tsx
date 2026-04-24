import { Dumbbell, Film, Clock, Weight, Calendar, AlertTriangle, TimerOff } from "lucide-react";

type SharedData = {
  shared_at: string;
  expires_at: string;
  video?: {
    id: string;
    title: string;
    exercise_type: string;
    shot_date: string;
    duration: number | null;
    memo: string | null;
    video_url: string | null;
  };
  workout?: {
    id: string;
    title: string;
    workout_date: string;
    blocks_json: unknown;
    total_sets: number | null;
    total_volume: number | null;
  };
};

async function fetchSharedData(
  token: string,
  origin: string,
): Promise<{ data?: SharedData; error?: string; expired?: boolean }> {
  try {
    const res = await fetch(`${origin}/api/share?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    if (res.status === 410) {
      return { error: "この共有リンクは期限切れです", expired: true };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.error || "共有リンクが無効です" };
    }
    return { data: await res.json() };
  } catch {
    return { error: "データの取得に失敗しました" };
  }
}

function fmtDuration(s: number | null | undefined) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

type BlockJson = {
  name?: string;
  movements?: {
    nameJa?: string;
    weight?: number;
    reps?: number;
    sets?: number;
  }[];
};

export default async function SharedLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const { data, error, expired } = await fetchSharedData(token, origin);

  if (expired) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <TimerOff size={28} strokeWidth={1.5} className="text-secondary" />
        </div>
        <h1 className="text-lg font-bold text-primary">リンクの期限が切れました</h1>
        <p className="max-w-sm text-sm leading-relaxed text-secondary">
          この共有リンクは有効期限が過ぎています。共有元に再度リンクの作成を依頼してください。
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <AlertTriangle size={28} strokeWidth={1.5} className="text-danger" />
        </div>
        <h1 className="text-lg font-bold text-primary">リンクが無効です</h1>
        <p className="max-w-sm text-sm leading-relaxed text-secondary">
          {error || "この共有リンクは期限切れか、無効です。"}
        </p>
      </div>
    );
  }

  const sharedDate = new Date(data.shared_at).toLocaleDateString("ja-JP");
  const expiresDate = new Date(data.expires_at).toLocaleDateString("ja-JP");

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto max-w-lg px-5 pb-10 pt-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            FormCheck
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-primary">
            共有されたデータ
          </h1>
          <p className="mt-1 text-xs text-secondary">
            共有日: {sharedDate} · 有効期限: {expiresDate}
          </p>
        </div>

        {/* Video Section */}
        {data.video && (
          <section className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            {/* Video Player */}
            {data.video.video_url ? (
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={data.video.video_url}
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-neutral-100">
                <div className="text-center">
                  <Film size={32} strokeWidth={1.5} className="mx-auto text-muted" />
                  <p className="mt-2 text-xs text-secondary">動画を読み込めませんでした</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 border-b border-border px-[18px] py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
                <Film size={18} strokeWidth={1.5} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  動画
                </p>
                <h2 className="mt-0.5 truncate text-base font-bold tracking-tight">
                  {data.video.title}
                </h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              <InfoRow icon={Dumbbell} label="種目" value={data.video.exercise_type} />
              <InfoRow icon={Calendar} label="撮影日" value={data.video.shot_date} />
              <InfoRow icon={Clock} label="長さ" value={fmtDuration(data.video.duration)} />
              {data.video.memo && (
                <div className="px-[18px] py-3">
                  <p className="text-xs font-semibold text-secondary">メモ</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-primary">
                    {data.video.memo}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Workout Section */}
        {data.workout && (
          <section className="mt-4 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <div className="flex items-center gap-3 border-b border-border px-[18px] py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
                <Dumbbell size={18} strokeWidth={1.5} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  ワークアウト
                </p>
                <h2 className="mt-0.5 truncate text-base font-bold tracking-tight">
                  {data.workout.title}
                </h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              <InfoRow icon={Calendar} label="日付" value={data.workout.workout_date} />
              <InfoRow
                icon={Dumbbell}
                label="合計セット"
                value={data.workout.total_sets != null ? `${data.workout.total_sets} セット` : "—"}
              />
              <InfoRow
                icon={Weight}
                label="総重量"
                value={
                  data.workout.total_volume != null
                    ? `${data.workout.total_volume.toLocaleString()} kg`
                    : "—"
                }
              />
            </div>

            {/* Blocks */}
            {Array.isArray(data.workout.blocks_json) && (
              <div className="border-t border-border px-[18px] py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  種目
                </p>
                <div className="mt-3 space-y-2">
                  {(data.workout.blocks_json as BlockJson[]).map((block, bi) => (
                    <div key={bi}>
                      {block.name && (
                        <p className="mb-1 text-xs font-bold text-secondary">
                          {block.name}
                        </p>
                      )}
                      {block.movements?.map((m, mi) => (
                        <div
                          key={mi}
                          className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
                        >
                          <span className="text-sm font-bold">{m.nameJa || "不明"}</span>
                          <span className="text-sm font-medium text-secondary">
                            {m.weight ?? 0}kg × {m.reps ?? 0} × {m.sets ?? 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-secondary">
          FormCheck で共有されたデータです
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 px-[18px]">
      <Icon size={14} strokeWidth={1.5} className="shrink-0 text-secondary" />
      <span className="text-sm text-secondary">{label}</span>
      <span className="ml-auto text-sm font-medium text-primary">{value}</span>
    </div>
  );
}
