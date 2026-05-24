import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 14-C file: ${relativePath}`);
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
    "src/features/document-intelligence/litigation-command-center-action-feed.ts",
    "src/features/document-intelligence/litigation-command-center-action-feed.test.ts",
    "src/features/document-intelligence/litigation-command-center-optimistic.ts",
    "src/hooks/use-litigation-command-center-actions.ts",
    "src/components/cases/litigation-command-center-client.tsx",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("src/features/document-intelligence/litigation-command-center.schema.ts", [
    'LITIGATION_COMMAND_CENTER_VERSION = "15-G.1"',
    "recentActionFeed",
    "actionsEnabled",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-action-feed.ts", [
    "PHASE14C_LITIGATION_COMMAND_CENTER_ACTION_FEED",
    "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED",
    "mapAuditLogToCommandCenterFeedItem",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.service.ts", [
    "listCommandCenterActionFeedForCase",
    "recentActionFeed",
  ]);

  assertIncludes("src/hooks/use-litigation-command-center-actions.ts", [
    "phase14c-litigation-command-center-actions-hook",
    "pushToast",
    "applyOptimisticTaskStatus",
    "snapshotsRef",
    "mergedFeed",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "phase14c-litigation-command-center-client",
    "useLitigationCommandCenterActions",
    "useToast",
    "lcc-section-action-feed",
    "lcc-mode-readonly",
    "lcc-mode-actions-enabled",
    "Phase 14-C",
    "처리 중…",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE14C-LITIGATION-COMMAND-CENTER-ACTION-FEEDBACK]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 14-C evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **14-C** |")) {
    throw new Error("docs/ai/README.md must include Phase **14-C** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase14c")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase14c",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase14c PASS");
}

main();
