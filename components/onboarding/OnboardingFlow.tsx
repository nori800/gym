"use client";

import { useState, useCallback } from "react";
import { Dumbbell, Camera, TrendingUp, ChevronRight } from "lucide-react";
import { FocusTrap } from "@/components/common/FocusTrap";

const STEPS = [
  {
    icon: Dumbbell,
    title: "ワークアウトを記録",
    desc: "種目・重量・回数をセットごとに記録。\nブロックで種目をグループ化して、\n効率的にトレーニングを管理できます。",
    accent: "bg-inverse",
  },
  {
    icon: Camera,
    title: "フォームを撮影",
    desc: "トレーニング中のフォームを動画で撮影。\nグリッド表示で姿勢をチェック、\nセットごとの記録に紐付けて振り返れます。",
    accent: "bg-accent",
  },
  {
    icon: TrendingUp,
    title: "成長を可視化",
    desc: "体重・体脂肪率の推移をグラフで確認。\nワークアウト履歴と合わせて\n自分の成長を実感できます。",
    accent: "bg-inverse",
  },
] as const;

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const StepIcon = current.icon;

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete();
    }
  }, [step, onComplete]);

  const skip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <FocusTrap>
    <div className="fixed inset-0 z-[200] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="FormCheck へようこそ">
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {/* Icon */}
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-[22px] ${current.accent}`}
        >
          <StepIcon
            size={36}
            strokeWidth={1.5}
            className={current.accent === "bg-accent" ? "text-inverse" : "text-on-inverse"}
          />
        </div>

        {/* Text */}
        <h1 className="mt-8 text-center text-[26px] font-bold tracking-tight">
          {current.title}
        </h1>
        <p className="mt-4 whitespace-pre-line text-center text-[15px] leading-relaxed text-secondary">
          {current.desc}
        </p>

        {/* Progress dots */}
        <div className="mt-10 flex gap-2" role="group" aria-label="進捗">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="sr-only">{step + 1} / {STEPS.length}</span>
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 px-6 pb-[max(2rem,calc(1rem+env(safe-area-inset-bottom,0px)))]">
        <button
          type="button"
          onClick={next}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-inverse text-base font-extrabold tracking-wide text-on-inverse shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 active:scale-[0.98]"
        >
          {step < STEPS.length - 1 ? (
            <>
              次へ
              <ChevronRight size={18} strokeWidth={2} />
            </>
          ) : (
            "はじめる"
          )}
        </button>
        {step < STEPS.length - 1 && (
          <button
            type="button"
            onClick={skip}
            className="mt-3 min-h-[44px] w-full text-sm font-bold text-muted transition-colors active:text-secondary"
          >
            スキップ
          </button>
        )}
      </div>
    </div>
    </FocusTrap>
  );
}
