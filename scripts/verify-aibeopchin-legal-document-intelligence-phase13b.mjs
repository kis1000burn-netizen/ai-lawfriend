import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 13-B file: ${relativePath}`);
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
    "prisma/migrations/20260524160000_litigation_document_intelligence_phase13b/migration.sql",
    "src/features/document-intelligence/document-upload.schema.ts",
    "src/features/document-intelligence/document-extraction.schema.ts",
    "src/features/document-intelligence/document-extraction.service.ts",
    "src/features/document-intelligence/document-extraction.repository.ts",
    "src/features/document-intelligence/document-extraction-policy.ts",
    "src/features/document-intelligence/document-extraction-audit.ts",
    "src/features/document-intelligence/document-extraction-status.ts",
    "src/features/document-intelligence/document-extraction-quality.ts",
    "src/features/document-intelligence/document-extraction-runner.ts",
    "src/features/document-intelligence/document-intelligence.storage.ts",
    "src/app/api/cases/[caseId]/document-intelligence/upload/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/extract/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/extracted-text/route.ts",
    "src/features/document-intelligence/document-extraction.schema.test.ts",
    "src/features/document-intelligence/document-extraction-quality.test.ts",
    "src/features/document-intelligence/document-upload.schema.test.ts",
    "src/features/document-intelligence/document-extraction-runner.test.ts",
    "src/features/document-intelligence/document-extraction-policy.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model LitigationUploadedFile",
    "model LitigationExtractedText",
    "LitigationExtractionStatus",
  ]);

  assertIncludes("src/features/document-intelligence/document-extraction.service.ts", [
    "PHASE13B",
    "runDocumentTextExtraction",
    "auditLitigationFileUpload",
    "buildExtractedTextResponse",
  ]);

  assertIncludes("src/features/document-intelligence/document-extraction-audit.ts", [
    "LITIGATION_FILE_UPLOAD",
    "LITIGATION_EXTRACT_STARTED",
    "LITIGATION_EXTRACT_COMPLETED",
    "LITIGATION_EXTRACT_FAILED",
    "LITIGATION_EXTRACT_RETRY",
  ]);

  assertIncludes("src/features/document-intelligence/document-extraction-runner.ts", [
    "OCR_NOT_CONFIGURED",
    "runDocumentTextExtraction",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13B-UPLOAD-EXTRACT]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 13-B evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-B** |")) {
    throw new Error("docs/ai/README.md must include Phase **13-B** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase13b")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase13b",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase13b PASS");
}

main();
