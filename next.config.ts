import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ブラウザ用バンドルで公開 Supabase 変数が確実に埋め込まれるようにする
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
};

export default nextConfig;
