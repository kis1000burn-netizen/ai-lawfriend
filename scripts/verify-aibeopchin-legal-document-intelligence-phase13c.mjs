import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 13-C file: ${relativePath}`);
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
    "prisma/schema.prisma",
    "prisma/migrations/20260524170000_litigation_document_classification_phase13c/migration.sql",
    "src/features/document-intelligence/document-classification.schema.ts",
    "src/features/document-intelligence/document-classification-policy.ts",
    "src/features/document-intelligence/document-classification.service.ts",
    "src/features/document-intelligence/document-classification.repository.ts",
    "src/features/document-intelligence/document-classification-validator.ts",
    "src/features/document-intelligence/document-classification-audit.ts",
    "src/features/document-intelligence/document-classification.classifier.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/classify/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/classification/route.ts",
    "src/features/document-intelligence/document-classification.classifier.test.ts",
    "src/features/document-intelligence/document-classification-validator.test.ts",
    "src/features/document-intelligence/document-classification.schema.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model LitigationDocumentClassification",
    "LitigationClassificationStatus",
    "LitigationAnalysisReadiness",
  ]);

  assertIncludes("src/features/document-intelligence/document-classification.service.ts", [
    "PHASE13C",
    "classifyLitigationDocument",
    "mapClassificationSummaryForList",
  ]);

  assertIncludes("src/features/document-intelligence/document-classification.classifier.ts", [
    "classifyLitigationDocument",
    "LEGAL_FILE_CLASSIFY",
  ]);

  assertIncludes("src/features/document-intelligence/document-classification-audit.ts", [
    "LITIGATION_CLASSIFY_STARTED",
    "LITIGATION_CLASSIFY_COMPLETED",
    "LITIGATION_CLASSIFY_FAILED",
  ]);

  assertIncludes("src/features/document-intelligence/document-extraction.service.ts", [
    "mapClassificationSummaryForList",
    "sourceParty",
    "analysisReadiness",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13C-CLASSIFICATION]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 13-C evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-C** |")) {
    throw new Error("docs/ai/README.md must include Phase **13-C** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase13c")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase13c",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase13c PASS");
}

main();
