"use client";

import { useState, useEffect } from "react";
import { OnboardingFlow } from "./OnboardingFlow";

const STORAGE_KEY = "formcheck_onboarding_complete";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShowOnboarding(true);
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && <OnboardingFlow onComplete={handleComplete} />}
      {children}
    </>
  );
}
