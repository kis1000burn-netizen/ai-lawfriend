import fs from "node:fs";
import path from "node:path";

/**
 * Shared Operations Monitoring RC block (Phase 17-E).
 */
export function createOperationsMonitoringRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Operations Monitoring RC file: ${relativePath}`);
    }
  }

  function assertIncludes(relativePath, terms) {
    const content = readFile(relativePath);
    for (const term of terms) {
      if (!content.includes(term)) {
        throw new Error(`Missing term "${term}" in ${relativePath}`);
      }
    }
  }

  return { readFile, assertFileExists, assertIncludes };
}

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-OPERATIONS-MONITORING-PHASE17F-LIVE-SMOKE",
  "EVIDENCE-20260524-AIBEOPCHIN-OPERATIONS-MONITORING-PHASE17-PRODUCTION-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER",
];

export function runOperationsMonitoringRcBlock(
  execSync,
  root,
  label = "verify:operations-monitoring-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createOperationsMonitoringRcFsHelpers(root);

  assertFileExists("docs/platform/AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/platform/AIBEOPCHIN_OPERATIONS_MONITORING_PHASE17_ROADMAP.md");
  assertFileExists("docs/operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_DASHBOARD_RUNBOOK.md");
  assertFileExists("docs/operations/AIBEOPCHIN_OPERATIONS_OBSERVER_RUNBOOK.md");
  assertFileExists("docs/operations/AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md");
  assertFileExists("docs/operations/AIBEOPCHIN_ADMIN_OPS_CONSOLE_RUNBOOK.md");
  assertFileExists("src/features/platform/operations-monitoring-rc-lock.ts");
  assertFileExists("src/features/platform/operations-monitoring-rc-lock.test.ts");
  assertFileExists("src/features/operations-monitoring/operations-monitoring-snapshot.service.ts");
  assertFileExists("src/features/operations-monitoring/operations-observer.constants.ts");
  assertFileExists("src/app/api/admin/operations/monitoring-snapshot/route.ts");
  assertFileExists("src/app/(protected)/admin/operations/monitoring/page.tsx");
  assertFileExists("docs/operations/AIBEOPCHIN_OPERATIONS_MONITORING_LIVE_SMOKE_RUNBOOK.md");
  assertFileExists("scripts/ops-operations-monitoring-live-smoke.mjs");
  assertFileExists("scripts/lib/ops-monitoring-live-smoke.mjs");
  assertFileExists("scripts/lib/operations-monitoring-fixture-policy.mjs");
  assertFileExists("scripts/verify-operations-monitoring-fixtures.mjs");
  assertFileExists("data/operations/fixtures/operations-monitoring-audit-issue.fixture.json");
  assertFileExists("data/operations/fixtures/operations-monitoring-cron-failure.fixture.json");
  assertFileExists("data/operations/fixtures/operations-monitoring-external-message-failure.fixture.json");

  assertIncludes("src/features/platform/operations-monitoring-rc-lock.ts", [
    "OPERATIONS_MONITORING_RC_LOCK_MARKER_PHASE17",
    "ops:post-deploy-monitoring-live-check",
    "ops:operations-monitoring-live-smoke",
    "/api/admin/operations/monitoring-snapshot",
    "/admin/operations/monitoring",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_OPERATIONS_MONITORING_PHASE17_ROADMAP.md", [
    "17-A",
    "17-B",
    "17-C",
    "17-D",
    "17-E",
    "17-F",
    "actorUserId",
    "rollback drill",
    "ADMIN auth regression",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_OPERATIONS_MONITORING_LIVE_SMOKE_RUNBOOK.md", [
    "ADMIN auth regression",
    "dashboard render",
    "audit issue fixture",
    "cron failure fixture",
    "external message failure fixture",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_INCIDENT_RESPONSE_ROLLBACK_DRILL_RUNBOOK.md", [
    "minimum-rollback-playbook",
    "P0",
    "rollback drill",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_ADMIN_OPS_CONSOLE_RUNBOOK.md", [
    "/admin/operations/monitoring",
    "monitoring-snapshot",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  for (const script of [
    "verify:aibeopchin-operations-monitoring-rc",
    "ops:post-deploy-monitoring-live-check",
    "ops:operations-monitoring-live-smoke",
    "verify:operations-monitoring-fixtures",
  ]) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCTION_GO_NO_GO_LAUNCH_RC_LOCK_SUMMARY.md", [
    "17",
    "Operations Monitoring",
  ]);

  const sevenDashboardApi = readFile("src/app/api/admin/operations/aibeopchin-7-dashboard/route.ts");
  if (!sevenDashboardApi.includes("requireRoleApi")) {
    throw new Error("7-dashboard API must require ADMIN auth (Phase 17 security gate)");
  }

  console.log(`[${label}] verify:operations-monitoring-fixtures …`);
  execSync("npm run verify:operations-monitoring-fixtures", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] test:operations-monitoring-fixtures …`);
  execSync("npm run test:operations-monitoring-fixtures", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] verify:aibeopchin-7-operation-dashboard …`);
  execSync("npm run verify:aibeopchin-7-operation-dashboard", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] running operations-monitoring-rc-lock Vitest …`);
  execSync("npm run test -- src/features/platform/operations-monitoring-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] running operations-observer Vitest …`);
  execSync("npm run test -- src/features/operations-monitoring/operations-observer.constants.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
