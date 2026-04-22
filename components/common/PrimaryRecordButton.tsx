"use client";

type PrimaryRecordButtonProps = {
  children: React.ReactNode;
  className?: string;
  surface?: "default" | "dark";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

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
      className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold tracking-wide transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${surfaceCls} ${className}`}
    >
      {children}
    </button>
  );
}
