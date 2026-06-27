export const PASS_LEVELS = {
  STATIC: "STATIC_PASS",
  PATCHSET: "PATCHSET_PASS",
  INTEGRATION: "INTEGRATION_PASS",
  E2E: "E2E_PASS",
  PROMOTION: "PROMOTION_READY",
};

export function toPassLabel(ok, pending = false) {
  if (pending) return "PENDING";
  return ok ? "PASS" : "FAIL";
}

export function buildPassStatus(input) {
  const {
    staticPass,
    patchsetPass,
    integrationPass,
    e2ePass,
    promotion,
  } = input;

  return {
    static: toPassLabel(staticPass.ok),
    patchset: toPassLabel(patchsetPass.ok),
    integration: integrationPass.status ?? toPassLabel(integrationPass.ok, !integrationPass.ok && integrationPass.blockers?.includes?.("DIAGNOSTIC_TEST_ENV_MISSING")),
    e2e: e2ePass.status ?? toPassLabel(e2ePass.ok, e2ePass.blockers?.includes?.("PLAYWRIGHT_BASE_URL_OR_E2E_DIAGNOSTIC_LOCAL_REQUIRED")),
    promotion: promotion.eligibleForMainProjectPromotion ? "PASS" : "BLOCKED",
  };
}
