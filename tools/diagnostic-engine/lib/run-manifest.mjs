import fs from "node:fs";
import path from "node:path";
import { writeJson, getEngineRoot } from "./paths.mjs";
import { buildSourceHash, getGitCommit, hashDirectory } from "./hash-utils.mjs";
import {
  buildDiagnosticTopLevelStatus,
  buildExtendedPassStatus,
} from "./diagnostic-status.mjs";
import { describeDiagnosticExitCode } from "./exit-codes.mjs";

export function createRunId(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const sec = String(date.getUTCSeconds()).padStart(2, "0");
  return `diag-${y}${m}${d}-${h}${min}${sec}`;
}

export function writeRunManifest(input) {
  const {
    runId = createRunId(),
    projectId,
    staticPass,
    patchsetPass,
    integrationPass,
    e2ePass,
    promotion,
    workflowId,
    runTests,
    withIntegration,
    withE2e,
    withOperationalGates = false,
    matchingUnitPass,
    matchingPermissionPass,
    socialProofPrivacyPass,
    stagingE2ePass,
    fixtureCleanup,
    executionMode = "STRUCTURE_ONLY",
    exitCode = 0,
  } = input;

  const passStatus = buildExtendedPassStatus({
    staticPass,
    patchsetPass,
    integrationPass,
    e2ePass,
    promotion,
    matchingUnitPass,
    matchingPermissionPass,
    socialProofPrivacyPass,
    stagingE2ePass,
    withOperationalGates,
  });

  const topLevel = buildDiagnosticTopLevelStatus({
    passStatus,
    promotion,
    withIntegration,
    withE2e,
    withOperationalGates,
    executionMode,
  });

  const exitReason = describeDiagnosticExitCode(exitCode, { executionMode });

  const manifest = {
    executionMode,
    diagnosticStatus: topLevel.diagnosticStatus,
    promotionStatus: topLevel.promotionStatus,
    blockingReasons: topLevel.blockingReasons,
    exitCode,
    exitReason,
    runId,
    project: projectId,
    workflowId,
    gitCommit: getGitCommit(),
    sourceHash: buildSourceHash(),
    patchsetHash: hashDirectory("aibeopchin_patchset"),
    testEnvironment: process.env.DIAGNOSTIC_TEST_ENV ?? null,
    flags: {
      runTests,
      withIntegration,
      withE2e,
      withOperationalGates,
    },
    static: passStatus.static,
    patchset: passStatus.patchset,
    integration: passStatus.integration,
    e2e: passStatus.e2e,
    matchingUnit: passStatus.matchingUnit,
    matchingPermission: passStatus.matchingPermission,
    socialProofPrivacy: passStatus.socialProofPrivacy,
    stagingE2e: passStatus.stagingE2e,
    promotion: passStatus.promotion,
    promotionBlockers: promotion.blockers ?? [],
    promotionPassLevels: promotion.passLevels ?? {},
    allowlistDatabase: promotion.passLevels?.ALLOWLIST_DATABASE_PASS ?? "PENDING",
    fixtureCleanupPass: promotion.passLevels?.FIXTURE_CLEANUP_PASS ?? "PENDING",
    securityHardFail: promotion.passLevels?.NO_SECURITY_HARD_FAIL ?? "PASS",
    fixtureCleanup: fixtureCleanup ?? null,
    createdAt: new Date().toISOString(),
  };

  const absolute = writeJson("_runtime/run-manifest.json", manifest);
  const runsDir = path.join(getEngineRoot(), "_runtime/runs");
  fs.mkdirSync(runsDir, { recursive: true });
  fs.writeFileSync(
    path.join(runsDir, `${manifest.runId}.json`),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  return { manifest, absolute, topLevel, passStatus };
}
