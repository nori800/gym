"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageCircle, Send, Loader2, Trash2, Clock } from "lucide-react";

type FeedbackItem = {
  id: string;
  video_id: string;
  trainer_user_id: string;
  body: string;
  frame_time: number | null;
  created_at: string;
};

interface FeedbackPanelProps {
  videoId: string;
  isTrainer: boolean;
  currentTime?: number;
}

export function FeedbackPanel({ videoId, isTrainer, currentTime }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBody, setNewBody] = useState("");
  const [sending, setSending] = useState(false);
  const [attachTime, setAttachTime] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch(`/api/feedback?video_id=${encodeURIComponent(videoId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setFeedback(data.feedback ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSend = useCallback(async () => {
    if (!newBody.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: videoId,
          body: newBody.trim(),
          frame_time: attachTime ? currentTime : undefined,
        }),
      });

      if (res.ok) {
        setNewBody("");
        setAttachTime(false);
        await fetchFeedback();
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }, [videoId, newBody, attachTime, currentTime, sending, fetchFeedback]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/feedback?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        await fetchFeedback();
      } catch {
        // silent
      }
    },
    [fetchFeedback],
  );

  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="mt-2 flex justify-center py-4">
        <Loader2 size={16} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle size={14} strokeWidth={1.5} className="text-secondary" />
        <span className="text-xs font-bold text-secondary">
          フィードバック ({feedback.length})
        </span>
      </div>

      {feedback.length === 0 && (
        <p className="text-center text-xs text-secondary py-2">
          まだフィードバックはありません
        </p>
      )}

      <div className="max-h-[200px] space-y-2 overflow-y-auto">
        {feedback.map((fb) => (
          <div
            key={fb.id}
            className="rounded-lg bg-surface px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {fb.frame_time != null && (
                  <span className="mr-1.5 inline-flex items-center gap-0.5 rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    <Clock size={10} strokeWidth={2} />
                    {fmtTime(fb.frame_time)}
                  </span>
                )}
                <p className="text-sm leading-relaxed text-primary whitespace-pre-wrap">
                  {fb.body}
                </p>
              </div>
              {isTrainer && (
                <button
                  type="button"
                  onClick={() => handleDelete(fb.id)}
                  className="shrink-0 rounded p-1 text-muted transition-colors hover:text-danger"
                  aria-label="削除"
                >
                  <Trash2 size={12} strokeWidth={1.5} />
                </button>
              )}
            </div>
            <p className="mt-1 text-[10px] text-muted">
              {new Date(fb.created_at).toLocaleDateString("ja-JP")}
            </p>
          </div>
        ))}
      </div>

      {isTrainer && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="フィードバックを入力..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !newBody.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-lg bg-inverse text-on-inverse transition-all active:scale-95 disabled:opacity-50"
              aria-label="送信"
            >
              {sending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} strokeWidth={2} />
              )}
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-secondary">
            <input
              type="checkbox"
              checked={attachTime}
              onChange={(e) => setAttachTime(e.target.checked)}
              className="rounded"
            />
            現在の再生位置を添付 {currentTime != null && attachTime && `(${fmtTime(currentTime)})`}
          </label>
        </div>
      )}
    </div>
  );
}
