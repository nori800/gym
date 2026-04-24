"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ClipboardList,
  Loader2,
  Search,
  type LucideIcon,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { MemberCard, type MemberProfile } from "@/components/trainer/MemberCard";

const memberCollator = new Intl.Collator("ja", {
  sensitivity: "base",
  numeric: true,
});

function compareMembers(a: MemberProfile, b: MemberProfile) {
  return memberCollator.compare(a.display_name, b.display_name);
}

function getMembershipDays(joinedOn: string | null): number | null {
  if (!joinedOn) return null;
  const joined = new Date(`${joinedOn}T00:00:00`);
  if (Number.isNaN(joined.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(
    1,
    Math.floor((today.getTime() - joined.getTime()) / 86400000) + 1,
  );
}

function isWithinDays(date: string | null, days: number) {
  if (!date) return false;
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return false;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return target >= threshold;
}

function updateLatest(
  map: Record<string, string>,
  userId: string,
  value: string | null,
) {
  if (!value) return;
  if (!map[userId] || value > map[userId]) map[userId] = value;
}

export default function TrainerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberQuery, setMemberQuery] = useState("");

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
      .select(
        "id, user_id, display_name, weight, phone_number, address, joined_on, trainer_memo",
      )
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

    const [workoutRes, videoRes, bodyRes] = await Promise.all([
      supabase
        .from("workouts")
        .select("user_id, created_at, workout_date")
        .in("user_id", memberIds),
      supabase
        .from("videos")
        .select("user_id, created_at, shot_date")
        .in("user_id", memberIds),
      supabase
        .from("body_logs")
        .select("user_id, created_at, log_date")
        .in("user_id", memberIds),
    ]);

    if (workoutRes.error) {
      console.error("[trainer] workout count error:", workoutRes.error.message);
    }
    if (videoRes.error) {
      console.error("[trainer] video count error:", videoRes.error.message);
    }
    if (bodyRes.error) {
      console.error("[trainer] body log count error:", bodyRes.error.message);
    }

    const workoutCounts: Record<string, number> = {};
    const videoCounts: Record<string, number> = {};
    const bodyLogCounts: Record<string, number> = {};
    const latestActivityByUser: Record<string, string> = {};
    for (const w of workoutRes.data ?? []) {
      workoutCounts[w.user_id] = (workoutCounts[w.user_id] || 0) + 1;
      updateLatest(latestActivityByUser, w.user_id, w.created_at ?? w.workout_date);
    }
    for (const v of videoRes.data ?? []) {
      videoCounts[v.user_id] = (videoCounts[v.user_id] || 0) + 1;
      updateLatest(latestActivityByUser, v.user_id, v.created_at ?? v.shot_date);
    }
    for (const b of bodyRes.data ?? []) {
      bodyLogCounts[b.user_id] = (bodyLogCounts[b.user_id] || 0) + 1;
      updateLatest(latestActivityByUser, b.user_id, b.created_at ?? b.log_date);
    }

    setMembers(
      profiles.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name || "名前未設定",
        weight: p.weight,
        phoneNumber: p.phone_number,
        address: p.address,
        joinedOn: p.joined_on,
        trainerMemo: p.trainer_memo,
        membershipDays: getMembershipDays(p.joined_on),
        workoutCount: workoutCounts[p.user_id] ?? 0,
        videoCount: videoCounts[p.user_id] ?? 0,
        bodyLogCount: bodyLogCounts[p.user_id] ?? 0,
        latestActivityAt: latestActivityByUser[p.user_id] ?? null,
      })).sort(compareMembers),
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
  const normalizedQuery = memberQuery.trim().toLowerCase();
  const filteredMembers = normalizedQuery
    ? members.filter((member) =>
        member.display_name.toLowerCase().includes(normalizedQuery),
      )
    : members;
  const activeCount = members.filter((member) =>
    isWithinDays(member.latestActivityAt, 7),
  ).length;
  const needsInfoCount = members.filter(
    (member) => !member.phoneNumber || !member.joinedOn,
  ).length;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">Trainer</p>
          <h1 className="mt-1 text-xl font-title tracking-tight">会員管理</h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            紐づけた会員の情報、継続状況、記録を確認します。
          </p>
        </div>
        <Link
          href="/trainer/register"
          className="flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-xl bg-inverse px-3.5 text-xs font-extrabold text-on-inverse transition-all active:scale-[0.98]"
        >
          <UserPlus size={14} strokeWidth={2} />
          登録
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-2.5">
        <SummaryCard icon={Users} label="会員数" value={members.length} unit="名" />
        <SummaryCard icon={Activity} label="7日内活動" value={activeCount} unit="名" />
        <SummaryCard
          icon={AlertCircle}
          label="要確認"
          value={needsInfoCount}
          unit="名"
        />
      </section>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-[22px] bg-white px-6 py-16 text-center shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <Users size={26} strokeWidth={1.5} className="text-muted" />
          </div>
          <p className="mt-5 text-[15px] font-bold">メンバーがいません</p>
          <p className="mt-2 max-w-[240px] text-center text-sm leading-relaxed text-secondary">
            まずは会員登録画面で、登録済みユーザーを会員として紐づけましょう。
          </p>
          <Link
            href="/trainer/register"
            className="mt-5 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-inverse px-5 text-sm font-extrabold text-on-inverse transition-all active:scale-[0.98]"
          >
            <UserPlus size={15} strokeWidth={2} />
            会員を登録
          </Link>
        </div>
      ) : (
        <>
          <section className="rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
                <Search size={18} strokeWidth={1.5} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold tracking-tight">メンバー検索</p>
                <p className="mt-0.5 text-xs text-secondary">
                  名前で絞り込みます。表示はあいうえお順です。
                </p>
              </div>
            </div>
            <input
              type="search"
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="会員名で検索"
              className="mt-3.5 min-h-[44px] w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-xs font-title uppercase tracking-[0.12em] text-muted">
                メンバー一覧
              </h2>
              <span className="text-xs font-caption text-muted">
                {filteredMembers.length} / {members.length} 名
              </span>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="rounded-[18px] bg-white px-[18px] py-8 text-center shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
                <p className="text-sm font-bold">該当する会員がいません</p>
                <p className="mt-1.5 text-xs text-secondary">
                  名前を変えて検索してください。
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[18px] bg-accent/10 p-[18px]">
            <div className="flex gap-3">
              <ClipboardList
                size={18}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-primary"
              />
              <div>
                <p className="text-sm font-bold tracking-tight">管理の目安</p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">
                  要確認は電話番号または入会日が未登録の会員です。詳細画面で住所・メモも更新できます。
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex min-h-[92px] flex-col justify-between rounded-[18px] bg-white p-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
      <Icon size={15} strokeWidth={1.6} className="text-primary" />
      <div>
        <p className="text-[10px] font-title uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
        <p className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-metric leading-none">{value}</span>
          <span className="text-xs font-caption text-muted">{unit}</span>
        </p>
      </div>
    </div>
  );
}
