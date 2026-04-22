"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Dumbbell, Scale, Film } from "lucide-react";

const NAV_LEFT = [
  { href: "/dashboard", label: "ホーム", icon: Home, match: ["/dashboard"] },
  { href: "/workouts", label: "ワークアウト", icon: Dumbbell, match: ["/workouts"] },
] as const;

const NAV_CENTER = {
  href: "/capture",
  label: "撮影",
  icon: Camera,
  match: ["/capture"],
} as const;

const NAV_RIGHT = [
  { href: "/videos", label: "動画", icon: Film, match: ["/videos"] },
  { href: "/body", label: "ボディ", icon: Scale, match: ["/body"] },
] as const;

function isPathActive(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

function TabItem({
  href,
  label,
  icon: Icon,
  match,
  pathname,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  match: readonly string[];
  pathname: string;
}) {
  const isActive = isPathActive(pathname, match);
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-0.5 pb-1.5 pt-1 transition-colors duration-150 active:opacity-70"
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        className={`transition-all duration-200 ${
          isActive ? "text-primary" : "text-muted group-active:scale-95"
        }`}
      />
      <span
        className={`max-w-full truncate px-0.5 text-center text-[10px] ${
          isActive ? "font-label text-primary" : "font-caption text-muted"
        }`}
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
}

export function BottomNav() {
  const pathname = usePathname();
  const captureActive = isPathActive(pathname, NAV_CENTER.match);
  const Icon = NAV_CENTER.icon;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-app pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex max-w-md items-end justify-between gap-0.5 px-1.5 pt-1">
        {NAV_LEFT.map((item) => (
          <TabItem key={item.href} {...item} pathname={pathname} />
        ))}

        {/* Center: primary action — form check capture */}
        <div className="flex w-[72px] shrink-0 flex-col items-center justify-end pb-0.5">
          <Link
            href={NAV_CENTER.href}
            aria-current={captureActive ? "page" : undefined}
            aria-label={NAV_CENTER.label}
            className={`flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition-all duration-200 active:scale-95 ${
              captureActive
                ? "bg-accent text-primary ring-2 ring-primary/15 ring-offset-2 ring-offset-app"
                : "bg-inverse text-on-inverse"
            }`}
          >
            <Icon size={22} strokeWidth={1.75} className={captureActive ? "text-primary" : "text-on-inverse"} />
          </Link>
          <span
            className={`mt-1 max-w-full truncate text-center text-[10px] ${
              captureActive ? "font-label text-primary" : "font-caption text-muted"
            }`}
          >
            {NAV_CENTER.label}
          </span>
        </div>

        {NAV_RIGHT.map((item) => (
          <TabItem key={item.href} {...item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
