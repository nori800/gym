"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
        <AlertTriangle size={28} strokeWidth={1.5} className="text-danger" />
      </div>
      <h2 className="mt-5 text-lg font-bold tracking-tight">
        エラーが発生しました
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-secondary">
        予期しない問題が発生しました。もう一度お試しいただくか、しばらく経ってから再度アクセスしてください。
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted">
          エラーID: {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 flex min-h-[44px] items-center gap-2 rounded-xl bg-inverse px-5 py-2.5 text-sm font-extrabold tracking-wide text-on-inverse transition-all active:scale-[0.98]"
      >
        <RotateCcw size={14} strokeWidth={2} />
        再試行
      </button>
    </div>
  );
}
