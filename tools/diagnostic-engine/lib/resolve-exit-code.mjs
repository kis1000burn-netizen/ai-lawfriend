import { DIAGNOSTIC_EXIT } from "./exit-codes.mjs";

function isHardFailure(passResult) {
  if (!passResult) return false;
  if (passResult.status === "FAIL") return true;
  if (passResult.ok === false && passResult.status !== "PENDING") return true;
  return false;
}

export function resolveDiagnosticExitCode(input) {
  const {
    requirePromotion = false,
    hardFailures = [],
    securityFailure = false,
    promotion,
  } = input;

  if (securityFailure || hardFailures.some(Boolean)) {
    return DIAGNOSTIC_EXIT.SECURITY_OR_ENV_ERROR;
  }

  if (requirePromotion && !promotion.eligibleForMainProjectPromotion) {
    return DIAGNOSTIC_EXIT.PROMOTION_INCOMPLETE;
  }

  return DIAGNOSTIC_EXIT.OK;
}

export function collectHardFailures(results) {
  return results.filter((item) => isHardFailure(item));
}
