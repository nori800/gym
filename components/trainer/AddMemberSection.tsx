"use client";

import { useState, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Search,
  UserPlus,
} from "lucide-react";

type SearchResult = {
  id: string;
  user_id: string;
  display_name: string;
  email_hint: string | null;
  has_trainer: boolean;
  is_self: boolean;
  is_trainer: boolean;
};

type MemberRegistrationValues = {
  displayName: string;
  phoneNumber: string;
  address: string;
  joinedOn: string;
  trainerMemo: string;
};

interface AddMemberSectionProps {
  query: string;
  registering: boolean;
  selectedMember: SearchResult | null;
  registrationValues: MemberRegistrationValues;
  onQueryChange: (value: string) => void;
  onSelectedMemberChange: (target: SearchResult | null) => void;
  onRegistrationChange: (values: MemberRegistrationValues) => void;
  onRegister: (target: SearchResult) => void;
}

export function AddMemberSection({
  query,
  registering,
  selectedMember,
  registrationValues,
  onQueryChange,
  onSelectedMemberChange,
  onRegistrationChange,
  onRegister,
}: AddMemberSectionProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchError("2文字以上入力してください");
      return;
    }

    setSearching(true);
    setSearchError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/trainer/search-member?q=${encodeURIComponent(q)}`,
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSearchError(data.error || "検索に失敗しました");
        return;
      }
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setSearchError("検索に失敗しました");
    } finally {
      setSearching(false);
    }
  }, [query]);

  return (
    <section className="mt-6">
      <div className="rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
            <UserPlus size={18} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight">1. 会員を検索</p>
            <p className="mt-0.5 text-xs text-secondary">
              登録済みユーザーを名前またはメールで探します
            </p>
          </div>
        </div>
        <div className="mt-3.5 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="メールアドレスまたは名前（2文字以上）"
            className="min-h-[44px] flex-1 rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !searching) handleSearch();
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || query.trim().length < 2}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-inverse px-4 text-sm font-extrabold text-on-inverse transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {searching ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} strokeWidth={2} />
            )}
            検索
          </button>
        </div>

        {searchError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2">
            <AlertCircle size={14} className="shrink-0 text-danger" />
            <p className="text-xs text-danger">{searchError}</p>
          </div>
        )}

        {hasSearched && results.length === 0 && !searching && !searchError && (
          <p className="mt-3 text-center text-xs text-secondary">
            該当するユーザーが見つかりませんでした
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-3 space-y-2">
            {results.map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${
                  selectedMember?.id === r.id
                    ? "bg-accent/10 ring-1 ring-accent/25"
                    : "bg-surface"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{r.display_name}</p>
                  {r.email_hint && (
                    <p className="text-xs text-secondary">{r.email_hint}</p>
                  )}
                </div>
                {r.is_self ? (
                  <span className="shrink-0 text-xs text-secondary">自分</span>
                ) : r.is_trainer ? (
                  <span className="shrink-0 text-xs text-secondary">
                    トレーナー
                  </span>
                ) : r.has_trainer ? (
                  <span className="shrink-0 text-xs text-secondary">
                    担当済み
                  </span>
                ) : selectedMember?.id === r.id ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
                    <CheckCircle2 size={13} strokeWidth={2} />
                    選択中
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectedMemberChange(r);
                      onRegistrationChange({
                        ...registrationValues,
                        displayName: r.display_name,
                      });
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-inverse px-3 py-1.5 text-xs font-extrabold text-on-inverse transition-all active:scale-[0.98]"
                  >
                    <UserPlus size={12} strokeWidth={2} />
                    選択
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
            <ClipboardList size={18} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight">2. 管理情報を登録</p>
            <p className="mt-0.5 text-xs text-secondary">
              会員の連絡先、入会日、メモを登録します
            </p>
          </div>
        </div>

        {!selectedMember ? (
          <div className="mt-4 rounded-xl bg-surface px-3.5 py-3 text-xs leading-relaxed text-secondary">
            先に会員候補を検索して「選択」を押してください。
          </div>
        ) : (
          <div className="mt-4 space-y-3.5">
            <div className="rounded-xl bg-accent/10 px-3.5 py-3">
              <p className="text-xs font-bold text-primary">
                {selectedMember.display_name} さんを登録します
              </p>
            </div>

            <label className="block">
              <span className="text-xs font-bold text-secondary">会員名</span>
              <input
                type="text"
                value={registrationValues.displayName}
                onChange={(e) =>
                  onRegistrationChange({
                    ...registrationValues,
                    displayName: e.target.value,
                  })
                }
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <div className="grid grid-cols-1 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-secondary">電話番号</span>
                <input
                  type="tel"
                  value={registrationValues.phoneNumber}
                  onChange={(e) =>
                    onRegistrationChange({
                      ...registrationValues,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="090-0000-0000"
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-secondary">入会日</span>
                <input
                  type="date"
                  value={registrationValues.joinedOn}
                  onChange={(e) =>
                    onRegistrationChange({
                      ...registrationValues,
                      joinedOn: e.target.value,
                    })
                  }
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-bold text-secondary">住所</span>
              <textarea
                value={registrationValues.address}
                onChange={(e) =>
                  onRegistrationChange({
                    ...registrationValues,
                    address: e.target.value,
                  })
                }
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-secondary">トレーナーメモ</span>
              <textarea
                value={registrationValues.trainerMemo}
                onChange={(e) =>
                  onRegistrationChange({
                    ...registrationValues,
                    trainerMemo: e.target.value,
                  })
                }
                rows={3}
                placeholder="目標、注意点、次回確認したいことなど"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <button
              type="button"
              onClick={() => onRegister(selectedMember)}
              disabled={registering || !registrationValues.displayName.trim()}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-sm font-extrabold text-on-inverse transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {registering ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <UserPlus size={15} strokeWidth={2} />
              )}
              会員として登録
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export type { MemberRegistrationValues, SearchResult };
