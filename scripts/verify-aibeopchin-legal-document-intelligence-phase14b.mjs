import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 14-B file: ${relativePath}`);
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

function main() {
  const required = [
    "src/features/document-intelligence/litigation-command-center-actions.schema.ts",
    "src/features/document-intelligence/litigation-command-center-actions.repository.ts",
    "src/features/document-intelligence/litigation-command-center-actions.service.ts",
    "src/features/document-intelligence/litigation-command-center-actions.test.ts",
    "src/features/document-intelligence/litigation-command-center-audit.ts",
    "src/app/api/cases/[caseId]/litigation-command-center/tasks/[taskId]/route.ts",
    "src/app/api/cases/[caseId]/litigation-command-center/deadlines/[deadlineId]/route.ts",
    "src/app/api/cases/[caseId]/litigation-command-center/supplements/[requestId]/send/route.ts",
    "src/app/api/cases/[caseId]/litigation-command-center/draft-contexts/[draftContextId]/generate-draft/route.ts",
    "src/components/cases/litigation-command-center-client.tsx",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("src/features/document-intelligence/litigation-command-center.schema.ts", [
    "evidenceMappingPendingItems",
    "actionsEnabled",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-actions.service.ts", [
    "PHASE14B_LITIGATION_COMMAND_CENTER_ACTIONS_SERVICE",
    "updateCommandCenterTaskStatusService",
    "updateCommandCenterDeadlineService",
    "sendCommandCenterSupplementService",
    "generateCommandCenterDraftFromContextService",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-audit.ts", [
    "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED",
    "LITIGATION_CMD_CENTER_DEADLINE_UPDATED",
    "LITIGATION_CMD_CENTER_SUPPLEMENT_SENT",
    "LITIGATION_CMD_CENTER_DRAFT_GENERATED",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "lcc-task-",
    "lcc-deadline-",
    "lcc-supplement-",
    "lcc-draft-context-",
    "lcc-evidence-pending-list",
    "lcc-opponent-brief-review-",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE14B-LITIGATION-COMMAND-CENTER-ACTIONS]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 14-B evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **14-B** |")) {
    throw new Error("docs/ai/README.md must include Phase **14-B** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase14b")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase14b",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase14b PASS");
}

main();
