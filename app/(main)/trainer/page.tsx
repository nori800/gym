"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  UserMinus,
  Dumbbell,
  Film,
  Scale,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { AppToast } from "@/components/common/AppToast";
import { createClient } from "@/lib/supabase/client";

type MemberProfile = {
  id: string;
  user_id: string;
  display_name: string;
  weight: number | null;
  workoutCount: number;
  videoCount: number;
};

type MemberDetail = {
  recentWorkouts: { id: string; title: string; workout_date: string }[];
  recentVideos: { id: string; title: string; exercise_type: string; created_at: string }[];
};

export default function TrainerPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast, show, dismiss } = useToast();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [memberDetail, setMemberDetail] = useState<Record<string, MemberDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    setRole(data?.role ?? null);
  }, [user]);

  const fetchMembers = useCallback(async () => {
    if (!user) {
      setMembers([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, weight")
      .eq("trainer_id", user.id);

    if (!profiles || profiles.length === 0) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const memberIds = profiles.map((p) => p.user_id);

    const [workoutRes, videoRes] = await Promise.all([
      supabase
        .from("workouts")
        .select("user_id")
        .in("user_id", memberIds),
      supabase
        .from("videos")
        .select("user_id")
        .in("user_id", memberIds),
    ]);

    const workoutCounts: Record<string, number> = {};
    const videoCounts: Record<string, number> = {};
    for (const w of workoutRes.data ?? []) {
      workoutCounts[w.user_id] = (workoutCounts[w.user_id] || 0) + 1;
    }
    for (const v of videoRes.data ?? []) {
      videoCounts[v.user_id] = (videoCounts[v.user_id] || 0) + 1;
    }

    setMembers(
      profiles.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name || "名前未設定",
        weight: p.weight,
        workoutCount: workoutCounts[p.user_id] ?? 0,
        videoCount: videoCounts[p.user_id] ?? 0,
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchRole();
      fetchMembers();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user, fetchRole, fetchMembers]);

  useEffect(() => {
    if (role !== null && role !== "trainer") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  const fetchMemberDetail = useCallback(
    async (userId: string) => {
      if (memberDetail[userId]) return;
      setDetailLoading(userId);
      const supabase = createClient();

      const [workoutRes, videoRes] = await Promise.all([
        supabase
          .from("workouts")
          .select("id, title, workout_date")
          .eq("user_id", userId)
          .order("workout_date", { ascending: false })
          .limit(5),
        supabase
          .from("videos")
          .select("id, title, exercise_type, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setMemberDetail((prev) => ({
        ...prev,
        [userId]: {
          recentWorkouts: workoutRes.data ?? [],
          recentVideos: videoRes.data ?? [],
        },
      }));
      setDetailLoading(null);
    },
    [memberDetail],
  );

  const toggleMember = useCallback(
    (userId: string) => {
      if (expandedMember === userId) {
        setExpandedMember(null);
      } else {
        setExpandedMember(userId);
        fetchMemberDetail(userId);
      }
    },
    [expandedMember, fetchMemberDetail],
  );

  const handleInvite = useCallback(async () => {
    if (!user || !inviteEmail.trim()) return;
    setInviting(true);
    const supabase = createClient();

    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id, user_id, trainer_id, display_name")
      .ilike("display_name", inviteEmail.trim())
      .limit(1);

    if (!targetUser || targetUser.length === 0) {
      show("ユーザーが見つかりません", "error");
      setInviting(false);
      return;
    }

    const target = targetUser[0];
    if (!target) {
      show("ユーザーが見つかりません", "error");
      setInviting(false);
      return;
    }

    if (target.trainer_id) {
      show("このユーザーは既に別のトレーナーに紐づいています", "error");
      setInviting(false);
      return;
    }

    if (target.user_id === user.id) {
      show("自分自身を招待することはできません", "error");
      setInviting(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ trainer_id: user.id })
      .eq("id", target.id);

    if (error) {
      show("招待に失敗しました", "error");
    } else {
      show(`${target.display_name || "メンバー"} を追加しました`, "success");
      setInviteEmail("");
      fetchMembers();
    }
    setInviting(false);
  }, [user, inviteEmail, show, fetchMembers]);

  const handleRemove = useCallback(
    async (member: MemberProfile) => {
      if (!user) return;
      setRemovingId(member.id);
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .update({ trainer_id: null })
        .eq("id", member.id)
        .eq("trainer_id", user.id);

      if (error) {
        show("解除に失敗しました", "error");
      } else {
        show(`${member.display_name} を解除しました`, "success");
        fetchMembers();
      }
      setRemovingId(null);
    },
    [user, show, fetchMembers],
  );

  if (loading || authLoading || (user && role === null)) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!user || role !== "trainer") {
    return null;
  }

  const isEmpty = members.length === 0;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)]">
      <AppToast toast={toast} onDismiss={dismiss} />

      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">Trainer</p>
          <h1 className="mt-1 text-xl font-title tracking-tight">メンバー管理</h1>
        </div>
        {!isEmpty && (
          <p className="pb-1 text-xs font-caption text-muted">{members.length} 名</p>
        )}
      </header>

      {/* Invite section */}
      <section className="mt-6">
        <div className="rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
              <UserPlus size={18} strokeWidth={1.5} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold tracking-tight">メンバーを招待</p>
              <p className="mt-0.5 text-xs text-secondary">
                メールアドレスまたは表示名で検索
              </p>
            </div>
          </div>
          <div className="mt-3.5 flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="メールアドレスまたは名前"
              className="min-h-[44px] flex-1 rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !inviting) handleInvite();
              }}
            />
            <button
              type="button"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-inverse px-4 text-sm font-extrabold text-on-inverse transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {inviting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} strokeWidth={2} />
              )}
              招待
            </button>
          </div>
        </div>
      </section>

      {/* Members list */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <Users size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">メンバーがいません</p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            メンバーを招待して、ワークアウトや動画を閲覧・管理しましょう。
          </p>
        </div>
      ) : (
        <section className="mt-6 space-y-3">
          <h2 className="px-0.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
            メンバー一覧
          </h2>
          <div className="space-y-2.5">
            {members.map((member) => {
              const isExpanded = expandedMember === member.user_id;
              const detail = memberDetail[member.user_id];
              const isLoadingDetail = detailLoading === member.user_id;

              return (
                <div
                  key={member.id}
                  className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]"
                >
                  <button
                    type="button"
                    onClick={() => toggleMember(member.user_id)}
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
                          {/* Recent workouts */}
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
                              <Dumbbell size={11} strokeWidth={1.5} />
                              最近のワークアウト
                            </p>
                            {detail.recentWorkouts.length > 0 ? (
                              <ul className="mt-2 space-y-1.5">
                                {detail.recentWorkouts.map((w) => (
                                  <li
                                    key={w.id}
                                    className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
                                  >
                                    <span className="truncate text-sm">
                                      {w.title}
                                    </span>
                                    <span className="shrink-0 text-xs text-secondary">
                                      {w.workout_date}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-xs text-secondary">
                                ワークアウトなし
                              </p>
                            )}
                          </div>

                          {/* Recent videos */}
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
                              <Film size={11} strokeWidth={1.5} />
                              最近の動画
                            </p>
                            {detail.recentVideos.length > 0 ? (
                              <ul className="mt-2 space-y-1.5">
                                {detail.recentVideos.map((v) => (
                                  <li
                                    key={v.id}
                                    className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
                                  >
                                    <span className="truncate text-sm">
                                      {v.title || v.exercise_type}
                                    </span>
                                    <span className="shrink-0 text-xs text-secondary">
                                      {v.created_at.slice(0, 10)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-xs text-secondary">
                                動画なし
                              </p>
                            )}
                          </div>

                          {/* Remove member */}
                          <button
                            type="button"
                            onClick={() => handleRemove(member)}
                            disabled={removingId === member.id}
                            className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border border-danger/20 text-sm font-bold text-danger transition-all active:scale-[0.98] disabled:opacity-50"
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
            })}
          </div>
        </section>
      )}
    </div>
  );
}
