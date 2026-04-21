"use client";

import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

interface PageHeaderProps {
  title?: string;
  back?: { href: string } | { onClick: () => void };
  close?: { href: string } | { onClick: () => void };
  right?: React.ReactNode;
  variant?: "default" | "compact";
}

/**
 * アプリ全体で共通のヘッダー。
 * - 戻る/閉じるはテキストではなくアイコン
 * - タイトルは中央、h2相当の控えめな階層
 */
export function PageHeader({ title, back, close, right, variant = "default" }: PageHeaderProps) {
  const btnCls =
    "flex h-10 w-10 items-center justify-center rounded-full text-primary transition-all duration-150 active:bg-chip active:scale-95";

  const LeftBtn = back ? (
    "href" in back ? (
      <Link href={back.href} className={btnCls} aria-label="戻る">
        <ArrowLeft size={20} strokeWidth={1.75} />
      </Link>
    ) : (
      <button type="button" onClick={back.onClick} className={btnCls} aria-label="戻る">
        <ArrowLeft size={20} strokeWidth={1.75} />
      </button>
    )
  ) : close ? (
    "href" in close ? (
      <Link href={close.href} className={btnCls} aria-label="閉じる">
        <X size={20} strokeWidth={1.75} />
      </Link>
    ) : (
      <button type="button" onClick={close.onClick} className={btnCls} aria-label="閉じる">
        <X size={20} strokeWidth={1.75} />
      </button>
    )
  ) : (
    <div className="h-10 w-10" />
  );

  return (
    <div
      className={`flex items-center justify-between ${
        variant === "compact" ? "h-11" : "h-14"
      }`}
    >
      <div className="w-10">{LeftBtn}</div>
      {title && (
        <h2 className="flex-1 truncate text-center text-[15px] font-bold tracking-tight text-primary">
          {title}
        </h2>
      )}
      <div className="flex w-10 items-center justify-end">{right}</div>
    </div>
  );
}
