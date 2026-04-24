"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { AppToast } from "@/components/common/AppToast";
import { createClient } from "@/lib/supabase/client";
import { InviteSection } from "@/components/trainer/InviteSection";
import { MemberCard, type MemberProfile, type MemberDetail } from "@/components/trainer/MemberCard";

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
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (error) {
      console.error("[trainer] fetchRole error:", error.message);
      setRole("member");
      return;
    }
    setRole(data?.role ?? "member");
  }, [user]);

  const fetchMembers = useCallback(async () => {
    if (!user) {
      setMembers([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, weight")
      .eq("trainer_id", user.id);

    if (profilesError) {
      console.error("[trainer] fetchMembers error:", profilesError.message);
      setMembers([]);
      setLoading(false);
      return;
    }

    if (!profiles || profiles.length === 0) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const memberIds = profiles.map((p) => p.user_id);

    const [workoutRes, videoRes] = await Promise.all([
      supabase.from("workouts").select("user_id").in("user_id", memberIds),
      supabase.from("videos").select("user_id").in("user_id", memberIds),
    ]);

    if (workoutRes.error) {
      console.error("[trainer] workout count error:", workoutRes.error.message);
    }
    if (videoRes.error) {
      console.error("[trainer] video count error:", videoRes.error.message);
    }

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
          .limit(25),
        supabase
          .from("videos")
          .select("id, title, exercise_type, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(25),
      ]);

      if (workoutRes.error) {
        console.error("[trainer] member workout fetch error:", workoutRes.error.message);
      }
      if (videoRes.error) {
        console.error("[trainer] member video fetch error:", videoRes.error.message);
      }

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

      <InviteSection
        inviteEmail={inviteEmail}
        inviting={inviting}
        onEmailChange={setInviteEmail}
        onInvite={handleInvite}
      />

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
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isExpanded={expandedMember === member.user_id}
                detail={memberDetail[member.user_id]}
                isLoadingDetail={detailLoading === member.user_id}
                removingId={removingId}
                onToggle={() => toggleMember(member.user_id)}
                onRemove={() => handleRemove(member)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
