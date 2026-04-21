"use client";

type PrimaryRecordButtonProps = {
  children: React.ReactNode;
  className?: string;
  /** default: 明るい背景向け（黒ボタン）。dark: 暗い帯の上向け（白ボタン） */
  surface?: "default" | "dark";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * アプリ全体で統一した「記録する」系のプライマリボタン。
 * 撮影・ボディ・セット保存などで同じサイズ・同じトーン階層に揃える。
 */
export function PrimaryRecordButton({
  children,
  className = "",
  surface = "default",
  type = "button",
  ...rest
}: PrimaryRecordButtonProps) {
  const surfaceCls =
    surface === "dark"
      ? "bg-white text-primary shadow-none ring-1 ring-white/30"
      : "bg-inverse text-on-inverse shadow-[0_2px_8px_rgba(0,0,0,0.12)]";

  return (
    <button
      type={type}
      {...rest}
      className={`flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[12px] font-bold tracking-wide transition-transform duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${surfaceCls} ${className}`}
    >
      {children}
    </button>
  );
}
