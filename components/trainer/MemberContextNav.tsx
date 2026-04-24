"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Film, Dumbbell, Scale } from "lucide-react";

const TABS = [
  { href: "/videos", label: "動画", icon: Film },
  { href: "/workouts", label: "WO", icon: Dumbbell },
  { href: "/body", label: "ボディ", icon: Scale },
] as const;

interface MemberContextNavProps {
  memberLabel: string;
  memberUserId: string;
}

export function MemberContextNav({
  memberLabel,
  memberUserId,
}: MemberContextNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/trainer/members/${memberUserId}`}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-secondary transition-colors active:text-primary"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            戻る
          </Link>
          <p className="min-w-0 truncate text-xs">
            <span className="font-bold text-primary">{memberLabel}</span>
            <span className="text-secondary"> さんのデータ</span>
          </p>
        </div>
      </div>

      <nav className="flex rounded-xl bg-chip p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive =
            pathname === t.href || pathname.startsWith(`${t.href}/`);
          const href = `${t.href}?member=${encodeURIComponent(memberUserId)}`;
          return (
            <Link
              key={t.href}
              href={href}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-secondary active:text-primary"
              }`}
            >
              <Icon size={13} strokeWidth={1.5} />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
