import fs from "node:fs";
import path from "node:path";

/**
 * Shared Legal Document Intelligence RC block (Phase 13-I).
 * Used by verify:aibeopchin-legal-document-intelligence-rc.
 * Must NOT exec the standalone npm script from within phase scripts (no circular calls).
 */
export function createLegalDocumentIntelligenceRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Legal Document Intelligence RC file: ${relativePath}`);
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

  return { readFile, assertFileExists, assertIncludes };
}

const PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-document-intelligence",
  "verify:aibeopchin-legal-document-intelligence-phase13b",
  "verify:aibeopchin-legal-document-intelligence-phase13c",
  "verify:aibeopchin-legal-document-intelligence-phase13d",
  "verify:aibeopchin-legal-document-intelligence-phase13e",
  "verify:aibeopchin-legal-document-intelligence-phase13f",
  "verify:aibeopchin-legal-document-intelligence-phase13g",
  "verify:aibeopchin-legal-document-intelligence-phase13h",
];

const MIGRATION_DIRS = [
  "20260524160000_litigation_document_intelligence_phase13b",
  "20260524170000_litigation_document_classification_phase13c",
  "20260524180000_litigation_document_analysis_phase13d",
  "20260524190000_litigation_opponent_brief_analysis_phase13e",
  "20260524200000_litigation_evidence_mapping_phase13f",
  "20260524210000_litigation_document_intelligence_review_phase13g",
  "20260524220000_litigation_operations_integration_phase13h",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-AI-CORE-PHASE13A-LEGAL-DOCUMENT-INTELLIGENCE-SPEC-LOCK",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13B-UPLOAD-EXTRACT",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13C-CLASSIFICATION",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13D-LEGAL-ANALYSIS",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13E-OPPONENT-BRIEF",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13F-EVIDENCE-MAPPING",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13G-LAWYER-REVIEW-GATE",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13H-LITIGATION-OPS-INTEGRATION",
];

const PIPELINE_API_ROUTES = [
  "src/app/api/cases/[caseId]/document-intelligence/upload/route.ts",
  "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/extract/route.ts",
  "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/classify/route.ts",
  "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/analyze/route.ts",
  "src/app/api/cases/[caseId]/document-intelligence/files/[fileId]/opponent-brief/analyze/route.ts",
  "src/app/api/cases/[caseId]/document-intelligence/evidence-map/run/route.ts",
  "src/app/api/cases/[caseId]/document-intelligence/review-queue/route.ts",
  "src/app/api/cases/[caseId]/document-intelligence/operations/sync/route.ts",
];

export function runLegalDocumentIntelligenceRcBlock(
  execSync,
  root,
  label = "verify:legal-document-intelligence-rc",
) {
  const { readFile, assertFileExists, assertIncludes } =
    createLegalDocumentIntelligenceRcFsHelpers(root);

  for (const script of PHASE_VERIFY_SCRIPTS) {
    console.log(`[${label}] running npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  assertFileExists("docs/ai/AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_RC_LOCK_SUMMARY.md");
  assertFileExists(
    "docs/ai/AIBEOPCHIN_LEGAL_DOCUMENT_INTELLIGENCE_PREDEPLOY_CLOSURE_CHECKLIST.md",
  );
  assertFileExists("src/features/document-intelligence/legal-document-intelligence-rc-lock.ts");

  for (const route of PIPELINE_API_ROUTES) {
    assertFileExists(route);
  }

  for (let i = 0; i < MIGRATION_DIRS.length; i++) {
    const dir = MIGRATION_DIRS[i];
    const migrationPath = path.join(root, "prisma/migrations", dir, "migration.sql");
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Missing Legal Document Intelligence RC migration: ${dir}`);
    }
    if (i > 0 && MIGRATION_DIRS[i] <= MIGRATION_DIRS[i - 1]) {
      throw new Error(
        `Migration order violation: ${MIGRATION_DIRS[i - 1]} must precede ${MIGRATION_DIRS[i]}`,
      );
    }
  }

  assertIncludes("src/features/document-intelligence/legal-document-intelligence-rc-lock.ts", [
    "LEGAL_DOCUMENT_INTELLIGENCE_RC_LOCK_MARKER_PHASE13I",
    "LEGAL_DOCUMENT_INTELLIGENCE_RC_MIGRATION_DIRS",
    "LEGAL_DOCUMENT_INTELLIGENCE_RC_AUDIT_ACTIONS",
    "LEGAL_DOCUMENT_INTELLIGENCE_RC_UI_SMOKE_TESTIDS",
  ]);

  assertIncludes("src/features/document-intelligence/document-extraction-policy.ts", [
    "assertCanUploadDocumentIntelligence",
    "assertCanExtractDocumentIntelligence",
  ]);

  assertIncludes("src/features/document-intelligence/document-classification-policy.ts", [
    "assertCanClassifyDocument",
  ]);

  assertIncludes("src/features/document-intelligence/document-analysis-policy.ts", [
    "assertCanAnalyzeDocument",
  ]);

  assertIncludes("src/features/document-intelligence/opponent-brief-analysis-policy.ts", [
    "assertCanAnalyzeOpponentBrief",
  ]);

  assertIncludes("src/features/document-intelligence/evidence-mapping-policy.ts", [
    "assertCanRunEvidenceMapping",
  ]);

  assertIncludes("src/features/document-intelligence/document-intelligence-review.policy.ts", [
    "assertConfirmedForDownstreamUse",
    "assertCanDecideDocumentIntelligenceReviewItem",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-operations.policy.ts", [
    "assertConfirmedForDownstreamUse",
    "assertCanRunLitigationOperationsSync",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-operations.sync.ts", [
    "NOT_LAWYER_CONFIRMED",
    "isConfirmedReviewStatus",
  ]);

  for (const auditFile of [
    "document-extraction-audit.ts",
    "document-classification-audit.ts",
    "document-analysis-audit.ts",
    "opponent-brief-analysis-audit.ts",
    "evidence-mapping-audit.ts",
    "document-intelligence-review-audit.ts",
    "litigation-operations-audit.ts",
  ]) {
    assertFileExists(`src/features/document-intelligence/${auditFile}`);
  }

  assertIncludes("src/components/cases/document-intelligence-review-console.tsx", [
    "document-intelligence-review-console",
    "doc-intel-ops-sync",
    "operations/sync",
  ]);

  assertIncludes("src/components/cases/lawyer-intelligence-review-console.tsx", [
    "doc-intel-review-tab",
    "DocumentIntelligenceReviewConsole",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tagClosure =
    "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13I-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tagClosure)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagClosure}`);
  }

  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-I** |") || !readme.includes("RC LOCKED")) {
    throw new Error("docs/ai/README.md must include Phase **13-I** RC LOCKED row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-rc")) {
    throw new Error("package.json must define verify:aibeopchin-legal-document-intelligence-rc");
  }

  console.log(`[${label}] running Document Intelligence Vitest bundle …`);
  execSync("npm run test -- src/features/document-intelligence", {
    stdio: "inherit",
    cwd: root,
  });
}
