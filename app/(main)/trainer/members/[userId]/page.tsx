"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Film,
  Dumbbell,
  Scale,
  Loader2,
  UserMinus,
  Video as VideoIcon,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { AppToast } from "@/components/common/AppToast";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/formatDate";

type Tab = "videos" | "workouts" | "body";

type MemberInfo = {
  profileId: string;
  displayName: string;
  weight: number | null;
  workoutCount: number;
  videoCount: number;
};

type VideoItem = {
  id: string;
  title: string;
  exercise_type: string;
  shot_date: string | null;
  duration: number | null;
};

type WorkoutItem = {
  id: string;
  title: string;
  workout_date: string;
  duration_min: number | null;
  total_sets: number | null;
};

type BodyLogItem = {
  id: string;
  log_date: string;
  weight: number | null;
  body_fat_pct: number | null;
};

export default function MemberHubPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast, show, dismiss } = useToast();

  const [tab, setTab] = useState<Tab>("videos");
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [bodyLogs, setBodyLogs] = useState<BodyLogItem[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removing, setRemoving] = useState(false);

  const fetchMemberInfo = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();

    const { data: self } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (self?.role !== "trainer") {
      setAccessError("トレーナーアカウントでログインしてください。");
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, display_name, weight")
      .eq("user_id", userId)
      .eq("trainer_id", user.id)
      .single();

    if (error || !profile) {
      setAccessError("このメンバーのデータにアクセスする権限がありません。");
      setLoading(false);
      return;
    }

    const [woRes, vidRes] = await Promise.all([
      supabase
        .from("workouts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    setMemberInfo({
      profileId: profile.id,
      displayName: profile.display_name || "名前未設定",
      weight: profile.weight,
      workoutCount: woRes.count ?? 0,
      videoCount: vidRes.count ?? 0,
    });
    setLoading(false);
  }, [user, userId]);

  const fetchTabData = useCallback(
    async (t: Tab) => {
      if (!user || loadedTabs.has(t)) return;
      setTabLoading(true);
      const supabase = createClient();

      if (t === "videos") {
        const { data } = await supabase
          .from("videos")
          .select("id, title, exercise_type, shot_date, duration")
          .eq("user_id", userId)
          .order("shot_date", { ascending: false })
          .limit(50);
        setVideos(data ?? []);
      } else if (t === "workouts") {
        const { data } = await supabase
          .from("workouts")
          .select("id, title, workout_date, duration_min, total_sets")
          .eq("user_id", userId)
          .order("workout_date", { ascending: false })
          .limit(50);
        setWorkouts(data ?? []);
      } else {
        const { data } = await supabase
          .from("body_logs")
          .select("id, log_date, weight, body_fat_pct")
          .eq("user_id", userId)
          .order("log_date", { ascending: false })
          .limit(50);
        setBodyLogs(data ?? []);
      }

      setLoadedTabs((prev) => new Set(prev).add(t));
      setTabLoading(false);
    },
    [user, userId, loadedTabs],
  );

  useEffect(() => {
    if (!authLoading && user) {
      fetchMemberInfo();
    } else if (!authLoading) {
      setAccessError("ログインしてください。");
      setLoading(false);
    }
  }, [authLoading, user, fetchMemberInfo]);

  useEffect(() => {
    if (memberInfo) {
      fetchTabData(tab);
    }
  }, [memberInfo, tab, fetchTabData]);

  const handleRemove = useCallback(async () => {
    if (!user || !memberInfo) return;
    setRemoving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ trainer_id: null })
      .eq("id", memberInfo.profileId)
      .eq("trainer_id", user.id);

    if (error) {
      show("解除に失敗しました", "error");
      setRemoving(false);
    } else {
      show(`${memberInfo.displayName} を解除しました`, "success");
      router.push("/trainer");
    }
  }, [user, memberInfo, show, router]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="space-y-4 py-12">
        <div className="rounded-xl bg-danger/10 px-4 py-3">
          <p className="text-sm font-bold text-danger">{accessError}</p>
        </div>
        <Link
          href="/trainer"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary"
        >
          <ArrowLeft size={14} />
          メンバー一覧に戻る
        </Link>
      </div>
    );
  }

  if (!memberInfo) return null;

  const tabs: { key: Tab; label: string; icon: typeof Film }[] = [
    { key: "videos", label: "動画", icon: Film },
    { key: "workouts", label: "WO", icon: Dumbbell },
    { key: "body", label: "ボディ", icon: Scale },
  ];

  return (
    <div className="min-h-[calc(100dvh-6rem)] space-y-5">
      <AppToast toast={toast} onDismiss={dismiss} />
      <ConfirmModal
        open={showRemoveModal}
        title="メンバーを解除"
        description={`${memberInfo.displayName} さんをメンバーから解除しますか？データは削除されません。`}
        confirmLabel="解除する"
        cancelLabel="キャンセル"
        danger
        onConfirm={() => {
          setShowRemoveModal(false);
          handleRemove();
        }}
        onCancel={() => setShowRemoveModal(false)}
      />

      <header className="space-y-3">
        <Link
          href="/trainer"
          className="inline-flex items-center gap-1 text-xs font-bold text-secondary transition-colors active:text-primary"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          メンバー一覧
        </Link>

        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-base font-bold text-primary">
            {memberInfo.displayName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-title tracking-tight">
              {memberInfo.displayName}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-secondary">
              <span className="flex items-center gap-1">
                <Scale size={11} strokeWidth={1.5} />
                {memberInfo.weight != null ? `${memberInfo.weight} kg` : "—"}
              </span>
              <span className="flex items-center gap-1">
                <Dumbbell size={11} strokeWidth={1.5} />
                {memberInfo.workoutCount}
              </span>
              <span className="flex items-center gap-1">
                <Film size={11} strokeWidth={1.5} />
                {memberInfo.videoCount}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="flex rounded-xl bg-chip p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-secondary active:text-primary"
              }`}
            >
              <Icon size={14} strokeWidth={1.5} />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {tabLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        ) : (
          <>
            {tab === "videos" && (
              <VideosTab videos={videos} memberUserId={userId} />
            )}
            {tab === "workouts" && (
              <WorkoutsTab workouts={workouts} memberUserId={userId} />
            )}
            {tab === "body" && <BodyTab bodyLogs={bodyLogs} />}
          </>
        )}
      </div>

      {/* Remove member */}
      <div className="border-t border-border pt-5">
        <button
          type="button"
          onClick={() => setShowRemoveModal(true)}
          disabled={removing}
          className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-danger/20 text-sm font-bold text-danger transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {removing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <UserMinus size={14} strokeWidth={2} />
          )}
          メンバーを解除
        </button>
      </div>
    </div>
  );
}

function VideosTab({
  videos,
  memberUserId,
}: {
  videos: VideoItem[];
  memberUserId: string;
}) {
  if (videos.length === 0) {
    return (
      <EmptyState
        icon={VideoIcon}
        message="動画がまだありません"
        sub="メンバーが撮影すると、ここに表示されます。"
      />
    );
  }
  return (
    <div className="space-y-2.5">
      {videos.map((v) => (
        <Link
          key={v.id}
          href={`/videos/${v.id}?member=${encodeURIComponent(memberUserId)}`}
          className="flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all active:scale-[0.99]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
            <Film size={16} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-tight">
              {v.title || v.exercise_type}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-secondary">
              <span>{v.exercise_type}</span>
              {v.shot_date && (
                <>
                  <span>·</span>
                  <span>{formatDate(v.shot_date)}</span>
                </>
              )}
              {v.duration != null && (
                <>
                  <span>·</span>
                  <span>{v.duration}秒</span>
                </>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function WorkoutsTab({
  workouts,
  memberUserId,
}: {
  workouts: WorkoutItem[];
  memberUserId: string;
}) {
  if (workouts.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        message="ワークアウトがまだありません"
        sub="メンバーが記録すると、ここに表示されます。"
      />
    );
  }
  return (
    <div className="space-y-2.5">
      {workouts.map((w) => (
        <Link
          key={w.id}
          href={`/workouts?member=${encodeURIComponent(memberUserId)}&open=${encodeURIComponent(w.id)}`}
          className="flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all active:scale-[0.99]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
            <Dumbbell size={16} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-tight">
              {w.title}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-secondary">
              <span>{w.workout_date}</span>
              {w.duration_min != null && (
                <>
                  <span>·</span>
                  <span>{w.duration_min}分</span>
                </>
              )}
              {w.total_sets != null && (
                <>
                  <span>·</span>
                  <span>{w.total_sets}セット</span>
                </>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function BodyTab({ bodyLogs }: { bodyLogs: BodyLogItem[] }) {
  if (bodyLogs.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        message="ボディログがまだありません"
        sub="メンバーが記録すると、ここに表示されます。"
      />
    );
  }
  return (
    <div className="space-y-2.5">
      {bodyLogs.map((log) => (
        <div
          key={log.id}
          className="flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.04)]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
            <Scale size={16} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight">
              {log.weight != null ? `${log.weight} kg` : "—"}
              {log.body_fat_pct != null && (
                <span className="ml-2 text-xs font-normal text-secondary">
                  体脂肪 {log.body_fat_pct}%
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-secondary">{log.log_date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  message: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <Icon size={22} strokeWidth={1.5} className="text-muted" />
      </div>
      <p className="mt-4 text-sm font-bold">{message}</p>
      <p className="mt-1.5 max-w-[240px] text-center text-xs leading-relaxed text-secondary">
        {sub}
      </p>
    </div>
  );
}
