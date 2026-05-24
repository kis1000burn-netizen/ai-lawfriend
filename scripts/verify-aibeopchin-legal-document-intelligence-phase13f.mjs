import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 13-F file: ${relativePath}`);
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
    "prisma/migrations/20260524200000_litigation_evidence_mapping_phase13f/migration.sql",
    "src/features/document-intelligence/evidence-mapping.schema.ts",
    "src/features/document-intelligence/evidence-mapping.service.ts",
    "src/features/document-intelligence/evidence-mapping.repository.ts",
    "src/features/document-intelligence/evidence-mapping-policy.ts",
    "src/features/document-intelligence/evidence-mapping-validator.ts",
    "src/features/document-intelligence/evidence-mapping-audit.ts",
    "src/features/document-intelligence/evidence-mapping-prompts.ts",
    "src/features/document-intelligence/evidence-mapping.context.ts",
    "src/features/document-intelligence/evidence-mapping.engine.ts",
    "src/app/api/cases/[caseId]/document-intelligence/evidence-map/run/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/evidence-map/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/evidence-map/[itemId]/review/route.ts",
    "src/features/document-intelligence/evidence-mapping.engine.test.ts",
    "src/features/document-intelligence/evidence-mapping-validator.test.ts",
    "src/features/document-intelligence/evidence-mapping-policy.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model LitigationEvidenceMapping",
    "LitigationEvidenceMappingItemReview",
  ]);

  assertIncludes("src/features/document-intelligence/evidence-mapping.service.ts", [
    "PHASE13F",
    "runEvidenceMappingEngine",
    "assertEvidenceMappingRunGate",
    "reviewLitigationEvidenceMappingItemService",
  ]);

  assertIncludes("src/features/document-intelligence/evidence-mapping-validator.ts", [
    "evidenceConfirmed",
    "claimProven",
    "hasSufficientEvidence",
    "NEEDS_LAWYER_REVIEW",
  ]);

  assertIncludes("src/features/document-intelligence/evidence-mapping-audit.ts", [
    "LITIGATION_EVIDENCE_MAPPING_STARTED",
    "LITIGATION_EVIDENCE_MAPPING_COMPLETED",
    "LITIGATION_EVIDENCE_MAPPING_ITEM_REVIEWED",
  ]);

  assertIncludes("src/features/document-intelligence/evidence-mapping.schema.ts", [
    "claimEvidenceLinks",
    "unsupportedClaims",
    "contradictedClaims",
    "missingEvidenceRequests",
    "supplementRequestDrafts",
    "sourceRefs",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13F-EVIDENCE-MAPPING]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 13-F evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-F** |")) {
    throw new Error("docs/ai/README.md must include Phase **13-F** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase13f")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase13f",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase13f PASS");
}

main();
