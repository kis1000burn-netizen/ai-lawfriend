import { describe, expect, it, beforeEach } from "vitest";
import {
  CMB_ONBOARDING_STORAGE_KEY,
  isCmbOnboardingCompleted,
  markCmbOnboardingCompleted,
} from "./cmb-onboarding-storage";

describe("cmb-onboarding-storage", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("starts incomplete", () => {
    expect(isCmbOnboardingCompleted()).toBe(false);
  });

  it("marks completion with SSOT key", () => {
    markCmbOnboardingCompleted();
    expect(globalThis.localStorage.getItem(CMB_ONBOARDING_STORAGE_KEY)).toBe("1");
    expect(isCmbOnboardingCompleted()).toBe(true);
  });
});
