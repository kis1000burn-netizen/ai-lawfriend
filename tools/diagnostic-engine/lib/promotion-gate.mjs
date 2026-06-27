import { readJson, writeJson } from "./paths.mjs";
import { isSecurityEnvironmentFailure } from "./test-environment-guard.mjs";

export function evaluatePromotionGate(options = {}) {
  const {
    staticPass = readJson("_runtime/static-pass.json"),
    patchset = readJson("_runtime/patchset-validation.json"),
    report = readJson("_runtime/diagnostic-report.json"),
    integrationPass = readJson("_runtime/integration-pass.json"),
    e2ePass = readJson("_runtime/e2e-pass.json"),
    platformContracts = readJson("_runtime/platform-contract-gate.json"),
    allowlistPass = integrationPass.allowlistPass ?? null,
    fixtureCleanup = e2ePass.fixtureCleanup ?? null,
    securityFailure = false,
    withIntegration = false,
    withE2e = false,
  } = options;

  const passConfig = readJson("config/pass-gates.json");
  const blockers = [];

  if (!staticPass.ok) blockers.push("STATIC_PASS_FAILED");
  if (!patchset.ok) blockers.push("PATCHSET_PASS_FAILED");
  if (report.summary.criticalCount > 0) blockers.push("CRITICAL_FINDINGS_PRESENT");
  if (report.summary.highCount > 0 && report.runTests) blockers.push("HIGH_FINDINGS_PRESENT");
  if (!platformContracts.ok) blockers.push("PLATFORM_CONTRACT_GATE_FAILED");

  const integrationStatus = integrationPass.status ?? (integrationPass.ok ? "PASS" : "FAIL");
  const e2eStatus = e2ePass.status ?? (e2ePass.ok ? "PASS" : "FAIL");
  const allowlistStatus =
    allowlistPass?.status ??
    (withIntegration
      ? allowlistPass?.ok
        ? "PASS"
        : "FAIL"
      : "PENDING");
  const fixtureCleanupStatus = withE2e
    ? fixtureCleanup?.status === "CLEANUP_OK"
      ? "PASS"
      : fixtureCleanup?.status === "CLEANUP_FAILED"
        ? "FAIL"
        : "PENDING"
    : "PENDING";
  const securityStatus =
    securityFailure ||
    isSecurityEnvironmentFailure(integrationPass.guard ?? {}) ||
    integrationPass.failureCategory === "SECURITY"
      ? "FAIL"
      : "PASS";

  if (allowlistStatus !== "PASS") {
    blockers.push(
      allowlistStatus === "PENDING"
        ? "ALLOWLIST_DATABASE_PASS_PENDING"
        : "ALLOWLIST_DATABASE_PASS_FAILED",
    );
  }
  if (integrationStatus !== "PASS") {
    blockers.push(
      integrationStatus === "PENDING"
        ? "INTEGRATION_PASS_PENDING"
        : "INTEGRATION_PASS_FAILED",
    );
  }
  if (e2eStatus !== "PASS") {
    blockers.push(e2eStatus === "PENDING" ? "E2E_PASS_PENDING" : "E2E_PASS_FAILED");
  }
  if (fixtureCleanupStatus !== "PASS") {
    blockers.push(
      fixtureCleanupStatus === "PENDING"
        ? "FIXTURE_CLEANUP_PASS_PENDING"
        : "FIXTURE_CLEANUP_PASS_FAILED",
    );
  }
  if (securityStatus !== "PASS") {
    blockers.push("NO_SECURITY_HARD_FAIL");
  }

  const passLevels = {
    STATIC_PASS: staticPass.ok ? "PASS" : "FAIL",
    PATCHSET_PASS: patchset.ok ? "PASS" : "FAIL",
    ALLOWLIST_DATABASE_PASS: allowlistStatus,
    INTEGRATION_PASS: integrationStatus,
    E2E_PASS: e2eStatus,
    FIXTURE_CLEANUP_PASS: fixtureCleanupStatus,
    NO_SECURITY_HARD_FAIL: securityStatus,
    PROMOTION_READY: blockers.length === 0 ? "PASS" : "BLOCKED",
  };

  const promotion = {
    stepId: "promotion-gate",
    evaluatedAt: new Date().toISOString(),
    passLevels,
    eligibleForMainProjectPromotion: blockers.length === 0,
    blockers,
    policy: {
      target: "original project (src/, prisma/, docs/ operational paths)",
      neverAutoWriteProductionCode: true,
      requiresHumanApproval: true,
      requiresPassLevels: passConfig.promotionRequires,
      allowedPromotionTargets: [
        "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
        "aibeopchin_patchset/ (staging only until manual merge)",
      ],
    },
    fixtureCleanup: fixtureCleanup ?? null,
    nextActions:
      blockers.length === 0
        ? [
            "Review patchset diff manually",
            "Apply only passed fixes to src/ or prisma/",
            "Re-run npm run diagnostic:staging-full",
          ]
        : [
            "Complete missing pass levels (integration/e2e require staging env)",
            "Fix blockers in patchset sandbox first",
            "Re-run diagnostic workflow",
          ],
  };

  writeJson("_runtime/promotion-gate.json", promotion);
  return promotion;
}
