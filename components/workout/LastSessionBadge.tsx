"use client";

import { History } from "lucide-react";
import { useLastSession } from "@/lib/hooks/useLastSession";

interface LastSessionBadgeProps {
  movementId: string;
  userId: string | undefined;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function LastSessionBadge({ movementId, userId }: LastSessionBadgeProps) {
  const { lastWeight, lastReps, lastSets, lastDate, loading } =
    useLastSession(movementId, userId);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-chip px-3 py-1.5 text-xs text-muted">
        <span className="h-3 w-3 animate-spin rounded-full border border-muted border-t-transparent" />
      </span>
    );
  }

  const hasData = lastWeight !== null || lastReps !== null || lastSets !== null;

  if (!hasData) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-chip px-3 py-1.5 text-xs text-muted">
        <History size={12} />
        初めての記録
      </span>
    );
  }

  const parts: string[] = [];
  if (lastWeight !== null) parts.push(`${lastWeight}kg`);
  if (lastReps !== null) parts.push(`${lastReps}回`);
  if (lastSets !== null) parts.push(`${lastSets}セット`);
  const dateLabel = lastDate ? ` (${formatShortDate(lastDate)})` : "";

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-chip px-3 py-1.5 text-xs text-secondary">
      <History size={12} />
      前回: {parts.join(" × ")}
      {dateLabel}
    </span>
  );
}
