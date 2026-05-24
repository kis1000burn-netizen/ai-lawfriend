"use client";

import { useCallback, useEffect, useState } from "react";
import { AibeopchinCmbOnboardingIntro } from "@/components/onboarding/aibeopchin-cmb-onboarding-intro";
import { CMB_ONBOARDING_AUTO_DISMISS_MS } from "@/lib/onboarding/cmb-onboarding-config";
import {
  isCmbOnboardingCompleted,
  markCmbOnboardingCompleted,
} from "@/lib/onboarding/cmb-onboarding-storage";

export function CmbOnboardingGate() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleComplete = useCallback(() => {
    if (exiting) {
      return;
    }
    setExiting(true);
    markCmbOnboardingCompleted();
    globalThis.setTimeout(() => setVisible(false), 420);
  }, [exiting]);

  useEffect(() => {
    if (isCmbOnboardingCompleted()) {
      return;
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible || exiting) {
      return;
    }
    const timer = globalThis.setTimeout(handleComplete, CMB_ONBOARDING_AUTO_DISMISS_MS);
    return () => globalThis.clearTimeout(timer);
  }, [visible, exiting, handleComplete]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <AibeopchinCmbOnboardingIntro onComplete={handleComplete} exiting={exiting} />
  );
}
