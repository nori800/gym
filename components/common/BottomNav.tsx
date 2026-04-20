"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, ClipboardList, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ホーム", icon: Home, match: ["/dashboard"] },
  { href: "/capture", label: "撮影", icon: Camera, match: ["/capture"] },
  { href: "/workouts", label: "履歴", icon: ClipboardList, match: ["/workouts", "/body"] },
  { href: "/settings", label: "設定", icon: Settings, match: ["/settings"] },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const isActive = match.some((m) => pathname.startsWith(m));
          return (
            <Link
              key={href}
              href={href}
              className="flex h-14 w-20 flex-col items-center justify-center gap-0.5 transition-colors duration-150"
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className={isActive ? "text-primary" : "text-muted"}
              />
              <span
                className={`text-[10px] font-caption ${isActive ? "text-primary" : "text-muted"}`}
              >
                {label}
              </span>
              <span
                className={`h-0.5 w-5 rounded-full ${isActive ? "bg-accent" : "bg-transparent"}`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
