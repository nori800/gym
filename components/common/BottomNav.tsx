"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Dumbbell, Scale, Film, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

const NAV_RIGHT_DEFAULT = [
  { href: "/videos", label: "動画", icon: Film, match: ["/videos"] },
  { href: "/body", label: "ボディ", icon: Scale, match: ["/body"] },
] as const;

const NAV_RIGHT_TRAINER = [
  { href: "/videos", label: "動画", icon: Film, match: ["/videos"] },
  { href: "/trainer", label: "管理", icon: Users, match: ["/trainer", "/body"] },
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
        className={`max-w-full truncate px-0.5 text-center text-xs ${
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

export function BottomNav({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  const captureActive = isPathActive(pathname, NAV_CENTER.match);
  const Icon = NAV_CENTER.icon;

  const [resolvedRole, setResolvedRole] = useState<string | null>(userRole ?? null);

  useEffect(() => {
    if (userRole !== undefined) {
      setResolvedRole(userRole);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (cancelled || !data.user) return;
        supabase
          .from("profiles")
          .select("role")
          .eq("user_id", data.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error("[BottomNav] profile fetch error:", error.message);
            }
            if (!cancelled) setResolvedRole(profile?.role ?? null);
          });
      })
      .catch((err) => {
        console.error("[BottomNav] auth.getUser error:", err);
        if (!cancelled) setResolvedRole(null);
      });

    return () => {
      cancelled = true;
    };
  }, [userRole]);

  const navRight = resolvedRole === "trainer" ? NAV_RIGHT_TRAINER : NAV_RIGHT_DEFAULT;

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
            className={`mt-1 max-w-full truncate text-center text-xs ${
              captureActive ? "font-label text-primary" : "font-caption text-muted"
            }`}
          >
            {NAV_CENTER.label}
          </span>
        </div>

        {navRight.map((item) => (
          <TabItem key={item.href} {...item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
