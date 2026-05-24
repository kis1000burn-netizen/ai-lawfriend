import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 14-A file: ${relativePath}`);
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
    "src/features/document-intelligence/litigation-command-center.schema.ts",
    "src/features/document-intelligence/litigation-command-center.service.ts",
    "src/features/document-intelligence/litigation-command-center.repository.ts",
    "src/features/document-intelligence/litigation-command-center.policy.ts",
    "src/features/document-intelligence/litigation-command-center.summary.ts",
    "src/features/document-intelligence/litigation-command-center.test.ts",
    "src/app/api/cases/[caseId]/litigation-command-center/route.ts",
    "src/app/(protected)/cases/[caseId]/litigation-command-center/page.tsx",
    "src/components/cases/litigation-command-center-client.tsx",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("src/features/document-intelligence/litigation-command-center.service.ts", [
    "PHASE14A_LITIGATION_COMMAND_CENTER_SERVICE",
    "getLitigationCommandCenterService",
    "getDocumentIntelligenceReviewQueueService",
    "getLitigationOperationsStatusService",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.policy.ts", [
    "assertCanReadLitigationCommandCenter",
    "canRunLitigationCommandCenterActions",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center.summary.ts", [
    "buildLitigationCommandCenterNarrative",
    "phaseLabel",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "litigation-command-center",
    "lcc-narrative",
    "lcc-ops-sync",
    "lcc-section-review-pending",
    "AI 후보 · 검토 필요",
  ]);

  assertIncludes("src/components/cases/case-detail-client.tsx", [
    "open-litigation-command-center",
    "litigation-command-center",
    "소송 지휘실 열기",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE14A-LITIGATION-COMMAND-CENTER]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 14-A evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **14-A** |")) {
    throw new Error("docs/ai/README.md must include Phase **14-A** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase14a")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase14a",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase14a PASS");
}

main();
