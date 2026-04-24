"use client";

import Link from "next/link";

interface TrainerViewingBannerProps {
  memberLabel: string;
  suffix?: string;
  returnHref: string;
  returnLabel?: string;
}

export function TrainerViewingBanner({
  memberLabel,
  suffix = "を表示中（閲覧のみ）",
  returnHref,
  returnLabel = "自分のデータへ",
}: TrainerViewingBannerProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5">
      <p className="min-w-0 text-xs text-secondary">
        <span className="font-bold text-primary">{memberLabel}</span>
        さん{suffix}
      </p>
      <Link
        href={returnHref}
        className="shrink-0 text-xs font-bold text-primary underline-offset-2 hover:opacity-80"
      >
        {returnLabel}
      </Link>
    </div>
  );
}
