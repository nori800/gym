"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Dumbbell, HeartPulse } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ホーム", icon: Home, match: ["/dashboard"] },
  { href: "/capture", label: "撮影", icon: Camera, match: ["/capture"] },
  { href: "/workouts", label: "ワークアウト", icon: Dumbbell, match: ["/workouts"] },
  { href: "/body", label: "ボディ", icon: HeartPulse, match: ["/body"] },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-app">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const isActive = match.some((m) => pathname.startsWith(m));
          return (
            <Link
              key={href}
              href={href}
              className="group flex h-14 w-20 flex-col items-center justify-center gap-0.5 transition-colors duration-150"
            >
              <Icon
                size={20}
                strokeWidth={1.75}
                className={`transition-all duration-200 ${
                  isActive ? "text-primary scale-110" : "text-muted group-active:scale-95"
                }`}
              />
              <span
                className={`text-[10px] font-caption ${isActive ? "text-primary" : "text-muted"}`}
              >
                {label}
              </span>
              <span
                className={`h-0.5 w-5 rounded-full transition-all ${
                  isActive ? "bg-primary" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
