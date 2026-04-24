"use client";

import Link from "next/link";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Film,
  Phone,
  Scale,
} from "lucide-react";
import { formatDate } from "@/lib/utils/formatDate";

export type MemberProfile = {
  id: string;
  user_id: string;
  display_name: string;
  weight: number | null;
  phoneNumber: string | null;
  address: string | null;
  joinedOn: string | null;
  trainerMemo: string | null;
  membershipDays: number | null;
  workoutCount: number;
  videoCount: number;
  bodyLogCount: number;
  latestActivityAt: string | null;
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
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold tracking-tight">
            {member.display_name}
          </p>
          {member.membershipDays != null && (
            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              継続 {member.membershipDays}日
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
          <span className="flex items-center gap-1">
            <Phone size={11} strokeWidth={1.5} />
            {member.phoneNumber || "電話未登録"}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={11} strokeWidth={1.5} />
            {member.joinedOn ? formatDate(member.joinedOn) : "入会日未登録"}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
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
          <span className="flex items-center gap-1">
            <Activity size={11} strokeWidth={1.5} />
            {member.bodyLogCount}
          </span>
        </div>
      </div>
      <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
    </Link>
  );
}
