/** Phase CMB Onboarding — first-visit localStorage SSOT */
export const CMB_ONBOARDING_STORAGE_KEY =
  "aibeopchin_cmb_onboarding_completed_v1" as const;

export function isCmbOnboardingCompleted(): boolean {
  if (typeof globalThis.localStorage === "undefined") {
    return false;
  }
  return globalThis.localStorage.getItem(CMB_ONBOARDING_STORAGE_KEY) === "1";
}

export function markCmbOnboardingCompleted(): void {
  if (typeof globalThis.localStorage === "undefined") {
    return;
  }
  globalThis.localStorage.setItem(CMB_ONBOARDING_STORAGE_KEY, "1");
}
