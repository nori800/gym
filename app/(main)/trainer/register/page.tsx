"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  AddMemberSection,
  type MemberRegistrationValues,
  type SearchResult,
} from "@/components/trainer/AddMemberSection";
import { AppToast } from "@/components/common/AppToast";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { createClient } from "@/lib/supabase/client";

const today = new Date().toISOString().slice(0, 10);

const INITIAL_REGISTRATION: MemberRegistrationValues = {
  displayName: "",
  phoneNumber: "",
  address: "",
  joinedOn: today,
  trainerMemo: "",
};

export default function TrainerRegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast, show, dismiss } = useToast();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<SearchResult | null>(null);
  const [registrationValues, setRegistrationValues] =
    useState<MemberRegistrationValues>(INITIAL_REGISTRATION);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("[trainer/register] fetchRole error:", error.message);
        }
        if (cancelled) return;
        const resolvedRole = data?.role ?? "member";
        setRole(resolvedRole);
        setLoading(false);
        if (resolvedRole !== "trainer") router.replace("/dashboard");
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, router, user]);

  const handleRegister = useCallback(
    async (target: SearchResult) => {
      setRegistering(true);
      try {
        const res = await fetch("/api/trainer/register-member", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: target.id,
            displayName: registrationValues.displayName,
            phoneNumber: registrationValues.phoneNumber,
            address: registrationValues.address,
            joinedOn: registrationValues.joinedOn,
            trainerMemo: registrationValues.trainerMemo,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          show(data.error || "会員登録に失敗しました", "error");
          return;
        }

        show(`${registrationValues.displayName} さんを登録しました`, "success");
        router.push(`/trainer/members/${target.user_id}`);
      } catch {
        show("会員登録に失敗しました", "error");
      } finally {
        setRegistering(false);
      }
    },
    [registrationValues, router, show],
  );

  if (loading || authLoading || (user && role === null)) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!user || role !== "trainer") return null;

  return (
    <div className="min-h-[calc(100dvh-6rem)]">
      <AppToast toast={toast} onDismiss={dismiss} />

      <header className="space-y-3">
        <Link
          href="/trainer"
          className="inline-flex items-center gap-1 text-xs font-bold text-secondary transition-colors active:text-primary"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          会員管理に戻る
        </Link>
        <div>
          <p className="text-xs font-title uppercase tracking-[0.12em] text-muted">
            Register
          </p>
          <h1 className="mt-1 text-xl font-title tracking-tight">会員登録</h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            検索と登録を分けました。登録済みユーザーを選び、管理に必要な情報を保存してください。
          </p>
        </div>
      </header>

      <AddMemberSection
        query={query}
        registering={registering}
        selectedMember={selectedMember}
        registrationValues={registrationValues}
        onQueryChange={setQuery}
        onSelectedMemberChange={setSelectedMember}
        onRegistrationChange={setRegistrationValues}
        onRegister={handleRegister}
      />
    </div>
  );
}
