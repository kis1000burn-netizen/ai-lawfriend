import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 14-D file: ${relativePath}`);
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
    "src/features/document-intelligence/litigation-command-center-list-summary.schema.ts",
    "src/features/document-intelligence/litigation-command-center-list-summary.repository.ts",
    "src/features/document-intelligence/litigation-command-center-list-summary.service.ts",
    "src/features/document-intelligence/litigation-command-center-list-summary.helpers.ts",
    "src/features/document-intelligence/litigation-command-center-list-summary.test.ts",
    "src/components/cases/case-list-command-center-widget.tsx",
    "src/components/dashboard/lawyer/lawyer-command-center-preview.tsx",
    "src/app/api/cases/litigation-command-center-summaries/route.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("src/features/document-intelligence/litigation-command-center-list-summary.service.ts", [
    "PHASE14D_LITIGATION_COMMAND_CENTER_LIST_SUMMARY_SERVICE",
    "getLitigationCommandCenterListSummariesForCases",
    "getLitigationCommandCenterDashboardPreviewWithTitles",
    "loadCommandCenterListBatchFacts",
  ]);

  assertIncludes("src/components/cases/case-list-command-center-widget.tsx", [
    "phase14d-case-list-command-center-widget",
    "lcc-list-open-",
    "소송 지휘실 열기",
    "reviewPendingCount",
    "supplementDraftCount",
  ]);

  assertIncludes("src/app/(protected)/cases/page.tsx", [
    "CaseListCommandCenterWidget",
    "소송 지휘실",
    "commandCenterSummary",
  ]);

  assertIncludes("src/components/dashboard/lawyer/lawyer-dashboard-home.tsx", [
    "LawyerCommandCenterPreview",
    "commandCenterPreview",
  ]);

  assertIncludes("src/app/(lawyer)/lawyer/page.tsx", [
    "getLitigationCommandCenterDashboardPreviewWithTitles",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE14D-LITIGATION-COMMAND-CENTER-DASHBOARD-WIDGET]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 14-D evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **14-D** |")) {
    throw new Error("docs/ai/README.md must include Phase **14-D** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase14d")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase14d",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase14d PASS");
}

main();
