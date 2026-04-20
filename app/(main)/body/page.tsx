"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BodyDetail } from "@/components/body/BodyDetail";

export default function BodyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-secondary transition-colors active:text-primary">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-xl font-title">体重 · 体脂肪</h1>
      </div>
      <BodyDetail />
    </div>
  );
}
