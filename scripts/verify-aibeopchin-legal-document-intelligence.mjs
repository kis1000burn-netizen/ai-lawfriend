import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 13-A file: ${relativePath}`);
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
  const requiredSpecs = [
    "docs/ai/AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md",
    "docs/ai/AIBEOPCHIN_UPLOAD_FILE_ANALYSIS_PIPELINE_SPEC.md",
    "docs/ai/AIBEOPCHIN_OPPONENT_BRIEF_ANALYSIS_SPEC.md",
    "docs/ai/AIBEOPCHIN_COURT_DOCUMENT_ANALYSIS_SPEC.md",
    "docs/ai/AIBEOPCHIN_EVIDENCE_MAPPING_SPEC.md",
  ];

  const requiredCode = [
    "src/features/document-intelligence/document-intelligence-engine.schema.ts",
    "src/features/document-intelligence/document-intelligence-task-types.ts",
    "src/features/document-intelligence/document-intelligence-engine.schema.test.ts",
  ];

  for (const file of [...requiredSpecs, ...requiredCode]) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_SPEC.md", [
    "Phase **13‑A**",
    "AI 서류·증거 분석 엔진",
    "단순 첨부파일이 아니라",
    "AI_ANALYZED",
    "LAWYER_CONFIRMED",
    "NEEDS_CLIENT_CONFIRMATION",
    "13‑B",
    "13‑H",
    "LitigationUploadedFile",
    "LEGAL_FILE_CLASSIFY",
    "litigationDocumentAnalysisBundleSchema",
    "verify:aibeopchin-legal-document-intelligence",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_UPLOAD_FILE_ANALYSIS_PIPELINE_SPEC.md", [
    "LEGAL_TEXT_EXTRACT_VALIDATE",
    "LitigationExtractedText",
    "OPPONENT_ANSWER",
    "requiresDualAnalysis",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_OPPONENT_BRIEF_ANALYSIS_SPEC.md", [
    "OPPONENT_BRIEF_ANALYZE",
    "admissions",
    "rebuttalIssues",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_COURT_DOCUMENT_ANALYSIS_SPEC.md", [
    "COURT_ORDER_ANALYZE",
    "LitigationDeadline",
    "COURT_CORRECTION_ORDER",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_EVIDENCE_MAPPING_SPEC.md", [
    "CLAIM_EVIDENCE_MAP",
    "CASE_RECORD_CONTRADICTION_SCAN",
    "LitigationEvidenceItem",
  ]);

  assertIncludes("src/features/document-intelligence/document-intelligence-engine.schema.ts", [
    "PHASE13A_LEGAL_DOCUMENT_INTELLIGENCE",
    "LEGAL_DOCUMENT_INTELLIGENCE_VERSION",
    "litigationDocumentAnalysisBundleSchema",
    "LitigationUploadedFile",
  ]);

  assertIncludes("src/features/document-intelligence/document-intelligence-task-types.ts", [
    "DOCUMENT_INTELLIGENCE_TASK_TYPES",
    "LITIGATION_DRAFT_CONTEXT_BUILD",
    "DOCUMENT_INTELLIGENCE_GOVERNANCE_FEATURE",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13A-LEGAL-DOCUMENT-INTELLIGENCE-SPEC-LOCK]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 13-A evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-A** |")) {
    throw new Error("docs/ai/README.md must include Phase **13-A** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence")) {
    throw new Error("package.json must define verify:aibeopchin-legal-document-intelligence");
  }

  console.log("verify:aibeopchin-legal-document-intelligence PASS");
}

main();
