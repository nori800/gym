"use client";

import { X, Lightbulb } from "lucide-react";
import { FocusTrap } from "@/components/common/FocusTrap";

interface BlockExplainerModalProps {
  open: boolean;
  onClose: () => void;
}

export function BlockExplainerModal({ open, onClose }: BlockExplainerModalProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="閉じる"
      />
      <div className="fixed inset-x-0 bottom-0 z-[110] mx-auto max-w-md" role="dialog" aria-modal="true" aria-label="ブロックとは？">
        <FocusTrap>
          <div className="rounded-t-[18px] bg-white px-6 pb-[max(2rem,calc(1rem+env(safe-area-inset-bottom,0px)))] pt-5 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-fade-in">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />

            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tight">ブロックとは？</h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-all active:bg-chip active:scale-95"
                aria-label="閉じる"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-[14px] bg-surface p-4">
                <p className="text-sm font-bold">スーパーセット・サーキット向け</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-secondary">
                  ブロックは複数の種目をグループ化する仕組みです。
                  1つのブロック内の種目を連続で行い、インターバル後にまた繰り返します。
                </p>
              </div>

              <div className="rounded-[14px] bg-surface p-4">
                <p className="text-sm font-bold">シンプルに使うなら</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-secondary">
                  1ブロックに1種目ずつ追加すれば、通常のストレートセットとして記録できます。
                  まずはこの使い方からでOK。
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-[14px] border border-accent/30 bg-accent/5 p-4">
                <Lightbulb size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-[13px] leading-relaxed text-secondary">
                  <strong className="text-primary">初心者の方へ:</strong> まずはブロック1つに種目を追加していくだけで始められます。慣れたら複数ブロックに挑戦しましょう。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-inverse text-sm font-extrabold tracking-wide text-on-inverse transition-all duration-150 active:scale-[0.98]"
            >
              わかりました
            </button>
          </div>
        </FocusTrap>
      </div>
    </>
  );
}
