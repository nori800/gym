"use client";

import { useState, useCallback } from "react";
import { UserPlus, Loader2, Search, AlertCircle } from "lucide-react";

type SearchResult = {
  id: string;
  user_id: string;
  display_name: string;
  email_hint: string | null;
  has_trainer: boolean;
  is_self: boolean;
};

interface AddMemberSectionProps {
  query: string;
  adding: boolean;
  onQueryChange: (value: string) => void;
  onAdd: (target: SearchResult) => void;
}

export function AddMemberSection({
  query,
  adding,
  onQueryChange,
  onAdd,
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
            <p className="text-sm font-bold tracking-tight">メンバーを追加</p>
            <p className="mt-0.5 text-xs text-secondary">
              登録済みのユーザーを検索して追加します
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
                className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{r.display_name}</p>
                  {r.email_hint && (
                    <p className="text-xs text-secondary">{r.email_hint}</p>
                  )}
                </div>
                {r.is_self ? (
                  <span className="shrink-0 text-xs text-secondary">自分</span>
                ) : r.has_trainer ? (
                  <span className="shrink-0 text-xs text-secondary">
                    担当済み
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAdd(r)}
                    disabled={adding}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-inverse px-3 py-1.5 text-xs font-extrabold text-on-inverse transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {adding ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <UserPlus size={12} strokeWidth={2} />
                    )}
                    追加
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export type { SearchResult };
