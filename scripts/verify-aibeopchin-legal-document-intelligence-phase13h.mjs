import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 13-H file: ${relativePath}`);
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
    "prisma/migrations/20260524220000_litigation_operations_integration_phase13h/migration.sql",
    "src/features/document-intelligence/litigation-operations.schema.ts",
    "src/features/document-intelligence/litigation-operations.service.ts",
    "src/features/document-intelligence/litigation-operations.repository.ts",
    "src/features/document-intelligence/litigation-operations.policy.ts",
    "src/features/document-intelligence/litigation-operations-audit.ts",
    "src/features/document-intelligence/litigation-operations.sync.ts",
    "src/app/api/cases/[caseId]/document-intelligence/operations/sync/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/operations/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/operations/tasks/create/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/operations/deadlines/create/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/operations/supplements/create/route.ts",
    "src/app/api/cases/[caseId]/document-intelligence/operations/draft-context/create/route.ts",
    "src/components/cases/document-intelligence-review-console.tsx",
    "src/features/document-intelligence/litigation-operations.policy.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model LitigationDeadline",
    "model LitigationTask",
    "model LitigationDraftContext",
    "LitigationDocumentIntelligenceOpsSync",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-operations.service.ts", [
    "PHASE13H",
    "syncLitigationOperationsService",
    "assertReviewItemConfirmedForDownstream",
    "runLitigationOperationsSync",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-operations.policy.ts", [
    "assertConfirmedForDownstreamUse",
    "LAWYER_CONFIRMED",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-operations-audit.ts", [
    "LITIGATION_DOC_INTEL_OPS_SYNC_COMPLETED",
    "LITIGATION_DOC_INTEL_OPS_DEADLINE_CREATED",
    "LITIGATION_DOC_INTEL_OPS_TASK_CREATED",
  ]);

  assertIncludes("src/components/cases/document-intelligence-review-console.tsx", [
    "doc-intel-ops-sync",
    "operations/sync",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13H-LITIGATION-OPS-INTEGRATION]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 13-H evidence tag");
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **13-H** |")) {
    throw new Error("docs/ai/README.md must include Phase **13-H** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-document-intelligence-phase13h")) {
    throw new Error(
      "package.json must define verify:aibeopchin-legal-document-intelligence-phase13h",
    );
  }

  console.log("verify:aibeopchin-legal-document-intelligence-phase13h PASS");
}

main();
