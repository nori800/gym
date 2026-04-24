"use client";

import Link from "next/link";
import {
  Dumbbell,
  Film,
  Scale,
  Loader2,
  ChevronRight,
  UserMinus,
  ExternalLink,
} from "lucide-react";

export type MemberProfile = {
  id: string;
  user_id: string;
  display_name: string;
  weight: number | null;
  workoutCount: number;
  videoCount: number;
};

export type MemberDetail = {
  recentWorkouts: { id: string; title: string; workout_date: string }[];
  recentVideos: { id: string; title: string; exercise_type: string; created_at: string }[];
};

interface MemberCardProps {
  member: MemberProfile;
  isExpanded: boolean;
  detail: MemberDetail | undefined;
  isLoadingDetail: boolean;
  removingId: string | null;
  onToggle: () => void;
  onRemove: () => void;
}

export function MemberCard({
  member,
  isExpanded,
  detail,
  isLoadingDetail,
  removingId,
  onToggle,
  onRemove,
}: MemberCardProps) {
  return (
    <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3.5 px-[18px] py-4 text-left transition-colors duration-150 active:bg-surface"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-primary">
          {member.display_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold tracking-tight">
            {member.display_name}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-secondary">
            <span className="flex items-center gap-1">
              <Scale size={11} strokeWidth={1.5} />
              {member.weight != null ? `${member.weight} kg` : "—"}
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell size={11} strokeWidth={1.5} />
              {member.workoutCount}
            </span>
            <span className="flex items-center gap-1">
              <Film size={11} strokeWidth={1.5} />
              {member.videoCount}
            </span>
          </div>
        </div>
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 text-muted transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border px-[18px] pb-4 pt-3">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="animate-spin text-muted" />
            </div>
          ) : detail ? (
            <div className="space-y-4">
              <DetailSection
                icon={Dumbbell}
                title="最近のワークアウト"
                items={detail.recentWorkouts}
                renderItem={(w) => (
                  <li key={w.id}>
                    <Link
                      href={`/workouts/edit?id=${w.id}`}
                      className="flex min-h-[44px] items-center justify-between rounded-lg bg-surface px-3 py-2 transition-colors active:bg-chip"
                    >
                      <span className="truncate text-sm">{w.title}</span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="text-xs text-secondary">{w.workout_date}</span>
                        <ExternalLink size={12} strokeWidth={1.5} className="text-muted" />
                      </div>
                    </Link>
                  </li>
                )}
                emptyMessage="ワークアウトなし"
              />

              <DetailSection
                icon={Film}
                title="最近の動画"
                items={detail.recentVideos}
                renderItem={(v) => (
                  <li key={v.id}>
                    <Link
                      href={`/videos/${v.id}`}
                      className="flex min-h-[44px] items-center justify-between rounded-lg bg-surface px-3 py-2 transition-colors active:bg-chip"
                    >
                      <span className="truncate text-sm">{v.title || v.exercise_type}</span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="text-xs text-secondary">{v.created_at.slice(0, 10)}</span>
                        <ExternalLink size={12} strokeWidth={1.5} className="text-muted" />
                      </div>
                    </Link>
                  </li>
                )}
                emptyMessage="動画なし"
              />

              <button
                type="button"
                onClick={onRemove}
                disabled={removingId === member.id}
                className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-danger/20 text-sm font-bold text-danger transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {removingId === member.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserMinus size={14} strokeWidth={2} />
                )}
                メンバーを解除
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DetailSection<T>({
  icon: Icon,
  title,
  items,
  renderItem,
  emptyMessage,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
        <Icon size={11} strokeWidth={1.5} />
        {title}
      </p>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1.5">{items.map(renderItem)}</ul>
      ) : (
        <p className="mt-2 text-xs text-secondary">{emptyMessage}</p>
      )}
    </div>
  );
}
