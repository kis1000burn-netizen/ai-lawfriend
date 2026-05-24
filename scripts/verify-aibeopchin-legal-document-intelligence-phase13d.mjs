import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 13-D file: ${relativePath}`);
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
    "prisma/migrations/20260524180000_litigation_document_analysis_phase13d/migration.sql",
    "src/features/document-intelligence/document-analysis.schema.ts",
    "src/features/document-intelligence/document-analysis.service.ts",
    "src/features/document-intelligence/document-analysis.repository.ts",
    "src/features/document-intelligence/document-analysis-policy.ts",
    "src/features/document-intelligence/document-analysis-validator.ts",
    "src/features/document-intelligence/document-analysis-citation.ts",
    "src/features/document-intelligence/document-analysis-audit.ts",
    "src/features/document-intelligence/document-analysis-prompts.ts",
    "src/features/document-intelligence/document-analysis.engine.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/analyze/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/analysis/route.ts",
    "src/features/document-intelligence/document-analysis.engine.test.ts",
    "src/features/document-intelligence/document-analysis-validator.test.ts",
    "src/features/document-intelligence/document-analysis-policy.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model LitigationDocumentAnalysis",
    "LitigationDocumentAnalysisStatus",
  ]);

  assertIncludes("src/features/document-intelligence/document-analysis.service.ts", [
    "PHASE13D",
    "analyzeLitigationDocumentContent",
    "assertAnalysisReadinessGate",
  ]);

  assertIncludes("src/features/document-intelligence/document-analysis-validator.ts", [
    "finalLegalConclusion",
    "winningProbability",
    "deadlineFinalDueAt",
    "NEEDS_LAWYER_REVIEW",
  ]);

  assertIncludes("src/features/document-intelligence/document-analysis-audit.ts", [
    "LITIGATION_ANALYZE_STARTED",
    "LITIGATION_ANALYZE_COMPLETED",
    "LITIGATION_ANALYZE_FAILED",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13D-LEGAL-ANALYSIS]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 13-D evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-D** |")) {
    throw new Error("docs/ai/README.md must include Phase **13-D** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase13d")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase13d",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase13d PASS");
}

main();
