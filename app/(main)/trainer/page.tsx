"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { AppToast } from "@/components/common/AppToast";
import { createClient } from "@/lib/supabase/client";
import { AddMemberSection, type SearchResult } from "@/components/trainer/AddMemberSection";
import { MemberCard, type MemberProfile } from "@/components/trainer/MemberCard";

export default function TrainerPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast, show, dismiss } = useToast();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addQuery, setAddQuery] = useState("");
  const [adding, setAdding] = useState(false);

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

  const handleAdd = useCallback(async (target: SearchResult) => {
    if (!user) return;
    setAdding(true);
    const supabase = createClient();

    if (target.is_self) {
      show("自分自身を追加することはできません", "error");
      setAdding(false);
      return;
    }

    if (target.has_trainer) {
      show("このユーザーは既に別のトレーナーに紐づいています", "error");
      setAdding(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ trainer_id: user.id })
      .eq("id", target.id);

    if (error) {
      show("追加に失敗しました", "error");
    } else {
      show(`${target.display_name || "メンバー"} を追加しました`, "success");
      setAddQuery("");
      fetchMembers();
    }
    setAdding(false);
  }, [user, show, fetchMembers]);

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
          <h1 className="mt-1 text-xl font-title tracking-tight">メンバー</h1>
        </div>
        {!isEmpty && (
          <p className="pb-1 text-xs font-caption text-muted">{members.length} 名</p>
        )}
      </header>

      <AddMemberSection
        query={addQuery}
        adding={adding}
        onQueryChange={setAddQuery}
        onAdd={handleAdd}
      />

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <Users size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">メンバーがいません</p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            ユーザーを検索してメンバーとして追加しましょう。
          </p>
        </div>
      ) : (
        <section className="mt-6 space-y-3">
          <h2 className="px-0.5 text-xs font-title uppercase tracking-[0.12em] text-muted">
            メンバー一覧
          </h2>
          <div className="space-y-2.5">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
