"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Dumbbell, Scale, Film } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ホーム", icon: Home, match: ["/dashboard"] },
  { href: "/workouts", label: "ワークアウト", icon: Dumbbell, match: ["/workouts"] },
  { href: "/capture", label: "撮影", icon: Camera, match: ["/capture"] },
  { href: "/videos", label: "動画", icon: Film, match: ["/videos"] },
  { href: "/body", label: "ボディ", icon: Scale, match: ["/body"] },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-app pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const isActive = match.some((m) => pathname.startsWith(m));
          return (
            <Link
              key={href}
              href={href}
              className="group flex h-14 w-16 flex-col items-center justify-center gap-0.5 transition-colors duration-150 active:opacity-70"
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className={`transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted group-active:scale-95"
                }`}
              />
              <span
                className={`text-[10px] ${isActive ? "font-label text-primary" : "font-caption text-muted"}`}
              >
                {label}
              </span>
              <span
                className={`h-0.5 w-5 rounded-full transition-all duration-200 ${
                  isActive ? "bg-accent" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
