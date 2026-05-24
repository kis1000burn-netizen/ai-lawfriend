import fs from "node:fs";
import path from "node:path";

/**
 * Shared Litigation Operations RC block (Product Phase 24-F).
 * Bundles 24-A~E static gates + Phase 23-F/14-E product cross-link.
 */
export function createLitigationOpsRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Litigation Ops RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24A-TASK-DEADLINE-AUTOMATION",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24B-COURT-FILING-PREPARATION-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24C-LAWYER-WORKBENCH-INTEGRATION",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24D-HEARING-SUBMISSION-CHECKLIST",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24E-CLIENT-LITIGATION-PROGRESS-SYNC",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-COMMAND-CENTER-PHASE14E-RC-PREDEPLOY-CLOSURE",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-litigation-ops-phase24a",
  "verify:aibeopchin-litigation-ops-phase24b",
  "verify:aibeopchin-litigation-ops-phase24c",
  "verify:aibeopchin-litigation-ops-phase24d",
  "verify:aibeopchin-litigation-ops-phase24e",
];

export function runLitigationOpsRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-litigation-ops-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createLitigationOpsRcFsHelpers(root);

  assertFileExists("src/features/litigation-ops/litigation-operations-rc-lock.ts");
  assertFileExists("src/features/litigation-ops/litigation-operations-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_RUNBOOK.md");

  assertIncludes("src/features/litigation-ops/litigation-operations-rc-lock.ts", [
    "LITIGATION_OPERATIONS_RC_LOCK_MARKER_PHASE24F",
    "verify:aibeopchin-litigation-ops-rc",
    "LITIGATION_OPERATIONS_RC_PRODUCT_CROSS_LINK",
    "litigation-command-center",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_LOCK_SUMMARY.md", [
    "24-A",
    "24-E",
    "24-F",
    "verify:aibeopchin-litigation-ops-rc",
    "23-F",
    "14-E",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_RUNBOOK.md", [
    "verify:aibeopchin-litigation-ops-rc",
    "Operator checklist",
    "24-A",
    "24-E",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_LITIGATION_OPERATIONS_RC_LOCK_SUMMARY.md",
    "AIBEOPCHIN_LITIGATION_OPERATIONS_RC_RUNBOOK.md",
    "Product 24-F",
  ]);

  assertIncludes(
    "src/features/litigation-ops/litigation-task-deadline-automation.service.ts",
    ["runLitigationTaskDeadlineAutomationForCase"],
  );

  assertIncludes("src/features/litigation-ops/court-filing-preparation-pack.service.ts", [
    "buildCourtFilingPreparationPackForCase",
  ]);

  assertIncludes("src/features/litigation-ops/lawyer-workbench-integration.service.ts", [
    "getLawyerWorkbenchLitigationSnapshot",
  ]);

  assertIncludes("src/features/litigation-ops/hearing-submission-checklist.service.ts", [
    "buildHearingSubmissionChecklistForCase",
  ]);

  assertIncludes("src/features/litigation-ops/client-litigation-progress-sync.service.ts", [
    "syncClientLitigationProgressForCase",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.service.ts", [
    "getLitigationCommandCenterService",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-litigation-ops-rc")) {
    throw new Error("package.json must define verify:aibeopchin-litigation-ops-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["24-F"]);

  assertIncludes("docs/platform/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_LOCK_SUMMARY.md", [
    "Litigation Operations",
  ]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] litigation-operations-rc-lock Vitest …`);
  execSync("npm run test -- src/features/litigation-ops/litigation-operations-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
