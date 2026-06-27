import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDiagnosticTopLevelStatus,
  buildExtendedPassStatus,
} from "../lib/diagnostic-status.mjs";
import { evaluateDatabaseUrlAllowlist } from "../lib/staging-database-allowlist.mjs";
import { EXECUTION_MODE } from "../lib/execution-mode.mjs";
import { DIAGNOSTIC_EXIT, describeDiagnosticExitCode } from "../lib/exit-codes.mjs";
import { evaluatePromotionGate } from "../lib/promotion-gate.mjs";
import { resolveDiagnosticExitCode } from "../lib/resolve-exit-code.mjs";

const engineRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(engineRoot, relativePath), "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function test(name, fn) {
  fn();
  console.log(`  ok ${name}`);
}

console.log("diagnostic-engine registry tests");

test("defines the 8-step workflow", () => {
  const workflow = readJson("config/first-practical-application.json");
  assert(workflow.workflowId === "first-practical-application-v1", "workflowId");
  assert(workflow.steps.length === 8, "step count");
  assert(workflow.steps[0].stepId === "register-project", "first step");
  assert(workflow.steps[7].stepId === "compress-bundle", "last step");
});

test("registers AI법친 as the first diagnostic project", () => {
  const project = readJson("projects/aibeopchin-first-project.json");
  assert(project.projectId === "aibeopchin", "projectId");
  assert(project.role === "FIRST_DIAGNOSTIC_PROJECT", "role");
  assert(project.canonicalSources.includes("prisma/schema.prisma"), "canonical");
});

test("registers planning and numbering reference docs", () => {
  const registry = readJson("reference-docs/aibeopchin-canonical-registry.json");
  const categories = registry.referenceDocs.map((doc) => doc.category);
  assert(categories.includes("PLANNING"), "planning");
  assert(categories.includes("NUMBERING_SYSTEM"), "numbering");
});

test("prepares platform expansion including dosirak and achim-haetsal", () => {
  const expansion = readJson("platform-expansion/registry.json");
  const ids = expansion.platforms.map((p) => p.platformId);
  assert(ids.includes("aibeopchin"), "aibeopchin");
  assert(ids.includes("dosirak-store"), "dosirak");
  assert(ids.includes("achim-haetsal"), "achim-haetsal");
});

test("defines separated pass gate levels", () => {
  const gates = readJson("config/pass-gates.json");
  assert(gates.levels.includes("STATIC_PASS"), "static");
  assert(gates.levels.includes("PATCHSET_PASS"), "patchset");
  assert(gates.levels.includes("INTEGRATION_PASS"), "integration");
  assert(gates.levels.includes("E2E_PASS"), "e2e");
  assert(gates.levels.includes("PROMOTION_READY"), "promotion");
  assert(gates.promotionRequires.includes("ALLOWLIST_DATABASE_PASS"), "allowlist promotion");
  assert(gates.promotionRequires.includes("FIXTURE_CLEANUP_PASS"), "cleanup promotion");
  assert(gates.promotionRequires.includes("NO_SECURITY_HARD_FAIL"), "security promotion");
});

test("requires platform contracts beyond profiles only", () => {
  const contract = readJson("platform-expansion/contracts/aibeopchin.json");
  assert(contract.platformId === "aibeopchin", "contract id");
  assert(Array.isArray(contract.requiredE2eTests), "required e2e");
  assert(contract.requiredE2eTests.includes("tests/e2e/diagnostic-case-access-control.spec.ts"), "access e2e");
});

test("blocks production-like database urls in test environment policy", () => {
  const env = readJson("config/test-environment.json");
  assert(Array.isArray(env.blockedDatabaseUrlSubstrings), "blocked patterns");
  assert(env.requiredEnvForIntegration.includes("DIAGNOSTIC_TEST_ENV"), "test env required");
  assert(env.allowlistPolicy.mode === "ALLOWLIST_FIRST", "allowlist mode");
  assert(env.allowlistPolicy.requiredDatabaseSchema === "diagnostic_test", "schema");
});

test("builds incomplete top-level status when integration and e2e are pending", () => {
  const promotion = { eligibleForMainProjectPromotion: false, blockers: ["INTEGRATION_PASS_PENDING"] };
  const passStatus = buildExtendedPassStatus({
    staticPass: { ok: true },
    patchsetPass: { ok: true },
    integrationPass: { ok: false, status: "PENDING", blockers: ["INTEGRATION_NOT_REQUESTED"] },
    e2ePass: { ok: false, status: "PENDING", blockers: ["E2E_NOT_REQUESTED"] },
    promotion,
    withOperationalGates: false,
  });
  const topLevel = buildDiagnosticTopLevelStatus({
    passStatus,
    promotion,
    withIntegration: false,
    withE2e: false,
    withOperationalGates: false,
  });
  assert(topLevel.diagnosticStatus === "INCOMPLETE", "diagnostic incomplete");
  assert(topLevel.promotionStatus === "BLOCKED", "promotion blocked");
  assert(topLevel.blockingReasons.some((r) => r.includes("INTEGRATION_PASS")), "integration reason");
});

test("uses allowlist-first database policy and exit code 2 for incomplete promotion", () => {
  const env = readJson("config/test-environment.json");
  const blocked = evaluateDatabaseUrlAllowlist(
    "postgresql://prod-db.example.com/aibeopchin_prod",
    env,
    "staging",
  );
  assert(!blocked.ok, "prod-like url blocked");
  const exitCode = resolveDiagnosticExitCode({
    requirePromotion: true,
    hardFailures: [],
    securityFailure: false,
    promotion: { eligibleForMainProjectPromotion: false, blockers: ["E2E_PASS_PENDING"] },
  });
  assert(exitCode === DIAGNOSTIC_EXIT.PROMOTION_INCOMPLETE, "exit 2");
});

test("uses structure-only exit reason when promotion was not requested", () => {
  const reason = describeDiagnosticExitCode(DIAGNOSTIC_EXIT.OK, {
    executionMode: EXECUTION_MODE.STRUCTURE_ONLY,
  });
  assert(
    reason === "Structural gates passed; promotion was not requested.",
    "structure-only exit reason",
  );
});

test("uses staging-full exit reason only for staging full success", () => {
  const reason = describeDiagnosticExitCode(DIAGNOSTIC_EXIT.OK, {
    executionMode: EXECUTION_MODE.STAGING_FULL,
  });
  assert(reason === "All required staging gates passed.", "staging-full exit reason");
});

test("blocks promotion when fixture cleanup failed even if e2e passed", () => {
  const promotion = evaluatePromotionGate({
    staticPass: { ok: true },
    patchset: { ok: true },
    report: { summary: { criticalCount: 0, highCount: 0 }, runTests: false },
    integrationPass: {
      ok: true,
      status: "PASS",
      allowlistPass: { ok: true, status: "PASS" },
    },
    e2ePass: { ok: true, status: "PASS" },
    platformContracts: { ok: true },
    fixtureCleanup: { status: "CLEANUP_FAILED", failures: [{ resource: "fixtures" }] },
    securityFailure: false,
    withIntegration: true,
    withE2e: true,
  });
  assert(!promotion.eligibleForMainProjectPromotion, "promotion blocked on cleanup fail");
  assert(
    promotion.blockers.includes("FIXTURE_CLEANUP_PASS_FAILED"),
    "cleanup blocker present",
  );
  assert(promotion.passLevels.E2E_PASS === "PASS", "e2e can still pass");
});

test("never marks complete/ready outside staging full execution", () => {
  const promotion = {
    eligibleForMainProjectPromotion: true,
    blockers: [],
  };
  const passStatus = buildExtendedPassStatus({
    staticPass: { ok: true },
    patchsetPass: { ok: true },
    integrationPass: { ok: true, status: "PASS" },
    e2ePass: { ok: true, status: "PASS" },
    promotion,
    withOperationalGates: false,
  });
  const topLevel = buildDiagnosticTopLevelStatus({
    passStatus,
    promotion,
    withIntegration: true,
    withE2e: true,
    executionMode: EXECUTION_MODE.STRUCTURE_ONLY,
  });
  assert(topLevel.diagnosticStatus === "INCOMPLETE", "structure-only stays incomplete");
  assert(topLevel.promotionStatus === "BLOCKED", "structure-only stays blocked");
});

console.log("diagnostic-engine registry tests PASS");
