import fs from "node:fs";
import path from "node:path";
import { assertPredeployMasterOrGate } from "./predeploy-gate-assertions.mjs";

/**
 * Shared Litigation Command Center RC block (Phase 14-E).
 * Used by verify:aibeopchin-litigation-command-center-rc.
 * Must NOT exec the standalone npm script from within phase scripts (no circular calls).
 */
export function createLitigationCommandCenterRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Litigation Command Center RC file: ${relativePath}`);
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

const PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-document-intelligence-phase14a",
  "verify:aibeopchin-legal-document-intelligence-phase14b",
  "verify:aibeopchin-legal-document-intelligence-phase14c",
  "verify:aibeopchin-legal-document-intelligence-phase14d",
];

const DEPENDENCY_MIGRATION_DIRS = [
  "20260524220000_litigation_operations_integration_phase13h",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE14A-LITIGATION-COMMAND-CENTER",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE14B-LITIGATION-COMMAND-CENTER-ACTIONS",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE14C-LITIGATION-COMMAND-CENTER-ACTION-FEEDBACK",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE14D-LITIGATION-COMMAND-CENTER-DASHBOARD-WIDGET",
];

const COMMAND_CENTER_API_ROUTES = [
  "src/app/api/cases/[caseId]/litigation-command-center/route.ts",
  "src/app/api/cases/[caseId]/litigation-command-center/tasks/[taskId]/route.ts",
  "src/app/api/cases/[caseId]/litigation-command-center/deadlines/[deadlineId]/route.ts",
  "src/app/api/cases/[caseId]/litigation-command-center/supplements/[requestId]/send/route.ts",
  "src/app/api/cases/[caseId]/litigation-command-center/draft-contexts/[draftContextId]/generate-draft/route.ts",
  "src/app/api/cases/litigation-command-center-summaries/route.ts",
];

export function runLitigationCommandCenterRcBlock(
  execSync,
  root,
  label = "verify:litigation-command-center-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createLitigationCommandCenterRcFsHelpers(root);

  for (const script of PHASE_VERIFY_SCRIPTS) {
    console.log(`[${label}] running npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  assertFileExists("docs/ai/AIBEOPCHIN_LITIGATION_COMMAND_CENTER_RC_LOCK_SUMMARY.md");
  assertFileExists(
    "docs/ai/AIBEOPCHIN_LITIGATION_COMMAND_CENTER_PREDEPLOY_CLOSURE_CHECKLIST.md",
  );
  assertFileExists("src/features/document-intelligence/litigation-command-center-rc-lock.ts");
  assertFileExists("src/features/document-intelligence/litigation-command-center-rc-lock.test.ts");

  for (const route of COMMAND_CENTER_API_ROUTES) {
    assertFileExists(route);
  }

  for (const dir of DEPENDENCY_MIGRATION_DIRS) {
    const migrationPath = path.join(root, "prisma/migrations", dir, "migration.sql");
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Missing Litigation Command Center dependency migration: ${dir}`);
    }
  }

  assertIncludes("src/features/document-intelligence/litigation-command-center-rc-lock.ts", [
    "LITIGATION_COMMAND_CENTER_RC_LOCK_MARKER_PHASE14E",
    "LITIGATION_COMMAND_CENTER_RC_PHASE_VERIFY_SCRIPTS",
    "LITIGATION_COMMAND_CENTER_RC_AUDIT_ACTIONS",
    "LITIGATION_COMMAND_CENTER_RC_UI_SMOKE_TESTIDS",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.policy.ts", [
    "assertCanReadLitigationCommandCenter",
    "canRunLitigationCommandCenterActions",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.schema.ts", [
    "readOnly",
    "actionsEnabled",
    "recentActionFeed",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.service.ts", [
    "getLitigationCommandCenterService",
    "recentActionFeed",
    "actionsEnabled",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-list-summary.service.ts", [
    "loadCommandCenterListBatchFacts",
    "getLitigationCommandCenterListSummariesForCases",
    "getLitigationCommandCenterDashboardPreviewWithTitles",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-list-summary.repository.ts", [
    "groupBy",
    "loadCommandCenterListBatchFacts",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-audit.ts", [
    "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED",
    "LITIGATION_CMD_CENTER_DEADLINE_UPDATED",
    "LITIGATION_CMD_CENTER_SUPPLEMENT_SENT",
    "LITIGATION_CMD_CENTER_DRAFT_GENERATED",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-actions.service.ts", [
    "updateCommandCenterTaskStatusService",
    "updateCommandCenterDeadlineService",
    "sendCommandCenterSupplementService",
    "generateCommandCenterDraftFromContextService",
  ]);

  assertIncludes("src/hooks/use-litigation-command-center-actions.ts", [
    "applyOptimisticTaskStatus",
    "pushToast",
    "snapshotsRef",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "litigation-command-center",
    "lcc-mode-readonly",
    "lcc-mode-actions-enabled",
    "lcc-section-action-feed",
    "useLitigationCommandCenterActions",
  ]);

  assertIncludes("src/components/cases/case-list-command-center-widget.tsx", [
    "lcc-list-open-",
    "소송 지휘실 열기",
  ]);

  assertIncludes("src/components/cases/case-detail-client.tsx", [
    "open-litigation-command-center",
    "litigation-command-center",
  ]);

  assertIncludes("src/components/dashboard/lawyer/lawyer-command-center-preview.tsx", [
    "lawyer-command-center-preview",
    "소송 지휘실 열기",
  ]);

  assertIncludes("src/app/(protected)/cases/page.tsx", [
    "CaseListCommandCenterWidget",
    "commandCenterSummary",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tagClosure =
    "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-COMMAND-CENTER-PHASE14E-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tagClosure)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagClosure}`);
  }

  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **14-E** |") || !readme.includes("RC LOCKED")) {
    throw new Error("docs/ai/README.md must include Phase **14-E** RC LOCKED row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-litigation-command-center-rc")) {
    throw new Error("package.json must define verify:aibeopchin-litigation-command-center-rc");
  }

  const predeploy = readFile("scripts/predeploy-check.ts");
  assertPredeployMasterOrGate(
    predeploy,
    "verify:aibeopchin-litigation-command-center-rc",
    "Phase 14-E LCC RC",
  );

  console.log(`[${label}] running Litigation Command Center Vitest bundle …`);
  execSync("npm run test -- src/features/document-intelligence/litigation-command-center", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] running litigation-command-center-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/document-intelligence/litigation-command-center-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
