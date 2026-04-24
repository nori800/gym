"use client";

import Link from "next/link";
import { Dumbbell, Film, Scale, ChevronRight } from "lucide-react";

export type MemberProfile = {
  id: string;
  user_id: string;
  display_name: string;
  weight: number | null;
  workoutCount: number;
  videoCount: number;
};

export function MemberCard({ member }: { member: MemberProfile }) {
  return (
    <Link
      href={`/trainer/members/${member.user_id}`}
      className="flex items-center gap-3.5 rounded-[18px] bg-white px-[18px] py-4 shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-150 active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-primary">
        {member.display_name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold tracking-tight">
          {member.display_name}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-secondary">
          <span className="flex items-center gap-1">
            <Scale size={11} strokeWidth={1.5} />
            {member.weight != null ? `${member.weight} kg` : "—"}
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell size={11} strokeWidth={1.5} />
            {member.workoutCount}
          </span>
          <span className="flex items-center gap-1">
            <Film size={11} strokeWidth={1.5} />
            {member.videoCount}
          </span>
        </div>
      </div>
      <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
    </Link>
  );
}
