"use client";

import { useState, useCallback } from "react";
import { Share2, Copy, Check, Loader2, ExternalLink } from "lucide-react";

interface ShareLinkButtonProps {
  videoId?: string;
  workoutId?: string;
}

export function ShareLinkButton({ videoId, workoutId }: ShareLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShareLink = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(videoId ? { video_id: videoId } : {}),
          ...(workoutId ? { workout_id: workoutId } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "共有リンクの作成に失敗しました");
      }

      const data = await res.json();
      setShareUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [videoId, workoutId]);

  const copyToClipboard = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("クリップボードへのコピーに失敗しました");
    }
  }, [shareUrl]);

  if (shareUrl) {
    return (
      <div className="space-y-2 rounded-lg bg-surface p-3">
        <p className="text-xs font-bold text-primary">共有リンクを作成しました</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 truncate rounded-lg border border-border bg-white px-3 py-2 text-xs text-secondary"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-inverse text-on-inverse transition-all active:scale-95"
            aria-label="URLをコピー"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="text-xs text-secondary">7日間有効。ログイン不要で閲覧できます。</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-2 text-xs text-danger">{error}</p>
      )}
      <button
        type="button"
        onClick={createShareLink}
        disabled={loading}
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold text-secondary transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Share2 size={14} strokeWidth={1.5} />
        )}
        共有リンクを作成
      </button>
    </div>
  );
}
