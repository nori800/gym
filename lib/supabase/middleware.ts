import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { resolveSupabasePublicConfig } from "./public-env";

export async function updateSession(request: NextRequest) {
  const { url: supabaseUrl, publishableKey: supabaseAnonKey } =
    resolveSupabasePublicConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[middleware] NEXT_PUBLIC_SUPABASE_URL またはクライアント用キー（NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY、または移行中の NEXT_PUBLIC_SUPABASE_ANON_KEY）が未設定です。`.env.local` / Vercel の Environment Variables を確認し、サーバーを再起動してください。",
    );
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let user: User | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("[middleware] supabase.auth.getUser:", error.message);
    }
    user = data.user ?? null;
  } catch (cause) {
    console.error("[middleware] supabase.auth.getUser failed:", cause);
    const { pathname } = request.nextUrl;
    const isProtected =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/workouts") ||
      pathname.startsWith("/body") ||
      pathname.startsWith("/capture") ||
      pathname.startsWith("/videos") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/trainer");
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/workouts") ||
    pathname.startsWith("/body") ||
    pathname.startsWith("/capture") ||
    pathname.startsWith("/videos") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/trainer");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
