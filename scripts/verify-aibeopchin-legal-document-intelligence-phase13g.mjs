import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 13-G file: ${relativePath}`);
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
    "prisma/migrations/20260524210000_litigation_document_intelligence_review_phase13g/migration.sql",
    "src/features/document-intelligence/document-intelligence-review.schema.ts",
    "src/features/document-intelligence/document-intelligence-review.service.ts",
    "src/features/document-intelligence/document-intelligence-review.repository.ts",
    "src/features/document-intelligence/document-intelligence-review.policy.ts",
    "src/features/document-intelligence/document-intelligence-review.validator.ts",
    "src/features/document-intelligence/document-intelligence-review-audit.ts",
    "src/features/document-intelligence/document-intelligence-review-ledger.ts",
    "src/features/document-intelligence/document-intelligence-review-queue.builder.ts",
    "src/components/cases/document-intelligence-review-console.tsx",
    "src/app/api/cases/[caseId]/document-intelligence/review-queue/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/review-queue/[itemId]/confirm/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/review-queue/[itemId]/edit/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/review-queue/[itemId]/reject/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/review-queue/[itemId]/request-client-confirmation/route.ts",
    "src/features/document-intelligence/document-intelligence-review-queue.builder.test.ts",
    "src/features/document-intelligence/document-intelligence-review.policy.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model LitigationDocumentIntelligenceReviewDecision",
    "LitigationDocumentIntelligenceReviewPhase",
  ]);

  assertIncludes(
    "src/features/document-intelligence/document-intelligence-review.service.ts",
    [
      "PHASE13G",
      "buildDocumentIntelligenceReviewQueue",
      "confirmDocumentIntelligenceReviewItemService",
      "buildLedgerEntryFromReviewItem",
    ],
  );

  assertIncludes(
    "src/features/document-intelligence/document-intelligence-review.policy.ts",
    [
      "assertConfirmedForDownstreamUse",
      "LAWYER_CONFIRMED",
      "clientVisible",
    ],
  );

  assertIncludes(
    "src/features/document-intelligence/document-intelligence-review-audit.ts",
    [
      "LITIGATION_DOC_INTEL_REVIEW_CONFIRMED",
      "LITIGATION_DOC_INTEL_REVIEW_EDITED",
      "LITIGATION_DOC_INTEL_REVIEW_REJECTED",
    ],
  );

  assertIncludes(
    "src/features/document-intelligence/document-intelligence-review-ledger.ts",
    ["DOCUMENT_CLAIM", "EVIDENCE_ITEM", "DEADLINE"],
  );

  assertIncludes("src/components/cases/lawyer-intelligence-review-console.tsx", [
    "서류·증거 분석",
    "DocumentIntelligenceReviewConsole",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13G-LAWYER-REVIEW-GATE]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 13-G evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-G** |")) {
    throw new Error("docs/ai/README.md must include Phase **13-G** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase13g")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase13g",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase13g PASS");
}

main();
