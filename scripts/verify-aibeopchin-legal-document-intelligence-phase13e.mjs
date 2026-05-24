import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 13-E file: ${relativePath}`);
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
    "prisma/migrations/20260524190000_litigation_opponent_brief_analysis_phase13e/migration.sql",
    "src/features/document-intelligence/opponent-brief-analysis.schema.ts",
    "src/features/document-intelligence/opponent-brief-analysis.service.ts",
    "src/features/document-intelligence/opponent-brief-analysis.repository.ts",
    "src/features/document-intelligence/opponent-brief-analysis-policy.ts",
    "src/features/document-intelligence/opponent-brief-analysis-validator.ts",
    "src/features/document-intelligence/opponent-brief-analysis-audit.ts",
    "src/features/document-intelligence/opponent-brief-analysis-prompts.ts",
    "src/features/document-intelligence/opponent-brief-analysis.engine.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/opponent-brief/analyze/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/opponent-brief/route.ts",
    "src/features/document-intelligence/opponent-brief-analysis.engine.test.ts",
    "src/features/document-intelligence/opponent-brief-analysis-validator.test.ts",
    "src/features/document-intelligence/opponent-brief-analysis-policy.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model LitigationOpponentBriefAnalysis",
    "LitigationOpponentBriefAnalysisStatus",
  ]);

  assertIncludes(
    "src/features/document-intelligence/opponent-brief-analysis.service.ts",
    [
      "PHASE13E",
      "analyzeOpponentBriefContent",
      "assertOpponentBriefAnalysisGate",
      "mapOpponentBriefSummaryForList",
    ],
  );

  assertIncludes(
    "src/features/document-intelligence/opponent-brief-analysis-validator.ts",
    [
      "opponentClaimIsWrong",
      "winningProbability",
      "rebuttalFilingReady",
      "NEEDS_LAWYER_REVIEW",
    ],
  );

  assertIncludes(
    "src/features/document-intelligence/opponent-brief-analysis-audit.ts",
    [
      "LITIGATION_OPPONENT_BRIEF_ANALYZE_STARTED",
      "LITIGATION_OPPONENT_BRIEF_ANALYZE_COMPLETED",
      "LITIGATION_OPPONENT_BRIEF_ANALYZE_FAILED",
    ],
  );

  assertIncludes(
    "src/features/document-intelligence/opponent-brief-analysis.schema.ts",
    [
      "OPPONENT_BRIEF_ELIGIBLE_DOCUMENT_TYPES",
      "opponentPositionSummary",
      "contradictionCandidates",
      "rebuttalIssueCandidates",
      "clientConfirmationQuestions",
      "draftContext",
    ],
  );

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13E-OPPONENT-BRIEF]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 13-E evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-E** |")) {
    throw new Error("docs/ai/README.md must include Phase **13-E** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase13e")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase13e",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase13e PASS");
}

main();
