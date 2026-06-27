export const EXECUTION_MODE = {
  STRUCTURE_ONLY: "STRUCTURE_ONLY",
  STAGING_FULL: "STAGING_FULL",
};

export function resolveExecutionMode(input) {
  const { requirePromotion = false, withIntegration = false, withE2e = false } = input;

  if (requirePromotion && withIntegration && withE2e) {
    return EXECUTION_MODE.STAGING_FULL;
  }

  return EXECUTION_MODE.STRUCTURE_ONLY;
}
