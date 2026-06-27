import { EXECUTION_MODE } from "./execution-mode.mjs";
import { buildPassStatus } from "./pass-status.mjs";

const PASS_LABELS = [
  ["STATIC_PASS", "static"],
  ["PATCHSET_PASS", "patchset"],
  ["INTEGRATION_PASS", "integration"],
  ["E2E_PASS", "e2e"],
  ["MATCHING_UNIT_PASS", "matchingUnit"],
  ["MATCHING_PERMISSION_PASS", "matchingPermission"],
  ["SOCIAL_PROOF_PRIVACY_PASS", "socialProofPrivacy"],
  ["STAGING_E2E_PASS", "stagingE2e"],
];

function passEntryLabel(name, value) {
  if (value === "PASS") return null;
  if (value === "PENDING") return `${name} is PENDING`;
  if (value === "BLOCKED") return `${name} is BLOCKED`;
  if (value === "FAIL") return `${name} is FAIL`;
  return `${name} is ${value}`;
}

export function buildDiagnosticTopLevelStatus(input) {
  const {
    passStatus,
    promotion,
    withIntegration = false,
    withE2e = false,
    withOperationalGates = false,
    executionMode = EXECUTION_MODE.STRUCTURE_ONLY,
  } = input;

  const blockingReasons = [];

  for (const [name, key] of PASS_LABELS) {
    const value = passStatus[key];
    if (!value) continue;
    const reason = passEntryLabel(name, value);
    if (reason) blockingReasons.push(reason);
  }

  if (!promotion.eligibleForMainProjectPromotion) {
    for (const blocker of promotion.blockers ?? []) {
      const reason = `${blocker} blocks promotion`;
      if (!blockingReasons.includes(reason)) {
        blockingReasons.push(reason);
      }
    }
  }

  if (!withIntegration && !blockingReasons.some((r) => r.includes("INTEGRATION_PASS"))) {
    blockingReasons.push("INTEGRATION_PASS is PENDING");
  }
  if (!withE2e && !blockingReasons.some((r) => r.includes("E2E_PASS"))) {
    blockingReasons.push("E2E_PASS is PENDING");
  }
  if (withOperationalGates) {
    for (const [name, key] of PASS_LABELS.slice(4)) {
      const value = passStatus[key];
      if (value === "PENDING") {
        const reason = `${name} is PENDING`;
        if (!blockingReasons.includes(reason)) blockingReasons.push(reason);
      }
    }
  }

  let promotionStatus = promotion.eligibleForMainProjectPromotion ? "READY" : "BLOCKED";
  let diagnosticStatus =
    promotion.eligibleForMainProjectPromotion &&
    passStatus.static === "PASS" &&
    passStatus.patchset === "PASS" &&
    passStatus.integration === "PASS" &&
    passStatus.e2e === "PASS" &&
    passStatus.promotion === "PASS"
      ? "COMPLETE"
      : "INCOMPLETE";

  if (executionMode !== EXECUTION_MODE.STAGING_FULL) {
    diagnosticStatus = "INCOMPLETE";
    if (promotionStatus === "READY") {
      promotionStatus = "BLOCKED";
      blockingReasons.push("STAGING_FULL execution was not requested");
    }
  }

  return {
    diagnosticStatus,
    promotionStatus,
    blockingReasons: [...new Set(blockingReasons)],
  };
}

export function buildExtendedPassStatus(input) {
  const base = buildPassStatus(input);
  const {
    matchingUnitPass = { ok: false, status: "PENDING" },
    matchingPermissionPass = { ok: false, status: "PENDING" },
    socialProofPrivacyPass = { ok: false, status: "PENDING" },
    stagingE2ePass = { ok: false, status: "PENDING" },
    withOperationalGates = false,
  } = input;

  if (!withOperationalGates) {
    return {
      ...base,
      matchingUnit: "PENDING",
      matchingPermission: "PENDING",
      socialProofPrivacy: "PENDING",
      stagingE2e: "PENDING",
    };
  }

  return {
    ...base,
    matchingUnit: matchingUnitPass.ok ? "PASS" : matchingUnitPass.status === "PENDING" ? "PENDING" : "FAIL",
    matchingPermission: matchingPermissionPass.ok
      ? "PASS"
      : matchingPermissionPass.status === "PENDING"
        ? "PENDING"
        : "FAIL",
    socialProofPrivacy: socialProofPrivacyPass.ok
      ? "PASS"
      : socialProofPrivacyPass.status === "PENDING"
        ? "PENDING"
        : "FAIL",
    stagingE2e: stagingE2ePass.status ?? (stagingE2ePass.ok ? "PASS" : "FAIL"),
  };
}
