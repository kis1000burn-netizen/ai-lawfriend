#!/usr/bin/env node
import { loadWorkflowConfig, registerPlatformExpansion, registerProject, registerReferenceDocs } from "../lib/registry.mjs";
import { writeMvpFlowArtifacts } from "../lib/mvp-flow-test-generator.mjs";
import { runDiagnosticReport } from "../lib/diagnostic-report.mjs";
import { validateInPatchsetSandbox } from "../lib/patchset-validator.mjs";
import { evaluatePromotionGate } from "../lib/promotion-gate.mjs";
import { compressDiagnosticBundle } from "../lib/compress-bundle.mjs";
import { evaluateStaticPass } from "../lib/static-gate.mjs";
import { evaluateIntegrationPass } from "../lib/integration-gate.mjs";
import { evaluateE2ePass } from "../lib/e2e-gate.mjs";
import { evaluatePlatformContracts } from "../lib/platform-contract-gate.mjs";
import {
  evaluateMatchingPermissionPass,
  evaluateMatchingUnitPass,
  evaluateSocialProofPrivacyPass,
  evaluateStagingE2ePass,
} from "../lib/operational-feature-gates.mjs";
import { writeRunManifest, createRunId } from "../lib/run-manifest.mjs";
import { buildExtendedPassStatus, buildDiagnosticTopLevelStatus } from "../lib/diagnostic-status.mjs";
import { DIAGNOSTIC_EXIT, describeDiagnosticExitCode } from "../lib/exit-codes.mjs";
import { resolveExecutionMode } from "../lib/execution-mode.mjs";
import { resolveDiagnosticExitCode } from "../lib/resolve-exit-code.mjs";
import { isSecurityEnvironmentFailure } from "../lib/test-environment-guard.mjs";
import { ensureDir, writeJson } from "../lib/paths.mjs";

const args = new Set(process.argv.slice(2));
const runTests = args.has("--with-tests");
const withIntegration = args.has("--with-integration");
const withE2e = args.has("--with-e2e");
const skipCompress = args.has("--skip-compress");
const withOperationalGates = args.has("--with-operational-gates");
const requirePromotion = args.has("--require-promotion");

function printStep(label, result) {
  const promotionBlocked =
    result.eligibleForMainProjectPromotion === false &&
    result.blockers?.some?.((item) => item.endsWith("_PENDING"));
  const ok = result.ok ?? result.eligibleForMainProjectPromotion ?? false;
  const status = promotionBlocked
    ? "BLOCKED"
    : ok
      ? "PASS"
      : result.status === "PENDING"
        ? "PENDING"
        : "FAIL";
  console.log(`[${status}] ${label}`);
  if (!result.ok && result.missing) {
    console.log(`  missing: ${result.missing.join(", ")}`);
  }
  if (result.blockers?.length) {
    console.log(`  blockers: ${result.blockers.join(", ")}`);
  }
}

function printPassSummary(passStatus) {
  console.log("");
  console.log("Pass levels:");
  console.log(`  STATIC_PASS        ${passStatus.static}`);
  console.log(`  PATCHSET_PASS      ${passStatus.patchset}`);
  console.log(`  INTEGRATION_PASS   ${passStatus.integration}`);
  console.log(`  E2E_PASS           ${passStatus.e2e}`);
  console.log(`  PROMOTION_READY    ${passStatus.promotion}`);
}

function printTopLevelStatus(topLevel, exitCode, executionMode) {
  console.log("");
  console.log("Top-level status:");
  console.log(`  executionMode:    ${executionMode}`);
  console.log(`  diagnosticStatus: ${topLevel.diagnosticStatus}`);
  console.log(`  promotionStatus:  ${topLevel.promotionStatus}`);
  console.log(
    `  exitCode:         ${exitCode} (${describeDiagnosticExitCode(exitCode, { executionMode })})`,
  );
  if (topLevel.blockingReasons.length > 0) {
    console.log("  blockingReasons:");
    for (const reason of topLevel.blockingReasons) {
      console.log(`    - ${reason}`);
    }
  }
}

async function main() {
  const workflow = loadWorkflowConfig();
  const runId = createRunId();
  process.env.DIAGNOSTIC_RUN_ID = runId;
  ensureDir("_runtime");
  ensureDir("_runtime/runs");

  console.log(`diagnostic-engine:first-practical-application (${workflow.workflowId})`);
  console.log(`runId: ${runId}`);

  let securityFailure = false;

  const staticPass = evaluateStaticPass();
  printStep("STATIC_PASS — structure/spec/forbidden rules", staticPass);
  if (!staticPass.ok) process.exitCode = 1;

  const project = registerProject();
  printStep("1) register AI법친 diagnostic project", project);
  if (!project.ok) process.exitCode = 1;

  const referenceDocs = registerReferenceDocs();
  printStep("2) register planning/numbering reference docs", referenceDocs);
  if (!referenceDocs.ok) process.exitCode = 1;

  const mvp = writeMvpFlowArtifacts();
  printStep("3) generate MVP flow tests in patchset", mvp);

  const report = runDiagnosticReport({ runTests });
  printStep(`4) diagnostic report${runTests ? " (with tests)" : ""}`, report);
  if (!report.ok) process.exitCode = 1;

  const patchset = validateInPatchsetSandbox();
  printStep("PATCHSET_PASS — patchset sandbox tests", patchset);
  if (!patchset.ok) process.exitCode = 1;

  let integrationPass = {
    ok: false,
    status: "PENDING",
    blockers: ["INTEGRATION_NOT_REQUESTED"],
  };
  if (withIntegration) {
    integrationPass = evaluateIntegrationPass();
    printStep("INTEGRATION_PASS — staging DB + permission flow", integrationPass);
    if (integrationPass.status === "FAIL") {
      process.exitCode = 1;
      if (isSecurityEnvironmentFailure(integrationPass.guard ?? {})) {
        securityFailure = true;
      }
    }
  } else {
    writeJson("_runtime/integration-pass.json", integrationPass);
  }

  let e2ePass = {
    ok: false,
    status: "PENDING",
    blockers: ["E2E_NOT_REQUESTED"],
  };
  let fixtureCleanup = null;
  if (withE2e) {
    e2ePass = evaluateE2ePass(runId);
    printStep("E2E_PASS — browser/API access control", e2ePass);
    fixtureCleanup = e2ePass.fixtureCleanup ?? null;
    if (e2ePass.status === "FAIL") process.exitCode = 1;
  } else {
    writeJson("_runtime/e2e-pass.json", e2ePass);
  }

  const platformContracts = evaluatePlatformContracts();
  printStep("7) platform expansion contracts", platformContracts);
  if (!platformContracts.ok) process.exitCode = 1;

  let matchingUnitPass = { ok: false, status: "PENDING" };
  let matchingPermissionPass = { ok: false, status: "PENDING" };
  let socialProofPrivacyPass = { ok: false, status: "PENDING" };
  let stagingE2ePass = { ok: false, status: "PENDING" };

  if (withOperationalGates) {
    matchingUnitPass = evaluateMatchingUnitPass();
    printStep("MATCHING_UNIT_PASS — recommendation rule tests", matchingUnitPass);
    if (!matchingUnitPass.ok) process.exitCode = 1;

    matchingPermissionPass = evaluateMatchingPermissionPass();
    printStep("MATCHING_PERMISSION_PASS — admin-only recommendation access", matchingPermissionPass);
    if (!matchingPermissionPass.ok) process.exitCode = 1;

    socialProofPrivacyPass = evaluateSocialProofPrivacyPass();
    printStep("SOCIAL_PROOF_PRIVACY_PASS — anonymized theme output", socialProofPrivacyPass);
    if (!socialProofPrivacyPass.ok) process.exitCode = 1;

    stagingE2ePass = evaluateStagingE2ePass(runId);
    printStep("STAGING_E2E_PASS — matching + social proof staging flow", stagingE2ePass);
    if (stagingE2ePass.status === "FAIL") process.exitCode = 1;
  } else {
    writeJson("_runtime/matching_unit_pass.json", matchingUnitPass);
    writeJson("_runtime/matching_permission_pass.json", matchingPermissionPass);
    writeJson("_runtime/social_proof_privacy_pass.json", socialProofPrivacyPass);
    writeJson("_runtime/staging_e2e_pass.json", stagingE2ePass);
  }

  const promotion = evaluatePromotionGate({
    staticPass,
    patchset,
    report,
    integrationPass,
    e2ePass,
    platformContracts,
    allowlistPass: integrationPass.allowlistPass ?? null,
    fixtureCleanup,
    securityFailure,
    withIntegration,
    withE2e,
  });
  printStep("PROMOTION_READY — main project promotion gate", promotion);

  const platforms = registerPlatformExpansion();
  printStep("7b) platform expansion registry profiles", platforms);
  if (!platforms.ok) process.exitCode = 1;

  let bundle = null;
  if (!skipCompress) {
    bundle = compressDiagnosticBundle();
    printStep("8) compress diagnostic bundle", bundle);
    if (!bundle.ok) process.exitCode = 1;
  }

  const passStatus = buildExtendedPassStatus({
    staticPass,
    patchsetPass: patchset,
    integrationPass,
    e2ePass,
    promotion,
    matchingUnitPass,
    matchingPermissionPass,
    socialProofPrivacyPass,
    stagingE2ePass,
    withOperationalGates,
  });
  printPassSummary(passStatus);

  const executionMode = resolveExecutionMode({
    requirePromotion,
    withIntegration,
    withE2e,
  });

  const topLevel = buildDiagnosticTopLevelStatus({
    passStatus,
    promotion,
    withIntegration,
    withE2e,
    withOperationalGates,
    executionMode,
  });

  const hardFailures = [
    !staticPass.ok,
    !patchset.ok,
    !report.ok,
    !platformContracts.ok,
    !platforms.ok,
    bundle && !bundle.ok,
    withOperationalGates && !matchingUnitPass.ok,
    withOperationalGates && !matchingPermissionPass.ok,
    withOperationalGates && !socialProofPrivacyPass.ok,
    withIntegration && integrationPass.status === "FAIL",
    withE2e && e2ePass.status === "FAIL",
    withOperationalGates && stagingE2ePass.status === "FAIL",
  ].filter(Boolean);

  const exitCode = resolveDiagnosticExitCode({
    requirePromotion,
    hardFailures,
    securityFailure,
    promotion,
  });

  const { manifest } = writeRunManifest({
    runId,
    projectId: workflow.primaryProjectId,
    workflowId: workflow.workflowId,
    executionMode,
    staticPass,
    patchsetPass: patchset,
    integrationPass,
    e2ePass,
    promotion,
    runTests,
    withIntegration,
    withE2e,
    withOperationalGates,
    matchingUnitPass,
    matchingPermissionPass,
    socialProofPrivacyPass,
    stagingE2ePass,
    fixtureCleanup,
    exitCode,
  });

  const exitReason = describeDiagnosticExitCode(exitCode, { executionMode });

  const summary = {
    executionMode,
    diagnosticStatus: topLevel.diagnosticStatus,
    promotionStatus: topLevel.promotionStatus,
    blockingReasons: topLevel.blockingReasons,
    exitCode,
    exitReason,
    workflowId: workflow.workflowId,
    completedAt: new Date().toISOString(),
    runId: manifest.runId,
    runTests,
    withIntegration,
    withE2e,
    withOperationalGates,
    requirePromotion,
    passStatus,
    project,
    referenceDocs,
    mvp,
    report,
    staticPass,
    patchset,
    integrationPass,
    e2ePass,
    platformContracts,
    promotion,
    matchingUnitPass,
    matchingPermissionPass,
    socialProofPrivacyPass,
    stagingE2ePass,
    platforms,
    bundle,
    manifest,
    ok: exitCode === DIAGNOSTIC_EXIT.OK,
  };

  writeJson("_runtime/first-practical-application-summary.json", summary);

  printTopLevelStatus(topLevel, exitCode, executionMode);

  console.log("");
  console.log(`Run manifest: tools/diagnostic-engine/_runtime/run-manifest.json (${manifest.runId})`);
  console.log("Summary written to tools/diagnostic-engine/_runtime/first-practical-application-summary.json");
  if (bundle?.bundlePath) {
    console.log(`Bundle: ${bundle.bundlePath}`);
  }

  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
